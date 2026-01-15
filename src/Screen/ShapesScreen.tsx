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
  Modal,
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
  const [isQuitModalVisible, setQuitModalVisible] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Orientation.lockToLandscape();
    
    // Initializing high-quality kid-friendly TTS settings
    Tts.getInitStatus().then(() => {
      Tts.setDefaultRate(0.48); // Clear but energetic
      Tts.setDefaultPitch(1.35); // Cute, high-pitched mascot voice
      speak(); // Speak first shape
    });

    const backAction = () => {
      setQuitModalVisible(true);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      backHandler.remove();
      Orientation.unlockAllOrientations();
      Tts.stop();
    };
  }, []);

  // Effect to trigger speech and animation on every change
  useEffect(() => {
    if (!isQuitModalVisible) {
      speak();
    }
  }, [index]);

  const speak = () => {
    Tts.stop();
    Tts.speak(SHAPES[index].name);
    
    // Tactile "Pop" Animation
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.spring(scale, { 
        toValue: 1.1, 
        friction: 4, 
        tension: 40, 
        useNativeDriver: true 
      }),
      Animated.spring(scale, { 
        toValue: 1, 
        friction: 3, 
        useNativeDriver: true 
      }),
    ]).start();
  };

  const handleQuit = () => {
    Tts.stop();
    Tts.speak("Bye Bye!"); 
    setQuitModalVisible(false);
    
    setTimeout(() => {
      navigation.goBack();
    }, 900);
  };

  const prev = () => index > 0 && setIndex(i => i - 1);
  const next = () => index < SHAPES.length - 1 && setIndex(i => i + 1);

  const shape = SHAPES[index];

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.iconRow}>
           
          </View>
          
          <TouchableOpacity 
            style={styles.close} 
            onPress={() => setQuitModalVisible(true)}
            activeOpacity={0.7}
          >
            <X color="white" size={26} strokeWidth={5} />
          </TouchableOpacity>
        </View>

        <View style={styles.center}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity activeOpacity={0.9} onPress={speak}>
                {shape.name === 'Square' && <Square color={shape.color} />}
                {shape.name === 'Circle' && <Circle color={shape.color} />}
                {shape.name === 'Triangle' && <Triangle color={shape.color} />}
                {shape.name === 'Heart' && <Heart color={shape.color} />}
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.arrows}>
          <TouchableOpacity 
            onPress={prev} 
            disabled={index === 0} 
            style={[styles.arrowBtn, index === 0 && styles.disabled]}
          >
            <ChevronLeft color="#5D3A1A" size={38} strokeWidth={6} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={next} 
            disabled={index === SHAPES.length - 1} 
            style={[styles.arrowBtn, index === SHAPES.length - 1 && styles.disabled]}
          >
            <ChevronRight color="#5D3A1A" size={38} strokeWidth={6} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{shape.name.toUpperCase()}</Text>
          </View>
        </View>

        {/* QUIT MODAL */}
        <Modal transparent visible={isQuitModalVisible} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Done playing? 👋</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalBtn, { backgroundColor: '#4CAF50' }]} 
                  onPress={() => setQuitModalVisible(false)}
                >
                  <Text style={styles.modalBtnText}>STAY</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalBtn, { backgroundColor: '#FF5C00' }]} 
                  onPress={handleQuit}
                >
                  <Text style={styles.modalBtnText}>BYE BYE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  emoji: { fontSize: 20 },
  roundIcon: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  close: { width: 46, height: 46, backgroundColor: '#FF5C00', borderRadius: 23, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  square: { width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: 25, elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  circle: { width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: ITEM_SIZE / 2, elevation: 8 },
  triangleWrap: { width: ITEM_SIZE, height: ITEM_SIZE, alignItems: 'center', justifyContent: 'center' },
  triangle: { width: 0, height: 0, borderLeftWidth: ITEM_SIZE / 2, borderRightWidth: ITEM_SIZE / 2, borderBottomWidth: ITEM_SIZE, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  heartWrap: { width: ITEM_SIZE, height: ITEM_SIZE, alignItems: 'center', justifyContent: 'center' },
  heartCircle: { position: 'absolute', width: ITEM_SIZE * 0.45, height: ITEM_SIZE * 0.45, borderRadius: (ITEM_SIZE * 0.45) / 2, top: ITEM_SIZE * 0.15 },
  heartLeft: { left: ITEM_SIZE * 0.15 },
  heartRight: { right: ITEM_SIZE * 0.15 },
  heartSquare: { position: 'absolute', width: ITEM_SIZE * 0.45, height: ITEM_SIZE * 0.45, top: ITEM_SIZE * 0.35, transform: [{ rotate: '45deg' }], borderRadius: 5 },
  arrows: { position: 'absolute', top: '45%', width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  arrowBtn: { width: 75, height: 60, backgroundColor: '#F3D299', borderRadius: 20, borderWidth: 4, borderColor: '#5D3A1A', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  disabled: { opacity: 0.2 },
  footer: { alignItems: 'center', marginBottom: 25 },
  pill: { backgroundColor: '#FF0043', paddingHorizontal: 60, paddingVertical: 12, borderRadius: 40, borderWidth: 5, borderColor: '#B3002A', elevation: 5 },
  pillText: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: 2 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: 'white', padding: 30, borderRadius: 35, alignItems: 'center', width: '50%', borderWidth: 6, borderColor: '#FFA502' },
  modalTitle: { fontSize: 26, fontWeight: '900', marginBottom: 25, color: '#333' },
  modalButtons: { flexDirection: 'row', gap: 20 },
  modalBtn: { paddingHorizontal: 35, paddingVertical: 15, borderRadius: 20, elevation: 4 },
  modalBtnText: { color: 'white', fontWeight: '900', fontSize: 18 }
});