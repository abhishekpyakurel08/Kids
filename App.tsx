



import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Orientation from 'react-native-orientation-locker';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    Orientation.lockToLandscape();
    return () => Orientation.unlockAllOrientations();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
 <AppNavigator />
  </GestureHandlerRootView>
  );
}
