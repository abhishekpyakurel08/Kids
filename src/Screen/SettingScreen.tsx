import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  Alert,
  Animated,
  Platform,
  Clipboard,
} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { ShoppingBag, Send, ShieldCheck, X } from 'lucide-react-native';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ---------------- LANDSCAPE LOCK ----------------
  useEffect(() => {
    Orientation.lockToLandscape();
    return () => Orientation.unlockAllOrientations();
  }, []);

  // ---------------- CONTACT DEVELOPER ----------------
  const handleContactDeveloper = async () => {
    const email = 'abhishekpyakurel01@gmail.com';
    const subject = encodeURIComponent('App Inquiry');
    const body = encodeURIComponent('Hello, I would like to contact you regarding your app.');

    const url = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback: copy to clipboard
        Clipboard.setString(email);
        Alert.alert(
          'Email copied',
          `Email address copied to clipboard. You can send an email to: ${email}`
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Could not open email client');
    }
  };

  // ---------------- BUTTON ANIMATION ----------------
  const animatePress = (callback?: () => void) => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start(callback);
  };

  const handlePressButton = (action?: () => void) => {
    animatePress(action);
  };

  return (
    <LinearGradient colors={['#FFDEE9', '#B5FFFC']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* ---------------- HEADER ---------------- */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
          >
            <X color="white" size={30} strokeWidth={3} />
          </TouchableOpacity>
        </View>

        {/* ---------------- MENU ---------------- */}
        <View style={styles.menuContainer}>
          <AnimatedTouchable
            style={[styles.menuItem, { transform: [{ scale: scaleAnim }] }]}
            onPress={() => handlePressButton()}
          >
            <ShoppingBag color="#5D4037" size={32} />
            <Text style={styles.menuText}>More amazing apps</Text>
          </AnimatedTouchable>

          <AnimatedTouchable
            style={[styles.menuItem, { transform: [{ scale: scaleAnim }] }]}
            onPress={() => handlePressButton(handleContactDeveloper)}
          >
            <Send color="#5D4037" size={32} />
            <Text style={styles.menuText}>Contact developer</Text>
          </AnimatedTouchable>

          <AnimatedTouchable
            style={[styles.menuItem, { transform: [{ scale: scaleAnim }] }]}
            onPress={() => handlePressButton()}
          >
            <ShieldCheck color="#5D4037" size={32} />
            <Text style={styles.menuText}>Privacy policy</Text>
          </AnimatedTouchable>

          <Text style={styles.versionText}>Version 1.8.1</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#3E2723',
  },
  closeBtn: {
    position: 'absolute',
    right: 30,
    top: 20,
    backgroundColor: '#FF4500',
    borderRadius: 25,
    padding: 5,
    elevation: 5,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBE7C6', // Kid-friendly soft peach
    width: '60%',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  menuText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5D4037',
    marginLeft: 15,
  },
  versionText: {
    marginTop: 40,
    color: '#8D6E63',
    fontSize: 16,
  },
});
