import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, useColorScheme } from 'react-native';

interface BackButtonProps {
  onPress?: () => void;
  color?: string;
  size?: number;
  className?: string;
}

export default function BackButton({ 
  onPress, 
  color, 
  size = 24, 
  className = "absolute left-4 top-0 z-10 p-2" 
}: BackButtonProps) {
  const router = useRouter();
  const theme = useColorScheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  const iconColor = color || (theme === 'dark' ? 'white' : 'black');

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={className}
    >
      <Ionicons
        name="chevron-back"
        size={size}
        color={iconColor}
      />
    </TouchableOpacity>
  );
}
