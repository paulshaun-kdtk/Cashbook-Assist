import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { MotiText, MotiView } from 'moti';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { Easing } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const Blob = ({ color, position, size, duration, delay }: { color: string, position: { x: number, y: number }, size: number, duration: number, delay: number }) => {
  return (
    <MotiView
      from={{
        translateX: position.x,
        translateY: position.y,
        scale: 1,
      }}
      animate={{
        translateX: position.x + (Math.random() - 0.5) * width * 0.5,
        translateY: position.y + (Math.random() - 0.5) * height * 0.5,
        scale: [1, 1.5, 1],
      }}
      transition={{
        type: 'timing',
        duration,
        delay,
        loop: true,
        easing: Easing.inOut(Easing.ease),
      }}
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
    />
  );
};

export default function SplashScreenComponent() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const colors = isDark
    ? ['#0d3b66', '#faf0ca', '#f4d35e', '#ee964b', '#f95738']
    : ['#a8dadc', '#457b9d', '#1d3557', '#fca311', '#e63946'];

  const blobs = [
    { size: width * 0.6, position: { x: width * 0.1, y: height * 0.1 }, duration: 5000, delay: 0 },
    { size: width * 0.4, position: { x: width * 0.5, y: height * 0.2 }, duration: 6000, delay: 1000 },
    { size: width * 0.5, position: { x: width * 0.2, y: height * 0.6 }, duration: 7000, delay: 2000 },
    { size: width * 0.3, position: { x: width * 0.7, y: height * 0.7 }, duration: 8000, delay: 3000 },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#ffffff' },
      ]}
    >
      <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill}>
        {blobs.map((blob, index) => (
          <Blob key={index} color={colors[index % colors.length]} {...blob} />
        ))}
      </BlurView>
      
      <MotiView
        style={styles.contentContainer}
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 300 }}
      >
        <MotiView
            from={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 60, delay: 500 }}
            style={{paddingVertical: 20, paddingHorizontal: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 20 }}
        >
            <Image
                source={{uri: 'https://cdn.pixabay.com/photo/2021/11/14/06/16/bank-6792991_1280.png'}}
                style={styles.logoImage}
            />
        </MotiView>
      </MotiView>

      <MotiView
        style={styles.textContainer}
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 800, delay: 800 }}
      >
        <MotiText
          style={[
            styles.title,
            { color: '#fff' },
          ]}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 1000 }}
        >
          Cashbook Assist
        </MotiText>
        <MotiText
          style={[
            styles.tagline,
            { color: '#fff' },
          ]}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 1200 }}
        >
          Your effortless finance partner
        </MotiText>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  logoImage: {
    width: width * 1.8,
    height: width * 0.6,
    borderRadius: (width * 0.08) / 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  textContainer: {
    position: 'absolute',
    bottom: height * 0.42,
    paddingHorizontal: 32,
    alignItems: 'flex-end',
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: 'SpaceMono-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'right',
    lineHeight: 28,
    fontFamily: 'SpaceMono-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});