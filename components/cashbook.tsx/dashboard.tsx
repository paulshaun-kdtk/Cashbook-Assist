import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { Image } from 'expo-image';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';


export default function HomeScreen() {
  const theme = useColorScheme();
  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View className="px-4 flex-row justify-between items-center">
          <View className="flex-row items-center space-x-2">
            <Image
              source={{ uri: 'https://i.pravatar.cc/100' }}
              className="w-10 h-10 rounded-full"
            />
            <View>
              <ThemedText className="text-xs text-gray-500 dark:text-gray-400">Hello!</ThemedText>
              <ThemedText className="text-black dark:text-green-400 font-bold">
                User Name
              </ThemedText>
            </View>
          </View>
        <View className="flex-row items-center gap-5">
          <TouchableOpacity>
            <SimpleLineIcons name="equalizer" size={24} color={theme === 'dark' ? 'white' : 'black'} />
          </TouchableOpacity>
           
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={theme === 'dark' ? 'white' : 'black'} />
          </TouchableOpacity>
      </View>
        </View>

        {/* Balance */}
        <View className="bg-gray-100 dark:bg-[#1A1E4A] mx-4 mt-6 rounded-xl p-4">
          <View className="flex-row justify-between items-center">
            <ThemedText className="text-black dark:text-white"> Balance</ThemedText>
            <ThemedText className="text-xs text-gray-500 dark:text-white">All Time</ThemedText>
          </View>
          <ThemedText className="text-4xl font-bold text-green-500 dark:text-green-400 mt-2">$10,213.89</ThemedText>

          <View className="flex-row justify-between mt-4 space-x-3">
            {['$5,213.89', '$2,213.89'].map((amount, idx) => (
              <View key={idx} className="flex-1 rounded-xl p-3 bg-gradient-to-b from-blue-300 to-blue-600 dark:from-[#4C4AFF] dark:to-[#2B2A7C]">
                <ThemedText className="text-sm text-black dark:text-white">Income</ThemedText>
                <Text className="text-lg font-bold text-green-600 dark:text-green-400">{amount}</Text>
                <Text className="text-xs text-gray-600 dark:text-gray-300">all time</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row justify-around mt-6 px-6">
          {[
            { icon: 'add', label: 'Add' },
            { icon: 'share-outline', label: 'Share' },
            { icon: 'download-outline', label: 'Export' },
            { icon: 'card', label: 'Transfer' },
          ].map(({ icon, label }) => (
            <View key={label} className='items-center'>
            <TouchableOpacity className="bg-gray-100 dark:bg-[#1A1E4A] rounded-xl p-4 w-lg">
              <Ionicons name={icon as any} size={24} color={theme === 'dark' ? 'white' : 'black'} />
            </TouchableOpacity>
            <Text className="text-xs text-black dark:text-white mt-1">{label}</Text>
            </View>
          ))}
        </View>

        {/* Transactions */}
        <View className="bg-gray-100 dark:bg-[#1A1E4A] mx-4 mt-6 rounded-xl p-4">
          <View className="flex-row justify-between mb-3">
            <ThemedText className="text-sm text-black dark:text-white">Transaction</ThemedText>
            <ThemedText className="text-xs text-green-500 dark:text-green-400">See All</ThemedText>
          </View>

          {[
            { name: 'Rimberio', date: 'July 12, 2025', amount: '$13.78' },
            { name: 'Borcelle', date: 'Jan 29, 2025', amount: '$10.88' },
            { name: 'Larana, Inc.', date: 'Feb 10, 2025', amount: '$20.18' },
            { name: 'Larana, Inc.', date: 'Feb 10, 2025', amount: '$20.18' },
          ].map((item, index) => (
            <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-200 dark:border-[#2C2F5D]">
              <View>
                <ThemedText className="text-black dark:text-white">{item.name}</ThemedText>
                <ThemedText className="text-xs text-gray-500 dark:text-gray-400">{item.date}</ThemedText>
              </View>
              <ThemedText className="font-semibold text-green-600 dark:text-green-400">{item.amount}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
