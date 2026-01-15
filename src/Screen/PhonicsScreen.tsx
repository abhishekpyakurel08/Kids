import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from 'react-native';
import { X, ChevronRight, ChevronLeft, ArrowRight, Volume2 } from 'lucide-react-native';
import Haptic from 'react-native-haptic-feedback';
import FastImage from 'react-native-fast-image';
import Tts from 'react-native-tts';
import { useContentStore } from '../store/useContentStore';

const { width, height } = Dimensions.get('window');

// Responsive scaling helpers
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;

export default function PhonicsScreen({ navigation, route }: any) {
  const { items, loading, fetchByType } = useContentStore();
  const [index, setIndex] = useState(0);

  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  // Initial setup
  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.4);
    Tts.setDefaultPitch(1.1);
    const type = route.params?.type || 'letter';
    fetchByType(type);
    return () => Tts.stop();
  }, []);

  // Auto-speak on change
  useEffect(() => {
    if (items[index]) speakContent();
  }, [index, items]);

  // Floating Loop Animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const speakContent = () => {
    const currentItem = items[index];
    if (currentItem?.question) {
      // Tap "Pop" Effect
      Animated.sequence([
        Animated.timing(pressAnim, { toValue: 0.92, duration: 100, useNativeDriver: true }),
        Animated.spring(pressAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();

      Haptic.trigger('impactMedium');
      Tts.stop();
      Tts.speak(currentItem.question);
    }
  };

  const navigate = (direction: 'next' | 'prev') => {
    const newIndex = direction === 'next' ? index + 1 : index - 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    Haptic.trigger('soft');
    Tts.stop();

    Animated.timing(slideAnim, {
      toValue: direction === 'next' ? -width : width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIndex(newIndex);
      slideAnim.setValue(direction === 'next' ? width : -width);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 12,
        useNativeDriver: true,
      }).start();
    });
  };

  const currentItem = items[index];
  const isUrl = (str: string) => str?.startsWith('http');

  // Animation Interpolations
  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -verticalScale(10)] });
  const shadowScale = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.88] });

  if (loading && items.length === 0) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER / CLOSE */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <View style={styles.closeCircle}>
          <X color="white" size={scale(20)} strokeWidth={4} />
        </View>
      </TouchableOpacity>

      <View style={styles.mainWrapper}>
        {/* NAVIGATION LEFT */}
        <TouchableOpacity
          style={[styles.navBtn, index === 0 && styles.disabled]}
          onPress={() => navigate('prev')}
          disabled={index === 0}
        >
          <ChevronLeft color="white" size={scale(38)} strokeWidth={6} />
        </TouchableOpacity>

        <Animated.View style={[styles.contentCenter, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.cardsRow}>
            {/* CARD 1: THE LETTER */}
            <View style={styles.cardContainer}>
              <Animated.View style={[styles.shadowBlob, { transform: [{ scale: shadowScale }] }]} />
              <Animated.View style={[{ transform: [{ translateY }, { scale: pressAnim }] }]}>
                <TouchableOpacity activeOpacity={0.9} onPress={speakContent} style={styles.whiteBox}>
                  <Text style={styles.letterText}>{currentItem?.title}</Text>
                  <View style={styles.speakerIcon}>
                    <Volume2 color="#FF5252" size={scale(14)} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* CONNECTING ARROW */}
            <View style={styles.arrowIcon}>
              <ArrowRight color="white" size={scale(28)} strokeWidth={8} />
            </View>

            {/* CARD 2: THE IMAGE/OBJECT */}
            <View style={styles.cardContainer}>
              <Animated.View style={[styles.shadowBlob, { transform: [{ scale: shadowScale }] }]} />
              <Animated.View style={[{ transform: [{ translateY }, { scale: pressAnim }] }]}>
                <TouchableOpacity activeOpacity={0.9} onPress={speakContent} style={styles.whiteBox}>
                  <View style={styles.imageWrapper}>
                    {isUrl(currentItem?.imageUrl) ? (
                      <FastImage
                        source={{ uri: currentItem?.imageUrl }}
                        style={styles.image}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.emojiText}>{currentItem?.imageUrl}</Text>
                    )}
                  </View>

                  {/* LABEL PILL */}
                  <View style={styles.labelContainer}>
                    <Text numberOfLines={1} adjustsFontSizeToFit style={styles.labelText}>
                      {currentItem?.question?.toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        {/* NAVIGATION RIGHT */}
        <TouchableOpacity
          style={[styles.navBtn, index === items.length - 1 && styles.disabled]}
          onPress={() => navigate('next')}
          disabled={index === items.length - 1}
        >
          <ChevronRight color="white" size={scale(38)} strokeWidth={6} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF5252' },
  loader: { flex: 1, backgroundColor: '#FF5252', justifyContent: 'center', alignItems: 'center' },

  closeBtn: { position: 'absolute', top: verticalScale(15), left: scale(15), zIndex: 30 },
  closeCircle: {
    backgroundColor: '#333',
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },

  mainWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(5),
  },

  contentCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  navBtn: { padding: scale(5) },
  disabled: { opacity: 0.15 },

  cardContainer: { 
    alignItems: 'center', 
    width: scale(120), 
    height: verticalScale(160), 
    justifyContent: 'center' 
  },
  
  whiteBox: {
    width: scale(112),
    height: scale(112), 
    backgroundColor: 'white',
    borderRadius: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: { elevation: 6 },
    }),
  },

  imageWrapper: {
    width: '100%',
    height: '100%',
    padding: scale(14), 
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: { width: '100%', height: '100%' },
  emojiText: { fontSize: scale(60) },
  letterText: { fontSize: scale(70), fontWeight: '900', color: '#FF5252', includeFontPadding: false },

  shadowBlob: {
    position: 'absolute',
    bottom: verticalScale(15),
    width: scale(65),
    height: verticalScale(7),
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 100,
  },

  speakerIcon: { position: 'absolute', top: scale(8), right: scale(8), opacity: 0.3 },

  labelContainer: {
    position: 'absolute',
    bottom: scale(-10),
    backgroundColor: '#A6CE39',
    paddingHorizontal: scale(8),
    paddingVertical: scale(5),
    borderRadius: scale(18),
    borderWidth: 2.5,
    borderColor: 'white',
    minWidth: '100%',
    alignItems: 'center',
    zIndex: 10,
  },

  labelText: { 
    color: 'white', 
    fontWeight: '900', 
    fontSize: scale(12), 
    letterSpacing: 0.4,
    textAlign: 'center' 
  },

  arrowIcon: { marginHorizontal: scale(1), marginTop: verticalScale(-10) },
});
