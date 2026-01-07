import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Platform,
  Vibration,
  PanResponder,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Tts from 'react-native-tts';
import { useContentStore } from '../store/useContentStore';
import { RefreshCw, Star, Frown } from 'lucide-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

const MathScreen = () => {
  const { items, loading, fetchByType, correctCount, wrongCount, trackAnswer } = useContentStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedbackColor, setFeedbackColor] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Tts.setDefaultRate(0.5);
    loadMath();
  }, []);

  const loadMath = () => {
    fetchByType('math', true);
    setCurrentIndex(0);
    setAnswered(false);
    setFeedbackColor(null);
    setShowConfetti(false);
    position.setValue({ x: 0, y: 0 });
    shakeAnimation.setValue(0);
  };

  const triggerShake = () => {
    shakeAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: false }),
    ]).start();
  };

  const handleAnswer = (userChoice: string, correctAnswer: string) => {
    if (answered) return;
    const isCorrect = userChoice === correctAnswer;
    setAnswered(true);
    setFeedbackColor(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      setShowConfetti(true);
      Tts.speak('Great job!');
      if (Platform.OS === 'android') Vibration.vibrate(50);
    } else {
      Tts.speak('Try again!');
      triggerShake();
      if (Platform.OS === 'android') Vibration.vibrate([0, 50, 20, 50]);
    }

    trackAnswer(isCorrect);

    setTimeout(() => {
      Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      setAnswered(false);
      setFeedbackColor(null);
      setShowConfetti(false);

      if (currentIndex < items.length - 1) setCurrentIndex(currentIndex + 1);
      else loadMath();
    }, 1500);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        const currentItem = items[currentIndex];
        if (!currentItem || answered || !currentItem.options) {
          Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
          return;
        }

        const right = currentItem.options[0] ?? '';
        const left = currentItem.options[1] ?? '';
        const correct = currentItem.correctAnswer ?? '';

        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.spring(position, { toValue: { x: width * 1.5, y: 0 }, useNativeDriver: false }).start(() =>
            handleAnswer(right, correct)
          );
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          Animated.spring(position, { toValue: { x: -width * 1.5, y: 0 }, useNativeDriver: false }).start(() =>
            handleAnswer(left, correct)
          );
        } else {
          Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const currentItem = items[currentIndex];

  const getOptionStyle = (index: number) => {
    const colors = ['#FF85B3', '#86EFAC', '#FFB444', '#60A5FA'];
    const borders = ['#D64C81', '#4ADE80', '#E29412', '#2563EB'];
    return { backgroundColor: colors[index % colors.length], borderBottomColor: borders[index % borders.length] };
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFB7DA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.statsBar}>
          <View style={[styles.statItem, { backgroundColor: '#FFD700' }]}>
            <Star size={22} color="#FFF" fill="#FFF" />
            <Text style={styles.statText}>{correctCount}</Text>
          </View>
          <Text style={styles.headerTitle}>Math Fun</Text>
          <View style={[styles.statItem, { backgroundColor: '#F87171' }]}>
            <Frown size={22} color="#FFF" />
            <Text style={styles.statText}>{wrongCount}</Text>
          </View>
        </View>

        <View style={styles.gameContent}>
          {currentItem && (
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.cardContainer,
                position.getLayout(),
                { transform: [{ translateX: shakeAnimation }] },
                feedbackColor === 'correct' && { borderColor: '#FFD700', borderWidth: 8 },
                feedbackColor === 'wrong' && { borderColor: '#FCA5A5', borderWidth: 8 },
              ]}
            >
              <Text style={styles.mathText}>{currentItem.question}</Text>

              <View style={styles.optionsContainer}>
                {currentItem.options?.map((opt, index) => {
                  const isCorrect = answered && opt === currentItem.correctAnswer;
                  const isWrong = answered && opt !== currentItem.correctAnswer && feedbackColor === 'wrong';

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionBox,
                        getOptionStyle(index),
                        isCorrect && { backgroundColor: '#FFD700', borderBottomColor: '#CCAC00' },
                        isWrong && { backgroundColor: '#FCA5A5', borderBottomColor: '#F87171' },
                      ]}
                      onPress={() => handleAnswer(opt, currentItem.correctAnswer ?? '')}
                      disabled={answered}
                    >
                      <Text style={styles.optionText}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.swipeHint}>⬅ SWIPE OR TAP TO ANSWER ➡</Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.refreshButton} onPress={loadMath}>
            <RefreshCw size={32} color="#FFF" />
          </TouchableOpacity>
        </View>

        {showConfetti && <ConfettiCannon count={200} origin={{ x: width / 2, y: 0 }} fadeOut fallSpeed={3000} />}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#BAE6FD' },
  safeArea: { flex: 1, paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#BAE6FD' },

  statsBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 60, marginTop: 30 },
  statItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 25 },
  statText: { color: '#FFF', fontWeight: '900', marginLeft: 6, fontSize: 22 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#FFF' },

  gameContent: { flex: 1, justifyContent: 'center' },

  cardContainer: {
    width: '100%',
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 45,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  mathText: { fontSize: 34, fontWeight: '900', color: '#334155', textAlign: 'center' },

  optionsContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },

  optionBox: {
    width: '100%',
    flex: 1,
    minHeight: 70,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 8,
  },

  optionText: { color: '#FFF', fontSize: 30, fontWeight: '900' },
  swipeHint: { fontSize: 13, fontWeight: '900', color: '#CBD5E1' },

  footer: { height: 100, justifyContent: 'center', alignItems: 'center' },
  refreshButton: {
    backgroundColor: '#A78BFA',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 6,
    borderBottomColor: '#7C3AED',
  },
});

export default MathScreen;
