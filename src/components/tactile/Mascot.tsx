import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import Svg, {
  Ellipse,
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

// Define the size presets outside the component to help TS inference
const SIZE_PRESETS = {
  sm: 80,
  md: 160,
  lg: 240,
  xl: 320,
};

interface MascotProps {
  size?: keyof typeof SIZE_PRESETS | number;
  animate?: 'float' | 'bounce' | 'wave' | 'none';
}

const Mascot: React.FC<MascotProps> = ({ size = 'md', animate = 'float' }) => {
  const translateY = useRef(new Animated.Value(0)).current;

  // Resolve size: if it's a number, use it; if it's a key, look it up
  const finalSize = typeof size === 'number' ? size : SIZE_PRESETS[size];

  useEffect(() => {
    // Reset position before starting new animation
    translateY.setValue(0);

    if (animate === 'bounce') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, { 
            toValue: -15, 
            duration: 600, 
            useNativeDriver: true 
          }),
          Animated.timing(translateY, { 
            toValue: 0, 
            duration: 600, 
            useNativeDriver: true 
          }),
        ])
      ).start();
    } else if (animate === 'float') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, { 
            toValue: -10, 
            duration: 2000, 
            useNativeDriver: true 
          }),
          Animated.timing(translateY, { 
            toValue: 0, 
            duration: 2000, 
            useNativeDriver: true 
          }),
        ])
      ).start();
    } else {
      translateY.stopAnimation();
    }
  }, [animate, translateY]);

  return (
    <Animated.View
      style={{
        width: finalSize,
        height: finalSize,
        transform: [{ translateY }],
      }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="hsl(270,60%,75%)" />
            <Stop offset="100%" stopColor="hsl(270,80%,85%)" />
          </LinearGradient>
          <LinearGradient id="bellyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="hsl(25,100%,85%)" />
            <Stop offset="100%" stopColor="hsl(25,90%,75%)" />
          </LinearGradient>
          <LinearGradient id="cheekGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="hsl(0,80%,80%)" />
            <Stop offset="100%" stopColor="hsl(0,70%,75%)" />
          </LinearGradient>
        </Defs>

        {/* Body */}
        <Ellipse cx="100" cy="130" rx="55" ry="50" fill="url(#bodyGradient)" />

        {/* Belly */}
        <Ellipse cx="100" cy="140" rx="35" ry="30" fill="url(#bellyGradient)" />

        {/* Head */}
        <Circle cx="100" cy="75" r="45" fill="url(#bodyGradient)" />

        {/* Ears */}
        <Path d="M60 45 L45 10 L75 35 Z" fill="url(#bodyGradient)" />
        <Path d="M140 45 L155 10 L125 35 Z" fill="url(#bodyGradient)" />

        {/* Face */}
        <Ellipse cx="100" cy="80" rx="25" ry="20" fill="url(#bellyGradient)" />

        {/* Eyes */}
        <Ellipse cx="80" cy="70" rx="12" ry="14" fill="hsl(230,50%,12%)" />
        <Ellipse cx="120" cy="70" rx="12" ry="14" fill="hsl(230,50%,12%)" />
        <Circle cx="84" cy="65" r="4" fill="white" />
        <Circle cx="124" cy="65" r="4" fill="white" />

        {/* Nose */}
        <Ellipse cx="100" cy="88" rx="6" ry="4" fill="hsl(0,70%,65%)" />

        {/* Mouth */}
        <Path 
          d="M92 95 Q100 102 108 95" 
          stroke="hsl(230,50%,12%)" 
          strokeWidth="2" 
          fill="none" 
        />

        {/* Cheeks */}
        <Ellipse 
          cx="65" cy="85" rx="8" ry="6" 
          fill="url(#cheekGradient)" opacity={0.7} 
        />
        <Ellipse 
          cx="135" cy="85" rx="8" ry="6" 
          fill="url(#cheekGradient)" opacity={0.7} 
        />

        {/* Tail */}
        <Path 
          d="M145 150 Q180 140 175 100 Q170 85 160 90" 
          stroke="url(#bodyGradient)" 
          strokeWidth={18} 
          fill="none" 
        />
        <Circle cx="162" cy="95" r="10" fill="url(#bellyGradient)" />

        {/* Star on forehead */}
        <Path
          d="M100 40 L103 48 L112 48 L105 53 L108 62 L100 57 L92 62 L95 53 L88 48 L97 48 Z"
          fill="hsl(45,100%,65%)"
        />
      </Svg>
    </Animated.View>
  );
};

export default Mascot;