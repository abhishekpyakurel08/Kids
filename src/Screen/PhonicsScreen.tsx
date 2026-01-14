import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { X, ArrowRight } from 'lucide-react-native';

export default function PhonicsScreen({ navigation }: any) {
  return (
    <View style={[styles.container, { backgroundColor: '#FF5252' }]}>
      {/* BACK TO ALPHABET MENU */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.navigate('AlphabetMenu')}>
        <View style={styles.closeCircle}><X color="white" size={30} strokeWidth={4} /></View>
      </TouchableOpacity>

      <View style={styles.row}>
        <View style={styles.whiteBox}><Text style={styles.letter}>A</Text></View>
        <ArrowRight color="white" size={60} strokeWidth={5} />
        <View style={styles.whiteBox}>
          <Text style={{fontSize: 100}}>🍎</Text>
          <View style={styles.label}><Text style={styles.labelText}>APPLE</Text></View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 20, right: 30, zIndex: 10 },
  closeCircle: { backgroundColor: '#333', width: 55, height: 55, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  whiteBox: { width: 230, height: 230, backgroundColor: 'white', borderRadius: 40, justifyContent: 'center', alignItems: 'center', elevation: 15 },
  letter: { fontSize: 130, fontWeight: '900', color: '#FF5252' },
  label: { position: 'absolute', bottom: -15, backgroundColor: '#A6CE39', paddingHorizontal: 25, paddingVertical: 8, borderRadius: 20 },
  labelText: { color: 'white', fontWeight: 'bold', fontSize: 22 }
});