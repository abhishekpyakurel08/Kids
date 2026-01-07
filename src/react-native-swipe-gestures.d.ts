declare module 'react-native-swipe-gestures' {
  import { ViewStyle, StyleProp } from 'react-native';
  import React from 'react';

  export interface GestureRecognizerProps {
    onSwipe?: (direction: string, state: any) => void;
    onSwipeUp?: (state: any) => void;
    onSwipeDown?: (state: any) => void;
    onSwipeLeft?: (state: any) => void;
    onSwipeRight?: (state: any) => void;
    config?: {
      velocityThreshold?: number;
      directionalOffsetThreshold?: number;
    };
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
  }

  export default class GestureRecognizer extends React.Component<GestureRecognizerProps> {}
}
