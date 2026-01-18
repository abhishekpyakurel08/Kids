import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import Tts from 'react-native-tts';
import { Plus, Minus, X, Divide, ArrowLeft } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';

type MathMenuNavigationProp = NavigationProp<RootStackParamList, 'MathMenu'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.45;
const SPACING = 20;
const SNAP_INTERVAL = CARD_WIDTH + SPACING;

interface MenuItem {
  label: string;
  screen: keyof RootStackParamList;
  params?: { type: 'addition' | 'subtraction' | 'multiplication' | 'division' };
  color: string;
  bg: string;
  icon: React.ReactNode;
}

const MathMenuScreen: React.FC = () => {
  const navigation = useNavigation<MathMenuNavigationProp>();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const lastSpokenIndex = useRef<number>(-1);

  const menuItems: MenuItem[] = [
    { label: 'COUNT', screen: 'NumberCount', color: '#FF7043', bg: '#FFEBE6', icon: <Text style={styles.iconEmoji}>123</Text> },
    { label: 'ADDITION', screen: 'Math', params: { type: 'addition' }, color: '#66BB6A', bg: '#E8F5E9', icon: <Plus size={80} color="#FFF" strokeWidth={4} /> },
    { label: 'SUBTRACTION', screen: 'Math', params: { type: 'subtraction' }, color: '#42A5F5', bg: '#E3F2FD', icon: <Minus size={80} color="#FFF" strokeWidth={4} /> },
    { label: 'MULTIPLICATION', screen: 'Math', params: { type: 'multiplication' }, color: '#BA68C8', bg: '#F3E5F5', icon: <X size={80} color="#FFF" strokeWidth={4} /> },
    { label: 'DIVISION', screen: 'Math', params: { type: 'division' }, color: '#FFB74D', bg: '#FFF3E0', icon: <Divide size={80} color="#FFF" strokeWidth={4} /> },
  ];

  useEffect(() => {
    Orientation.lockToLandscape();
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.2);
    return () => Tts.stop();
  }, []);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  );

  const onMomentumScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SNAP_INTERVAL);
    if (index >= 0 && index < menuItems.length) {
      setActiveIndex(index);
      if (lastSpokenIndex.current !== index) {
        lastSpokenIndex.current = index;
        Tts.stop();
        Tts.speak(menuItems[index].label.toLowerCase());
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <ArrowLeft size={30} color="#FFF" strokeWidth={4} />
      </TouchableOpacity>

      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
          alignItems: 'center',
        }}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToAlignment="center"
        onMomentumScrollEnd={onMomentumScrollEnd}
      >
        {menuItems.map((item, index) => {
          const inputRange = [
            (index - 1) * SNAP_INTERVAL,
            index * SNAP_INTERVAL,
            (index + 1) * SNAP_INTERVAL,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.85, 1.1, 0.85],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View key={index} style={[styles.cardContainer, { transform: [{ scale }], opacity }]}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  if (item.screen === 'NumberCount') navigation.navigate('NumberCount');
                  else if (item.screen === 'Math' && item.params) navigation.navigate('Math', item.params);
                }}
                style={[styles.card, { backgroundColor: item.bg }]}
              >
                <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                  {item.icon}
                </View>
                <View style={styles.labelContainer}>
                  <Text style={styles.labelText}>{item.label}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#A5D6A7' },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: '#FF7043',
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    elevation: 5,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: '75%',
    marginRight: SPACING,
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    borderRadius: 45,
    borderWidth: 10,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#FFF',
    marginBottom: 20,
    elevation: 5,
  },
  iconEmoji: { fontSize: 50, fontWeight: '900', color: '#FFF' },
  labelContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
  },
  labelText: { fontSize: 24, fontWeight: '900', color: '#333', letterSpacing: 1 },
});

export default MathMenuScreen;
