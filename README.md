
**BRS Receipt Sorter

Overview**

BRS (Receipt Sorter) is a full-stack application designed to automate the processing of receipt images. The system allows users to capture a receipt via a React Native mobile app, then processes the image on a Node.js/Express backend by extracting text (using the Google Cloud Vision API), categorizing the receipt (via OpenAI’s GPT-4), and finally uploading the file into a structured folder hierarchy on a Google Shared Drive. The backend is deployed on AWS Elastic Beanstalk and the mobile app is distributed via TestFlight.

**Key Features**
	•	Express Server: Handles receipt uploads on the /upload endpoint.
	•	File Uploads: Uses multer with memory storage to manage file uploads.
	•	Text Extraction: Utilizes Google Cloud Vision API to extract text from receipts.
	•	Receipt Categorization: Leverages OpenAI’s GPT-4 API to automatically classify receipts into predefined categories (Meals, Travel, Events, Misc, Software).
	•	Google Drive Integration: Dynamically uploads files to a Google Shared Drive with a user-specific, year/quarter/category folder structure.
	•	Mobile App: A React Native app (built with Expo) that captures receipts using the device camera.

**Technologies Used**
	•	Backend: Node.js, Express.js, Multer, Google Cloud Vision API, OpenAI GPT-4 API, Google Drive API.
	•	Frontend: React Native, Expo.
	•	Deployment: AWS Elastic Beanstalk (backend), TestFlight (mobile app distribution).
	•	Other Tools: AWS Cloud (logging, environment variables), GitHub for version control.

**Installation and Setup**

Backend (BRS)
	1.	Clone the Repository:

```
git clone https://github.com/yourusername/brs.git
cd brs
```


	2.	Install Dependencies:
 
```
npm install
```

	3.	Configure Environment Variables:
Create a .env file in the project root with variables similar to:

```
PORT=3000
GOOGLE_APPLICATION_CREDENTIALS=/var/app/current/main_service_account.json
OPENAI_API_KEY=your-openai-api-key
ROOT_FOLDER_ID=your-root-folder-id
SHARED_DRIVE_ID=your-shared-drive-id
NODE_ENV=production
SENDGRID_API_KEY=your-sendgrid-api-key
```

Note: Ensure that the credentials file is deployed to the correct location in your AWS Elastic Beanstalk environment.

	4.	Deploy to AWS Elastic Beanstalk:
	•	Package your project (excluding node_modules) into a zip file.
	•	Deploy the zip using the AWS EB CLI or via the AWS Elastic Beanstalk Console.
	•	Confirm that the health check path (e.g., /) returns 200 OK by adding a simple GET route if needed.

Frontend (ReceiptSorterApp)
	1.	Clone the Repository:
 
```
git clone https://github.com/yourusername/receiptsorterapp.git
cd receiptsorterapp
```

	2.	Install Dependencies:
 
```
npm install
```

	3.	Configure the API Endpoint:
	•	In your App.js (or relevant file), update the backend endpoint URL to point to your AWS Elastic Beanstalk deployment (e.g., http://brsfinanceportal-env.eba-bueve3pm.us-east-1.elasticbeanstalk.com/upload).
	4.	Run the App Locally:
 
```
expo start
```

**Use an emulator or physical device for testing.**

	5.	Deployment to TestFlight:
	•	Build your app using Expo’s build services or your preferred method.
	•	Upload the build to App Store Connect and distribute via TestFlight.

**How It Works**
	1.	Image Capture:
	•	The mobile app’s CameraScreen component uses Expo Camera to capture receipt images.
	•	After capturing, the image URI is passed to a parent component (via an onReceiptCaptured callback).
	2.	Uploading and Processing:
	•	The parent component builds a FormData object containing the file (from the captured image) and a userEmail.
	•	A POST request is sent to the /upload endpoint.
	•	The backend uses Google Cloud Vision API to extract text and OpenAI GPT-4 to categorize the receipt.
	•	The receipt image is uploaded to the appropriate folder in the Google Shared Drive.
	•	A JSON response is returned with details such as file ID, file URL, category, and a text snippet.
	3.	User Feedback:
	•	The mobile app receives the response and displays the processing result to the user.

**Troubleshooting**
	•	No Response from Mobile App:
	•	Verify that the mobile app is sending a multipart form-data request to /upload with the correct keys (file and userEmail).
	•	Ensure that the API endpoint URL is correctly configured in the mobile app.
	•	Network Issues on iOS:
	•	Check that App Transport Security (ATS) settings in Info.plist are configured properly, or use HTTPS for the backend.
	•	API Errors (Google/OpenAI):
	•	Confirm that all environment variables (API keys, shared drive ID, etc.) are set correctly.
	•	Make sure the credentials file exists at the specified path in your AWS environment.

**Contributing**

Contributions, issues, and feature requests are welcome! Please check the issues page for current tasks or open a new issue if you find a bug or have a suggestion.

**License**

Apache License 2.0

⸻
