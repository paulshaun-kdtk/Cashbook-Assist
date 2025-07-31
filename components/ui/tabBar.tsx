import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const tabConfig = [
  { name: 'index', icon: 'home-outline', label: 'Home' },
  { name: 'dashboard', icon: 'bar-chart-outline', label: 'Dashboard' },
  { name: 'profile', icon: 'person-circle-outline', label: 'Profile' },
];

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useColorScheme();
  const insets = useSafeAreaInsets()
  const backgroundColor = theme === 'dark' ? '#155e75' : '#e0f7fa'; // Deep cyan vs light cyan
  const focusedColor = theme === 'dark' ? '#06b6d4' : '#155e75';     // Cyan bright vs deep cyan
  const unfocusedColor = theme === 'dark' ? '#ccc' : '#666';         // Light gray vs medium gray

  return (
    <View
      className="absolute left-0 right-0 bottom-0 h-20 rounded-t-5 flex-row justify-around items-center px-6"
      style={{
        backgroundColor,
        marginBottom: Platform.OS === "ios" ? 0 : insets.bottom
      }}
    >
      {tabConfig.map((tab, index) => {
        const isFocused = state.index === index;

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            className="items-center"
          >
            <Ionicons
              name={tab.icon}
              size={26}
              color={isFocused ? focusedColor : unfocusedColor}
            />
            <Text
              style={{
                color: isFocused ? focusedColor : unfocusedColor,
                fontSize: 12,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
