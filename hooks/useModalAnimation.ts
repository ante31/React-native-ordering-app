import { useRef } from 'react';
import { Animated } from 'react-native';

export const useModalAnimation = (onClose: () => void) => {
  const backdrop = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 300, useNativeDriver: true }),
    ]).start(onClose);
  };

  return { backdrop, fadeAnim, scaleAnim, animateIn, animateOut };
};
