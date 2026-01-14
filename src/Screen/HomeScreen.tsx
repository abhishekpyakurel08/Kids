import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  Image, StatusBar, useWindowDimensions, Animated as RNAnimated,
  NativeSyntheticEvent, NativeScrollEvent, AppState
} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import Tts from 'react-native-tts';
import Video from 'react-native-video';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Volume2, VolumeX, Settings, LogOut, Star } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';

export interface CardItem {
  key: string;
  color: string;
  image: any;
  label: string;
  screen: keyof RootStackParamList;
}

const CARDS: CardItem[] = [
  { key: 'Alphabet', color: '#9D4EDD', image: require('../assets/images/abc.jpeg'), label: 'ABC', screen: 'AlphabetMenu' },
  { key: 'Numbers', color: '#10B981', image: require('../assets/images/123.jpeg'), label: '123', screen: 'MathMenu' },
  { key: 'Animals', color: '#FFB347', image: require('../assets/images/animals.jpeg'), label: 'Animals', screen: 'Animal' },
  { key: 'Fruits', color: '#77DD77', image: require('../assets/images/fruits.png'), label: 'Fruits', screen: 'Fruits' },
  { key: 'Colors', color: '#4facfe', image: require('../assets/images/color.jpeg'), label: 'Colors', screen: 'Colors' },
  { key: 'Flowers', color: '#FF77FF', image: require('../assets/images/flower.jpeg'), label: 'Flower', screen: 'Flower' },
  { key: 'Birds', color: '#4facfe', image: require('../assets/images/bird.jpeg'), label: 'Birds', screen: 'Birds' },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { width, height } = useWindowDimensions();
  const scrollX = useRef(new RNAnimated.Value(0)).current;
  const [isMuted, setIsMuted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const SPACING = 15;
  const CARD_WIDTH = Math.min(350, width * 0.28);
  const FULL_SIZE = CARD_WIDTH + SPACING * 2;

  useFocusEffect(
    useCallback(() => {
      Orientation.lockToLandscape();
      return () => Orientation.unlockAllOrientations();
    }, [])
  );

  const speakSafe = (text: string) => {
    Tts.stop();
    Tts.speak(text);
  };

  const handlePressCard = (item: CardItem) => {
    speakSafe(item.label);
    if (item.screen === 'Math') {
      navigation.navigate('Math', { type: 'addition' });
    } else {
      navigation.navigate(item.screen);
    }
  };

  const onScroll = RNAnimated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: true,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / FULL_SIZE);
        if (index !== activeIndex && index >= 0 && index < CARDS.length) {
          setActiveIndex(index);
          speakSafe(CARDS[index].label);
        }
      },
    }
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Video
        source={require('../assets/images/background.mp4')}
        repeat muted={isMuted} resizeMode="cover"
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity style={[styles.roundBtn, { backgroundColor: '#FF4757' }]}>
            <LogOut color="white" size={28} />
          </TouchableOpacity>
          <View style={styles.topRightGroup}>
            <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={[styles.roundBtn, { backgroundColor: '#f59e0b', marginRight: 12 }]}>
              {isMuted ? <VolumeX color="white" size={28} /> : <Volume2 color="white" size={28} />}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.roundBtn, { backgroundColor: '#1E90FF' }]} onPress={() => navigation.navigate('Settings')}>
              <Settings color="white" size={28} />
            </TouchableOpacity>
          </View>
        </View>

        <RNAnimated.FlatList
          data={CARDS}
          horizontal
          snapToInterval={FULL_SIZE}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          contentContainerStyle={{ paddingHorizontal: (width - CARD_WIDTH) / 2 }}
          renderItem={({ item, index }) => {
            const inputRange = [(index - 1) * FULL_SIZE, index * FULL_SIZE, (index + 1) * FULL_SIZE];
            const scale = scrollX.interpolate({ inputRange, outputRange: [0.8, 1.05, 0.8], extrapolate: 'clamp' });
            return (
              <RNAnimated.View style={{ width: CARD_WIDTH, height: height * 0.7, transform: [{ scale }], marginHorizontal: SPACING / 2 }}>
                <TouchableOpacity onPress={() => handlePressCard(item)} style={[styles.cardMain, { backgroundColor: item.color }]}>
                  <Image source={item.image} style={styles.cardImage} />
                  <Text style={styles.cardLabel}>{item.label}</Text>
                </TouchableOpacity>
              </RNAnimated.View>
            );
          }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  topRightGroup: { flexDirection: 'row' },
  roundBtn: { width: 55, height: 55, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  cardMain: { flex: 1, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  cardImage: { width: '90%', height: '65%', resizeMode: 'contain', borderRadius: 20 },
  cardLabel: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 10 },
});