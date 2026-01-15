import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import Tts from 'react-native-tts';
import { ArrowLeft, ArrowRight, X } from 'lucide-react-native';
import Orientation from 'react-native-orientation-locker';
import { useContentStore } from '../store/useContentStore';
import { useNavigation } from '@react-navigation/native';

const BASE_URL = 'https://kiddsapp-backend.tecobit.cloud';

const BirdScreen = () => {
  const { items, loading, fetchByType } = useContentStore();
  const [index, setIndex] = useState(0);
  const navigation = useNavigation();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(1)).current;
  const leftBtnPush = useRef(new Animated.Value(0)).current;
  const rightBtnPush = useRef(new Animated.Value(0)).current;
  const exitBtnPush = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Orientation.lockToLandscape();
    StatusBar.setHidden(true);
    fetchByType('bird', true);

    return () => {
      Orientation.unlockAllOrientations();
      StatusBar.setHidden(false);
    };
  }, []);

  if (loading || items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF004D" />
      </View>
    );
  }

  const currentBird = items[index];

  const isEmoji = (str: string) =>
    str && str.length <= 4 && !str.includes('/') && !str.startsWith('http');

  // Navigation arrows
  const handleNav = (dir: 'next' | 'prev', animVar: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animVar, { toValue: 5, duration: 100, useNativeDriver: true }),
      Animated.timing(animVar, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      if (dir === 'next' && index < items.length - 1) setIndex(prev => prev + 1);
      if (dir === 'prev' && index > 0) setIndex(prev => prev - 1);

      // Animate slide-up and badge
      translateYAnim.setValue(20);
      badgeScale.setValue(0.8);
      Animated.spring(translateYAnim, { toValue: 0, friction: 5, useNativeDriver: true }).start();
      Animated.spring(badgeScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    });
  };

  // Tap bird to speak & bounce
  const speakAndBounce = () => {
    Tts.stop();
    Tts.speak(currentBird?.title || 'Bird');

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  // Exit button: instantly stop TTS and go back
  const handleExit = () => {
    Tts.stop();
    Animated.sequence([
      Animated.timing(exitBtnPush, { toValue: 5, duration: 100, useNativeDriver: true }),
      Animated.timing(exitBtnPush, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start(() => navigation.goBack());
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://i.imgur.com/your_landscape_bg.png' }}
        style={styles.flex}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.flex}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity activeOpacity={1} onPress={handleExit}>
              <Animated.View style={{ transform: [{ translateY: exitBtnPush }] }}>
                <View style={styles.exitBtn}>
                  <X color="white" strokeWidth={5} size={22} />
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* INTERACTION CONTENT */}
          <View style={styles.content}>
            {/* LEFT ARROW */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => handleNav('prev', leftBtnPush)}
              disabled={index === 0}
            >
              <View style={[styles.navBtn3D, index === 0 && { opacity: 0.3 }]}>
                <View style={styles.btnShadow} />
                <Animated.View style={[styles.btnFace, { transform: [{ translateY: leftBtnPush }] }]}>
                  <ArrowLeft color="#7B5231" size={35} strokeWidth={4} />
                </Animated.View>
              </View>
            </TouchableOpacity>

            {/* CHARACTER/EMOJI */}
            <TouchableOpacity activeOpacity={1} onPress={speakAndBounce} style={styles.displayArea}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateY: translateYAnim }] }}>
                {isEmoji(currentBird?.imageUrl || '') ? (
                  <Text style={styles.emojiText}>{currentBird?.imageUrl}</Text>
                ) : (
                  <Animated.Image
                    source={{
                      uri: currentBird?.imageUrl?.startsWith('http')
                        ? currentBird.imageUrl
                        : `${BASE_URL}/${currentBird.imageUrl}`,
                    }}
                    style={styles.mainImage}
                    resizeMode="contain"
                  />
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* RIGHT ARROW */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => handleNav('next', rightBtnPush)}
              disabled={index === items.length - 1}
            >
              <View style={[styles.navBtn3D, index === items.length - 1 && { opacity: 0.3 }]}>
                <View style={styles.btnShadow} />
                <Animated.View style={[styles.btnFace, { transform: [{ translateY: rightBtnPush }] }]}>
                  <ArrowRight color="#7B5231" size={35} strokeWidth={4} />
                </Animated.View>
              </View>
            </TouchableOpacity>
          </View>

          {/* BOTTOM BADGE */}
          <Animated.View style={[styles.bottomBadge, { transform: [{ scale: badgeScale }, { translateY: translateYAnim }] }]}>
            <Text style={styles.bottomBadgeText}>{currentBird?.title?.toUpperCase()}</Text>
          </Animated.View>

          {/* GRASS FOOTER */}
          <View style={styles.grassFooter}>
            <Text style={styles.grassText}>🌱🌿🌻☘️🌵🌷🍀🌿🌱🌻🌱🌿🌻☘️🌵🌷🍀🌿🌱🌻</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#87CEEB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // HEADER
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, alignItems: 'center' },
  exitBtn: { backgroundColor: '#FF5722', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white' },

  // CONTENT
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30 },
  displayArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mainImage: { width: 320, height: 260 },
  emojiText: { fontSize: 160 },

  // NAV BUTTON 3D
  navBtn3D: { width: 75, height: 65 },
  btnShadow: { position: 'absolute', bottom: 0, width: 75, height: 55, backgroundColor: '#7B5231', borderRadius: 15 },
  btnFace: { width: 75, height: 58, backgroundColor: '#F3D299', borderRadius: 15, borderWidth: 3, borderColor: '#7B5231', justifyContent: 'center', alignItems: 'center' },

  // BOTTOM BADGE
  bottomBadge: { backgroundColor: '#FF003C', paddingHorizontal: 50, paddingVertical: 8, borderRadius: 20, borderWidth: 3, borderColor: '#B3002A', alignSelf: 'center', marginBottom: 10, elevation: 6 },
  bottomBadgeText: { color: 'white', fontSize: 26, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },

  // GRASS FOOTER
  grassFooter: { height: 45, backgroundColor: '#4CAF50', justifyContent: 'center', overflow: 'hidden' },
  grassText: { fontSize: 32, textAlign: 'center', marginTop: -8 },
});

export default BirdScreen;
