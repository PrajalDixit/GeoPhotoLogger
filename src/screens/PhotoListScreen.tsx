import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/Navigation';

type NavigationProp = StackNavigationProp<RootStackParamList, 'PhotoListScreen'>;

const PhotoListScreen = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('photos')
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPhotos(data);
      });
    return () => unsubscribe();
  }, []);

  const handlePhotoPress = (photo: any) => {
    navigation.navigate('MapScreen', {
      latitude: photo.location.latitude,
      longitude: photo.location.longitude,
      imageUrl: `data:image/jpeg;base64,${photo.image}`,
      timestamp: photo.timestamp?.toDate().toLocaleString() || 'N/A',
      uid: photo.uid,
    });
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Photo Gallery</Text>
          <Text style={styles.headerSubtitle}>
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          {photos.map(photo => (
            <TouchableOpacity
              key={photo.id}
              onPress={() => handlePhotoPress(photo)}
              activeOpacity={0.8}
              style={styles.touchable}
            >
              <View style={styles.card}>
                <Image
                  source={{ uri: `data:image/jpeg;base64,${photo.image}` }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={(error) => console.log('Image load error:', error)}
                  onLoad={() => console.log('Image loaded successfully')}
                />
                <Text style={styles.text}>
                  📍 {photo.location?.latitude.toFixed(4)}, {photo.location?.longitude.toFixed(4)}
                </Text>
                <Text style={styles.text}>
                  🕒 {photo.timestamp?.toDate().toLocaleString() || 'N/A'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('CameraScreen')}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>📷</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  container: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 100,
  },
  touchable: {
    width: '100%',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  fabIcon: {
    fontSize: 24,
  },
});

export default PhotoListScreen;