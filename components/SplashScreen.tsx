import { View, Text } from 'react-native';
import React from 'react';

const SplashScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>book-assist cashbook</Text>
    </View>
  );
};

export default SplashScreen;