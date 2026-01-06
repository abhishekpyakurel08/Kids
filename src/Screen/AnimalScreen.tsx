import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView, Alert, Platform
} from 'react-native';
import Sound from 'react-native-sound';
import { useContentStore } from '../store/useContentStore';

const BASE_URL = 'https://kiddsapp-backend.tecobit.cloud';

const AnimalSoundScreen = () => {
  const { items, loading, fetchByType, fetchMore } = useContentStore();
  const [loadingSoundId, setLoadingSoundId] = useState<string | null>(null);
  const currentSoundRef = useRef<Sound | null>(null); // 👈 add this

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

  const playSound = (item: any) => {
    if (!item.soundUrl) return;

    setLoadingSoundId(item._id);

    const soundUrl = item.soundUrl.startsWith('http')
      ? item.soundUrl
      : `${BASE_URL}${item.soundUrl.startsWith('/') ? '' : '/'}${item.soundUrl}`;

    // 🛑 stop previous sound
    if (currentSoundRef.current) {
      currentSoundRef.current.stop();
      currentSoundRef.current.release();
      currentSoundRef.current = null;
    }

    const animalSound = new Sound(soundUrl, '', (err) => {
      if (err) {
        setLoadingSoundId(null);
        Alert.alert("Network Error", "Could not load sound.");
        return;
      }
      setLoadingSoundId(null);
      currentSoundRef.current = animalSound;

      animalSound.play(() => {
        animalSound.release();
        if (currentSoundRef.current === animalSound) {
          currentSoundRef.current = null;
        }
      });
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    const isEmoji = item.imageUrl && item.imageUrl.length < 5 && !item.imageUrl.includes('.');

    const imageUrl = item.imageUrl?.startsWith('http')
      ? item.imageUrl
      : `${BASE_URL}${item.imageUrl?.startsWith('/') ? '' : '/'}${item.imageUrl}`;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => playSound(item)}
        disabled={loadingSoundId !== null}
      >
        <View style={styles.whiteBox}>
          {loadingSoundId === item._id ? (
            <ActivityIndicator color="#689F38" />
          ) : isEmoji ? (
            <Text style={styles.emojiText}>{item.imageUrl}</Text>
          ) : (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
          )}
        </View>
        <Text style={styles.animalName}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Animal Sounds</Text>
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Waking up the animals...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={3}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={() => fetchMore('animal')}
          onEndReachedThreshold={0.4}
          ListFooterComponent={loading ? <ActivityIndicator color="#fff" /> : null}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#689F38' },
  header: { paddingVertical: 20, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 12, paddingBottom: 30 },
  card: { flex: 1 / 3, margin: 10, alignItems: 'center' },
  whiteBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 6 }
    })
  },
  image: { width: '75%', height: '75%' },
  emojiText: { fontSize: 45 },
  animalName: { color: '#fff', fontWeight: 'bold', marginTop: 10, fontSize: 16 },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 14 }
});

export default AnimalSoundScreen;
