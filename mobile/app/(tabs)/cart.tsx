import { View, Text } from 'react-native'
import React from 'react'
import SafeScreen from '@/components/SafeScreen'
import { ActivityIndicator } from 'react-native'

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