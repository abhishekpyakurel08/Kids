import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  SafeAreaView,
  Alert,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
} from 'react-native';
import Animated, { BounceIn, FadeOut } from 'react-native-reanimated';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

// --- Types ---
type Shape = {
  x: number;
  y: number;
  emoji: string;
  size: number;
  id: string;
  color: string;
};

// --- Constants ---
const EMOJI_SHAPES = ['⭐', '🌙', '🌈', '🍎', '🐶', '🚀', '🦄', '🎨'];
const BACKGROUNDS = ['#0F172A', '#FEF3C7', '#ECFEFF', '#FCE7F3', '#111827'];
const RAINBOW_COLORS = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF'];

export default function KidsEmojiDrawing() {
  const viewShotRef = useRef<ViewShot>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedEmoji, setSelectedEmoji] = useState<string>(EMOJI_SHAPES[0]);
  const [bgIndex, setBgIndex] = useState(0);
  const [eraser, setEraser] = useState(false);

  // Sync state to Ref to prevent stale closures in PanResponder
  const stateRef = useRef({ selectedEmoji, eraser, shapes });
  stateRef.current = { selectedEmoji, eraser, shapes };

  const lastPoint = useRef<{ x: number; y: number; time: number } | null>(null);
  const rainbowIndex = useRef(0);

  // --- Drawing Logic ---
  const handleTouch = (x: number, y: number) => {
    const { eraser: isEraser, selectedEmoji: currentEmoji } = stateRef.current;

    if (isEraser) {
      setShapes((prev) => prev.filter((s) => Math.hypot(s.x - x, s.y - y) > 35));
      return;
    }

    const now = Date.now();
    let speed = 0.5;

    if (lastPoint.current) {
      const dx = x - lastPoint.current.x;
      const dy = y - lastPoint.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Prevent overlapping; only draw if moved enough
      if (distance < 25) return; 
      
      speed = distance / Math.max(now - lastPoint.current.time, 1);
    }
    lastPoint.current = { x, y, time: now };

    const color = RAINBOW_COLORS[rainbowIndex.current];
    rainbowIndex.current = (rainbowIndex.current + 1) % RAINBOW_COLORS.length;

    const newShape: Shape = {
      x,
      y,
      emoji: currentEmoji,
      size: Math.min(80, Math.max(35, 100 - speed * 15)),
      id: `${now}-${Math.random()}`,
      color,
    };

    setShapes((prev) => [...prev, newShape]);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => handleTouch(e.nativeEvent.locationX, e.nativeEvent.locationY),
      onPanResponderMove: (e) => handleTouch(e.nativeEvent.locationX, e.nativeEvent.locationY),
      onPanResponderRelease: () => { 
        lastPoint.current = null; 
      },
    })
  ).current;

  // --- Save Function ---
  const saveDrawing = async () => {
    try {
      if (Platform.OS === 'android') {
        // Safe conversion for Platform.Version
        const rawVersion = Platform.Version;
        const version = typeof rawVersion === 'string' ? parseInt(rawVersion, 10) : rawVersion;

        const perm = version >= 33 
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES 
          : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
          
        const status = await PermissionsAndroid.request(perm);
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Gallery access is needed to save art.');
          return;
        }
      }

      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef, { format: 'png', quality: 0.9 });
        await CameraRoll.save(uri, { type: 'photo' });
        Alert.alert('Saved! 📸', 'Your masterpiece is in your gallery!');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not save photo');
      console.error(err);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <Text style={styles.title}>🎨 STUDIO</Text>
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.toolBtn, eraser && styles.activeTool]} 
              onPress={() => setEraser(!eraser)}
            >
              <Text style={styles.toolText}>{eraser ? '✏️ Draw' : '🧽 Erase'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn} onPress={() => setShapes([])}>
              <Text style={styles.toolText}>🗑️ Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* EMOJI SELECTOR */}
        <View style={styles.selectorRow}>
          {EMOJI_SHAPES.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.shapeBtn, 
                selectedEmoji === emoji && !eraser && styles.selectedShape
              ]}
              onPress={() => {
                setEraser(false);
                setSelectedEmoji(emoji);
              }}
            >
              <Text style={{ fontSize: 28 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DRAWING CANVAS */}
        <View style={styles.canvasContainer}>
          <ViewShot ref={viewShotRef} style={{ flex: 1 }}>
            <View
              style={[styles.drawingBoard, { backgroundColor: BACKGROUNDS[bgIndex] }]}
              {...panResponder.panHandlers}
            >
              {shapes.map((s) => (
                <Animated.Text
                  key={s.id}
                  entering={BounceIn}
                  exiting={FadeOut}
                  style={[styles.emoji, { 
                    left: s.x - s.size / 2, 
                    top: s.y - s.size / 2, 
                    fontSize: s.size, 
                    color: s.color 
                  }]}
                >
                  {s.emoji}
                </Animated.Text>
              ))}
            </View>
          </ViewShot>
        </View>

        {/* BOTTOM BAR */}
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={styles.bgBtn} 
            onPress={() => setBgIndex((i) => (i + 1) % BACKGROUNDS.length)}
          >
            <Text style={styles.toolText}>🖼️ BG Color</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={saveDrawing}>
            <Text style={styles.saveText}>📸 Save Art</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 15, 
    alignItems: 'center' 
  },
  row: { flexDirection: 'row' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFD700' },
  toolBtn: { 
    backgroundColor: '#334155', 
    padding: 10, 
    borderRadius: 10, 
    marginLeft: 10 
  },
  activeTool: { backgroundColor: '#ef4444' },
  toolText: { color: 'white', fontWeight: 'bold' },
  selectorRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    marginBottom: 10 
  },
  shapeBtn: { 
    margin: 5, 
    padding: 8, 
    borderRadius: 15, 
    backgroundColor: '#1e293b', 
    borderWidth: 2, 
    borderColor: 'transparent' 
  },
  selectedShape: { borderColor: '#FFD700', backgroundColor: '#334155' },
  canvasContainer: { 
    flex: 1, 
    marginHorizontal: 15, 
    borderRadius: 25, 
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  drawingBoard: { flex: 1 },
  emoji: { position: 'absolute' },
  bottomBar: { 
    flexDirection: 'row', 
    padding: 20, 
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bgBtn: { 
    backgroundColor: '#334155', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 15 
  },
  saveBtn: { 
    backgroundColor: '#22C55E', 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    borderRadius: 15 
  },
  saveText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});