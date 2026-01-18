import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import Tts from 'react-native-tts';
import Orientation from 'react-native-orientation-locker';
import { X } from 'lucide-react-native';
import { useContentStore } from '../store/useContentStore';

const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://kiddsapp-backend.tecobit.cloud';

export default function FruitScreen({ navigation }: any) {
  const { items, loading, fetchByType } = useContentStore();
  const [fruits, setFruits] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  const translateX = useSharedValue(0);
  const transition = useSharedValue(0); // for fade + scale
  const bounce = useSharedValue(1); // for tap bounce
  const EMOJI_SIZE = Math.min(width, height) * 0.25;

  useEffect(() => {
    Orientation.lockToLandscape();
    fetchByType('fruit', true);

    const backAction = () => {
      handleQuit();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      backHandler.remove();
      Orientation.unlockAllOrientations();
      Tts.stop();
    };
  }, []);

  useEffect(() => {
    if (items?.length) {
      setFruits(items);
      setIndex(0);
    }
  }, [items]);

  const currentFruit = fruits[index];

  // Speak fruit name on index change
  useEffect(() => {
    if (currentFruit) {
      Tts.stop();
      Tts.speak(currentFruit.title);
      transition.value = withTiming(1, { duration: 400 }, () => {
        transition.value = 0;
      });
    }
  }, [index, currentFruit]);

  const handleQuit = () => {
    Tts.stop();
    Tts.speak("Bye Bye!");
    setTimeout(() => navigation.goBack(), 1000);
  };

  const next = () => setIndex(i => (i + 1) % fruits.length);
  const prev = () => setIndex(i => (i - 1 + fruits.length) % fruits.length);

  const onSwipeEnd = (e: any) => {
    if (e.nativeEvent.translationX < -50) runOnJS(next)();
    if (e.nativeEvent.translationX > 50) runOnJS(prev)();
    translateX.value = withSpring(0);
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: bounce.value }],
  }));

  // Animated fade + scale for fruit on index change
  const transitionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(transition.value, [0, 1], [0.7, 1], Extrapolate.CLAMP),
    transform: [
      {
        scale: interpolate(transition.value, [0, 1], [0.85, 1], Extrapolate.CLAMP),
      },
    ],
  }));

  const isEmoji = currentFruit?.imageUrl?.length <= 4;

  const imageUrl = currentFruit?.imageUrl
    ? currentFruit.imageUrl.startsWith('http')
      ? currentFruit.imageUrl
      : `${BASE_URL}/uploads/${currentFruit.imageUrl}`
    : null;

  // Tap to speak + bounce
  const onTapFruit = () => {
    if (!currentFruit) return;
    Tts.stop();
    Tts.speak(currentFruit.title);

    // Bounce animation
    bounce.value = withSpring(1.2, { damping: 5 }, () => {
      bounce.value = withSpring(1);
    });
  };

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

        {/* EXIT BUTTON */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitBtn} onPress={handleQuit}>
            <X color="white" strokeWidth={4} size={30} />
          </TouchableOpacity>
        </View>

        {/* LEFT ARROW */}
        <TouchableOpacity style={[styles.arrow, { left: 30 }]} onPress={prev}>
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>

        {/* RIGHT ARROW */}
        <TouchableOpacity style={[styles.arrow, { right: 30 }]} onPress={next}>
          <Text style={styles.arrowText}>▶</Text>
        </TouchableOpacity>

        {/* SWIPE GESTURE + TAP */}
        <PanGestureHandler
          onGestureEvent={e => (translateX.value = e.nativeEvent.translationX)}
          onEnded={onSwipeEnd}
        >
          <Animated.View style={[styles.fruitWrapper, animStyle, transitionStyle]}>
            <TouchableOpacity activeOpacity={0.9} onPress={onTapFruit}>
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
            </TouchableOpacity>
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
  header: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 20,
  },
  exitBtn: {
    backgroundColor: '#FF5722',
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
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
    borderRadius: 20,
  },
  emoji: {
    textAlign: 'center',
  },
  label: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: '#E11D48',
    paddingHorizontal: 60,
    paddingVertical: 12,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#B3002A',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  labelText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  arrow: {
    position: 'absolute',
    top: '45%',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 4,
    borderColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  arrowText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
});
