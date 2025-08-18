import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen({ onReceiptCaptured }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // If permissions are still loading or not yet determined, show a loader
  if (!permission) {
    return <View />;
  }
    // If permission is denied, request permission and show a loader
  if (!permission.granted) {
    requestPermission();
    return <View />;  }

  // When user taps the screen, take a photo and pass the photo URI to the parent's callback.
  const takePhoto = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        // Capture photo without base64 option for better performance.
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
        console.log('Photo captured:', photo.uri);
        if (onReceiptCaptured) {
          onReceiptCaptured(photo.uri);
        }
      } catch (error) {
        console.error('Error taking photo:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onCameraReady={() => setIsCameraReady(true)}
        onTouchEnd={takePhoto} // Capture photo when tapping the screen
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionButton: {
    backgroundColor: '#027ffc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  camera: {
    flex: 1,
  },
});