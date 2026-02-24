import { View, Text } from 'react-native'
import React from 'react'
import SafeScreen from '@/components/SafeScreen'
import { ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const CartScreen = () => {
  return (
    <SafeScreen>
      <Text>CartScreen</Text>
    </SafeScreen>
      
    
  )
}

export default CartScreen
function LoadingUI() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#00D9FF" />
      <Text className="text-text-secondary mt-4">Loading cart...</Text>
    </View>
  );
}
function ErrorUI() {
  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
      <Text className="text-text-primary font-semibold text-xl mt-4">Failed to load cart</Text>
      <Text className="text-text-secondary text-center mt-2">
        Please check your connection and try again
      </Text>
    </View>
  );
}