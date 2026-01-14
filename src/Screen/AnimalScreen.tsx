import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, Image, ImageBackground, StyleSheet,
  ActivityIndicator, Animated, Modal, TouchableOpacity, SafeAreaView, StatusBar, Pressable
} from 'react-native';
import { ArrowLeft, ArrowRight, X, Zap, Gamepad2 } from 'lucide-react-native';
import Sound from 'react-native-sound';
import Orientation from 'react-native-orientation-locker';
import { useContentStore } from '../store/useContentStore';

const BASE_URL = 'https://kiddsapp-backend.tecobit.cloud';

const isEmoji = (str: string) => 
  str && str.length <= 4 && !str.includes('/') && !str.startsWith('http');

const AnimalSoundScreen = () => {
  const { items, loading, fetchByType } = useContentStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isQuitModalVisible, setQuitModalVisible] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const leftBtnPush = useRef(new Animated.Value(0)).current;
  const rightBtnPush = useRef(new Animated.Value(0)).current;
  const soundCache = useRef<Record<string, Sound>>({});

  useEffect(() => {
    Orientation.lockToLandscape();
    StatusBar.setHidden(true);
    fetchByType('animal', true);
    Sound.setCategory('Playback');

    return () => {
      Orientation.unlockAllOrientations();
      StatusBar.setHidden(false);
      // Release all sounds when leaving
      Object.values(soundCache.current).forEach(s => s.release());
    };
  }, []);

  // Pre-load sounds when items change
  useEffect(() => {
    items.forEach(item => {
      if (item.soundUrl && !soundCache.current[item._id]) {
        const uri = item.soundUrl.startsWith('http') 
          ? item.soundUrl 
          : `${BASE_URL}/${item.soundUrl}`;
        
        const sound = new Sound(uri, '', (error) => {
          if (error) console.warn('Failed to load sound', uri, error);
        });
        soundCache.current[item._id] = sound;
      }
    });
  }, [items]);

  const playSound = (id: string) => {
    const sound = soundCache.current[id];
    if (sound) {
      sound.stop(() => {
        sound.play();
      });
    }
  };

  const bounceAnimal = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.2, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const animateButton = (animVar: Animated.Value, action: () => void) => {
    Animated.sequence([
      Animated.timing(animVar, { toValue: 4, duration: 100, useNativeDriver: true }),
      Animated.timing(animVar, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start(() => action());
  };

  const nextItem = () => currentIndex < items.length - 1 && setCurrentIndex(currentIndex + 1);
  const prevItem = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);

  if (loading || items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF003C" />
      </View>
    );
  }

  const currentItem = items[currentIndex];

  const NavButton = ({ direction, disabled }: { direction: 'left' | 'right', disabled: boolean }) => {
    const animVar = direction === 'left' ? leftBtnPush : rightBtnPush;
    return (
      <TouchableOpacity 
        activeOpacity={1}
        onPress={() => animateButton(animVar, direction === 'left' ? prevItem : nextItem)} 
        disabled={disabled} 
        style={[styles.arrow3DContainer, disabled && { opacity: 0.3 }]}
      >
        <View style={styles.arrow3DShadow} />
        <Animated.View style={[styles.arrow3DFace, { transform: [{ translateY: animVar }] }]}>
          {direction === 'left' ? 
            <ArrowLeft color="#7B5231" size={32} strokeWidth={4} /> : 
            <ArrowRight color="#7B5231" size={32} strokeWidth={4} />
          }
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={{ uri: 'https://i.imgur.com/your_landscape_bg.png' }} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.overlay}>
          {/* Top Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={[styles.roundBtn, { backgroundColor: '#FFB300' }]}><Zap color="white" fill="white" size={22} /></TouchableOpacity>
              <TouchableOpacity style={[styles.roundBtn, { backgroundColor: '#F44336' }]}><Gamepad2 color="white" size={22} /></TouchableOpacity>
            </View>

            <View style={styles.redBadge}>
              <Text style={styles.redBadgeText}>{currentItem.title.toUpperCase()}</Text>
            </View>

            <TouchableOpacity style={styles.exitBtn} onPress={() => setQuitModalVisible(true)}>
              <X color="white" strokeWidth={5} size={24} />
            </TouchableOpacity>
          </View>

          {/* Main Content with Pressable Animal */}
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
                          : `${BASE_URL}/${currentItem.imageUrl}` 
                      }}
                      style={styles.animalImage}
                      resizeMode="contain"
                    />
                  )}
                </Animated.View>
              </Pressable>
            </View>

            <NavButton direction="right" disabled={currentIndex === items.length - 1} />
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Basic Quit Modal */}
      <Modal transparent visible={isQuitModalVisible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Continue playing?</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setQuitModalVisible(false)}>
              <Text style={styles.modalBtnText}>YES</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D0E9AC' },
  backgroundImage: { flex: 1 },
  overlay: { flex: 1, paddingHorizontal: 30 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#D0E9AC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15 },
  headerLeft: { flexDirection: 'row', gap: 12 },
  roundBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white', elevation: 4 },
  redBadge: { backgroundColor: '#FF003C', paddingHorizontal: 60, paddingVertical: 8, borderRadius: 20, borderWidth: 4, borderColor: '#B3002A', elevation: 8 },
  redBadgeText: { color: 'white', fontSize: 26, fontWeight: '900', letterSpacing: 2 },
  exitBtn: { backgroundColor: '#FF5722', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white' },
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  animalContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  animalImage: { width: 300, height: 250 },
  emojiText: { fontSize: 150, textAlign: 'center' },
  arrow3DContainer: { width: 75, height: 65 },
  arrow3DShadow: { position: 'absolute', bottom: 0, width: 75, height: 55, backgroundColor: '#7B5231', borderRadius: 18 },
  arrow3DFace: { width: 75, height: 58, backgroundColor: '#F3D299', borderRadius: 18, borderWidth: 3, borderColor: '#7B5231', justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: 'white', padding: 30, borderRadius: 20, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  modalBtn: { backgroundColor: '#FF003C', paddingHorizontal: 40, paddingVertical: 10, borderRadius: 10 },
  modalBtnText: { color: 'white', fontWeight: 'bold' }
});

export default AnimalSoundScreen;