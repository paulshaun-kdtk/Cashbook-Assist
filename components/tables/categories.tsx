import { formatDateShortWords } from '@/assets/formatters/dates';
import { useStoredUsername } from '@/hooks/useStoredUsername';
import { RootState } from '@/redux/store';
import { fetchCategoriesThunk } from '@/redux/thunks/categories/fetch';
import { deleteCategoryThunk } from '@/redux/thunks/categories/post';
import { Category } from '@/types/category';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Modalize } from 'react-native-modalize';
import { useDispatch, useSelector } from 'react-redux';
import AddCategoryForm from '../forms/addCategory';
import { ThemedText } from '../ThemedText';
import Loader from '../ui/loading';

export default function CategoriesList() {
  const theme = useColorScheme(); // 'light' or 'dark'
  const router = useRouter()
  const dispatch = useDispatch()
  const {username} = useStoredUsername()
  const { categories, loading, error } = useSelector((state: RootState) => state.categories);

  const modalizeRef = React.useRef<Modalize>(null);

    React.useEffect(() => {
      if (username) {
        dispatch(fetchCategoriesThunk(username))
    }
  }, [username, dispatch]);

  const handleCashbookDeletion = (cashBookId: string) => {
    if (!username) return
    dispatch(deleteCategoryThunk({documentId: cashBookId})).then(() => {
      dispatch(fetchCategoriesThunk(username));
    });

  }
    const renderRightActions = (cashBookId: string) => (
    <TouchableOpacity
      onPress={() => {
        handleCashbookDeletion(cashBookId);  
      }}
      className="bg-red-600 justify-center items-center w-20 h-full"
    >
      <MaterialIcons name="delete" size={24} color="white" />
    </TouchableOpacity>
  );

  const handleAddCashbook = () => {
    modalizeRef.current?.open();
  };

   const  handleCloseModal = () => {
      modalizeRef.current?.close();
      if (username) {
        dispatch(fetchCategoriesThunk(username));
      }
    }

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      {/* Header */}
      {loading && <Loader />}
      <View className="px-4 flex-row items-center justify-center relative mb-6">
        <ThemedText type='title' className="text-xl font-bold">Categories</ThemedText>
      </View>

      {error && <Text className='text-red-500 m-auto text-center w-100 mx-5 mb-4'>{error}</Text>}

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-4 mb-4">
          <ThemedText className="text-base font-semibold text-black dark:text-white">List</ThemedText>
        </View>

        {/* Cashbook List */}
        <View className="mx-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1E4A] shadow-lg">
          {categories.map((cashbook: Category, index) => (
            <View key={cashbook.$id}>
                  <Swipeable
                    renderRightActions={() => renderRightActions(cashbook.$id)}
                  >
            <TouchableOpacity
              onPress={() => router.push(`/transactions/${cashbook.$id}`)}
              className={`flex-row items-center py-3 px-4 ${
                index < categories.length - 1 ? 'border-b border-gray-200 dark:border-[#2C2F5D]' : ''
              }`}
              >
              {/* Icon for cashbook */}
              <Ionicons
                name="wallet-outline" // Using a wallet icon for cashbooks
                size={28}
                color={theme === 'dark' ? 'white' : '#6B7280'}
                className="mr-4"
                />
              <View className="flex-1">
                <ThemedText className="text-base font-semibold">{cashbook.name}</ThemedText>
                <ThemedText className="text-xs text-gray-500 dark:text-gray-400">{formatDateShortWords(cashbook.$createdAt)}</ThemedText>
              </View>
            </TouchableOpacity>
                </Swipeable>
              </View>
          ))}
        </View>

        {/* Add New Cashbook Button */}
        <TouchableOpacity
          className="mx-4 mt-6 p-4 rounded-xl bg-cyan-600 dark:bg-cyan-500 items-center justify-center shadow-md"
          onPress={handleAddCashbook}
        >
          <Text className="text-white p-2 font-bold">New Category</Text>
        </TouchableOpacity>
      </ScrollView>
            <Modalize rootStyle={{ backgroundColor: 'transparent' }} modalStyle={{ backgroundColor: 'transparent' }} ref={modalizeRef}><AddCategoryForm onFormSubmit={handleCloseModal} /></Modalize>
    </View>
  );
}
