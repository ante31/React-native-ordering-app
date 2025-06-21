import { Dimensions } from 'react-native';

export function isTablet() {
  const { width } = Dimensions.get('window');
  return width >= 768;
}