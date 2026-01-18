



import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Orientation from 'react-native-orientation-locker';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'react-native';

export default function App() {
  useEffect(() => {
    Orientation.lockToLandscape(); // Lock globally
    StatusBar.setHidden(true);

    return () => {
      Orientation.unlockAllOrientations();
      StatusBar.setHidden(false);
    };
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
 <AppNavigator />
  </GestureHandlerRootView>
  );
}
