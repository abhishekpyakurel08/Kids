import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Vibration,
  Platform,
  SafeAreaView,
  useWindowDimensions,
  Animated,
  ImageBackground,
  StatusBar,
} from 'react-native';
import Tts from 'react-native-tts';
import { ArrowLeft, ArrowRight, X, Zap, Gamepad2 } from 'lucide-react-native';
import Orientation from 'react-native-orientation-locker';
import { useContentStore } from '../store/useContentStore';

const BASE_URL = 'https://kiddsapp-backend.tecobit.cloud';

export default function FlowerScreen() {
  const { width, height } = useWindowDimensions();
  const { items, loading, fetchByType } = useContentStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(1)).current;
  const leftBtnPush = useRef(new Animated.Value(0)).current;
  const rightBtnPush = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Orientation.lockToLandscape();
    StatusBar.setHidden(true);
    fetchByType('flower', true);

    return () => {
      Orientation.unlockAllOrientations();
      StatusBar.setHidden(false);
    };
  }, []);

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      triggerTransition();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      triggerTransition();
    }
  };

  const triggerTransition = () => {
    // Flower scale animation
    scaleAnim.setValue(0.8);
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    // Badge bounce animation
    badgeScale.setValue(0.8);
    Animated.spring(badgeScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();

    // Slide-up animation for flower + badge
    translateYAnim.setValue(20); // start slightly lower
    Animated.spring(translateYAnim, { toValue: 0, friction: 5, useNativeDriver: true }).start();
  };

  const handlePress = (item: any) => {
    Tts.stop();
    Tts.speak(item.title || 'Flower');

    if (Platform.OS === 'android') Vibration.vibrate(15);

    // Tap bounce effect on flower
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const animateNavButton = (animVar: Animated.Value, action: () => void) => {
    Animated.sequence([
      Animated.timing(animVar, { toValue: 4, duration: 100, useNativeDriver: true }),
      Animated.timing(animVar, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start(() => action());
  };

  if (loading || items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF003C" />
      </View>
    );
  }

  const currentItem = items[currentIndex];
  const isEmoji = (str: string) => str && str.length <= 4 && !str.includes('/') && !str.startsWith('http');

  const NavButton = ({ direction, disabled }: { direction: 'left' | 'right'; disabled: boolean }) => {
    const animVar = direction === 'left' ? leftBtnPush : rightBtnPush;
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => animateNavButton(animVar, direction === 'left' ? handlePrev : handleNext)}
        disabled={disabled}
        style={[styles.arrow3DContainer, disabled && { opacity: 0.3 }]}
      >
        <View style={styles.arrow3DShadow} />
        <Animated.View style={[styles.arrow3DFace, { transform: [{ translateY: animVar }] }]}>
          {direction === 'left' ? (
            <ArrowLeft color="#7B5231" size={32} strokeWidth={4} />
          ) : (
            <ArrowRight color="#7B5231" size={32} strokeWidth={4} />
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <ImageBackground
        source={{ uri: 'https://your-backend-or-cdn.com/garden_bg.png' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.overlay}>
          {/* Top Bar */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={[styles.roundBtn, { backgroundColor: '#FFB300' }]}>
                <Zap color="white" fill="white" size={22} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roundBtn, { backgroundColor: '#F44336' }]}>
                <Gamepad2 color="white" size={22} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.exitBtn}>
              <X color="white" strokeWidth={5} size={24} />
            </TouchableOpacity>
          </View>

          {/* Main content */}
          <View style={styles.content}>
            <NavButton direction="left" disabled={currentIndex === 0} />

            <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateY: translateYAnim }] }}>
              <TouchableOpacity activeOpacity={1} onPress={() => handlePress(currentItem)} style={styles.flowerContainer}>
                {isEmoji(currentItem.imageUrl) ? (
                  <Text style={styles.emojiText}>{currentItem.imageUrl}</Text>
                ) : (
                  <Image
                    source={{
                      uri: currentItem.imageUrl.startsWith('http')
                        ? currentItem.imageUrl
                        : `${BASE_URL}/${currentItem.imageUrl}`,
                    }}
                    style={styles.flowerImage}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>

              {/* Bottom Badge */}
              <Animated.View style={[styles.bottomBadge, { transform: [{ scale: badgeScale }, { translateY: translateYAnim }] }]}>
                <Text style={styles.bottomBadgeText}>{currentItem.title.toUpperCase()}</Text>
              </Animated.View>
            </Animated.View>

            <NavButton direction="right" disabled={currentIndex === items.length - 1} />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F7FA' },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, paddingHorizontal: 30 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
  },
  headerLeft: { flexDirection: 'row', gap: 12 },
  roundBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    elevation: 4,
  },
  exitBtn: {
    backgroundColor: '#FF5722',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },

  // Main content
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  flowerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flowerImage: { width: 320, height: 280 },
  emojiText: { fontSize: 160, textAlign: 'center' },

  // 3D Navigation
  arrow3DContainer: { width: 75, height: 65 },
  arrow3DShadow: {
    position: 'absolute',
    bottom: 0,
    width: 75,
    height: 55,
    backgroundColor: '#7B5231',
    borderRadius: 18,
  },
  arrow3DFace: {
    width: 75,
    height: 58,
    backgroundColor: '#F3D299',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#7B5231',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom badge
  bottomBadge: {
    backgroundColor: '#FF003C',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#B3002A',
    alignSelf: 'center',
    marginBottom: 25,
    elevation: 6,
    marginTop: 20,
  },
  bottomBadgeText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
});
