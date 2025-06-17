import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from '../screens/Login';
import CameraScreen from '../screens/CameraScreen';
import MapScreen from '../screens/MapScreen';
import PhotoListScreen from '../screens/PhotoListScreen';
export type RootStackParamList = {
  Login: undefined;
  CameraScreen: undefined;
   MapScreen: {
    latitude: number;
    longitude: number;
    imageUrl: string;
    timestamp: string;
    uid: string;
  };
  PhotoListScreen: undefined
};

const Stack = createStackNavigator<RootStackParamList>();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CameraScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CameraScreen" component={CameraScreen} />
        <Stack.Screen name="PhotoListScreen" component={PhotoListScreen} />
        <Stack.Screen name="MapScreen" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
