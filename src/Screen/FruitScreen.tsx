import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import Tts from 'react-native-tts';
import Orientation from 'react-native-orientation-locker';
import { useContentStore } from '../store/useContentStore';

const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://kiddsapp-backend.tecobit.cloud';

export default function FruitScreen({ navigation }: any) {
  const { items, loading, fetchByType } = useContentStore();
  const [fruits, setFruits] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  const translateX = useSharedValue(0);

  // Dynamic emoji size
  const EMOJI_SIZE = Math.min(width, height) * 0.25;

  useEffect(() => {
    Orientation.lockToLandscape();
    fetchByType('fruit', true);
    return () => Orientation.unlockAllOrientations();
  }, []);

  useEffect(() => {
    if (items?.length) {
      setFruits(items);
      setIndex(0);
    }
  }, [items]);

  const currentFruit = fruits[index];

  useEffect(() => {
    if (currentFruit) {
      Tts.stop();
      Tts.speak(currentFruit.title);
    }
  }, [index, currentFruit]);

  const next = () => setIndex(i => (i + 1) % fruits.length);
  const prev = () => setIndex(i => (i - 1 + fruits.length) % fruits.length);

  const onSwipeEnd = (e: any) => {
    if (e.nativeEvent.translationX < -50) runOnJS(next)();
    if (e.nativeEvent.translationX > 50) runOnJS(prev)();
    translateX.value = withSpring(0);
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const isEmoji = currentFruit?.imageUrl?.length <= 2;

  const imageUrl = currentFruit?.imageUrl
    ? currentFruit.imageUrl.startsWith('http')
      ? currentFruit.imageUrl
      : `${BASE_URL}/uploads/${currentFruit.imageUrl}`
    : null;

  if (loading || !currentFruit) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />

        {/* LEFT ARROW */}
        <TouchableOpacity style={[styles.arrow, { left: 30 }]} onPress={prev}>
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>

        {/* RIGHT ARROW */}
        <TouchableOpacity style={[styles.arrow, { right: 30 }]} onPress={next}>
          <Text style={styles.arrowText}>▶</Text>
        </TouchableOpacity>

        {/* SWIPE GESTURE */}
        <PanGestureHandler
          onGestureEvent={(e) => (translateX.value = e.nativeEvent.translationX)}
          onEnded={onSwipeEnd}
        >
          <Animated.View style={[styles.fruitWrapper, animStyle]}>
            {isEmoji ? (
              <Text style={[styles.emoji, { fontSize: EMOJI_SIZE }]}>{currentFruit.imageUrl}</Text>
            ) : (
              imageUrl && (
                <FastImage
                  source={{ uri: imageUrl, cache: FastImage.cacheControl.web }}
                  style={styles.image}
                  resizeMode={FastImage.resizeMode.contain}
                />
              )
            )}
          </Animated.View>
        </PanGestureHandler>

        {/* BOTTOM LABEL */}
        <View style={styles.label}>
          <Text style={styles.labelText}>{currentFruit.title.toUpperCase()}</Text>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#87CEFA',
  },
  fruitWrapper: {
    width: 350,
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emoji: {
    textAlign: 'center',
  },
  label: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#E11D48',
    paddingHorizontal: 60,
    paddingVertical: 18,
    borderRadius: 40,
  },
  labelText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  arrowText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
});
