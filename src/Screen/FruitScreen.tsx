import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import Tts from 'react-native-tts';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Home } from 'lucide-react-native';
import FastImage from 'react-native-fast-image'; // ✅ Cached Image
import { useContentStore } from '../store/useContentStore';

const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://kiddsapp-backend.tecobit.cloud';
const CACHE_KEY = 'FRUITS_CACHE';

const shuffle = (arr: any[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const FruitScreen = ({ navigation }: any) => {
  const { items, loading, fetchByType } = useContentStore();
  const [fruits, setFruits] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [offline, setOffline] = useState(false);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // --- Load fruits ---
  const loadFruits = async () => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      await fetchByType('fruit', true);
      setOffline(false);
    } else {
      setOffline(true);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) setFruits(JSON.parse(cached));
    }
  };

  useEffect(() => {
    loadFruits();
    return () => Tts.stop();
  }, []);

  useEffect(() => {
    if (items && items.length) {
      const shuffled = shuffle(items);
      setFruits(shuffled);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(shuffled)).catch(console.log);
      setCurrentIndex(0);
    }
  }, [items]);

  const currentFruit = fruits[currentIndex];

  useEffect(() => {
    if (!currentFruit) return;
    Tts.stop();
    Tts.setDefaultRate(0.45);
    Tts.speak(`Match the ${currentFruit.title}`);
  }, [currentFruit?._id]);

  const onMatchSuccess = () => {
    if (!currentFruit || fruits.length === 0) return;
    Tts.stop();
    Tts.speak(`Correct! ${currentFruit.title}`);
    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
      setCurrentIndex((prev) => (prev + 1 < fruits.length ? prev + 1 : 0));
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
    }, 1200);
  };

  const onGestureEnd = (event: any) => {
    if (event.nativeEvent.translationY > height * 0.25) runOnJS(onMatchSuccess)();
    else {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if ((loading && !fruits.length) || !currentFruit) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>
          {offline ? 'Offline mode: Loading cached fruits...' : 'Loading fruits...'}
        </Text>
      </View>
    );
  }

  const isEmoji = (v?: string) => v && /\p{Emoji}/u.test(v);
  const normalizeUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${BASE_URL}${url}`;
    if (url.startsWith('uploads/')) return `${BASE_URL}/${url}`;
    return `${BASE_URL}/uploads/${url}`;
  };
  const imageUrl = normalizeUrl(currentFruit?.imageUrl);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {showConfetti && <ConfettiCannon count={80} origin={{ x: width / 2, y: 0 }} />}
        <Text style={styles.title}>🍓  Match Game 🍌 {offline && '(Offline)'}</Text>

        <View style={styles.sourceArea}>
          <PanGestureHandler
            onGestureEvent={(e) => {
              translateX.value = e.nativeEvent.translationX;
              translateY.value = e.nativeEvent.translationY;
            }}
            onEnded={onGestureEnd}
          >
            <Animated.View style={[styles.fruitBubble, animatedStyle]}>
              {isEmoji(currentFruit.imageUrl) ? (
                <Text style={styles.emojiText}>{currentFruit.imageUrl}</Text>
              ) : imageUrl ? (
                <FastImage
                  source={{ uri: imageUrl, priority: FastImage.priority.high }}
                  style={styles.fruitImage}
                  resizeMode={FastImage.resizeMode.contain}
                />
              ) : (
                <Text style={styles.fallback}>❓</Text>
              )}
            </Animated.View>
          </PanGestureHandler>
        </View>

        <View style={styles.targetArea}>
          <Text style={styles.dropText}>Drop Here!</Text>
          <View style={styles.labelContainer}>
            <Text style={styles.fruitName}>{currentFruit.title.toUpperCase()}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.goBack()}>
          <Home color="#FFF" size={30} />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default FruitScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#A7F3D0', alignItems: 'center' },
  center: { flex: 1, backgroundColor: '#A7F3D0', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#065F46', fontSize: 24, fontWeight: 'bold' },
  title: { fontSize: 38, fontWeight: '900', color: '#065F46', marginTop: 30 },
  sourceArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fruitBubble: {
    width: 160, height: 160, backgroundColor: '#FDE68A', borderRadius: 80,
    justifyContent: 'center', alignItems: 'center', borderWidth: 6, borderColor: '#F59E0B',
  },
  fruitImage: { width: 110, height: 110 },
  emojiText: { fontSize: 90 },
  fallback: { fontSize: 60 },
  targetArea: {
    width: width * 0.85, height: 180, borderRadius: 50, borderStyle: 'dashed',
    borderWidth: 5, borderColor: '#10B981', justifyContent: 'center', alignItems: 'center',
    marginBottom: 80, backgroundColor: '#ECFDF5',
  },
  dropText: { fontSize: 22, fontWeight: '900', color: '#10B981', marginBottom: 10 },
  labelContainer: { paddingHorizontal: 40, paddingVertical: 14, backgroundColor: '#34D399', borderRadius: 30 },
  fruitName: { fontSize: 34, fontWeight: '900', color: '#064E3B' },
  homeBtn: { position: 'absolute', bottom: 25, left: 20, backgroundColor: '#F97316', padding: 18, borderRadius: 40 },
});
