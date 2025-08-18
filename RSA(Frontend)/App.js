// App.js - ReceiptSorterApp (React Native)

import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthProvider, AuthContext } from './AuthContext';
import CameraScreen from './CameraScreen';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
   *  - Checks network connectivity.
   *  - If offline, queues the receipt submission in AsyncStorage.
   *  - If online, creates a FormData object with the file, userEmail, and cardNumber,
   *    then sends it to your backend at /upload.
   *  - Updates state with the result (success/failure, category, etc.).
   */
  const processReceipt = async (imageUri) => {
    setProcessing(true);
    setOcrResult(null);
    try { 
      /* Check network connectivity
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
         //Offline: store submission for later processing
        const pendingSubmissions = JSON.parse(await AsyncStorage.getItem('pendingSubmissions')) || [];
        pendingSubmissions.push({ imageUri, userEmail: user?.email || 'testuser@example.com' });
        await AsyncStorage.setItem('pendingSubmissions', JSON.stringify(pendingSubmissions));
        console.log('No network - receipt queued for later submission.');
        setOcrResult({ success: true, category: 'Pending', text: 'Receipt queued for submission.' });
      } else { 
       */
         //Online: Build FormData and send to backend
        const formData = new FormData();
        formData.append('file', {
          uri: imageUri,
          name: `receipt-${Date.now()}.jpg`,
          type: 'image/jpeg',
        });
        
        formData.append('userEmail', user?.email || 'testuser@example.com');
        // Append cardNumber field (example card number: 212)
        formData.append('cardNumber', '212');
        const backendUrl = 'http://brsfinanceportal-env.eba-bueve3pm.us-east-1.elasticbeanstalk.com/upload';
        const response = await fetch(backendUrl, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        setOcrResult(data);
        setTimeout(() => setOcrResult(null), 6000); // Hide success box after 6 seconds
      
    } catch (error) {
      console.error('Error processing receipt:', error);
      setOcrResult({ success: false, error: error.message, category: '' });
      setTimeout(() => setOcrResult(null), 6000); // Hide error box after 6 seconds
    } finally {
      setProcessing(false);
    }
  };
/*
  const processQueuedSubmissions = async () => {
    try {
      const pendingSubmissions = JSON.parse(await AsyncStorage.getItem('pendingSubmissions')) || [];
      if (pendingSubmissions.length > 0) {
        console.log(`Processing ${pendingSubmissions.length} queued submissions...`);
        for (const submission of pendingSubmissions) {
          await processReceipt(submission.imageUri);
        }
        await AsyncStorage.removeItem('pendingSubmissions');
      }
    } catch (error) {
      console.error("Error processing queued submissions:", error);
    }
  };
*/ /*
  useEffect(() => {
    const handleConnectivityChange = (state) => {
      if (state.isConnected) {
        processQueuedSubmissions();
      }
    };

    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);
    return () => unsubscribe();
  }, []);
*/
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please sign in to continue</Text>
        <Button title="Sign In with Google" onPress={signIn} disabled={!request} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* CameraScreen will call onReceiptCaptured(imageUri) once a photo is taken */}
      <CameraScreen onReceiptCaptured={processReceipt} />

      {/* Processing overlay */}
      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>Processing receipt...</Text>
        </View>
      )}

      {/* Display result if available */}
      {ocrResult && (
        <View
          style={[
            styles.resultContainer,
            ocrResult.success ? styles.successBox : styles.errorBox,
          ]}
        >
          {ocrResult.success ? (
            <Text style={styles.resultTitle}>Receipt submitted</Text>
          ) : (
            <Text style={styles.resultTitle}>Error: {ocrResult.error}</Text>
          )}
          <Text style={styles.resultDetails}>Category: {ocrResult.category}</Text>
          {ocrResult.fileUrl && (
            <Text style={styles.resultDetails}>File URL: {ocrResult.fileUrl}</Text>
          )}
          {ocrResult.text && (
            <Text style={styles.resultDetails}>{ocrResult.text}</Text>
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
  successBox: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    margin: 10,
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    margin: 10,
  },
});