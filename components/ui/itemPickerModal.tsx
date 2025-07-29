import { formatTextCapitalize } from "@/assets/formatters/text";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const screenHeight = Dimensions.get("window").height;

export default function ItemPickerModal({
  visible,
  onClose,
  items,
  is_stock=false,
  is_customer=false,
  is_currency=false,
  onSelectItem,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter()

  const filteredItems = items.filter((item) => {
    const itemName = is_currency ? item.currency : item.name;
    return itemName && itemName.toLowerCase().includes(searchQuery.toLowerCase());
  });


  return (
<Modal visible={visible} animationType="slide" transparent>
  <Pressable onPress={onClose} className="flex-1 bg-black/50">

    <Pressable
      onPress={() => {}}
      style={{ height: screenHeight * 0.6 }}
      className="absolute top-0 left-0 right-0 bg-slate-950/90 rounded-b-3xl p-4"
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-lg font-bold">Select Item</Text>
        <Pressable onPress={onClose}>
          <Feather name="x" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Search Input */}
      <TextInput
        placeholder="Search item..."
        placeholderTextColor="#94a3b8"
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="bg-white/10 text-white p-4 rounded-2xl mb-4"
      />

      {/* Item List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item, index) => {
          return is_currency ? item.number : index.toString();
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectItem(item);
              onClose();
            }}
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (is_stock) {
                router.push(`(tabs)/(stockItem)/${item.id}`);
              } else if (is_customer) {
                router.push(`(tabs)/(customers)/${item.id}`);
              } else {
                Alert.alert('Apologies', 'This item seems to have no detail action available yet')
              }
            }}
            
            className={`p-4 ${
              is_stock
                ? item.quantity <= 5
                  ? "bg-red-500/40"
                  : item.quantity <= 15
                  ? "bg-yellow-500/40"
                  : "bg-green-500/40"
                : "bg-white/10"
            } rounded-2xl mb-2`}
          >
            <Text className="text-white">
              {is_currency ? item.currency : formatTextCapitalize(item.name)}
              {is_currency && ` (${item.symbol})`}
            </Text>

            {is_stock && (
              <Text className="text-slate-200 text-base mt-2">
                {item.quantity} in stock
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text className="text-slate-400 text-center mt-4">
            No items found.
          </Text>
        }
      />
    </Pressable>
  </Pressable>
</Modal>
  );
}