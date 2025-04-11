# ReceiptSorterApp 📸🧾  
A React Native mobile app to capture receipts, submit them to a backend for processing, and get categorized results in real-time. Works both online and offline (queueing submissions when offline).

---

## 🚀 Features

- Google Sign-In authentication
- Receipt capture via camera
- Uploads to AWS-hosted backend
- Offline queueing with retry logic
- Success/error result display
- Simple, lightweight design

---

## 🛠 Setup Instructions

### 1. Clone the Repository

```
bash
git clone https://github.com/your-username/ReceiptSorterApp.git
cd ReceiptSorterApp
```


⸻

2. Install Dependencies

Make sure you’re in the frontend directory:
```
cd frontend
npm install
```
Also install pods for iOS:
```
cd ios
pod install
cd ..
```


⸻

3. Add Google Auth Configuration

Follow this guide to:
	•	Set up your OAuth client ID in Google Cloud Console.
	•	Add your REVERSED_CLIENT_ID to Info.plist for iOS.
	•	Make sure Android configs are in place (if Android support is needed).

⸻

4. Run the App

iOS
```
npx react-native run-ios
```
Or open in Xcode and hit the Run button (after cleaning the build folder and deleting Derived Data).

Android
```
npx react-native run-android
```


⸻

📡 Backend Endpoint

The app is currently configured to send receipts to:
```
http://brsfinanceportal-env.eba-bueve3pm.us-east-1.elasticbeanstalk.com/upload
```
This endpoint must accept multipart/form-data with fields:
	•	file: JPEG image
	•	userEmail
	•	cardNumber

⸻

🔐 Privacy Policy

View our Privacy Policy here:
https://builders-international.github.io/BRS-RSA/privacy-policy.md

⸻

🧪 Troubleshooting

White Screen or Crash on Launch?
	•	Clean build folder in Xcode: Product → Clean Build Folder
	•	Delete Derived Data:
```
rm -rf ~/Library/Developer/Xcode/DerivedData
```

	•	Reinstall Pods:
```
cd ios && pod install && cd ..
```

	•	Rebuild the app

⸻

🧰 Technologies Used
	•	React Native
	•	React Context
	•	AsyncStorage
	•	Google Sign-In
	•	NetInfo
	•	AWS Elastic Beanstalk

⸻

👨‍💻 Author

Elliott Godwin
GitHub: @EGOD21

⸻

📄 License

Apache 2.0
