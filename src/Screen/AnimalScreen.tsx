import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Pressable,
  BackHandler,
} from 'react-native';

import { ArrowLeft, ArrowRight, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Sound from 'react-native-sound';
import Orientation from 'react-native-orientation-locker';
import Tts from 'react-native-tts';

import { useContentStore } from '../store/useContentStore';

const BASE_URL = 'https://kiddsapp-backend.tecobit.cloud';

const isEmoji = (str: string) =>
  str && str.length <= 4 && !str.includes('/') && !str.startsWith('http');

const AnimalScreen = () => {
  const navigation = useNavigation();
  const { items, loading, fetchByType } = useContentStore();

  const [currentIndex, setCurrentIndex] = useState(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const leftBtnPush = useRef(new Animated.Value(0)).current;
  const rightBtnPush = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const soundCache = useRef<Record<string, Sound>>({});

  /* ───────────────────────────────
     INITIAL SETUP
  ─────────────────────────────── */
  useEffect(() => {
    Orientation.lockToLandscape();
    StatusBar.setHidden(true);
    fetchByType('animal', true);

    Sound.setCategory('Playback', true);

    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.45);
    Tts.setDefaultPitch(1.3);

    const backAction = () => {
      handleQuit();
      return true; // prevent default
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => {
      backHandler.remove();
      Orientation.unlockAllOrientations();
      StatusBar.setHidden(false);

      Object.values(soundCache.current).forEach(s => s.release());
      Tts.stop();
    };
  }, []);

  /* ───────────────────────────────
     PRELOAD ANIMAL SOUNDS
  ─────────────────────────────── */
  useEffect(() => {
    items.forEach(item => {
      if (item.soundUrl && !soundCache.current[item._id]) {
        const uri = item.soundUrl.startsWith('http')
          ? item.soundUrl
          : `${BASE_URL}/${item.soundUrl}`;

        soundCache.current[item._id] = new Sound(uri, '', error => {
          if (error) console.warn('Sound load failed:', uri);
        });
      }
    });
  }, [items]);

  /* ───────────────────────────────
     SOUND HELPERS
  ─────────────────────────────── */
  const stopAllSounds = () => {
    Object.values(soundCache.current).forEach(sound => sound.stop());
  };

  const playSound = (id: string) => {
    stopAllSounds();
    const sound = soundCache.current[id];
    if (sound) sound.play();
  };

  /* ───────────────────────────────
     UI ANIMATIONS
  ─────────────────────────────── */
  const bounceAnimal = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.2, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const animateButton = (anim: Animated.Value, action: () => void) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 4, duration: 100, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start(action);
  };

  /* ───────────────────────────────
     NAVIGATION
  ─────────────────────────────── */
  const nextItem = () => {
    stopAllSounds();
    if (currentIndex < items.length - 1) setCurrentIndex(i => i + 1);
  };

  const prevItem = () => {
    stopAllSounds();
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  const handleQuit = () => {
    stopAllSounds();
    Tts.stop();

    // Fade out screen
    Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: true }).start();

    // Speak "Bye bye" and exit app safely
    Tts.speak('Bye bye!', undefined, {
      onFinish: () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          BackHandler.exitApp(); // fallback if first screen
        }
      },
    });
  };

  /* ───────────────────────────────
     LOADING
  ─────────────────────────────── */
  if (loading || items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF003C" />
      </View>
    );
  }

  const currentItem = items[currentIndex];

  /* ───────────────────────────────
     NAV BUTTON
  ─────────────────────────────── */
  const NavButton = ({
    direction,
    disabled,
  }: {
    direction: 'left' | 'right';
    disabled: boolean;
  }) => {
    const animVar = direction === 'left' ? leftBtnPush : rightBtnPush;

    return (
      <TouchableOpacity
        activeOpacity={1}
        disabled={disabled}
        onPress={() =>
          animateButton(animVar, direction === 'left' ? prevItem : nextItem)
        }
        style={[styles.arrow3DContainer, disabled && { opacity: 0.3 }]}
      >
        <View style={styles.arrow3DShadow} />
        <Animated.View
          style={[styles.arrow3DFace, { transform: [{ translateY: animVar }] }]}
        >
          {direction === 'left' ? (
            <ArrowLeft color="#7B5231" size={32} strokeWidth={4} />
          ) : (
            <ArrowRight color="#7B5231" size={32} strokeWidth={4} />
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  /* ───────────────────────────────
     UI
  ─────────────────────────────── */
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ImageBackground
        source={{ uri: 'https://i.imgur.com/your_landscape_bg.png' }}
        style={styles.backgroundImage}
      >
        <SafeAreaView style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.exitBtn} onPress={handleQuit}>
              <X color="white" size={24} strokeWidth={5} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <NavButton direction="left" disabled={currentIndex === 0} />

            <View style={styles.animalContainer}>
              <Pressable
                onPress={() => {
                  bounceAnimal();
                  playSound(currentItem._id);
                }}
              >
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  {isEmoji(currentItem.imageUrl) ? (
                    <Text style={styles.emojiText}>{currentItem.imageUrl}</Text>
                  ) : (
                    <Image
                      source={{
                        uri: currentItem.imageUrl.startsWith('http')
                          ? currentItem.imageUrl
                          : `${BASE_URL}/${currentItem.imageUrl}`,
                      }}
                      style={styles.animalImage}
                      resizeMode="contain"
                    />
                  )}
                </Animated.View>
              </Pressable>

              <View style={styles.titleBottomWrapper}>
                <Text style={styles.titleBottomText}>
                  {currentItem.title.toUpperCase()}
                </Text>
              </View>
            </View>

            <NavButton direction="right" disabled={currentIndex === items.length - 1} />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </Animated.View>
  );
};

/* ───────────────────────────────
   STYLES
─────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D0E9AC' },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, paddingHorizontal: 30 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'flex-end', paddingTop: 15 },
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
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  animalContainer: { flex: 1, alignItems: 'center' },
  animalImage: { width: 300, height: 250 },
  emojiText: { fontSize: 150 },
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
  titleBottomWrapper: {
    marginTop: 20,
    backgroundColor: '#FF003C',
    paddingHorizontal: 50,
    paddingVertical: 10,
    borderRadius: 25,
  },
  titleBottomText: {
    color: 'white',
    fontSize: 26,
    fontWeight: '900',
  },
});

export default AnimalScreen;
