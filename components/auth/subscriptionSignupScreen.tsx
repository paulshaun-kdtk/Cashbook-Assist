import { useColorScheme } from '@/hooks/useColorScheme';
import { useToast } from '@/hooks/useToast';
import { confirmUserName } from '@/redux/appwrite/auth/userActions';
import { appwriteCreds } from '@/redux/appwrite/credentials';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Purchases, {
    PACKAGE_TYPE,
    PurchasesPackage
} from 'react-native-purchases';
import { ThemedText } from '../ThemedText';

interface SubscriptionPlan {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  features: string[];
  popular?: boolean;
  packageType?: PACKAGE_TYPE;
  rcPackage?: PurchasesPackage;
}

// Free tier plan (always available)
const freePlan: SubscriptionPlan = {
  id: 'free',
  title: 'Free',
  description: 'Perfect for getting started',
  price: 'Free',
  features: [
    '1 company',
    '1 cashbook',
    'limited to 1000 transactions',
    'Advanced transaction tracking',
    'AI-powered insights',
    'Smart category suggestions',
    'Advanced reports & analytics',
    'Export to PDF & Excel',
  ],
};

// Premium features for paid plans
const premiumFeatures = [
  'Unlimited cashbooks',
  'Advanced transaction tracking',
  'AI-powered insights',
  'Smart category suggestions',
  'Advanced reports & analytics',
  'Multi-currency support',
  'Export to PDF & Excel',
];

const annualBonusFeatures = [
    'priority support',
];

export default function SubscriptionSignupScreen() {
  const theme = useColorScheme();
  const { showToast } = useToast();

  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [checkingUsername, setCheckingUsername] = useState(false);
        const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
        
  // Subscription state
  const [selectedPlan, setSelectedPlan] = useState<string>('free');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    const loadOfferingsAsync = async () => {
      try {
        setIsLoadingSubscriptions(true);
        const plans: SubscriptionPlan[] = [freePlan];

        // Try to load RevenueCat offerings
        const offerings = await Purchases.getOfferings();
        
        if (offerings.current && offerings.current.availablePackages.length > 0) {
          // Create subscription plans from RevenueCat packages
          offerings.current.availablePackages.forEach((rcPackage, index) => {
            if (rcPackage.packageType === PACKAGE_TYPE.MONTHLY) {
              plans.push({
                id: `pro_monthly_${rcPackage.identifier}`,
                title: 'Pro Monthly',
                description: 'For growing businesses',
                price: rcPackage.product.priceString,
                features: premiumFeatures,
                popular: true,
                packageType: PACKAGE_TYPE.MONTHLY,
                rcPackage,
              });
            } else if (rcPackage.packageType === PACKAGE_TYPE.ANNUAL) {
              // Calculate potential savings for annual plan
              const monthlyPackage = offerings.current?.availablePackages.find(
                pkg => pkg.packageType === PACKAGE_TYPE.MONTHLY
              );
              let originalPrice: string | undefined;
              
              if (monthlyPackage) {
                const monthlyPrice = monthlyPackage.product.price;
                const annualEquivalent = monthlyPrice * 12;
                const currentAnnualPrice = rcPackage.product.price;
                const savings = Math.round(((annualEquivalent - currentAnnualPrice) / annualEquivalent) * 100);
                
                if (savings > 0) {
                  originalPrice = `$${annualEquivalent.toFixed(2)}/year`;
                }
              }

              plans.push({
                id: `pro_annual_${rcPackage.identifier}`,
                title: 'Pro Annual',
                description: 'Best value for committed users',
                price: rcPackage.product.priceString,
                originalPrice,
                features: [
                  ...premiumFeatures,
                  originalPrice ? `Save money vs monthly` : 'Best value option',
                  ...annualBonusFeatures,
                ],
                packageType: PACKAGE_TYPE.ANNUAL,
                rcPackage,
              });
            }
          });
        }

        // If no RevenueCat packages found, add fallback plans
        if (plans.length === 1) {
          console.log('No RevenueCat packages found, using fallback plans');
          plans.push(
            {
              id: 'pro_monthly_fallback',
              title: 'Pro Monthly',
              description: 'For growing businesses',
              price: 'Contact Support',
              features: premiumFeatures,
              popular: true,
            },
            {
              id: 'pro_annual_fallback',
              title: 'Pro Annual',
              description: 'Best value for committed users',
              price: 'Contact Support',
              features: [
                ...premiumFeatures,
                'Best value option',
                ...annualBonusFeatures,
              ],
            }
          );
        }

        setSubscriptionPlans(plans);
      } catch (error) {
        console.log('Error loading subscription offerings:', error);
        // Fallback to free plan only if there's an error
        setSubscriptionPlans([freePlan]);
      } finally {
        setIsLoadingSubscriptions(false);
      }
    };

    loadOfferingsAsync();
  }, []);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      showToast({ type: 'error', text1: 'Please enter your email' });
      return false;
    }

    if (!email.includes('@')) {
      showToast({ type: 'error', text1: 'Please enter a valid email address' });
      return false;
    }

    if (!name.trim()) {
      showToast({ type: 'error', text1: 'Please enter your full name' });
      return false;
    }

    if (!username.trim()) {
      showToast({ type: 'error', text1: 'Please enter a username' });
      return false;
    }

    if (username.length < 3) {
      showToast({ type: 'error', text1: 'Username must be at least 3 characters' });
      return false;
    }

    if (!password.trim()) {
      showToast({ type: 'error', text1: 'Please enter a password' });
      return false;
    }

    if (password.length < 6) {
      showToast({ type: 'error', text1: 'Password must be at least 6 characters' });
      return false;
    }

    if (!/\d/.test(password)) {
      showToast({ type: 'error', text1: 'Password must contain at least one number' });
      return false;
    }

    if (password !== confirmPassword) {
      showToast({ type: 'error', text1: 'Passwords do not match' });
      return false;
    }

    return true;
  };

  const createAppwriteUser = async () => {
    try {
      // 1️⃣ Create Auth User first
      const authUserResponse = await fetch(
        `${appwriteCreds.apiUrl}/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': appwriteCreds.projectId!,
            'X-Appwrite-Key': appwriteCreds.apiKey!,
          },
          body: JSON.stringify({
            userId: 'unique()',
            email: email.toLowerCase().trim(),
            password: password,
            name: name.trim(),
          }),
        }
      );

      if (!authUserResponse.ok) {
        const error = await authUserResponse.json();
        console.error('Appwrite auth user creation error', error);
        throw new Error(error.message || 'Failed to create auth user');
      }

      const authUser = await authUserResponse.json();

      // 2️⃣ Add user to team immediately
      const teamId = "6788e80e002d1a60eef7"; // Same team ID from your API
      try {
        const teamMembershipResponse = await fetch(
          `${appwriteCreds.apiUrl}/teams/${teamId}/memberships`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': appwriteCreds.projectId!,
              'X-Appwrite-Key': appwriteCreds.apiKey!,
            },
            body: JSON.stringify({
              userId: authUser.$id,
              roles: ['member'],
              email: email.toLowerCase().trim(),
              name: name.trim(),
            }),
          }
        );

        if (!teamMembershipResponse.ok) {
          const teamError = await teamMembershipResponse.json();
          console.warn('Team membership creation failed:', teamError);
          // Don't throw error - continue with user creation even if team membership fails
        } else {
          console.log('User successfully added to team');
        }
      } catch (teamError) {
        console.warn('Team membership error:', teamError);
        // Continue with user creation even if team membership fails
      }

      // 3️⃣ Create Database User
      const userPayload = {
        documentId: 'unique()',
        data: {
          email: email.toLowerCase().trim(),
          full_name: name.trim(),
          identifier: `${email.toLowerCase().trim()}-${authUser.$id}`,
          which_key: username.toLowerCase().trim(),
          expoNotificationId: 'not-set',
          createdAt: new Date().toISOString(),
        },
      };

      const response = await fetch(
        `${appwriteCreds.apiUrl}/databases/${appwriteCreds.databaseId}/collections/${appwriteCreds.user_collection_id}/documents`,
        {
          method: 'POST',
          headers: {
            'X-Appwrite-Project': appwriteCreds.projectId!,
            'X-Appwrite-Key': appwriteCreds.apiKey!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userPayload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Appwrite database user creation error', error);
        throw new Error(error.message || 'Failed to create database user');
      }

      const databaseUser = await response.json();
      
      // Return the database user but include auth user ID for reference
      return {
        ...databaseUser,
        authUserId: authUser.$id,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const createSubscriptionDocument = async (userId: string, subscriptionData: any) => {
    try {
      const subscriptionPayload = {
        documentId: 'unique()',
        data: {
          user: email.toLowerCase().trim(),
          has_user_created: true,
          subscription_status: subscriptionData.status,
          subscription_type: subscriptionData.type,
          subscription_platform: Platform.OS,
          payment_platform: 'revenue_cat',
          subscription_plan_id: subscriptionData.planId,
          subscription_id: subscriptionData.subscriptionId || 'to-be-set',
          which_key: username.toLowerCase().trim(),
        },
      };

      const response = await fetch(
        `${appwriteCreds.apiUrl}/databases/${appwriteCreds.databaseId}/collections/${appwriteCreds.subscription_collection_id}/documents`,
        {
          method: 'POST',
          headers: {
            'X-Appwrite-Project': appwriteCreds.projectId!,
            'X-Appwrite-Key': appwriteCreds.apiKey!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscriptionPayload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  };

  const handleFreeTierSignup = async () => {
    try {
      // Create user in Appwrite
      const user = await createAppwriteUser();
      
      // Create free subscription document
      await createSubscriptionDocument(user.$id, {
        status: 'pending',
        type: 'annual', 
        planId: 'free',
        subscriptionId: 'free-trial',
      });

      showToast({ type: 'success', text1: 'Account created successfully!', text2: 'Welcome to your free trial.' });
      router.replace('/auth/signin');
    } catch (error: any) {
      console.error('Free signup error:', error);
      showToast({ type: 'error', text1: error.message || 'Failed to create account' });
    }
  };

  const handlePaidSubscription = async (plan: SubscriptionPlan) => {
    try {
      if (!plan.rcPackage) {
        throw new Error('Subscription package not available');
      }

      // Make the purchase
      const purchaseResult = await Purchases.purchasePackage(plan.rcPackage);
      const customerInfo = purchaseResult.customerInfo;

      // Create user in Appwrite
      const user = await createAppwriteUser();

      // Create subscription document with RevenueCat data
      await createSubscriptionDocument(user.$id, {
        status: 'active',
        type: plan.packageType === PACKAGE_TYPE.MONTHLY ? 'monthly' : 'annual',
        planId: plan.id,
        subscriptionId: customerInfo.originalAppUserId || `rc-${Date.now()}`,
      });

      showToast({ type: 'success', text1: 'Subscription activated successfully!' });
      router.replace('/auth/signin');
    } catch (error: any) {
      console.error('Paid subscription error:', error);
      if (!error.userCancelled) {
        showToast({ type: 'error', text1: error.message || 'Failed to process subscription' });
      }
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const selectedPlanData = subscriptionPlans.find(plan => plan.id === selectedPlan);
      
      if (!selectedPlanData) {
        throw new Error('Please select a subscription plan');
      }

      if (selectedPlan === 'free') {
        await handleFreeTierSignup();
      } else {
        // Check if this is a fallback plan (no RevenueCat package)
        if (!selectedPlanData.rcPackage) {
          showToast({ 
            type: 'error', 
            text1: 'Subscription unavailable', 
            text2: 'Please contact support or try the free plan' 
          });
          return;
        }
        await handlePaidSubscription(selectedPlanData);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      showToast({ type: 'error', text1: error.message || 'Failed to create account' });
    } finally {
      setIsLoading(false);
    }
  };

      async function handleUsernameCheck() {
        if (!username) {
          setUsernameAvailable(null); // reset to neutral state
          return;
        }
        setCheckingUsername(true);
        try {
          const result = await confirmUserName(username);
          setUsernameAvailable(result.success);
        } catch (error) {
          console.error("Error checking username:", error);
          setUsernameAvailable(false);
        } finally {
          setCheckingUsername(false);
        }
      }
  

  const renderSubscriptionPlan = (plan: SubscriptionPlan) => (
    <TouchableOpacity
      key={plan.id}
      className={`p-4 rounded-xl border-2 mb-4 ${
        selectedPlan === plan.id
          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      } ${plan.popular ? 'ring-2 ring-cyan-200 dark:ring-cyan-800' : ''}`}
      onPress={() => setSelectedPlan(plan.id)}
      disabled={!plan.rcPackage && plan.id !== 'free'}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <View className="flex-row items-center">
            <ThemedText className="text-lg font-bold">{plan.title}</ThemedText>
            {plan.popular && (
              <View className="ml-2 px-2 py-1 bg-cyan-500 rounded-full">
                <Text className="text-white text-xs font-bold">POPULAR</Text>
              </View>
            )}
            {!plan.rcPackage && plan.id !== 'free' && (
              <View className="ml-2 px-2 py-1 bg-gray-400 rounded-full">
                <Text className="text-white text-xs font-bold">UNAVAILABLE</Text>
              </View>
            )}
          </View>
          <ThemedText className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {plan.description}
          </ThemedText>
        </View>
        <View className="items-end">
          <ThemedText className={`text-xl font-bold ${
            !plan.rcPackage && plan.id !== 'free' 
              ? 'text-gray-400 dark:text-gray-500' 
              : 'text-cyan-600 dark:text-cyan-400'
          }`}>
            {plan.price}
          </ThemedText>
          {plan.originalPrice && (
            <ThemedText className="text-sm text-gray-500 line-through">
              {plan.originalPrice}
            </ThemedText>
          )}
        </View>
      </View>

      <View className="mt-3">
        {plan.features.map((feature, index) => (
          <View key={index} className="flex-row items-center mb-1">
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={theme === 'dark' ? '#06B6D4' : '#0891B2'}
            />
            <ThemedText className={`text-sm ml-2 ${
              !plan.rcPackage && plan.id !== 'free'
                ? 'text-gray-400 dark:text-gray-500'
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {feature}
            </ThemedText>
          </View>
        ))}
      </View>

      <View className="absolute top-4 right-4">
        <View className={`w-6 h-6 rounded-full border-2 ${
          selectedPlan === plan.id
            ? 'border-cyan-500 bg-cyan-500'
            : 'border-gray-300 dark:border-gray-600'
        } items-center justify-center ${
          !plan.rcPackage && plan.id !== 'free' ? 'opacity-50' : ''
        }`}>
          {selectedPlan === plan.id && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 px-6 pt-16">
        {/* Header */}
        <View className="items-center mb-8">
          <ThemedText className="text-3xl font-bold mb-2">Create Account</ThemedText>
          <ThemedText className="text-gray-600 dark:text-gray-400 text-center">
            Choose your plan and start managing your cashbooks
          </ThemedText>
        </View>

        {/* User Information Form */}
        <View className="mb-8">
          <ThemedText className="text-lg font-semibold mb-4">Account Information</ThemedText>
          
          {/* Email Input */}
          <View className="mb-4">
            <ThemedText className="text-sm font-medium mb-2 ml-2">Email Address</ThemedText>
            <TextInput
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter your email"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Name Input */}
          <View className="mb-4">
            <ThemedText className="text-sm font-medium mb-2 ml-2">Full Name</ThemedText>
            <TextInput
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter your full name"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Username Input */}
        <View className="mb-4">
        <ThemedText className="text-sm font-medium mb-2 ml-2">Username</ThemedText>
        <TextInput
                className="w-full p-4 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Confirm your username"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={username}
            onChangeText={setUsername}
            onBlur={handleUsernameCheck}
            keyboardType="email-address"
            autoCapitalize="none"
            />
          {checkingUsername && (
                <ThemedText>Validating...</ThemedText>
                )}
                {usernameAvailable === false && (
                <Text className="mt-2 text-sm text-red-500 dark:text-red-400">
                    Username is already taken. Please choose another.
                </Text>
                )}
                {usernameAvailable === true && (
                <Text className="mt-2 text-sm text-green-500 dark:text-green-400">
                    username available.
                </Text>
                )}
        </View>

          {/* Password Input */}
          <View className="mb-4">
            <ThemedText className="text-sm font-medium mb-2 ml-2">Password</ThemedText>
            <View className="relative">
              <TextInput
                className="w-full p-4 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Create a password"
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View className="mb-4">
            <ThemedText className="text-sm font-medium mb-2 ml-2">Confirm Password</ThemedText>
            <View className="relative">
              <TextInput
                className="w-full p-4 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Confirm your password"
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                />
              </TouchableOpacity>
            </View>
            <ThemedText className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-2">
              Must contain a number and at least 6 characters
            </ThemedText>
          </View>
        </View>

        {/* Subscription Plans */}
        <View className="mb-8">
          <ThemedText className="text-lg font-semibold mb-4">Choose Your Plan</ThemedText>
          
          {isLoadingSubscriptions ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#06B6D4" />
              <ThemedText className="mt-2 text-gray-600 dark:text-gray-400">
                Loading subscription plans...
              </ThemedText>
            </View>
          ) : (
            subscriptionPlans.map(plan => renderSubscriptionPlan(plan))
          )}
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          className={`w-full p-4 rounded-xl items-center justify-center shadow-md mb-4 ${
            isLoading
              ? 'bg-gray-400 dark:bg-gray-600'
              : 'bg-cyan-700 dark:bg-cyan-600'
          }`}
          onPress={handleSignUp}
          disabled={isLoading || isLoadingSubscriptions || !usernameAvailable}
        >
          {isLoading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-lg font-bold ml-2">Creating Account...</Text>
            </View>
          ) : (
            <Text className="text-white text-lg font-bold">
              {selectedPlan === 'free' ? 'Start Free Trial' : 'Subscribe & Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Terms and Privacy */}
        <ThemedText className="text-xs text-center text-gray-500 dark:text-gray-400 mb-4">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </ThemedText>

        {/* Sign In Link */}
        <View className="flex-row justify-center mb-8">
          <ThemedText className="text-sm text-gray-700 dark:text-gray-300">
            Already have an account?{' '}
          </ThemedText>
          <TouchableOpacity onPress={() => router.replace('/auth/signin')}>
            <ThemedText className="text-sm text-cyan-500 dark:text-cyan-400 font-bold">
              Sign In
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
