import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.exp),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#1a1a2e' : '#f0f4f8' }, // Darker background for dark mode, lighter for light
      ]}
    >
      {/* Top half with a solid color and the image */}
      <View
        style={[
          styles.topHalf,
          // The background color for topHalf is now effectively covered by the image
          // { backgroundColor: isDark ? '#1f4068' : '#a7d9e8' },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={"https://cdn.pixabay.com/photo/2021/11/14/06/16/bank-6792991_1280.png"}
            style={styles.logoImage} // Apply styling to the image
            contentFit="cover" // Ensures the image covers the entire area
          />
        </View>
      </View>

      <Animated.View style={[styles.textContainer, animatedStyle]}>
        <Text
          style={[
            styles.title,
            { color: isDark ? '#66fcf1' : '#1f4068' }, // Vibrant teal for dark, deep blue for light
          ]}
        >
          Cashbook Assist
        </Text>
        <Text
          style={[
            styles.tagline,
            { color: isDark ? '#b0c4de' : '#5f7c8f' }, // Lighter gray for dark, medium gray for light
          ]}
        >
          Your effortless finance partner
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHalf: {
    height: height * 0.5,
    overflow: 'hidden',
    position: 'relative',
    // Removed justifyContent and alignItems here as the image will fill the space
  },
  imageContainer: {
    position: 'absolute', // Position absolutely to fill parent
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%', // Make it fill the parent
    height: '100%', // Make it fill the parent
  },
  logoImage: {
    width: '100%', // Make the image fill its container
    height: '100%', // Make the image fill its container
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12, // Increased gap for better spacing
  },
  title: {
    fontSize: 34, // Slightly larger font
    fontWeight: 'bold',
    letterSpacing: 1.5, // Increased letter spacing
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18, // Slightly larger font
    fontWeight: '500',
    fontStyle: 'normal', // Removed italic for a cleaner look
    textAlign: 'center',
    lineHeight: 24, // Added line height for readability
  },
});