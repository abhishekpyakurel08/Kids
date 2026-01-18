import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Tts from 'react-native-tts';
import ConfettiCannon from 'react-native-confetti-cannon';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useContentStore } from '../store/useContentStore';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const NumberCount: React.FC = () => {
  const navigation = useNavigation();
  const { items, loading, fetchByType } = useContentStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;

  const currentItem = items[currentIndex] as { title?: string; valueName?: string } | undefined;

  // ───────────── INITIAL SETUP ─────────────
  useEffect(() => {
    fetchByType('number', true);

    Tts.setDefaultRate(0.45);
    Tts.setDefaultPitch(1.3);

    // Floating Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, { toValue: -15, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatingAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Cleanup on unmount
    return () => {
      Tts.stop();
    };
  }, []);

  // ───────────── TTS HELPER ─────────────
  const playNumber = (item: typeof currentItem) => {
    if (!item) return;

    // Animate
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.25, friction: 3, tension: 40, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    // Speak number safely
    try {
      Tts.stop();
      const text = item.valueName || item.title || '';
      Tts.speak(text);
    } catch (err) {
      console.log('TTS error:', err);
    }
  };

  // ───────────── NAVIGATION ─────────────
  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);

      // Show confetti on next
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);

      playNumber(items[newIndex]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);

      playNumber(items[newIndex]);
    }
  };

  // ───────────── EXIT BUTTON WITH TTS ─────────────
  const handleExit = () => {
    try {
      Tts.stop();
      Tts.speak('Bye Bye');

      // Wait until TTS finishes before going back
      const listener = Tts.addEventListener('tts-finish', () => {
        navigation.goBack();
        listener.remove(); // cleanup listener
      });
    } catch (err) {
      console.log('TTS error:', err);
      navigation.goBack(); // fallback
    }
  };

  // ───────────── LOADING STATE ─────────────
  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4081" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      {/* 3D Soft Grid Background */}
      <View style={styles.gridContainer}>
        <View style={styles.gridLineHorizontal} />
        <View style={styles.gridLineVertical} />
      </View>

      {/* Exit Button */}
      <TouchableOpacity style={styles.exitBtn} onPress={handleExit} activeOpacity={0.8}>
        <View style={styles.btnShadow} />
        <View style={styles.exitBtnInner}>
          <X size={32} color="#FFF" strokeWidth={5} />
        </View>
      </TouchableOpacity>

      <View style={styles.mainContent}>
        {/* Left Nav */}
        <TouchableOpacity
          onPress={handlePrev}
          style={[styles.navBtn, currentIndex === 0 && styles.disabledBtn]}
          disabled={currentIndex === 0}
        >
          <View style={styles.navShadow} />
          <View style={styles.navBtnInner}>
            <ChevronLeft size={55} color="#8D6E63" strokeWidth={6} />
          </View>
        </TouchableOpacity>

        {/* Floating Number */}
        <View style={styles.numberContainer}>
          {currentItem && (
            <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateY: floatingAnim }] }}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => playNumber(currentItem)}>
                <Text style={styles.bigNumberText}>{currentItem.title}</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* Right Nav */}
        <TouchableOpacity
          onPress={handleNext}
          style={[styles.navBtn, currentIndex === items.length - 1 && styles.disabledBtn]}
          disabled={currentIndex === items.length - 1}
        >
          <View style={styles.navShadow} />
          <View style={styles.navBtnInner}>
            <ChevronRight size={55} color="#8D6E63" strokeWidth={6} />
          </View>
        </TouchableOpacity>
      </View>

      {showConfetti && <ConfettiCannon count={100} origin={{ x: width / 2, y: -20 }} fadeOut />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF9FF' },
  gridContainer: { ...StyleSheet.absoluteFillObject, zIndex: -1 },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    borderStyle: 'dashed',
  },
  gridLineVertical: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    borderStyle: 'dashed',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  exitBtn: { position: 'absolute', top: 25, right: 30, width: 64, height: 64, zIndex: 10 },
  btnShadow: { position: 'absolute', top: 6, width: 64, height: 64, borderRadius: 32, backgroundColor: '#BF360C' },
  exitBtnInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FF5722', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFF' },

  mainContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 40 },

  navBtn: { width: 95, height: 75 },
  navShadow: { position: 'absolute', top: 6, width: 95, height: 75, borderRadius: 25, backgroundColor: '#8D6E63' },
  navBtnInner: { width: 95, height: 75, borderRadius: 25, backgroundColor: '#F9E4C9', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFF' },
  disabledBtn: { opacity: 0.4 },

  numberContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bigNumberText: {
    fontSize: 260,
    fontWeight: '900',
    color: '#FF4081',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 8, height: 8 },
    textShadowRadius: 4,
  },
});

export default NumberCount;
