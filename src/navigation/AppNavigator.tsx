import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Core Screens
import SplashScreen from '../Screen/SplashScreen';
import HomeScreen from '../Screen/HomeScreen';
import SettingsScreen from '../Screen/SettingScreen';

// Alphabet Flow
import AlphabetMenuScreen from '../Screen/AlphabetMenuScreen';
import AlphabetScreen from '../Screen/AlphabetScreen';
import PhonicsScreen from '../Screen/PhonicsScreen';

// Math Flow
import MathMenuScreen from '../Screen/MathMenuScreen';
import MathScreen from '../Screen/MathScreen';
import NumberCountScreen from '../Screen/NumberCount';

// Category Screens
import ColorsScreen from '../Screen/ColorsScreen';
import ShapesScreen from '../Screen/ShapesScreen';
import AnimalScreen from '../Screen/AnimalScreen';
import FruitsScreen from '../Screen/FruitScreen';
import FlowerScreen from '../Screen/FlowerScreen';
import BirdsScreen from '../Screen/BirdsScreen';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Settings: undefined;
  AlphabetMenu: undefined;
  Alphabet: undefined;
  Phonics: undefined;
  Colors: undefined;
  Shapes: undefined;
  Animal: undefined;
  Fruits: undefined;
  Flower: undefined;
  Birds: undefined;
  MathMenu: undefined;
  Math: { type: 'addition' | 'subtraction' | 'multiplication' | 'division' };
  NumberCount: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          orientation: 'landscape', 
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        
        {/* Alphabet Module */}
        <Stack.Screen name="AlphabetMenu" component={AlphabetMenuScreen} />
        <Stack.Screen name="Alphabet" component={AlphabetScreen} />
        <Stack.Screen name="Phonics" component={PhonicsScreen} />

        {/* Categories */}
        <Stack.Screen name="Colors" component={ColorsScreen} />
        <Stack.Screen name="Shapes" component={ShapesScreen} />
        <Stack.Screen name="Animal" component={AnimalScreen} />
        <Stack.Screen name="Fruits" component={FruitsScreen} />
        <Stack.Screen name="Flower" component={FlowerScreen} />
        <Stack.Screen name="Birds" component={BirdsScreen} />

        {/* Math Module */}
        <Stack.Screen name="MathMenu" component={MathMenuScreen} />
        <Stack.Screen name="Math" component={MathScreen} />
        <Stack.Screen name="NumberCount" component={NumberCountScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}