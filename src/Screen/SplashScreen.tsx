import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  useWindowDimensions, 
  TouchableWithoutFeedback, 
  Text,
  Easing,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Mascot from '../components/tactile/Mascot';
import FloatingStars from '../components/FloatingStars';
import { Sparkles } from 'lucide-react-native';
import Orientation from 'react-native-orientation-locker';
import Tts from 'react-native-tts';

const SplashScreen = () => {
  const navigation = useNavigation<any>();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Animation Refs
  const mascotOpacity = useRef(new Animated.Value(0)).current;
  const mascotScale = useRef(new Animated.Value(0.3)).current;
  const mascotTranslateY = useRef(new Animated.Value(-200)).current; // Start high for drop
  const textOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Lock Orientation & Hide Bar
    Orientation.lockToLandscape();
    StatusBar.setHidden(true);
    
    // 2. Setup Kid-Friendly Voice
    Tts.getInitStatus().then(() => {
      Tts.setDefaultRate(0.55);  // High energy speed
      Tts.setDefaultPitch(1.5); // Very cute, high-pitched "kid" voice
    });

    // 3. Ultra-Smooth Entrance Sequence
    Animated.sequence([
      // Mascot Drops and Bounces (Tactile feel)
      Animated.parallel([
        Animated.timing(mascotOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(mascotTranslateY, { 
          toValue: 0, 
          friction: 4, 
          tension: 40, 
          useNativeDriver: true 
        }),
        Animated.spring(mascotScale, { 
          toValue: 1, 
          friction: 4, 
          useNativeDriver: true 
        }),
      ]),
      // Text fades in smoothly
      Animated.timing(textOpacity, { 
        toValue: 1, 
        duration: 800, 
        easing: Easing.out(Easing.quad),
        useNativeDriver: true 
      }),
    ]).start();

    // 4. Delayed Voice Greeting (Speaks once mascot lands)
    const voiceTimer = setTimeout(() => {
      Tts.speak("Hey there! Let's play and learn!");
    }, 800);

    // 5. Auto-Navigate Timer (4.5s total)
    const autoNavTimer = setTimeout(() => {
      exitAndNavigate();
    }, 4500);

    return () => {
      clearTimeout(voiceTimer);
      clearTimeout(autoNavTimer);
      Tts.stop();
    };
  }, []);

  const exitAndNavigate = () => {
    Tts.stop();
    // Portal Effect: Mascot zooms into the camera while background fades
    Animated.parallel([
      Animated.timing(containerOpacity, { 
        toValue: 0, 
        duration: 700, 
        useNativeDriver: true 
      }),
      Animated.timing(mascotScale, { 
        toValue: 15, // Ultra zoom for portal effect
        duration: 900, 
        easing: Easing.in(Easing.exp),
        useNativeDriver: true 
      }),
    ]).start(() => {
      navigation.replace('Home');
    });
  };

  // Dynamic Layout Calculations
  const mascotSize = isLandscape ? width * 0.32 : width * 0.45;
  const titleFontSize = isLandscape ? width * 0.055 : 42;
  const subtitleFontSize = isLandscape ? width * 0.016 : 14;
  const textBottom = isLandscape ? height * 0.1 : height * 0.12;

  return (
    <TouchableWithoutFeedback onPress={exitAndNavigate}>
      <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
        <StatusBar hidden />
        <FloatingStars />

        {/* MASCOT CONTAINER */}
        <Animated.View style={{ 
          opacity: mascotOpacity, 
          transform: [
            { scale: mascotScale }, 
            { translateY: mascotTranslateY }
          ] 
        }}>
          <Mascot size={mascotSize} animate="bounce" />
        </Animated.View>

        {/* TITLE & SUBTITLE */}
        <Animated.View style={[styles.textContainer, { opacity: textOpacity, bottom: textBottom }]}>
          <Text style={[styles.title, { fontSize: titleFontSize }]}>
            Modern Kids Learning
          </Text>
          <View style={styles.loadingRow}>
            <Sparkles size={20} color="#FFD700" />
            <Text style={[styles.subtitle, { fontSize: subtitleFontSize }]}>
              READY TO EXPLORE!
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0B1026', 
    alignItems: 'center', 
    justifyContent: 'center',
    overflow: 'hidden' // Important for the mascot zoom-in
  },
  textContainer: { 
    position: 'absolute', 
    alignItems: 'center' 
  },
  title: {
    fontWeight: '900', 
    color: '#FFFFFF', 
    letterSpacing: 1, 
    textShadowColor: 'rgba(199, 184, 255, 0.9)',
    textShadowOffset: { width: 0, height: 0 }, 
    textShadowRadius: 20, 
    textAlign: 'center',
  },
  subtitle: { 
    color: '#C7B8FF', 
    marginLeft: 10, 
    fontWeight: '800', 
    letterSpacing: 5, 
    textTransform: 'uppercase' 
  },
  loadingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 15, 
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    opacity: 0.9 
  },
});

export default SplashScreen;