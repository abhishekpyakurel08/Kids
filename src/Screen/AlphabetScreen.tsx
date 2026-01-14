import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, useWindowDimensions } from 'react-native';
import Tts from 'react-native-tts';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useContentStore } from '../store/useContentStore';

export default function AlphabetScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const { items, fetchByType } = useContentStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => { fetchByType('letter', true); Tts.setDefaultRate(0.5); }, []);

  const scrollTo = (index: number) => {
    if (index >= 0 && index < items.length) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
      Tts.stop();
      Tts.speak(items[index].title);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FF5E8E' }]}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.navigate('AlphabetMenu')}>
        <View style={styles.closeCircle}><X color="white" size={30} strokeWidth={4} /></View>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef} data={items} horizontal pagingEnabled scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity activeOpacity={0.9} style={styles.whiteCard} onPress={() => Tts.speak(item.title)}>
              <Text style={styles.bigLetter}>{item.title}</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => scrollTo(currentIndex - 1)} disabled={currentIndex === 0}>
          <ChevronLeft color="white" size={80} style={{ opacity: currentIndex === 0 ? 0.2 : 1 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => scrollTo(currentIndex + 1)} disabled={currentIndex === items.length - 1}>
          <ChevronRight color="white" size={80} style={{ opacity: currentIndex === items.length - 1 ? 0.2 : 1 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  whiteCard: { width: 300, height: 300, backgroundColor: 'white', borderRadius: 60, justifyContent: 'center', alignItems: 'center', elevation: 20 },
  bigLetter: { fontSize: 200, fontWeight: '900', color: '#FF5E8E' },
  closeBtn: { position: 'absolute', top: 20, right: 30, zIndex: 10 },
  closeCircle: { backgroundColor: '#333', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white' },
  navBar: { position: 'absolute', bottom: 40, width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 40 }
});