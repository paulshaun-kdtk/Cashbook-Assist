import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '../ThemedText';
import BackButton from './BackButton';

export default function BackButtonPreview() {
  return (
    <View style={{ padding: 20, backgroundColor: 'white', flex: 1 }}>
      <ThemedText style={{ fontSize: 18, marginBottom: 20 }}>Back Button Preview</ThemedText>
      
      {/* Default BackButton */}
      <View style={{ position: 'relative', height: 60, backgroundColor: '#f0f0f0', marginBottom: 20 }}>
        <BackButton />
        <ThemedText style={{ textAlign: 'center', lineHeight: 60 }}>Default Back Button</ThemedText>
      </View>
      
      {/* Custom positioned BackButton */}
      <View style={{ position: 'relative', height: 60, backgroundColor: '#f0f0f0', marginBottom: 20 }}>
        <BackButton className="absolute top-4 left-4 z-10 p-2" />
        <ThemedText style={{ textAlign: 'center', lineHeight: 60 }}>Custom Positioned Back Button</ThemedText>
      </View>
      
      {/* Custom color BackButton */}
      <View style={{ position: 'relative', height: 60, backgroundColor: '#333', marginBottom: 20 }}>
        <BackButton color="white" />
        <ThemedText style={{ textAlign: 'center', lineHeight: 60, color: 'white' }}>White Back Button</ThemedText>
      </View>
    </View>
  );
}
