import os
import io
import datetime
from flask import Flask, request
from google.cloud import vision
from openai import OpenAI
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# For HEIC/HEIF support and image handling
import pillow_heif
from PIL import Image

# ----------------------------------------------------
# 1. Configure Pillow to handle HEIC/HEIF images
# ----------------------------------------------------
pillow_heif.register_heif_opener()

# ----------------------------------------------------
# 2. OpenAI Client Initialization
# ----------------------------------------------------
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY")
)

# ----------------------------------------------------
# 3. Google Drive Setup
# ----------------------------------------------------
DRIVE_SERVICE_ACCOUNT_FILE = "drive_service_account.json"  # Update if needed
SCOPES = ['https://www.googleapis.com/auth/drive']
drive_creds = service_account.Credentials.from_service_account_file(
    DRIVE_SERVICE_ACCOUNT_FILE, scopes=SCOPES)
drive_service = build('drive', 'v3', credentials=drive_creds)

# Replace with your Google Drive “Receipts” root folder ID
ROOT_FOLDER_ID = '0AM5JN1VHDwo-Uk9PVA'  # <-- UPDATE THIS

# ----------------------------------------------------
# 4. Helper Functions
# ----------------------------------------------------

def get_current_quarter():
    """Determine the current fiscal quarter based on the current month."""
    month = datetime.datetime.now().month
    if month <= 3:
        return "Q1"
    elif month <= 6:
        return "Q2"
    elif month <= 9:
        return "Q3"
    else:
        return "Q4"

def resize_image_pil(img, max_size=1024):
    """
    Resize a Pillow Image object so that neither width nor height exceeds max_size,
    preserving aspect ratio. Returns the resized Pillow Image.
    """
    ratio = min(max_size / img.width, max_size / img.height)
    if ratio < 1:
        new_width = int(img.width * ratio)
        new_height = int(img.height * ratio)
        img = img.resize((new_width, new_height), Image.LANCZOS)
    return img

def extract_text_from_image(image_bytes, filename):
    """
    Use Google Cloud Vision API to extract text from the provided image bytes.
    Pillow-heif allows us to open HEIC files directly. We then optionally resize
    the image and convert it to JPEG bytes before sending to Vision.
    """
    # 1. Open the image (Pillow now supports HEIC thanks to pillow-heif)
    img = Image.open(io.BytesIO(image_bytes))

    # 2. Resize if large
    img = resize_image_pil(img, max_size=1024)

    # 3. Convert to JPEG bytes for Vision
    with io.BytesIO() as output:
        img.save(output, format='JPEG', optimize=True, quality=85)
        final_bytes = output.getvalue()

    # 4. Send to Google Vision for OCR
    vision_client = vision.ImageAnnotatorClient()
    image = vision.Image(content=final_bytes)
    response = vision_client.text_detection(image=image)
    texts = response.text_annotations
    if texts:
        return texts[0].description  # The first result is the full text
    return ""

def categorize_receipt_text(text):
    """
    Send the extracted text to OpenAI to determine the receipt category.
    Returns a single word: Meals, Travel, Events, or Misc.
    """
    prompt = (
        "Given the following receipt details, determine which category it belongs to "
        "from these options: Meals, Travel, Events, or Misc. Return only one word representing the category.\n\n"
        f"Receipt Details:\n{text}\n\nCategory:"
    )
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="gpt-4",  # or "gpt-3.5-turbo" if needed
        max_tokens=10,
        temperature=0.3
    )
    category = response.choices[0].message.content.strip()
    return category if category else "Misc"

def get_or_create_folder(service, folder_name, parent_folder_id=None):
    """
    Check if a folder exists in Google Drive under the given parent_folder_id,
    and create it if it doesn't.
    """
    query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder'"
    if parent_folder_id:
        query += f" and '{parent_folder_id}' in parents"
    results = service.files().list(q=query, spaces='drive', fields="files(id, name)").execute()
    items = results.get('files', [])
    if items:
        return items[0]['id']
    else:
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        if parent_folder_id:
            file_metadata['parents'] = [parent_folder_id]
        folder = service.files().create(body=file_metadata, fields='id').execute()
        return folder.get('id')

def upload_file_to_drive(service, file_path, file_name, parent_folder_id):
    """
    Upload a file to a specified folder in Google Drive.
    Returns the file ID of the uploaded file.
    """
    file_metadata = {
        'name': file_name,
        'parents': [parent_folder_id]
    }
    media = MediaFileUpload(file_path, resumable=True)
    uploaded_file = service.files().create(
        body=file_metadata, media_body=media, fields='id'
    ).execute()
    return uploaded_file.get('id')

# ----------------------------------------------------
# 5. Flask Application
# ----------------------------------------------------
app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    """
    A minimal, Bootstrap-based page that auto-opens the camera
    and auto-submits when a photo is taken.
    """
    return '''
<!DOCTYPE html>
<html>
<head>
  <title>Receipt Upload</title>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
  />
  <script>
    // Trigger the camera input on page load
    function triggerCamera() {
      document.getElementById('fileInput').click();
    }

    // As soon as the user selects (snaps) a photo, submit the form automatically
    function handleFileChange() {
      document.getElementById('uploadForm').submit();
    }

    window.onload = triggerCamera;
  </script>
</head>
<body class="bg-light">
  <div class="container mt-5">
    <div class="card p-4">
      <h2>Receipt Upload</h2>
      <p class="text-muted">Please snap a photo of your receipt. It will automatically upload.</p>
      <form
        id="uploadForm"
        method="POST"
        action="/upload"
        enctype="multipart/form-data"
        class="mt-3"
      >
        <input
          style="display:none;"
          type="file"
          id="fileInput"
          name="file"
          accept="image/*"
          capture="camera"
          onchange="handleFileChange()"
        />
        <p>If your camera doesn't open automatically, please click
          <button type="button" class="btn btn-sm btn-secondary" onclick="triggerCamera()">
            here
          </button>.
        </p>
      </form>
    </div>
  </div>
</body>
</html>
'''

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return "No file part in the request", 400
    file = request.files['file']
    if file.filename == '':
        return "No file selected", 400

    # Save the uploaded file locally
    local_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(local_path)

    # Read file bytes for OCR
    with open(local_path, 'rb') as image_file:
        image_bytes = image_file.read()

    # -----------------------------
    # Step 1: OCR Processing
    # -----------------------------
    extracted_text = extract_text_from_image(image_bytes, file.filename)
    if not extracted_text:
        os.remove(local_path)
        return "No text detected in image", 400

    # -----------------------------
    # Step 2: Categorize the Receipt using OpenAI
    # -----------------------------
    category = categorize_receipt_text(extracted_text)

    # -----------------------------
    # Step 3: Organize and Upload to Google Drive
    # -----------------------------
    quarter = get_current_quarter()
    quarter_folder_id = get_or_create_folder(drive_service, quarter, parent_folder_id=ROOT_FOLDER_ID)
    category_folder_id = get_or_create_folder(drive_service, category, parent_folder_id=quarter_folder_id)
    drive_file_id = upload_file_to_drive(drive_service, local_path, file.filename, category_folder_id)

    # Optionally remove the local file after upload
    os.remove(local_path)

    return f"Receipt processed and uploaded successfully! Drive File ID: {drive_file_id}"

if __name__ == '__main__':
    # Run the Flask app on localhost:5000
    app.run(debug=True)