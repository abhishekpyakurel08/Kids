// src/Screen/FlowerScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Vibration,
  Platform,
  FlatList,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Sound from 'react-native-sound';
import Tts from 'react-native-tts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useContentStore } from '../store/useContentStore';

const BASE_URL = 'https://kiddsapp-backend.tecobit.cloud';
const formatUrl = (url?: string) => (url ? `${BASE_URL}/${url}` : undefined);

// ---------- Animated Star ----------
function Star({ x, y, size }: { x: number; y: number; size: number }) {
  const anim = useSharedValue(0);
  useEffect(() => {
    anim.value = withSequence(withTiming(1, { duration: 300 }), withTiming(0, { duration: 300 }));
  }, []);
  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - size / 2,
    top: y - size / 2,
    width: size,
    height: size,
    transform: [{ scale: anim.value }],
  }));
  return <Animated.Text style={[style, { fontSize: size, color: '#FFD700' }]}>⭐</Animated.Text>;
}

// ---------- Flower Card ----------
function FlowerCard({ item, onSelect, styles }: any) {
  const imageUri = formatUrl(item.imageUrl);

  const handlePress = () => {
    if (item.soundUrl) {
      const sound = new Sound(formatUrl(item.soundUrl)!, undefined, (error) => {
        if (!error) sound.play(() => sound.release());
      });
    }
    Tts.stop();
    Tts.speak(item.title);
    if (Platform.OS === 'android') Vibration.vibrate(10);
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <TouchableOpacity onPress={handlePress}>
          <Image source={{ uri: imageUri }} style={styles.flowerImage} resizeMode="contain" />
        </TouchableOpacity>

        <Text style={styles.flowerTitle}>{item.title}</Text>

        <View style={styles.optionsWrapper}>
          {item.options?.map((opt: string) => (
            <TouchableOpacity key={opt} style={styles.optionBtn} onPress={() => onSelect(item, opt)}>
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.playButton} onPress={handlePress}>
          <Text style={styles.playButtonText}>🔊 Play Sound</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------- Main Screen ----------
export default function FlowerScreen() {
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 768;
  const styles = createStyles(width, height, isTablet);

  const { items: storeItems, loading, fetchByType } = useContentStore();
  const [items, setItems] = useState<any[]>([]);
  const [stars, setStars] = useState<{ x: number; y: number; id: string; size: number }[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ---------- Fetch flowers ----------
  useEffect(() => {
    fetchByType('flower', true);
    AsyncStorage.getItem('flower_cache').then((cached) => {
      if (cached) setItems(JSON.parse(cached));
    });
  }, []);

  useEffect(() => {
    if (storeItems.length > 0) {
      setItems(storeItems);
      AsyncStorage.setItem('flower_cache', JSON.stringify(storeItems));
    }
  }, [storeItems]);

  // ---------- Handle option select ----------
  const handleSelect = (flower: any, option: string) => {
    const correct = option === flower.correctAnswer;

    if (correct) {
      const x = Math.random() * width * 0.8 + width * 0.1;
      const y = Math.random() * height * 0.5 + height * 0.2;
      const size = Math.random() * 30 + 20;
      const id = Date.now().toString();
      setStars((prev) => [...prev, { x, y, id, size }]);
      setTimeout(() => setStars((prev) => prev.filter((s) => s.id !== id)), 600);
    }

    saveStats(correct ? 1 : 0);

    if (currentIndex + 1 >= items.length) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={styles.loaderText}>Loading flowers...</Text>
      </View>
    );
  }

  const currentFlower = items[currentIndex];
  if (!currentFlower) return null;

  return (
    <SafeAreaView style={styles.container}>
      {stars.map((s) => (
        <Star key={s.id} x={s.x} y={s.y} size={s.size} />
      ))}

      {showConfetti && (
        <ConfettiCannon
          count={100}
          origin={{ x: width / 2, y: 0 }}
          fadeOut
          explosionSpeed={350}
          fallSpeed={3000}
        />
      )}

      <FlatList
        data={[currentFlower]}
        horizontal={!isTablet}
        keyExtractor={(item, index) => item._id ?? index.toString()}
        renderItem={({ item }) => <FlowerCard item={item} onSelect={handleSelect} styles={styles} />}
      />
    </SafeAreaView>
  );
}

// ---------- Styles ----------
const createStyles = (width: number, height: number, isTablet: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFE4E1' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { color: '#FF69B4', marginTop: 10, fontWeight: '600' },

    page: {
      width: isTablet ? width / 2 : width,
      paddingVertical: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },

    card: {
      width: isTablet ? width / 2 : width * 0.9,
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.3)',
      paddingVertical: 20,
      borderRadius: 25,
      shadowColor: '#FF69B4',
      shadowOpacity: 0.25,
      shadowRadius: 15,
      elevation: 8,
    },

    flowerImage: {
      width: scale(isTablet ? 250 : 200, width),
      height: scale(isTablet ? 250 : 200, width),
      borderRadius: 120,
      marginBottom: 15,
    },

    flowerTitle: {
      fontSize: moderateScale(isTablet ? 36 : 28, width),
      fontWeight: 'bold',
      color: '#FF69B4',
      marginBottom: 15,
    },

    optionsWrapper: { width: '100%', alignItems: 'center' },

    optionBtn: {
      width: '80%',
      backgroundColor: '#FFB6C1',
      paddingVertical: 12,
      marginVertical: 6,
      borderRadius: 20,
      alignItems: 'center',
    },

    optionText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

    playButton: {
      marginTop: 15,
      backgroundColor: '#FF69B4',
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 25,
    },

    playButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  });

// ---------- Responsive scaling helpers ----------
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;
const scale = (size: number, width: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number, height: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, width: number, factor = 0.5) =>
  size + (scale(size, width) - size) * factor;

// ---------- Dummy saveStats function ----------
function saveStats(score: number) {
  // You can integrate backend stats saving here
  console.log('Score saved:', score);
}
