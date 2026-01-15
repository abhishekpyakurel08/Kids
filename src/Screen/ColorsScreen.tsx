import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
  BackHandler,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import Tts from 'react-native-tts';
import { ChevronLeft, ChevronRight, XCircle, Gamepad2, Zap } from 'lucide-react-native';
import Orientation from 'react-native-orientation-locker';

const { width, height } = Dimensions.get('window');

const COLOR_DATA = [
  { id: '1', name: 'Red', hex: '#FF3B30' },
  { id: '2', name: 'Blue', hex: '#007AFF' },
  { id: '3', name: 'Green', hex: '#34C759' },
  { id: '4', name: 'Yellow', hex: '#FFCC00' },
  { id: '5', name: 'Orange', hex: '#FF9500' },
  { id: '6', name: 'Purple', hex: '#AF52DE' },
  { id: '7', name: 'Pink', hex: '#FF2D55' },
  { id: '8', name: 'Brown', hex: '#8E6E53' },
  { id: '9', name: 'Black', hex: '#1C1C1E' },
  { id: '10', name: 'White', hex: '#FFFFFF' },
  { id: '11', name: 'Gray', hex: '#8E8E93' },
  { id: '12', name: 'Cyan', hex: '#32ADE6' },
];

export default function ColorSwipeGame({ navigation }: any) {
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isQuitModalVisible, setQuitModalVisible] = useState(false);

  useEffect(() => {
    // Lock to landscape and init TTS
    Orientation.lockToLandscape();
    Tts.getInitStatus().then(() => {
      Tts.setDefaultRate(0.5);
      Tts.setDefaultPitch(1.2);
      Tts.speak(COLOR_DATA[0].name);
    });

    // Handle Android Back Button
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

  const handleColorSpeech = (index: number) => {
    Tts.stop();
    Tts.speak(COLOR_DATA[index].name);
  };

  const handleQuit = () => {
    Tts.stop();
    Tts.speak("Bye Bye!"); // TTS says goodbye
    setQuitModalVisible(false);
    
    // Short delay so the child can hear "Bye Bye" before the screen disappears
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  const onPageSelected = (e: { nativeEvent: { position: number } }) => {
    const index = e.nativeEvent.position;
    if (index !== currentPage) {
      setCurrentPage(index);
      handleColorSpeech(index);
    }
  };

  const movePage = (dir: 'next' | 'prev') => {
    const nextIndex = dir === 'next' ? currentPage + 1 : currentPage - 1;
    if (nextIndex >= 0 && nextIndex < COLOR_DATA.length) {
      setCurrentPage(nextIndex);
      pagerRef.current?.setPage(nextIndex);
      handleColorSpeech(nextIndex);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Notebook Grid Background */}
      <View style={styles.gridContainer}>
        {[...Array(20)].map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridLineV, { left: i * 40 }]} />
        ))}
        {[...Array(30)].map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLineH, { top: i * 40 }]} />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
         
          
          {/* EXIT BUTTON */}
          <TouchableOpacity activeOpacity={0.7} onPress={() => setQuitModalVisible(true)}>
            <XCircle color="#FF4D00" size={50} fill="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.gameEngine}>
          <TouchableOpacity 
            onPress={() => movePage('prev')}
            disabled={currentPage === 0}
            style={[styles.navArrow, { opacity: currentPage === 0 ? 0 : 1 }]}
          >
            <View style={styles.arrowBase}>
               <ChevronLeft color="#8D6E63" size={45} strokeWidth={4} />
            </View>
          </TouchableOpacity>

          <PagerView 
            ref={pagerRef}
            style={styles.pager} 
            initialPage={0}
            onPageSelected={onPageSelected}
          >
            {COLOR_DATA.map((item) => (
              <View key={item.id} style={styles.cardWrapper}>
                <View style={styles.cardDepthShadow} />
                <View style={styles.mainFlashcard}>
                  <View style={[styles.colorBlock, { backgroundColor: item.hex }]} />
                  <View style={styles.labelBlock}>
                    <Text style={styles.colorLabelText}>{item.name}</Text>
                  </View>
                </View>
              </View>
            ))}
          </PagerView>

          <TouchableOpacity 
             onPress={() => movePage('next')}
             disabled={currentPage === COLOR_DATA.length - 1}
             style={[styles.navArrow, { opacity: currentPage === COLOR_DATA.length - 1 ? 0 : 1 }]}
          >
            <View style={styles.arrowBase}>
              <ChevronRight color="#8D6E63" size={45} strokeWidth={4} />
            </View>
          </TouchableOpacity>
        </View>

        {/* QUIT MODAL */}
        <Modal transparent visible={isQuitModalVisible} animationType="fade" onRequestClose={() => setQuitModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Want to go back? 👋</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalBtn, { backgroundColor: '#4CAF50' }]} 
                  onPress={() => setQuitModalVisible(false)}
                >
                  <Text style={styles.modalBtnText}>KEEP PLAYING</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalBtn, { backgroundColor: '#F44336' }]} 
                  onPress={handleQuit}
                >
                  <Text style={styles.modalBtnText}>BYE BYE!</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  safeArea: { flex: 1 },
  gridContainer: { ...StyleSheet.absoluteFillObject, opacity: 0.15 },
  gridLineV: { position: 'absolute', width: 1, height: '100%', backgroundColor: '#CBD5E1' },
  gridLineH: { position: 'absolute', height: 1, width: '100%', backgroundColor: '#CBD5E1' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingTop: 15,
    alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row' },
  iconBtn: {
    width: 55,
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  gameEngine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  pager: { flex: 1, height: height * 0.75 },
  cardWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardDepthShadow: {
    position: 'absolute',
    width: width * 0.62,
    height: height * 0.65,
    backgroundColor: '#DDE4ED',
    borderRadius: 35,
    transform: [{ translateY: 12 }, { translateX: 6 }],
  },
  mainFlashcard: {
    width: width * 0.62,
    height: height * 0.65,
    backgroundColor: 'white',
    borderRadius: 35,
    padding: 15,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  colorBlock: { flex: 3.2, borderRadius: 25 },
  labelBlock: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  colorLabelText: { fontSize: 50, fontWeight: '900', color: '#1E293B', letterSpacing: 1 },
  navArrow: { width: 65, height: 65, justifyContent: 'center', alignItems: 'center' },
  arrowBase: {
    backgroundColor: '#F3E5D8',
    padding: 10,
    borderRadius: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#D7BCA3',
    borderRightWidth: 3,
    borderRightColor: '#D7BCA3',
  },
  // Modal Styles
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: 'white', padding: 30, borderRadius: 35, alignItems: 'center', width: '50%', borderWidth: 6, borderColor: '#FFB800' },
  modalTitle: { fontSize: 26, fontWeight: '900', marginBottom: 25, color: '#333' },
  modalButtons: { flexDirection: 'row', gap: 20 },
  modalBtn: { paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20, elevation: 4 },
  modalBtnText: { color: 'white', fontWeight: '900', fontSize: 18 }
});