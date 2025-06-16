import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  PermissionsAndroid,
  Platform,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  type Permission,
} from 'react-native';
import {
  CameraOptions,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import RNFS from 'react-native-fs';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface LocationCoords {
  latitude: number;
  longitude: number;
}

const CameraScreen = ({navigation}: any) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  const pickerOptions: CameraOptions = {
    mediaType: 'photo',
    quality: 0.8,
    includeBase64: false,
  };

  const requestPermission = async (
    permission: Permission,
    title: string,
    message: string,
  ): Promise<boolean> => {
    const granted = await PermissionsAndroid.request(permission, {
      title,
      message,
      buttonPositive: 'OK',
    });
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const requestCameraPermission = () =>
    Platform.OS === 'android'
      ? requestPermission(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          'Camera Permission',
          'This app needs camera access to take pictures.',
        )
      : Promise.resolve(true);

  const requestLocationPermission = () =>
    Platform.OS === 'android'
      ? requestPermission(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          'Location Permission',
          'This app needs location access to tag photos.',
        )
      : Promise.resolve(true);

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Camera permission is required.');
      return;
    }

    launchCamera(pickerOptions, res => {
      if (res.didCancel || res.errorCode) return;
      const uri = res.assets?.[0]?.uri;
      if (uri) setImageUri(uri);
    });
  };

  const openGallery = async () => {
    launchImageLibrary(pickerOptions, res => {
      if (res.didCancel || res.errorCode) return;
      const uri = res.assets?.[0]?.uri;
      if (uri) setImageUri(uri);
    });
  };

  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Location access is required.');
      setIsLocationLoading(false);
      return;
    }

    Geolocation.getCurrentPosition(
      pos => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setIsLocationLoading(false);
        console.log('📍 Location:', pos.coords.latitude, pos.coords.longitude);
      },
      error => {
        console.error('❌ Location error:', error.message);
        Alert.alert('Location error', error.message);
        setIsLocationLoading(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const uploadToFirestoreOnly = async () => {
    if (!imageUri || !location) {
      Alert.alert('Missing data', 'Image and location are required');
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await RNFS.readFile(imageUri.replace('file://', ''), 'base64');
      const uid = auth().currentUser?.uid || 'test_user';

      await firestore().collection('photos').add({
        image: base64,
        timestamp: firestore.FieldValue.serverTimestamp(),
        location,
        uid,
      });

      Alert.alert('✅ Upload Successful');
      setImageUri(null);
      navigation.navigate('PhotoListScreen');
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      Alert.alert('❌ Upload Failed', error.message || 'Unknown error');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const renderLocationStatus = () => {
    if (isLocationLoading) {
      return (
        <View style={styles.locationContainer}>
          <ActivityIndicator size="small" color="#6366F1" />
          <Text style={styles.locationLoadingText}>Getting location...</Text>
        </View>
      );
    }

    if (location) {
      return (
        <View style={styles.locationContainer}>
          <View style={styles.locationBadge}>
            <Text style={styles.locationEmoji}>📍</Text>
            <Text style={styles.locationText}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity style={styles.retryLocationButton} onPress={getCurrentLocation}>
        <Text style={styles.retryLocationText}>📍 Retry Location</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Camera Utility</Text>
          <Text style={styles.subtitle}>Capture and share your moments</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={openCamera}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonIcon}>📸</Text>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={openGallery}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonIcon}>🖼️</Text>
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>

        {imageUri && (
          <View style={styles.imageContainer}>
            <Image 
              source={{uri: imageUri}} 
              style={styles.image} 
              resizeMode="cover" 
            />
            <View style={styles.imageOverlay}>
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setImageUri(null)}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {renderLocationStatus()}

        <TouchableOpacity 
          style={[
            styles.uploadButton, 
            (!imageUri || !location || isUploading) && styles.uploadButtonDisabled
          ]} 
          onPress={uploadToFirestoreOnly}
          disabled={!imageUri || !location || isUploading}
          activeOpacity={0.8}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.uploadButtonIcon}>☁️</Text>
          )}
          <Text style={styles.uploadButtonText}>
            {isUploading ? 'Uploading...' : 'Upload to Firebase'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  buttonContainer: {
    marginBottom: 24,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
  },
  secondaryButton: {
    backgroundColor: '#6366F1',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: screenWidth * 0.75,
    backgroundColor: '#F3F4F6',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  removeImageButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  locationContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  locationEmoji: {
    fontSize: 14,
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  locationLoadingText: {
    fontSize: 14,
    color: '#6366F1',
    marginLeft: 8,
    fontWeight: '500',
  },
  retryLocationButton: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  retryLocationText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 56,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  uploadButtonIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CameraScreen;