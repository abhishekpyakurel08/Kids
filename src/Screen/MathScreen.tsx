// src/Screen/MathScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  StatusBar,
  PanResponder,
} from 'react-native';
import Tts from 'react-native-tts';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useContentStore, ContentItem } from '../store/useContentStore';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width, height } = Dimensions.get('window');

type MathScreenRouteProp = RouteProp<RootStackParamList, 'Math'>;

interface Props {
  route: MathScreenRouteProp;
}

const MathScreen: React.FC<Props> = ({ route }) => {
  const { type = 'addition' } = route.params || {};
  const { items, loading, fetchByType, trackAnswer, fetchMore } = useContentStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  //  Handle orientation changes
  const [dimensions, setDimensions] = useState({ width, height });
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    return () => subscription.remove();
  }, []);

  //  Initialize TTS and fetch content
  useEffect(() => {
    Tts.setDefaultRate(0.5);
    fetchByType(type, true);
  }, [type]);

  const goNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(i => i + 1);
      if (currentIndex >= items.length - 3) fetchMore(type);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  // 🖐 Swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 20,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -50) goNext();
        if (gesture.dx > 50) goPrev();
      },
    })
  ).current;

  const handleAnswer = (userChoice: string, correctAnswer: string) => {
    if (answered) return;

    const isCorrect = userChoice === correctAnswer;
    setAnswered(true);

    if (isCorrect) {
      setShowConfetti(true);
      Tts.speak('Great job!');
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Tts.speak('Try again!');
    }

    trackAnswer(isCorrect);

    setTimeout(() => {
      setAnswered(false);
      setShowConfetti(false);
      goNext();
    }, 1500);
  };

  const currentItem: ContentItem | undefined = items[currentIndex];

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.gameContent}>
        {currentItem && (
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.mathCard,
              { transform: [{ scale: scaleAnim }], width: dimensions.width * 0.85, borderRadius: 30 },
            ]}
          >
            <Text style={styles.parentsOnlyText}>FOR PARENTS ONLY</Text>
            <Text style={styles.questionText}>{currentItem.question}</Text>
            <View style={styles.optionsRow}>
              {currentItem.options?.map((opt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionButton}
                  onPress={() => handleAnswer(opt, currentItem.correctAnswer!)}
                  disabled={answered}
                >
                  <Text style={styles.optionButtonText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.arrowRow}>
              <TouchableOpacity onPress={goPrev} disabled={currentIndex === 0} style={styles.arrowButton}>
                <Text style={styles.arrowText}>◀</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={goNext} disabled={currentIndex === items.length - 1} style={styles.arrowButton}>
                <Text style={styles.arrowText}>▶</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>

      {showConfetti && <ConfettiCannon count={150} origin={{ x: dimensions.width / 2, y: 0 }} />}
    </View>
  );
};

export default MathScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#81D4FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#81D4FA' },
  gameContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mathCard: {
    backgroundColor: '#FFF',
    padding: 30,
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#FFD54F',
    elevation: 10,
  },
  parentsOnlyText: { fontSize: 14, color: '#94A3B8', fontWeight: 'bold', marginBottom: 10 },
  questionText: { fontSize: 32, fontWeight: '900', color: '#1E293B', marginBottom: 30, textAlign: 'center' },
  optionsRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 20, flexWrap: 'wrap' },
  optionButton: {
    backgroundColor: '#90CAF9',
    minWidth: 80,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderBottomWidth: 4,
    borderBottomColor: '#42A5F5',
  },
  optionButtonText: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  arrowRow: { flexDirection: 'row', justifyContent: 'space-between', width: '60%', marginTop: 10 },
  arrowButton: { backgroundColor: '#FFB300', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  arrowText: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
});
