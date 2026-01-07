import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ActivityIndicator, Vibration, Platform, 
  SafeAreaView, useWindowDimensions, Animated,
  Alert
} from 'react-native';
import Sound from 'react-native-sound';
import Tts from 'react-native-tts';
import ConfettiCannon from 'react-native-confetti-cannon';
import LinearGradient from 'react-native-linear-gradient';
import { useContentStore } from '../store/useContentStore';

const BASE_URL = 'https://kiddsapp-backend.tecobit.cloud';

// ---------- Rocket Navigation Component ----------
const RocketButton = ({ direction, onPress, styles }: { direction: 'left' | 'right', onPress: () => void, styles: any }) => {
  const tiltAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(tiltAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(tiltAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = tiltAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress} 
      style={[styles.rocketContainer, direction === 'left' ? { left: 15 } : { right: 15 }]}
    >
      <Animated.View style={{ transform: [{ translateY }] }}>
        <Text style={[styles.rocketEmoji, direction === 'left' && { transform: [{ rotate: '-90deg' }] }]}>🚀</Text>
        <Text style={styles.rocketText}>{direction === 'left' ? 'BACK' : 'NEXT'}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ---------- Fixed Flower Card Component ----------
const FlowerCard = ({ item, styles }: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Normalize and detect image types (emoji vs remote URL)
  const isEmoji = (v?: string) => v && /\p{Emoji}/u.test(v);
  const normalizeUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };
  const imageUri = normalizeUrl(item.imageUrl);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, { toValue: 0.85, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleValue, { toValue: 1.1, friction: 3, useNativeDriver: true }),
      Animated.timing(scaleValue, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    if (item.soundUrl) {
      const fullUrl = item.soundUrl.startsWith('http') ? item.soundUrl : `${BASE_URL}${item.soundUrl}`;
      const sound = new Sound(fullUrl, '', (error) => {
        if (!error) sound.play(() => sound.release());
      });
    }
    Tts.stop();
    Tts.speak(item.title || "Flower");
    if (Platform.OS === 'android') Vibration.vibrate(15);
  };

  return (
    <View style={styles.cardContainer}>
      <Animated.View style={[styles.clayCard, { transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity activeOpacity={1} onPress={handlePress} style={styles.imageWrapper}>
          {isEmoji(item.imageUrl) ? (
            <Text style={styles.emojiMain}>{item.imageUrl}</Text>
          ) : imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.flowerImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.emojiMain}>❓</Text>
          )}
        </TouchableOpacity>
        <View style={styles.nameTag}>
          <Text style={styles.flowerTitle}>{item.title ? item.title.toUpperCase() : ""}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

// ---------- Main Screen ----------
export default function FlowerScreen() {
  const { width } = useWindowDimensions();
  const styles = createStyles(width);
  const { items: storeItems, loading, fetchByType } = useContentStore();
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchByType('flower', true);
  }, []);

  useEffect(() => {
    if (storeItems.length > 0) setItems(storeItems);
  }, [storeItems]);

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#E0F7FA', '#FCE4EC']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Flower Garden</Text>
        </View>

        <View style={styles.mainContent}>
          <RocketButton direction="left" onPress={handlePrev} styles={styles} />
          
          {items[currentIndex] && (
            <FlowerCard item={items[currentIndex]} styles={styles} />
          )}

          <RocketButton direction="right" onPress={handleNext} styles={styles} />
        </View>

        {showConfetti && <ConfettiCannon count={100} origin={{ x: width / 2, y: 0 }} />}
      </SafeAreaView>
    </LinearGradient>
  );
}

// ---------- Enhanced 3D Styles ----------
const createStyles = (width: number) =>
  StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingVertical: 20, alignItems: 'center' },
    headerTitle: { 
      fontSize: width > 700 ? 42 : 32, 
      fontWeight: '900', 
      color: '#FF69B4',
      textShadowColor: 'rgba(0,0,0,0.1)',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 3
    },
    mainContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    
    // Rocket Buttons
    rocketContainer: {
      position: 'absolute',
      top: '40%',
      zIndex: 10,
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.7)',
      padding: 12,
      borderRadius: 25,
      borderWidth: 3,
      borderColor: '#FFF',
    },
    rocketEmoji: { fontSize: width > 700 ? 45 : 30 },
    rocketText: { fontWeight: '900', color: '#FF69B4', fontSize: 10, marginTop: 4 },

    // Flower Card
    cardContainer: { width: width * 0.7, alignItems: 'center' },
    clayCard: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 6,
      borderColor: 'rgba(255, 255, 255, 0.6)',
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.15, shadowRadius: 15 },
        android: { elevation: 15 }
      }),
    },
    imageWrapper: { width: '80%', height: '80%', justifyContent: 'center', alignItems: 'center' },
    flowerImage: { width: '100%', height: '100%' },
    emojiMain: { fontSize: width > 700 ? 140 : 100 },
    nameTag: {
      marginTop: -25,
      backgroundColor: '#FFF',
      paddingHorizontal: 25,
      paddingVertical: 10,
      borderRadius: 20,
      elevation: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 4 }
    },
    flowerTitle: { color: '#333', fontWeight: '900', fontSize: 20, letterSpacing: 1 },
  });