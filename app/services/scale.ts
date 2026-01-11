import { Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_HEIGHT = 752;

export const scale = {
  light: (size: number) => Math.round((size * SCREEN_HEIGHT) / BASE_HEIGHT),
  medium: (size: number) => {
    const ratio = SCREEN_HEIGHT / BASE_HEIGHT;
    return Math.round(size * (1 + (ratio - 1) * 2));
  },
  heavy: (size: number) => {
    const ratio = SCREEN_HEIGHT / BASE_HEIGHT;
    return Math.round(size * (ratio > 1 ? ratio * 1.5 : ratio));
  },
  isTablet: () => false
};