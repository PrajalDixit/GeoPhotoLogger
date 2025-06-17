import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

const MapScreen = ({ route }: any) => {
  const { latitude, longitude, imageUrl, timestamp } = route.params;  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imageUrl || imageUrl.trim() === '') {
      setImageError(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [imageUrl]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    setLoading(false);
  };

  const handleImageError = (error: any) => {
    setImageError(true);
    setImageLoaded(false);
    setLoading(false);
  };

  const renderMarkerContent = () => {
    if (loading) {
      return (
        <View style={styles.hybridFallback}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      );
    }

    if (imageError || !imageUrl) {
      return (
        <View style={styles.hybridFallback}>
          <Text style={styles.fallbackText}>📷</Text>
        </View>
      );
    }

    return (
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.hybridMarkerImage}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onLoadStart={() => {
          setLoading(true);
        }}
        onLoadEnd={() => {
          setLoading(false);
        }}
        resizeMode="cover"
      />
    );
  };

  const renderHybridMarker = () => (
    <Marker 
      coordinate={{ 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude) 
      }} 
      title="Photo Location"
      description={`Taken at ${timestamp}`}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.hybridMarkerContainer}>
        <View style={styles.hybridImageContainer}>
          {renderMarkerContent()}
        </View>
        <View style={styles.markerPin} />
      </View>
      
      <Callout tooltip style={styles.callout}>
        <View style={styles.calloutContainer}>
          {imageUrl && !imageError ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.calloutImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.calloutImage, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ fontSize: 30 }}>📷</Text>
            </View>
          )}
          <View style={styles.calloutTextContainer}>
            <Text style={styles.calloutText}>🕒 {timestamp}</Text>
            <Text style={styles.calloutText}>
              📍 {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}
            </Text>
          </View>
        </View>
      </Callout>
    </Marker>
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {renderHybridMarker()}
      </MapView>
      
      {/* Debug info overlay */}
      <View style={styles.debugOverlay}>
        <Text style={styles.debugText}>
          Image URL: {imageUrl ? 'Present' : 'Missing'}
        </Text>
        <Text style={styles.debugText}>
          Status: {loading ? 'Loading' : imageError ? 'Error' : imageLoaded ? 'Loaded' : 'Ready'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  map: { 
    flex: 1 
  },
  debugOverlay: {
    position: 'absolute',
    top: 50,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
  },
  simpleMarkerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  fallbackText: {
    fontSize: 20,
    color: '#fff',
  },
  callout: {
    flex: 1,
  },
  calloutContainer: {
    width: 220,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutImage: {
    width: 200,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  calloutTextContainer: {
    alignItems: 'center',
  },
  calloutText: {
    fontSize: 14,
    color: '#333',
    marginTop: 3,
    textAlign: 'center',
  },
  hybridMarkerContainer: {
    alignItems: 'center',
  },
  hybridImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#007AFF',
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  hybridMarkerImage: {
    width: '100%', 
    height: '100%', 
    borderRadius: 22,
  },
  hybridFallback: {
    width: '100%', 
    height: '100%', 
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerPin: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#007AFF',
    marginTop: -2,
  },
});

export default MapScreen;