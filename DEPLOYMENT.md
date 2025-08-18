# Receipt Sorter App - Deployment Guide

## 🚀 Current Production Setup

### **Frontend (iOS App)**
- **Version**: 1.0.8 (Build 5) - **Live on App Store**
- **Bundle ID**: `com.egod21.ReceiptSorterApp`
- **Deployment**: Xcode → TestFlight → App Store (Unlisted Distribution)

### **Backend (API Server)**
- **Version**: 3.1.0
- **Deployment**: AWS Elastic Beanstalk
- **URL**: `brsfinanceportal-env.eba-bueve3pm.us-east-1.elasticbeanstalk.com`

## 📱 iOS App Deployment Process

### Prerequisites
- Xcode installed
- Apple Developer Account
- Service account keys in secure location (`/Volumes/BuildersSS/BRS/`)

### Build & Deploy Steps
1. **Open Project**: `/Users/elliottgodwin/ReceiptSorterApp/ios/ReceiptSorterApp.xcworkspace`
2. **Update Version**: 
   - `app.json` → `ios.buildNumber` (increment for new builds)
   - `ios/ReceiptSorterApp/Info.plist` → `CFBundleVersion` (should match buildNumber)
3. **Archive**: Product → Archive in Xcode
4. **Validate**: Use Xcode Organizer to validate archive
5. **Submit**: Upload to TestFlight → Submit for App Review
6. **Distribution**: Currently using **Unlisted Distribution** (internal org use)

### Critical iOS Configurations
- **ATS Exception**: Required for AWS Elastic Beanstalk HTTP endpoint
- **Camera Permission**: Approved wording for App Review compliance
- **iPad Support**: All orientations configured to prevent white screen
- **Splash Screen**: Centered logo with proper constraints

## 🖥️ Backend Deployment Process

### Prerequisites
- AWS Elastic Beanstalk environment configured
- Service account keys: `main_service_account.json` and `drive_service_account.json`
- Environment variables configured in EB

### Required Environment Variables
```bash
GOOGLE_APPLICATION_CREDENTIALS=/var/app/current/main_service_account.json
NODE_ENV=production
PORT=3000
# Add other environment variables as needed
```

### Deploy Steps
1. **Prepare Code**: Ensure service account keys are in deployment package
2. **ZIP Package**: Create deployment zip (exclude node_modules, include service accounts)
3. **Upload to EB**: Use AWS Console or EB CLI
4. **Verify**: Test API endpoints after deployment

## 🔧 Development Workflow

### For Frontend Updates
1. **Edit Code**: `/Users/elliottgodwin/ReceiptSorterApp/`
2. **Test**: `expo start --dev-client` or `expo run:ios`
3. **Build**: Use Xcode for final builds
4. **Deploy**: Archive → TestFlight → App Store

### For Backend Updates
1. **Edit Code**: `/Volumes/BuildersSS/BRS/`
2. **Test Locally**: `npm run dev`
3. **Deploy**: Package → AWS Elastic Beanstalk
4. **Verify**: Test API endpoints

## 📋 Key Files & Locations

### Production Sources
- **Frontend**: `/Users/elliottgodwin/ReceiptSorterApp/`
- **Backend**: `/Volumes/BuildersSS/BRS/`
- **Credentials**: `/Volumes/BuildersSS/BRS/*.json`

### Repository (GitHub)
- **URL**: `https://github.com/Builders-International/BRS-RSA`
- **Purpose**: Version control and collaboration
- **Note**: Credentials are gitignored for security

## 🚨 Important Notes

### App Review Compliance
- Camera permission wording must match approved text
- No pre-permission prompts before iOS system sheet
- iPad support must be complete (all orientations)

### Security
- Never commit service account keys to GitHub
- Keep credentials in secure locations only
- Use environment variables for sensitive data

### Version Management
- Increment build numbers for each TestFlight upload
- Keep app.json and Info.plist versions synchronized
- Document changes between versions

## 🔍 Troubleshooting

### Common iOS Issues
- **White screen on iPad**: Check splash screen constraints and iPad orientations
- **Network offline errors**: Verify ATS exception for backend URL
- **Camera crashes**: Check permission descriptions in Info.plist

### Common Backend Issues
- **Service account errors**: Verify GOOGLE_APPLICATION_CREDENTIALS path
- **CORS issues**: Ensure backend accepts requests from app domain
- **Environment variables**: Check EB environment configuration

## 📞 Support
- **Original Development**: ChatGPT assisted development
- **Current Maintainer**: Elliott Godwin
- **Repository**: [BRS-RSA on GitHub](https://github.com/Builders-International/BRS-RSA)