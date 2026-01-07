import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Platform, // Added to fix the error
  useWindowDimensions, // Critical for "All-Device" responsiveness
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  BounceIn,
  FadeInDown,
} from 'react-native-reanimated';
import Tts from 'react-native-tts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

// --- DATA ---
const STRINGS = {
  title: 'Modern Kids Learning',
  Alphabet: 'Alphabet',
  Math: 'Math',
  Colors: 'Colors',
  Shapes: 'Shapes',
  Animals: 'Animals',
  Fruits: 'Fruits',
  Flower: 'Flower'
} as const;

const CARDS = [
  { key: 'Animals', color: '#FFB347', image: require('../assets/images/animals.jpeg'), route: 'Animal' },
  { key: 'Fruits', color: '#77DD77', image: require('../assets/images/fruits.png'), route: 'Fruits' },
  { key: 'Math', color: '#4facfe', image: require('../assets/images/123.jpeg'), route: 'Math' },
  { key: 'Alphabet', color: '#FF5E5E', image: require('../assets/images/abc.jpeg'), route: 'Alphabet' },
  { key: 'Colors', color: '#A18CD1', image: require('../assets/images/color.jpeg'), route: 'Colors' },
  { key: 'Shapes', color: '#FAD02E', image: require('../assets/images/shapes.png'), route: 'Shapes' },
  { key: 'Flower', color: '#FFB347', image: require('../assets/images/shapes.png'), route: 'Flower' },
]
// --- COMPONENTS ---

const AnimatedCard = ({ item, index, numColumns }: any) => {
  const { width } = useWindowDimensions();
  const scale = useSharedValue(1);
  const navigation = useNavigation<any>();

  // Calculate dynamic width for responsiveness
  const spacing = 20;
  const itemWidth = (width - spacing * (numColumns + 1)) / numColumns;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Tts.stop();
    Tts.speak(item.key);
    if (item.route) navigation.navigate(item.route);
  };

  return (
    <Animated.View 
      entering={BounceIn.delay(index * 100)} 
      style={[styles.cardWrapper, { width: itemWidth }, animatedStyle]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => (scale.value = withSpring(0.92))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={handlePress}
        style={[styles.card, { backgroundColor: item.color }]}
      >
        <View style={styles.whiteBubble}>
          <Image source={item.image} style={styles.cardImage} />
        </View>
        <Text style={styles.cardLabel}>{item.key}</Text>
      </TouchableOpacity>
      {/* 3D Bottom Shadow Effect */}
      <View style={[styles.cardShadow, { backgroundColor: item.color }]} />
    </Animated.View>
  );
};

// --- MAIN SCREEN ---

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width, height } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Responsiveness Logic
  const isLandscape = width > height;
  const isTablet = width > 768;
  const numColumns = isTablet ? (isLandscape ? 4 : 3) : 2;

  // const handleConfirmParents = () => {
  //   if (inputValue === '8') {
  //     setModalVisible(false);
  //     navigation.navigate('Settings');
  //   } else {
  //     Alert.alert('Oops!', 'That answer is not correct 😊');
  //   }
  // };

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Floating Bubbles */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[styles.bgBubble, { top: '15%', left: '5%', width: 50, height: 50 }]} />
        <View style={[styles.bgBubble, { top: '40%', right: '10%', width: 80, height: 80 }]} />
        <View style={[styles.bgBubble, { bottom: '20%', left: '10%', width: 40, height: 40 }]} />
      </View>

      <Text style={styles.headerTitle}>{STRINGS.title}</Text>

      <FlatList
        data={CARDS}
        key={numColumns} // Forces refresh when rotating screen
        numColumns={numColumns}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <AnimatedCard item={item} index={index} numColumns={numColumns} />
        )}
      />

      {/* Settings Navigation Trigger */}
      <TouchableOpacity 
        style={styles.settingsBtn} 
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="settings" size={28} color="#94A3B8" />
      </TouchableOpacity>

   
    </SafeAreaView>
  );
}

// --- STYLES ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6DFFC' },
  headerTitle: {
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    color: '#FFB347',
    marginVertical: 20,
    // Add custom font here if available
  },
  listContainer: { paddingHorizontal: 10, paddingBottom: 100 },
  
  // Card 3D Styling
  cardWrapper: {
    height: 180,
    marginVertical: 15,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 80, // Makes it a pill shape
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  cardShadow: {
    position: 'absolute',
    bottom: -8,
    width: '95%',
    height: '100%',
    borderRadius: 80,
    opacity: 0.4,
    zIndex: 1,
  },
  whiteBubble: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardImage: { width: 60, height: 60, resizeMode: 'contain' },
  cardLabel: { color: '#FFF', fontSize: 18, fontWeight: '900' },

  // Background
  bgBubble: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 100,
    opacity: 0.4,
  },

  settingsBtn: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 50,
    elevation: 5,
  },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: 280, backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 10 },
  modalSubtitle: { fontSize: 18, marginBottom: 20 },
  modalInput: { width: '100%', height: 50, backgroundColor: '#F1F5F9', borderRadius: 15, textAlign: 'center', fontSize: 20, marginBottom: 20 },
  okButton: { backgroundColor: '#4facfe', paddingHorizontal: 40, paddingVertical: 12, borderRadius: 25 },
  okButtonText: { color: '#FFF', fontWeight: 'bold' },
});