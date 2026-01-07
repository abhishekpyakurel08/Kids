import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Animated,
  Alert
} from 'react-native';
import Sound from 'react-native-sound';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SvgUri } from 'react-native-svg';
import { useContentStore } from '../store/useContentStore';
import { Volume2 } from 'lucide-react-native';

const BASE_URL = 'https://kiddsapp-backend.tecobit.cloud';

// --- Sub-component: Memoized Animal Card ---
const AnimalCard = memo(({ item, playSound }: { item: any, playSound: (item: any) => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isEmoji = item.imageUrl && item.imageUrl.length < 5 && !item.imageUrl.includes('.');
  const isSvg = item.imageUrl?.endsWith('.svg');

  const imageUrl = item.imageUrl?.startsWith('http')
    ? item.imageUrl
    : `${BASE_URL}${item.imageUrl?.startsWith('/') ? '' : '/'}${item.imageUrl}`;

  const onPressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => playSound(item)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.whiteBox}>
          {isSvg ? (
            <SvgUri width="70%" height="70%" uri={imageUrl} />
          ) : isEmoji ? (
            <Text style={styles.emojiText}>{item.imageUrl}</Text>
          ) : (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
          )}
          <View style={styles.soundIcon}>
            <Volume2 color="#689F38" size={24} />
          </View>
        </View>
        <Text style={styles.animalName}>{item.title}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
});

// --- Main Screen Component ---
const AnimalSoundScreen: React.FC = () => {
  const { items, loading, fetchByType, fetchMore } = useContentStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const currentSoundRef = useRef<Sound | null>(null);

  useEffect(() => {
    Sound.setCategory('Playback');
    fetchByType('animal', true);

    return () => {
      if (currentSoundRef.current) {
        currentSoundRef.current.stop();
        currentSoundRef.current.release();
        currentSoundRef.current = null;
      }
    };
  }, []);

  const playSound = useCallback((item: any) => {
    if (!item.soundUrl) return;

    const soundUrl = item.soundUrl.startsWith('http')
      ? item.soundUrl
      : `${BASE_URL}${item.soundUrl.startsWith('/') ? '' : '/'}${item.soundUrl}`;

    if (currentSoundRef.current) {
      currentSoundRef.current.stop();
      currentSoundRef.current.release();
    }

    const animalSound = new Sound(soundUrl, '', (err) => {
      if (err) {
        Alert.alert("Error", "Could not play the sound!");
        return;
      }

      currentSoundRef.current = animalSound;
      animalSound.play(() => {
        animalSound.release();
        if (currentSoundRef.current === animalSound) {
          currentSoundRef.current = null;
        }
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      });
    });
  }, []);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <AnimalCard 
      item={item} 
      playSound={playSound} 
    />
  ), [playSound]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Animal Sounds</Text>
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading animals...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={() => fetchMore('animal')}
          onEndReachedThreshold={0.4}
          ListFooterComponent={loading ? <ActivityIndicator color="#fff" /> : null}
        />
      )}

      {showConfetti && (
        <ConfettiCannon count={50} origin={{ x: -20, y: 0 }} fadeOut fallSpeed={3000} />
      )}
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#689F38' },
  header: { paddingVertical: 20, alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 12, paddingBottom: 30 },
  card: { flex: 1 / 2, margin: 15, alignItems: 'center' },
  whiteBox: {
    backgroundColor: '#fff',
    borderRadius: 25,
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 8 }
    })
  },
  image: { width: '85%', height: '85%' },
  emojiText: { fontSize: 60 },
  animalName: { color: '#fff', fontWeight: 'bold', marginTop: 12, fontSize: 18, textAlign: 'center' },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 16 },
  soundIcon: { position: 'absolute', bottom: 8, right: 8 }
});

export default AnimalSoundScreen;
