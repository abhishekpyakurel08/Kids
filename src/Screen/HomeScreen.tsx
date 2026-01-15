import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Animated as RNAnimated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Easing,
} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import Tts from 'react-native-tts';
import Video from 'react-native-video';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Volume2, VolumeX, Settings, LogOut, Play } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import Haptic from 'react-native-haptic-feedback';
import FastImage from 'react-native-fast-image';
import { debounce } from 'lodash';

export interface CardItem {
  key: string;
  color: string;
  image: any;
  label: string;
  screen: keyof RootStackParamList;
}

const CARDS: CardItem[] = [
  { key: 'Alphabet', color: '#9D4EDD', image: require('../assets/images/abc.jpeg'), label: 'Alphabets', screen: 'AlphabetMenu' },
  { key: 'Numbers', color: '#FF4757', image: require('../assets/images/123.jpeg'), label: 'Numbers', screen: 'MathMenu' },
  { key: 'Animals', color: '#FFB347', image: require('../assets/images/animals.jpeg'), label: 'Animals', screen: 'Animal' },
  { key: 'Fruits', color: '#77DD77', image: require('../assets/images/fruits.png'), label: 'Fruits', screen: 'Fruits' },
  { key: 'Colors', color: '#4facfe', image: require('../assets/images/color.jpeg'), label: 'Colors', screen: 'Colors' },
  { key: 'Shapes', color: '#FF6F91', image: require('../assets/images/shapes.png'), label: 'Shapes', screen: 'Shapes' },
  { key: "Birds", color: "#00CED1", image: require("../assets/images/bird.jpeg"), label: "Birds", screen: "Birds" }
];

const speakSafe = debounce((text: string) => {
  Tts.stop();
  Tts.speak(text);
}, 300);

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const [isMuted, setIsMuted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const CARD_WIDTH = width * 0.42;
  const CARD_MARGIN = 20;
  const FULL_SIZE = CARD_WIDTH + CARD_MARGIN * 2;

  const scrollX = useRef(new RNAnimated.Value(0)).current;
  const shineAnim = useRef(new RNAnimated.Value(0)).current;
  const wiggleAnim = useRef(new RNAnimated.Value(0)).current;
  const logoutBounce = useRef(new RNAnimated.Value(1)).current; // For bounce animation

  // Lock landscape and set TTS rate
  useFocusEffect(
    useCallback(() => {
      Orientation.lockToLandscape();
      Tts.setDefaultRate(0.5);
      return () => {
        Orientation.unlockAllOrientations();
        Tts.stop();
      };
    }, [])
  );

  // Shine and wiggle animations
  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.timing(shineAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(wiggleAnim, { toValue: 1, duration: 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        RNAnimated.timing(wiggleAnim, { toValue: -1, duration: 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        RNAnimated.timing(wiggleAnim, { toValue: 0, duration: 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        RNAnimated.delay(2000),
      ])
    ).start();
  }, []);

  const videoTranslateX = scrollX.interpolate({
    inputRange: [0, FULL_SIZE * (CARDS.length - 1)],
    outputRange: [40, -40],
    extrapolate: 'clamp',
  });

  const onScroll = RNAnimated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: true,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / FULL_SIZE);
        if (index !== activeIndex && index >= 0 && index < CARDS.length) {
          setActiveIndex(index);
          speakSafe(CARDS[index].label);
          Haptic.trigger('selection');
        }
      },
    }
  );

  // Card component
  const Card = React.memo(({ item, index }: { item: CardItem; index: number }) => {
    const isActive = index === activeIndex;
    const inputRange = [(index - 1) * FULL_SIZE, index * FULL_SIZE, (index + 1) * FULL_SIZE];

    const scaleScroll = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1.05, 0.85],
      extrapolate: 'clamp',
    });

    const rotateWiggle = wiggleAnim.interpolate({
      inputRange: [-1, 1],
      outputRange: ['-2deg', '2deg'],
    });

    const shineTranslateX = shineAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-CARD_WIDTH, CARD_WIDTH * 1.5],
    });

    return (
      <RNAnimated.View
        style={[
          styles.cardWrapper, 
          { 
            width: CARD_WIDTH, 
            marginHorizontal: CARD_MARGIN,
            transform: [
              { scale: scaleScroll },
              { rotate: isActive ? rotateWiggle : '0deg' }
            ] 
          }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.cardContainer, { backgroundColor: item.color }]}
          onPress={() => {
            Haptic.trigger('impactMedium');
            navigation.navigate(item.screen as any);
          }}
        >
          <View style={styles.imageSection}>
            <FastImage source={item.image} style={styles.cardImage} resizeMode="contain" />
            <RNAnimated.View
              style={[styles.shineEffect, { transform: [{ translateX: shineTranslateX }, { rotate: '25deg' }] }]}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerLabel}>{item.label}</Text>
            <View style={styles.playCircle}>
              <Play fill="#FF4757" color="#FF4757" size={18} />
            </View>
          </View>
        </TouchableOpacity>
      </RNAnimated.View>
    );
  });

  // Function to handle LogOut tap with bounce
  const handleLogout = () => {
    RNAnimated.sequence([
      RNAnimated.timing(logoutBounce, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      RNAnimated.timing(logoutBounce, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      Tts.stop();
      Tts.speak('Bye Bye', undefined, {
        onFinish: () => {
          navigation.goBack();
          // Or use BackHandler.exitApp() to fully close app
        },
      });
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Parallax Video Background */}
      <RNAnimated.View style={[styles.backgroundContainer, { transform: [{ scale: 1.15 }, { translateX: videoTranslateX }] }]}>
        <Video
          source={require('../assets/images/background.mp4')}
          repeat
          muted={isMuted}
          resizeMode="cover"
          style={StyleSheet.absoluteFillObject}
          rate={1.0}
        />
        <View style={styles.overlay} />
      </RNAnimated.View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header UI */}
        <View style={styles.header}>
        
          {/* Mute & Settings */}
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity 
              onPress={() => setIsMuted(!isMuted)}
              style={[styles.navBtn, { backgroundColor: '#FF69B4', marginRight: 15 }]}
            >
              {isMuted ? <VolumeX color="white" size={24} /> : <Volume2 color="white" size={24} />}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Settings')}
              style={[styles.navBtn, { backgroundColor: '#00BFFF' }]}
            >
              <Settings color="white" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Carousel */}
        <RNAnimated.FlatList
          data={CARDS}
          horizontal
          snapToInterval={FULL_SIZE}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ 
            paddingHorizontal: (width - FULL_SIZE) / 2 + CARD_MARGIN,
            paddingVertical: 20 
          }}
          keyExtractor={(item) => item.key}
          renderItem={({ item, index }) => <Card item={item} index={index} />}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  backgroundContainer: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
  safeArea: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 30, 
    paddingTop: 20, 
    zIndex: 10 
  },
  navBtn: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 4, 
    borderColor: 'white',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardWrapper: { height: '85%', justifyContent: 'center' },
  cardContainer: {
    flex: 1,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: 'white',
    overflow: 'hidden',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  imageSection: {
    flex: 3,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardImage: { width: '75%', height: '75%' },
  footer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  footerLabel: { color: 'white', fontSize: 26, fontWeight: '900' },
  playCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shineEffect: {
    position: 'absolute',
    width: 100,
    height: '300%',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});
