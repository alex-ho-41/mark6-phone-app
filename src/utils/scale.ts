import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const BASE_WIDTH = 375; // iPhone 8 baseline

export const scale = (size: number): number => Math.round((width / BASE_WIDTH) * size);
