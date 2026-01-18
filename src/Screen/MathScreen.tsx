import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { CheckCircle2, XCircle, RefreshCcw, Trophy, X } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import ConfettiCannon from 'react-native-confetti-cannon';
import Tts from 'react-native-tts';
import { useContentStore, ContentItem } from '../store/useContentStore';

const { width, height } = Dimensions.get('window');
const TOTAL_STEPS = 10;

type MathScreenProps = {
  route: { params: { type: 'addition' | 'subtraction' | 'multiplication' | 'division' } };
  navigation: any;
};

export default function MathScreen({ route, navigation }: MathScreenProps) {
  const { type } = route.params;
  const {
    items,
    loading,
    fetchByType,
    trackAnswer,
    highScore,
    resetScores,
    updateHighScore,
  } = useContentStore();

  const [sessionQuestions, setSessionQuestions] = useState<ContentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [exitPressed, setExitPressed] = useState(false);

  useEffect(() => {
    fetchByType(type, true);
    Tts.setDefaultRate(0.45);
    Tts.setDefaultPitch(1.2);
  }, [type]);

  useEffect(() => {
    if (items.length > 0) {
      const selected =
        items.length > TOTAL_STEPS ? shuffleArray(items).slice(0, TOTAL_STEPS) : items;
      setSessionQuestions(selected);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsFinished(false);
      setShowConfetti(false);
      setQuizScore(0);
      speakQuestion(selected[0]);
    }
  }, [items]);

  const currentQuestion = sessionQuestions[currentIndex];

  const speakQuestion = (question: ContentItem | undefined) => {
    if (!question) return;
    try {
      Tts.stop();
      Tts.speak(question.question);
    } catch (err) {
      console.log('TTS error:', err);
    }
  };

  const speakAnswer = (answer: string | number) => {
    try {
      Tts.stop();
      Tts.speak(String(answer));
    } catch (err) {
      console.log('TTS error:', err);
    }
  };

  const handleAnswer = (val: string | number) => {
    if (selectedAnswer || !currentQuestion) return;

    const isCorrect = String(val) === String(currentQuestion.correctAnswer);
    setSelectedAnswer(val);
    trackAnswer(isCorrect);
    setQuizScore(prev => prev + (isCorrect ? 1 : 0));
    speakAnswer(val);

    setTimeout(() => {
      if (currentIndex < sessionQuestions.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setSelectedAnswer(null);
        speakQuestion(sessionQuestions[nextIndex]);
      } else {
        const finalScore = quizScore + (isCorrect ? 1 : 0);
        updateHighScore(finalScore);
        if ((finalScore / sessionQuestions.length) * 100 >= 80) setShowConfetti(true);
        setIsFinished(true);
      }
    }, 1200);
  };

  const restart = () => {
    resetScores();
    fetchByType(type, true);
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  const progress = ((currentIndex + 1) / sessionQuestions.length) * 100;
  const percentage = Math.round((quizScore / sessionQuestions.length) * 100);

  const getCompletionMessage = () => {
    if (percentage === 100) return 'Perfect Score! 🎉';
    if (percentage >= 80) return 'Excellent Work! 🌟';
    if (percentage >= 60) return 'Good Job! 👍';
    if (percentage >= 40) return 'Keep Practicing! 💪';
    return "Don't Give Up! 🚀";
  };

  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 414;
  const questionFontSize = isSmallScreen ? 32 : isMediumScreen ? 36 : 40;
  const optionSize = isSmallScreen ? 80 : isMediumScreen ? 90 : 95;
  const optionFontSize = isSmallScreen ? 22 : isMediumScreen ? 26 : 28;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {isFinished && showConfetti && (
          <ConfettiCannon count={150} origin={{ x: width / 2, y: 0 }} fadeOut autoStart />
        )}

        {/* ───────────── EXIT BUTTON (LEFT) ───────────── */}
        <MotiView
          animate={{ scale: exitPressed ? 0.9 : 1 }}
          transition={{ type: 'spring', damping: 12 }}
          style={styles.exitBtnContainer}
        >
          <TouchableOpacity
            style={styles.exitBtn}
            onPress={() => {
              Tts.stop();
              Tts.speak('Bye Bye');
              setTimeout(() => navigation.goBack(), 600);
            }}
            onPressIn={() => setExitPressed(true)}
            onPressOut={() => setExitPressed(false)}
          >
            <X size={32} color="#FFF" strokeWidth={5} />
          </TouchableOpacity>
        </MotiView>

        {/* ───────────── PROGRESS ───────────── */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <MotiView
              animate={{ width: `${progress}%` }}
              transition={{ type: 'timing', duration: 400 }}
              style={styles.progressFill}
            />
          </View>
          <Text style={styles.stepText}>
            Step {currentIndex + 1} of {sessionQuestions.length}
          </Text>
          {/* "Correct Answers" text has been removed from here */}
        </View>

        {/* ───────────── QUESTION ───────────── */}
        <View style={styles.questionArea}>
          <Text style={[styles.questionLabel, { fontSize: questionFontSize }]}>
            {currentQuestion?.question}
          </Text>
        </View>

        {/* ───────────── OPTIONS GRID ───────────── */}
        <View style={styles.grid}>
          {currentQuestion?.options?.map((option, idx) => {
            const isCorrect = String(option) === String(currentQuestion.correctAnswer);
            const isSelected = selectedAnswer === option;

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
                activeOpacity={0.7}
              >
                <MotiView
                  from={{ scale: 1 }}
                  animate={{
                    scale: isSelected ? 1.05 : 1,
                    translateY: isSelected ? -5 : 0,
                    backgroundColor: isSelected
                      ? isCorrect
                        ? '#4CAF50'
                        : '#F44336'
                      : '#FFFFFF',
                  }}
                  transition={{ type: 'spring', damping: 12 }}
                  style={[styles.option, { width: optionSize, height: optionSize * 0.84 }]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && { color: 'white' },
                      { fontSize: optionFontSize },
                    ]}
                  >
                    {option}
                  </Text>

                  <AnimatePresence>
                    {isSelected && (
                      <MotiView
                        from={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={styles.check}
                      >
                        {isCorrect ? (
                          <CheckCircle2 color="white" size={22} />
                        ) : (
                          <XCircle color="white" size={22} />
                        )}
                      </MotiView>
                    )}
                  </AnimatePresence>
                </MotiView>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ───────────── RESTART BUTTON ───────────── */}
        <TouchableOpacity onPress={restart} style={styles.cancel}>
          <Text style={styles.cancelText}>RESTART</Text>
        </TouchableOpacity>

        {/* ───────────── QUIZ FINISHED OVERLAY ───────────── */}
        {isFinished && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.overlay}>
            <MotiView
              from={{ opacity: 0, scale: 0.7, translateY: 50 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              style={styles.card}
            >
              <Trophy color="#FFD700" size={isSmallScreen ? 38 : 45} />
              <Text style={[styles.title, { fontSize: isSmallScreen ? 19 : 22 }]}>
                {getCompletionMessage()}
              </Text>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreValue}>Score: {quizScore}/{sessionQuestions.length}</Text>
                <Text style={[styles.scoreValue, { color: '#FF9800' }]}>Best: {highScore}/{sessionQuestions.length}</Text>
              </View>
              <TouchableOpacity onPress={restart} style={styles.mainBtn}>
                <RefreshCcw color="white" size={18} />
                <Text style={styles.mainBtnText}>Try Again</Text>
              </TouchableOpacity>
            </MotiView>
          </MotiView>
        )}
      </View>
    </SafeAreaView>
  );
}

function shuffleArray<T>(array: T[]): T[] {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F9FF' },
  container: { flex: 1, alignItems: 'center', paddingHorizontal: width * 0.06 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  exitBtnContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 10,
    left: 20,
    zIndex: 100,
  },
  exitBtn: {
    width: width < 375 ? 45 : 50,
    height: width < 375 ? 45 : 50,
    borderRadius: 100,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  progressContainer: {
    width: '100%',
    marginTop: 80,
    paddingHorizontal: width * 0.02,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#D1E4F3',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#3498DB' },
  stepText: { textAlign: 'center', marginTop: 6, color: '#5D6D7E', fontWeight: '600' },

  questionArea: { height: height * 0.2, justifyContent: 'center', alignItems: 'center' },
  questionLabel: { fontWeight: '900', color: '#1A4A73', textAlign: 'center' },

  grid: { flexDirection: 'row', gap: 15, flexWrap: 'wrap', justifyContent: 'center' },
  option: {
    backgroundColor: 'white',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  optionText: { fontWeight: '800', color: '#2C3E50' },
  check: { position: 'absolute', top: -8, right: -8, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 20 },

  cancel: { marginTop: 'auto', marginBottom: 30, paddingVertical: 10 },
  cancelText: { color: '#E74C3C', fontSize: 17, fontWeight: '800', textDecorationLine: 'underline' },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: 'white', width: '85%', padding: 20, borderRadius: 20, alignItems: 'center' },
  title: { fontWeight: '900', color: '#1A4A73', marginTop: 10 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginVertical: 15 },
  scoreValue: { fontWeight: '900', color: '#27AE60' },
  mainBtn: { backgroundColor: '#3498DB', flexDirection: 'row', borderRadius: 20, gap: 7, padding: 12, alignItems: 'center' },
  mainBtnText: { color: 'white', fontWeight: '800' },
});