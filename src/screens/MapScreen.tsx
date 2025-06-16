import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

const MapScreen = ({ route }: any) => {
  const { latitude, longitude, imageUrl, timestamp } = route.params;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Debug logs
  useEffect(() => {
    console.log('MapScreen params:', { 
      latitude, 
      longitude, 
      imageUrl: imageUrl ? `${imageUrl.substring(0, 50)}...` : 'No image URL', 
      timestamp 
    });
  }, [imageUrl]);

  const handleImageLoad = () => {
    console.log('Marker image loaded successfully');
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = (error: any) => {
    console.log('Marker image load error:', error);
    setImageError(true);
    setImageLoaded(false);
  };

  // Approach 1: Simple direct image as marker child (most reliable for base64)
  const renderSimpleImageMarker = () => (
    <Marker 
      coordinate={{ 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude) 
      }} 
      title="Photo Location"
      description={`Taken at ${timestamp}`}
    >
      {imageUrl ? (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.simpleMarkerImage}
          onLoad={handleImageLoad}
          onError={handleImageError}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.fallbackMarker}>
          <Text style={styles.fallbackText}>📷</Text>
        </View>
      )}
      
      <Callout tooltip style={styles.callout}>
        <View style={styles.calloutContainer}>
          {imageUrl && (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.calloutImage}
              resizeMode="cover"
              onError={(error) => console.log('Callout image error:', error)}
              onLoad={() => console.log('Callout image loaded')}
            />
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

  // Approach 2: Using marker image prop with proper sizing
  const renderImagePropMarker = () => (
    <Marker 
      coordinate={{ 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude) 
      }} 
      title="Photo Location"
      description={`Taken at ${timestamp}`}
      image={imageUrl ? { 
        uri: imageUrl,
        width: 10,
        height: 10
      } : undefined}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <Callout tooltip style={styles.callout}>
        <View style={styles.calloutContainer}>
          {imageUrl && (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.calloutImage}
              resizeMode="cover"
            />
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

  // Approach 4: Hybrid approach - Custom view that should work reliably
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
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.hybridMarkerImage}
              onLoad={handleImageLoad}
              onError={handleImageError}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.hybridFallback}>
              <Text style={styles.fallbackText}>📷</Text>
            </View>
          )}
        </View>
        <View style={styles.markerPin} />
      </View>
      
      <Callout tooltip style={styles.callout}>
        <View style={styles.calloutContainer}>
          {imageUrl && (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.calloutImage}
              resizeMode="cover"
            />
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

  // Approach 3: Custom view with absolute positioning
  const renderCustomViewMarker = () => (
    <Marker 
      coordinate={{ 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude) 
      }} 
      title="Photo Location"
      description={`Taken at ${timestamp}`}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={styles.customMarkerWrapper}>
        {imageUrl ? (
          <View style={styles.imageMarkerContainer}>
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.customMarkerImage}
              onLoad={handleImageLoad}
              onError={handleImageError}
              resizeMode="cover"
            />
          </View>
        ) : (
          <View style={styles.fallbackMarker}>
            <Text style={styles.fallbackText}>📷</Text>
          </View>
        )}
      </View>
      
      <Callout tooltip style={styles.callout}>
        <View style={styles.calloutContainer}>
          {imageUrl && (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.calloutImage}
              resizeMode="cover"
            />
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
        {/* Try Approach 2 with proper sizing */}
        {/* {renderImagePropMarker()} */}
        
        {/* If Approach 2 doesn't work well, try Approach 4 */}
        {renderHybridMarker()}
        
        {/* Original Approach 1 - fallback */}
        {/* {renderSimpleImageMarker()} */}
      </MapView>
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
  // Simple marker image (Approach 1)
  simpleMarkerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  // Custom marker wrapper (Approach 3)
  customMarkerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageMarkerContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
  customMarkerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  fallbackMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
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
    width: 20,
    height: 12,
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
  // Hybrid marker styles (Approach 4)
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
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  hybridFallback: {
    width: 44,
    height: 44,
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