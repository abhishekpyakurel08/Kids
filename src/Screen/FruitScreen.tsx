import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import Tts from 'react-native-tts';
import Orientation from 'react-native-orientation-locker';
import { X } from 'lucide-react-native'; // Ensure lucide-react-native is installed
import { useContentStore } from '../store/useContentStore';

const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://kiddsapp-backend.tecobit.cloud';

export default function FruitScreen({ navigation }: any) {
  const { items, loading, fetchByType } = useContentStore();
  const [fruits, setFruits] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [isQuitModalVisible, setQuitModalVisible] = useState(false);

  const translateX = useSharedValue(0);
  const EMOJI_SIZE = Math.min(width, height) * 0.25;

  useEffect(() => {
    Orientation.lockToLandscape();
    fetchByType('fruit', true);

    // Handle Android Hardware Back Button
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

  useEffect(() => {
    if (items?.length) {
      setFruits(items);
      setIndex(0);
    }
  }, [items]);

  const currentFruit = fruits[index];

  // Speak fruit name on index change
  useEffect(() => {
    if (currentFruit && !isQuitModalVisible) {
      Tts.stop();
      Tts.speak(currentFruit.title);
    }
  }, [index, currentFruit, isQuitModalVisible]);

  const handleQuit = () => {
    Tts.stop();
    Tts.speak("Bye Bye!"); // TTS says "Bye Bye"
    setQuitModalVisible(false);
    
    // Small delay to allow TTS to start before screen closes
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  const next = () => setIndex(i => (i + 1) % fruits.length);
  const prev = () => setIndex(i => (i - 1 + fruits.length) % fruits.length);

  const onSwipeEnd = (e: any) => {
    if (e.nativeEvent.translationX < -50) runOnJS(next)();
    if (e.nativeEvent.translationX > 50) runOnJS(prev)();
    translateX.value = withSpring(0);
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const isEmoji = currentFruit?.imageUrl?.length <= 4; // Improved emoji detection

  const imageUrl = currentFruit?.imageUrl
    ? currentFruit.imageUrl.startsWith('http')
      ? currentFruit.imageUrl
      : `${BASE_URL}/uploads/${currentFruit.imageUrl}`
    : null;

  if (loading || !currentFruit) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />

        {/* TOP HEADER WITH X BUTTON */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.exitBtn} 
            onPress={() => setQuitModalVisible(true)}
          >
            <X color="white" strokeWidth={4} size={30} />
          </TouchableOpacity>
        </View>

        {/* LEFT ARROW */}
        <TouchableOpacity style={[styles.arrow, { left: 30 }]} onPress={prev}>
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>

        {/* RIGHT ARROW */}
        <TouchableOpacity style={[styles.arrow, { right: 30 }]} onPress={next}>
          <Text style={styles.arrowText}>▶</Text>
        </TouchableOpacity>

        {/* SWIPE GESTURE */}
        <PanGestureHandler
          onGestureEvent={(e) => (translateX.value = e.nativeEvent.translationX)}
          onEnded={onSwipeEnd}
        >
          <Animated.View style={[styles.fruitWrapper, animStyle]}>
            {isEmoji ? (
              <Text style={[styles.emoji, { fontSize: EMOJI_SIZE }]}>{currentFruit.imageUrl}</Text>
            ) : (
              imageUrl && (
                <FastImage
                  source={{ uri: imageUrl, cache: FastImage.cacheControl.web }}
                  style={styles.image}
                  resizeMode={FastImage.resizeMode.contain}
                />
              )
            )}
          </Animated.View>
        </PanGestureHandler>

        {/* BOTTOM LABEL */}
        <View style={styles.label}>
          <Text style={styles.labelText}>{currentFruit.title.toUpperCase()}</Text>
        </View>

        {/* QUIT MODAL */}
        <Modal transparent visible={isQuitModalVisible} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Want to go back? 👋</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalBtn, { backgroundColor: '#4CAF50' }]} 
                  onPress={() => setQuitModalVisible(false)}
                >
                  <Text style={styles.modalBtnText}>PLAY</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalBtn, { backgroundColor: '#F44336' }]} 
                  onPress={handleQuit}
                >
                  <Text style={styles.modalBtnText}>BYE BYE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 20,
  },
  exitBtn: {
    backgroundColor: '#FF5722',
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    elevation: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#87CEFA',
  },
  fruitWrapper: {
    width: 350,
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emoji: {
    textAlign: 'center',
  },
  label: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: '#E11D48',
    paddingHorizontal: 60,
    paddingVertical: 12,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#B3002A',
  },
  labelText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  arrow: {
    position: 'absolute',
    top: '45%',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 4,
    borderColor: 'white',
  },
  arrowText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  // Modal Styles
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: 'white', padding: 30, borderRadius: 30, alignItems: 'center', width: '50%' },
  modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 25, color: '#333' },
  modalButtons: { flexDirection: 'row', gap: 20 },
  modalBtn: { paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20 },
  modalBtnText: { color: 'white', fontWeight: '900', fontSize: 18 }
});