# Receipt Sorter App (RSA) - Codebase Analysis

## 🔍 Code Reconnaissance Summary

**Investigation Date**: August 14, 2025  
**Status**: Complete reconnaissance of distributed codebase  

## 📂 Code Location Analysis

### 1. **PRODUCTION/DEPLOYED VERSION (Most Recent)** ⭐
- **Location**: `/Users/elliottgodwin/ReceiptSorterApp`
- **Frontend Version**: 1.0.7 (package.json) but **1.0.8** (Info.plist)
- **Build Version**: 4 (CFBundleVersion in Info.plist)
- **Status**: **This is the version currently deployed and working**
- **Evidence**: 
  - Contains full iOS build artifacts (xcworkspace, build directory)
  - Last Xcode build: March 4-23, 2025 (based on file timestamps)
  - Info.plist contains AWS backend URL: `brsfinanceportal-env.eba-bueve3pm.us-east-1.elasticbeanstalk.com`
  - More advanced camera permission description

### 2. **DEVELOPMENT BACKEND (Newer)** ⚠️
- **Location**: `/Volumes/BuildersSS/BRS`
- **Version**: 3.1.0 (vs 3.0.5 in repo)
- **Status**: **Contains service account keys and newer dependencies**
- **Key Files**:
  - `drive_service_account.json` (Google Drive credentials)
  - `main_service_account.json` (Main service account)
  - `keybundle.zip` (Certificate bundle)
  - `test-receipt.jpg` (Testing file)
- **Dependencies**: Includes additional packages like `node-cron` and `@react-native-community/cli`

### 3. **GITHUB REPOSITORY (Outdated)** 📚
- **Location**: `/Users/elliottgodwin/Desktop/BRS-RSA-main` (current directory)
- **Frontend Version**: 1.0.7
- **Backend Version**: 3.0.5
- **Status**: **This is behind the production version**
- **Missing**: Service account keys, recent updates, AWS configuration

## 🏗️ Architecture Overview

### Frontend (RSA)
- **Technology**: React Native with Expo (v52.0.37)
- **Platform**: iOS focused (deployed via Xcode, not Expo Go)
- **Key Features**:
  - Camera integration (`expo-camera`)
  - Authentication (`expo-auth-session`)
  - Offline storage (`@react-native-async-storage`)
  - Error monitoring (`@sentry/react-native`)
- **Bundle ID**: `com.egod21.ReceiptSorterApp`

### Backend (BRS)
- **Technology**: Node.js Express server (ES Modules)
- **Key Integrations**:
  - Google Cloud Vision API (receipt OCR)
  - OpenAI API (receipt processing/categorization)
  - Google Drive API (storage)
  - SendGrid (email notifications)
- **Deployment**: AWS Elastic Beanstalk
- **URL**: `brsfinanceportal-env.eba-bueve3pm.us-east-1.elasticbeanstalk.com`

## ⚡ Current Production Setup

### What's Running Live:
1. **iOS App**: Version 1.0.8 (build 4) - deployed from `/Users/elliottgodwin/ReceiptSorterApp`
2. **Backend API**: Running on AWS Elastic Beanstalk (version likely from `/Volumes/BuildersSS/BRS`)

### Deployment Method:
- **Frontend**: Built and deployed through Xcode (not Expo Go)
- **Backend**: Deployed to AWS Elastic Beanstalk with service account credentials

## 🚨 Critical Findings

### Version Discrepancies:
1. **Production frontend** (1.0.8) is **newer** than repo (1.0.7)
2. **Development backend** (3.1.0) is **newer** than repo (3.0.5)
3. **Repo is missing**:
   - Service account credentials
   - AWS backend URL configuration
   - Recent dependency updates
   - Build configurations used in production

## 🎯 Recommendations for Updates

### To Deploy New Updates:

1. **Source Control Priority**:
   - **CRITICAL**: The `/Users/elliottgodwin/ReceiptSorterApp` folder is your source of truth for frontend
   - Use `/Volumes/BuildersSS/BRS` for backend updates (has latest version 3.1.0)
   - Update this repo with production versions

2. **For Frontend Updates**:
   - Make changes in `/Users/elliottgodwin/ReceiptSorterApp`
   - Build and deploy through Xcode (as you've been doing)
   - Update version numbers in both `package.json` and `Info.plist`

3. **For Backend Updates**:
   - Work from `/Volumes/BuildersSS/BRS` (has service account keys)
   - Deploy to AWS Elastic Beanstalk
   - Ensure environment variables are set correctly

4. **Repository Sync**:
   - Copy production code back to this repo
   - Add service account keys to `.gitignore`
   - Document the build/deploy process

### Service Account Management:
- Service account keys are in `/Volumes/BuildersSS/BRS/`
- These are required for Google Cloud Vision and Drive integration
- **DO NOT** commit these to the repository

## 🔧 Development Workflow

### Current Working Process:
1. Frontend changes → `/Users/elliottgodwin/ReceiptSorterApp` → Xcode → iOS deployment
2. Backend changes → `/Volumes/BuildersSS/BRS` → AWS Elastic Beanstalk

### Recommended Next Steps:
1. Sync production code back to this repository
2. Document deployment procedures
3. Set up proper environment variable management
4. Consider using environment-specific configuration files

## 📝 Notes
- Expo Go was abandoned in favor of direct Xcode deployment
- App successfully uses Google Cloud Vision for receipt OCR
- Email scheduling functionality is implemented via `emailScheduler.js`
- AWS backend is live and functional at the configured URL