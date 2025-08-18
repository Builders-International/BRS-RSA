/////////////////////////////////////////////////////////
// app.js - BRS Node/Express Project (ES Modules syntax)
/////////////////////////////////////////////////////////

// 1. Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// 2. Imports
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { google } from 'googleapis';
import vision from '@google-cloud/vision';
import OpenAI from 'openai';
import { Readable } from 'stream';
import './emailScheduler.js';
import accountNumbers from './accountNumbers.json' assert { type: 'json' };

function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

// 3. Express Setup
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3000;

// 4. Multer Setup for Memory Storage
const upload = multer({ storage: multer.memoryStorage() });

// 5. Google Auth Setup for Drive
//    (Ensure process.env.GOOGLE_APPLICATION_CREDENTIALS is set correctly in your EB environment)
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: [
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/drive'
  ],
});
const driveService = google.drive({ version: 'v3', auth });

// 6. Create a Vision client using @google-cloud/vision
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// 7. OpenAI Setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 8. Helper: Extract text from image using Vision client
async function extractTextFromImage(imageBuffer) {
  try {
    const [result] = await visionClient.textDetection(imageBuffer);
    const text = result.fullTextAnnotation?.text || '';
    console.log('Extracted text:', text.substring(0, 50) + '...');
    return text;
  } catch (err) {
    console.error('Vision API Error:', err);
    throw err;
  }
}

// 9. Helper: Categorize receipt text
async function categorizeReceiptText(text) {
  const prompt = `Categorize this receipt (Meals/Travel/Events/Misc/Software):\n${text}`;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // or 'gpt-3.5-turbo'
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10,
      temperature: 0.3,
    });

    const category = completion.choices[0].message.content.trim();
    const validCategories = ['Meals', 'Travel', 'Events', 'Misc', 'Software'];
    return validCategories.includes(category) ? category : 'Misc';
  } catch (err) {
    console.error('OpenAI Error:', err.response?.data || err.message);
    return 'Misc';
  }
}

// 10. Helper: Find (or confirm existence of) a subfolder in Google Drive
async function getFolderId(folderName, parentId) {
  try {
    const res = await driveService.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents`,
      fields: 'files(id)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      driveId: process.env.SHARED_DRIVE_ID,
      corpora: 'drive', // ADDED corpora: 'drive'
    });

    if (!res.data.files?.length) {
      throw new Error(`Folder "${folderName}" not found in parentId: ${parentId}`);
    }
    return res.data.files[0].id;
  } catch (err) {
    console.error('Drive Folder Error:', err.message);
    throw err;
  }
}

// 11. Upload Endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Log incoming request details
    console.log(`Incoming upload from ${req.ip}`);
    console.log(
      `File metadata: ${JSON.stringify({
        size: req.file?.size,
        mimetype: req.file?.mimetype,
      })}`
    );

    // Validate input
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!req.body.userEmail) return res.status(400).json({ error: 'No email provided' });

    // Process image via Vision
    const text = await extractTextFromImage(req.file.buffer);
    if (!text) return res.status(400).json({ error: 'No text detected' });

    // Categorize
    const category = await categorizeReceiptText(text);
    console.log(`Detected category: ${category}`);

    // Build folder structure with additional month level:
    // shared drive -> user -> year -> quarter -> month -> category
    const rootId = process.env.ROOT_FOLDER_ID; // top-level shared drive folder
    const now = new Date();
    const year = now.getFullYear().toString();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    const month = now.toLocaleString('default', { month: 'long' }); // e.g., "January"
    
    const paths = [
      req.body.userEmail, // user folder
      year,               // year folder
      `Q${quarter}`,      // quarter folder
      month,              // month folder
      category,           // category folder
    ];

    // Resolve folder IDs in sequence
    let parentId = rootId;
    for (const folderName of paths) {
      parentId = await getFolderId(folderName, parentId);
    }

    // Construct file name using user's name and card number
    const email = req.body.userEmail || 'unknown';
    const userName = email.split('@')[0];
    const capitalizedName = userName.charAt(0).toUpperCase() + userName.slice(1);
    const cardNumber = accountNumbers[userName.toLowerCase()] || '212';
    const fileName = `${capitalizedName}-${cardNumber}-receipt-${Date.now()}.jpg`;

    // Upload to Google Drive with the new file name and folder structure
    const { data } = await driveService.files.create({
      media: {
        mimeType: req.file.mimetype,
        body: bufferToStream(req.file.buffer), // USE RAW BUFFER AS STREAM
      },
      resource: {
        name: fileName,
        parents: [parentId],
      },
      fields: 'id, webViewLink',
      supportsAllDrives: true,
      driveId: process.env.SHARED_DRIVE_ID, // specify the shared drive ID
    });

    // Return success response
    res.json({
      success: true,
      fileId: data.id,
      fileUrl: data.webViewLink,
      category,
      text: text.substring(0, 50) + '...',
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({
      error: err.message || 'Server error',
      details: err.response?.data?.error || null,
    });
  }
});

// 12. Health Check Route (Optional)
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// 13. Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});