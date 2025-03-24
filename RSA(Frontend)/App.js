// App.js - ReceiptSorterApp (React Native)

import React, { useContext, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthProvider, AuthContext } from './AuthContext';
import CameraScreen from './CameraScreen';

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}

function Main() {
  const { user, signIn, request } = useContext(AuthContext);
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  /**
   * processReceipt:
   *  - Receives an image URI from CameraScreen
   *  - Builds FormData with the file & user email
   *  - Sends it to your backend BRS at /upload
   *  - Updates state with the result (category, text, fileUrl, etc.)
   */
  const processReceipt = async (imageUri) => {
    setProcessing(true);
    setOcrResult(null);

    try {
      // 1) Create FormData to match what your BRS backend expects
      const formData = new FormData();

      // Append the image as "file"
      formData.append('file', {
        uri: imageUri,
        name: `receipt-${Date.now()}.jpg`,
        type: 'image/jpeg', // adjust if you know the image is PNG, etc.
      });

      // Append userEmail — ensure you have a valid email or placeholder
      formData.append('userEmail', user?.email || 'testuser@example.com');

      // 2) Post to your deployed BRS backend /upload endpoint
      const backendUrl = 'http://brsfinanceportal-env.eba-bueve3pm.us-east-1.elasticbeanstalk.com/upload';
      const response = await fetch(backendUrl, {
        method: 'POST',
        // Do NOT manually set Content-Type here; fetch sets it automatically for FormData
        body: formData,
      });

      // 3) Handle the response
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      // data should include: { success, fileId, fileUrl, category, text } (from your BRS backend)
      setOcrResult(data);
    } catch (error) {
      console.error('Error processing receipt:', error);
    } finally {
      setProcessing(false);
    }
  };

  // If user is not signed in, display Sign In screen
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please sign in to continue</Text>
        <Button title="Sign In with Google" onPress={signIn} disabled={!request} />
      </View>
    );
  }

  // If user is signed in, display camera and result info
  return (
    <View style={{ flex: 1 }}>
      {/* CameraScreen should call onReceiptCaptured(imageUri) once a photo is taken */}
      <CameraScreen onReceiptCaptured={processReceipt} />

      {/* Processing overlay */}
      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>Processing receipt...</Text>
        </View>
      )}

      {/* Display result if we have one */}
      {ocrResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Receipt Category: {ocrResult.category}</Text>
          {/* The backend sets 'text' as a snippet of OCR text */}
          <Text style={styles.resultDetails}>OCR Text: {ocrResult.text}</Text>
          {/* The backend sets 'fileUrl' for the link to Google Drive */}
          {ocrResult.fileUrl && (
            <Text style={styles.resultDetails}>File URL: {ocrResult.fileUrl}</Text>
          )}
        </View>
      )}
    </View>
  );
}

// Basic styling
const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  title: {
    fontSize: 18, marginBottom: 20,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff', marginTop: 10, fontSize: 16,
  },
  resultContainer: {
    position: 'absolute',
    top: 50, left: 20, right: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 20, fontWeight: 'bold', marginBottom: 8,
  },
  resultDetails: {
    fontSize: 16,
  },
});
