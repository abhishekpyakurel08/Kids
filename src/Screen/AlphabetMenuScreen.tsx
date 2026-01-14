import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { X } from 'lucide-react-native';

export default function AlphabetMenuScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {/* Background Decor */}
      <View style={styles.shelfDecor}>
        <View style={styles.shelfLine} />
        <View style={styles.shelfLine} />
      </View>

      <SafeAreaView style={styles.content}>
        {/* BACK TO HOME */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.navigate('Home')}>
          <View style={styles.closeCircle}><X color="white" size={30} strokeWidth={4} /></View>
        </TouchableOpacity>

        <View style={styles.cardWrapper}>
          {/* TO ALPHABET */}
          <TouchableOpacity 
            style={[styles.menuCard, { backgroundColor: '#9D4EDD' }]}
            onPress={() => navigation.navigate('Alphabet')}
          >
            <View style={styles.visualArea}>
              <Text style={[styles.bigChar, { color: '#FFB347' }]}>A</Text>
              <Text style={[styles.bigChar, { color: '#10B981' }]}>B</Text>
              <Text style={[styles.bigChar, { color: '#FF7F00' }]}>C</Text>
            </View>
            <View style={styles.cardFooter}><Text style={styles.footerLabel}>Alphabets</Text></View>
          </TouchableOpacity>

          {/* TO PHONICS */}
          <TouchableOpacity 
            style={[styles.menuCard, { backgroundColor: '#FF5252' }]}
            onPress={() => navigation.navigate('Phonics')}
          >
            <View style={styles.visualArea}>
              <Text style={styles.bigChar}>A</Text>
              <Text style={styles.arrowText}>→</Text>
              <Text style={styles.emojiText}>🍎</Text>
            </View>
            <View style={styles.cardFooter}><Text style={styles.footerLabel}>Phonics</Text></View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8A2BE2' },
  shelfDecor: { ...StyleSheet.absoluteFillObject, padding: 40, paddingTop: 80 },
  shelfLine: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 140, borderRadius: 4 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardWrapper: { flexDirection: 'row', gap: 40 },
  menuCard: { width: 320, height: 220, borderRadius: 40, borderWidth: 6, borderColor: 'white', elevation: 10, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  visualArea: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  bigChar: { fontSize: 80, fontWeight: '900', color: 'white' },
  arrowText: { fontSize: 40, color: 'white' },
  emojiText: { fontSize: 70 },
  cardFooter: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(0,0,0,0.15)', paddingVertical: 12, alignItems: 'center' },
  footerLabel: { color: 'white', fontSize: 28, fontWeight: '900' },
  closeBtn: { position: 'absolute', top: 20, right: 30 },
  closeCircle: { backgroundColor: '#FF7F00', width: 55, height: 55, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white' }
});