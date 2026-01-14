import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  useWindowDimensions, 
  TouchableWithoutFeedback, 
  Text 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Mascot from '../components/tactile/Mascot';
import FloatingStars from '../components/FloatingStars';
import { Sparkles } from 'lucide-react-native';
import Orientation from 'react-native-orientation-locker';



const SplashScreen = () => {
  const navigation = useNavigation<any>();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  useEffect(() => {
    Orientation.lockToLandscape();
    return () => Orientation.unlockAllOrientations();
  }, []);

  const mascotOpacity = useRef(new Animated.Value(0)).current;
  const mascotScale = useRef(new Animated.Value(0.7)).current;
  const mascotTranslateY = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mascotOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(mascotScale, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }),
      Animated.timing(mascotTranslateY, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.timing(textOpacity, { toValue: 1, duration: 800, delay: 400, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      exitAndNavigate();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const exitAndNavigate = () => {
    Animated.parallel([
      Animated.timing(containerOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(mascotScale, { toValue: 4, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      navigation.replace('Home');
    });
  };

  // Dynamic scaling for landscape
  const mascotSize = isLandscape ? width * 0.35 : width * 0.5;
  const titleFontSize = isLandscape ? width * 0.06 : 48;
  const subtitleFontSize = isLandscape ? width * 0.018 : 14;
  const textBottom = isLandscape ? height * 0.12 : height * 0.15;

  return (
    <TouchableWithoutFeedback onPress={exitAndNavigate}>
      <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
        <FloatingStars />

        <Animated.View style={{ 
          opacity: mascotOpacity, 
          transform: [{ scale: mascotScale }, { translateY: mascotTranslateY }] 
        }}>
          <Mascot size={mascotSize} animate="bounce" />
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: textOpacity, bottom: textBottom }]}>
          <Text style={[styles.title, { fontSize: titleFontSize }]}>Modern Kids Learning</Text>
          <View style={styles.loadingRow}>
            <Sparkles size={18} color="#C7B8FF" />
            <Text style={[styles.subtitle, { fontSize: subtitleFontSize }]}>ALARIC I...</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1026', alignItems: 'center', justifyContent: 'center' },
  textContainer: { position: 'absolute', alignItems: 'center' },
  title: {
    fontWeight: '900', color: '#FFFFFF', letterSpacing: 1, textShadowColor: 'rgba(199, 184, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20, textAlign: 'center',
  },
  subtitle: { color: '#C7B8FF', marginLeft: 8, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, opacity: 0.7 },
});
