import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';  // Latest expo-camera import

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // If permissions are still loading or not yet determined
  if (!permission) {
    return <View />; // You could show a loader here
  }
  // If permission is denied, show a message with a button to request again
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need your permission to use the camera.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

 // When user taps the screen, take a photo and send it to the endpoint.
 const takePhoto = async () => {
  if (cameraRef.current && isCameraReady) {
    try {
      // Capture photo with base64 option so we can send the image data as a string.
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      console.log('Photo captured:', photo.uri);

      // Send the captured image (base64 string) to your endpoint.
      const response = await fetch('http://brsfinanceportal-env.eba-bueve3pm.us-east-1.elasticbeanstalk.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: photo.base64
        })
      });
      const result = await response.json();
      console.log('Upload result:', result);
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  }
};

  return (
    <View style={styles.container}>
      {/* Camera preview */}
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