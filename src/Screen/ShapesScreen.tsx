import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  BackHandler,
} from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import Tts from 'react-native-tts';
import Orientation from 'react-native-orientation-locker';

const { width, height } = Dimensions.get('window');
const ITEM_SIZE = Math.min(width * 0.6, height * 0.35);

const SHAPES = [
  { id: '1', name: 'Square', color: '#F7D716' },
  { id: '2', name: 'Circle', color: '#FF4757' },
  { id: '3', name: 'Triangle', color: '#2ED573' },
  { id: '4', name: 'Heart', color: '#FF6B81' },
];

export default function ShapesScreen({ navigation }: any) {
  const [index, setIndex] = useState(0);

  // Animations
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Orientation.lockToLandscape();

    // Initialize TTS
    Tts.getInitStatus().then(() => {
      Tts.setDefaultRate(0.48);
      Tts.setDefaultPitch(1.35);
      speak();
    });

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
    speak();
  }, [index]);

  const speak = () => {
    Tts.stop();
    Tts.speak(SHAPES[index].name);

    Animated.sequence([
      Animated.timing(scale, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1.1, friction: 4, tension: 40, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const handleQuit = () => {
    Tts.stop();
    Tts.speak("Bye Bye!");
    setTimeout(() => navigation.goBack(), 900);
  };

  // Smooth carousel slide
  const slideToIndex = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= SHAPES.length) return;

    Animated.parallel([
      Animated.timing(translateX, { toValue: newIndex > index ? -width : width, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setIndex(newIndex);
      translateX.setValue(newIndex > index ? width : -width);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    });
  };

  const prev = () => slideToIndex(index - 1);
  const next = () => slideToIndex(index + 1);

  const shape = SHAPES[index];

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconRow}></View>
          <TouchableOpacity style={styles.close} onPress={handleQuit} activeOpacity={0.7}>
            <X color="white" size={26} strokeWidth={5} />
          </TouchableOpacity>
        </View>

        {/* Shape Card */}
        <View style={styles.center}>
          <Animated.View
            style={{
              transform: [{ translateX }, { scale }],
              opacity,
            }}
          >
            <TouchableOpacity activeOpacity={0.9} onPress={speak}>
              <View style={styles.cardWrapper}>
                <View style={styles.cardShadow} />
                <View style={styles.card}>
                  {shape.name === 'Square' && <Square color={shape.color} />}
                  {shape.name === 'Circle' && <Circle color={shape.color} />}
                  {shape.name === 'Triangle' && <Triangle color={shape.color} />}
                  {shape.name === 'Heart' && <Heart color={shape.color} />}
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Navigation Arrows */}
        <View style={styles.arrows}>
          <TouchableOpacity onPress={prev} disabled={index === 0} style={[styles.arrowBtn, index === 0 && styles.disabled]}>
            <ChevronLeft color="#5D3A1A" size={38} strokeWidth={6} />
          </TouchableOpacity>

          <TouchableOpacity onPress={next} disabled={index === SHAPES.length - 1} style={[styles.arrowBtn, index === SHAPES.length - 1 && styles.disabled]}>
            <ChevronRight color="#5D3A1A" size={38} strokeWidth={6} />
          </TouchableOpacity>
        </View>

        {/* Footer Pill */}
        <View style={styles.footer}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{shape.name.toUpperCase()}</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

/* ---------- SHAPE COMPONENTS ---------- */
const Square = ({ color }: any) => <View style={[styles.square, { backgroundColor: color }]} />;
const Circle = ({ color }: any) => <View style={[styles.circle, { backgroundColor: color }]} />;
const Triangle = ({ color }: any) => (
  <View style={styles.triangleWrap}>
    <View style={[styles.triangle, { borderBottomColor: color }]} />
  </View>
);
const Heart = ({ color }: any) => (
  <View style={styles.heartWrap}>
    <View style={[styles.heartCircle, styles.heartLeft, { backgroundColor: color }]} />
    <View style={[styles.heartCircle, styles.heartRight, { backgroundColor: color }]} />
    <View style={[styles.heartSquare, { backgroundColor: color }]} />
  </View>
);

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 18 },
  iconRow: { flexDirection: 'row', gap: 12 },
  close: { width: 46, height: 46, backgroundColor: '#FF5C00', borderRadius: 23, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Card Styles
  cardWrapper: { width: ITEM_SIZE + 40, height: ITEM_SIZE + 40, alignItems: 'center', justifyContent: 'center', marginVertical: 15 },
  cardShadow: { position: 'absolute', width: ITEM_SIZE, height: ITEM_SIZE, backgroundColor: '#000', opacity: 0.1, borderRadius: 25, transform: [{ translateY: 8 }, { translateX: 5 }] },
  card: { width: ITEM_SIZE, height: ITEM_SIZE, backgroundColor: '#fff', borderRadius: 25, elevation: 10, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 15, shadowOffset: { width: 0, height: 5 }, justifyContent: 'center', alignItems: 'center' },

  square: { width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: 25, elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  circle: { width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: ITEM_SIZE / 2, elevation: 8 },
  triangleWrap: { width: ITEM_SIZE, height: ITEM_SIZE, alignItems: 'center', justifyContent: 'center' },
  triangle: { width: 0, height: 0, borderLeftWidth: ITEM_SIZE / 2, borderRightWidth: ITEM_SIZE / 2, borderBottomWidth: ITEM_SIZE, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  heartWrap: { width: ITEM_SIZE, height: ITEM_SIZE, alignItems: 'center', justifyContent: 'center' },
  heartCircle: { position: 'absolute', width: ITEM_SIZE * 0.45, height: ITEM_SIZE * 0.45, borderRadius: (ITEM_SIZE * 0.45) / 2, top: ITEM_SIZE * 0.15 },
  heartLeft: { left: ITEM_SIZE * 0.15 },
  heartRight: { right: ITEM_SIZE * 0.15 },
  heartSquare: { position: 'absolute', width: ITEM_SIZE * 0.45, height: ITEM_SIZE * 0.45, top: ITEM_SIZE * 0.35, transform: [{ rotate: '45deg' }], borderRadius: 5 },

  // Navigation arrows
  arrows: { position: 'absolute', top: '45%', width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  arrowBtn: { width: 75, height: 60, backgroundColor: '#F3D299', borderRadius: 20, borderWidth: 4, borderColor: '#5D3A1A', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  disabled: { opacity: 0.2 },

  // Footer pill
  footer: { alignItems: 'center', marginBottom: 25 },
  pill: { backgroundColor: '#FF0043', paddingHorizontal: 70, paddingVertical: 16, borderRadius: 50, borderWidth: 5, borderColor: '#B3002A', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  pillText: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 4 },
});
