import { Ionicons } from '@expo/vector-icons';
import kv from 'expo-sqlite/kv-store';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Modal,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';

interface SwipeActionTutorialProps {
  visible: boolean;
  onClose: () => void;
  targetComponent?: 'transactions' | 'companies' | 'cashbooks';
}

const TUTORIAL_STORAGE_KEY = 'swipe_tutorial_shown';

export const SwipeActionTutorial: React.FC<SwipeActionTutorialProps> = ({
  visible,
  onClose,
  targetComponent = 'transactions'
}) => {
  const theme = useColorScheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [swipeAnimation] = useState(new Animated.Value(0));

  const startSwipeAnimation = React.useCallback(() => {
    swipeAnimation.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(swipeAnimation, {
          toValue: -120,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(swipeAnimation, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [swipeAnimation]);

  useEffect(() => {
    if (visible) {
      startSwipeAnimation();
    }
  }, [visible, currentStep, startSwipeAnimation]);

  const tutorialSteps = {
    transactions: [
      {
        title: "Swipe to Edit & Delete",
        description: "Swipe left on any transaction to reveal edit and delete options",
        emoji: "💸",
        icon: "swap-horizontal"
      },
      {
        title: "Quick Actions",
        description: "Blue button lets you edit transaction details, red button deletes it",
        emoji: "⚡",
        icon: "options"
      },
      {
        title: "Try It Out!",
        description: "Find a transaction and swipe left to see these actions in motion",
        emoji: "🎯",
        icon: "hand-left"
      }
    ],
    companies: [
      {
        title: "Manage Companies",
        description: "Swipe left on company cards to edit or delete them",
        emoji: "🏢",
        icon: "swap-horizontal"
      },
      {
        title: "Quick Company Actions",
        description: "Edit company details or remove them with a simple swipe",
        emoji: "⚡",
        icon: "options"
      }
    ],
    cashbooks: [
      {
        title: "Cashbook Management",
        description: "Swipe left on cashbooks to access editing and deletion options",
        emoji: "📊",
        icon: "swap-horizontal"
      },
      {
        title: "Quick Cashbook Actions",
        description: "Manage your cashbooks efficiently with swipe gestures",
        emoji: "⚡",
        icon: "options"
      }
    ]
  };

  const steps = tutorialSteps[targetComponent];
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Mark tutorial as completed
    await kv.setItem(TUTORIAL_STORAGE_KEY, 'true');
    onClose();
  };

  const handleSkip = async () => {
    await kv.setItem(TUTORIAL_STORAGE_KEY, 'true');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white dark:bg-[#1A1E4A] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          {/* Header */}
          <View className="items-center mb-6">
            <View className="bg-cyan-100 dark:bg-cyan-900/30 w-16 h-16 rounded-full items-center justify-center mb-3">
              <Text className="text-3xl">{currentStepData.emoji}</Text>
            </View>
            <Text className="text-xl font-bold text-gray-800 dark:text-white text-center">
              {currentStepData.title}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
              {currentStepData.description}
            </Text>
          </View>

          {/* Demo Animation */}
          <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 overflow-hidden">
            <View className="relative">
              {/* Mock Transaction Card */}
              <Animated.View
                style={{
                  transform: [{ translateX: swipeAnimation }],
                }}
                className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm"
              >
                <View className="flex-row items-center">
                  <View className="bg-cyan-100 dark:bg-cyan-900/30 w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Ionicons 
                      name={currentStepData.icon as any} 
                      size={20} 
                      color={theme === 'dark' ? '#06B6D4' : '#0891B2'} 
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-800 dark:text-white text-sm">
                      Sample Transaction
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      Swipe left to reveal actions
                    </Text>
                  </View>
                  <Text className="font-bold text-green-600 dark:text-green-400">
                    $25.00
                  </Text>
                </View>
              </Animated.View>

              {/* Action Buttons (shown when swiping) */}
              <View className="absolute right-2 top-1/2 transform -translate-y-1/2 flex-row">
                <View className="bg-blue-500 w-8 h-8 rounded items-center justify-center mr-1">
                  <Ionicons name="create" size={16} color="white" />
                </View>
                <View className="bg-red-500 w-8 h-8 rounded items-center justify-center">
                  <Ionicons name="trash" size={16} color="white" />
                </View>
              </View>
            </View>

            {/* Swipe Indicator */}
            <View className="flex-row items-center justify-center mt-3">
              <Ionicons 
                name="arrow-back" 
                size={16} 
                color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} 
              />
              <Text className="text-xs text-gray-500 dark:text-gray-400 mx-2">
                Swipe Left
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={16} 
                color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} 
              />
            </View>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row justify-center items-center mb-6">
            {steps.map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentStep
                    ? 'bg-cyan-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            {currentStep > 0 && (
              <TouchableOpacity
                onPress={handlePrevious}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg items-center"
              >
                <Text className="font-semibold text-gray-700 dark:text-gray-300">
                  Previous
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={handleSkip}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg items-center"
            >
              <Text className="font-semibold text-gray-700 dark:text-gray-300">
                Skip
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              className="flex-1 py-3 bg-cyan-600 dark:bg-cyan-500 rounded-lg items-center"
            >
              <Text className="font-semibold text-white">
                {currentStep === steps.length - 1 ? 'Got it!' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Hook to check if tutorial should be shown
export const useSwipeActionTutorial = () => {
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  const checkTutorialStatus = async () => {
    try {
      const hasSeenTutorial = await kv.getItem(TUTORIAL_STORAGE_KEY);
      setShouldShowTutorial(!hasSeenTutorial);
    } catch (error) {
      console.log('Error checking tutorial status:', error);
      setShouldShowTutorial(true);
    } finally {
      setIsLoading(false);
    }
  };

  const markTutorialComplete = async () => {
    try {
      await kv.setItem(TUTORIAL_STORAGE_KEY, 'true');
      setShouldShowTutorial(false);
    } catch (error) {
      console.log('Error marking tutorial complete:', error);
    }
  };

  const resetTutorial = async () => {
    try {
      await kv.removeItem(TUTORIAL_STORAGE_KEY);
      setShouldShowTutorial(true);
    } catch (error) {
      console.log('Error resetting tutorial:', error);
    }
  };

  return {
    shouldShowTutorial,
    isLoading,
    markTutorialComplete,
    resetTutorial
  };
};
