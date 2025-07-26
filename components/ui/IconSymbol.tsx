import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Symbol, SymbolViewProps } from 'expo-symbols'; // Only works on iOS
import { OpaqueColorValue, Platform, StyleProp, TextStyle } from 'react-native';

type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  'house.fill': 'home',
  'book.closed.fill': 'menu-book',
  'chart.bar.fill': 'bar-chart',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolViewProps['weight'];
}) {
  if (Platform.OS === 'ios') {
    return (
      <Symbol name={name} size={size} color={color} style={style} weight={weight} />
    );
  }

  const fallbackName = MAPPING[name];
  if (!fallbackName) {
    console.warn(`Missing Material icon mapping for: "${name}"`);
    return null;
  }

  return (
    <MaterialIcons name={fallbackName} size={size} color={color} style={style} />
  );
}
