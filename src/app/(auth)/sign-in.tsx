import { View, Text, Button } from 'react-native'
import React from 'react'
import {router} from 'expo-router'

const sign_in = () => {
  return (
    <View>
      <Text>Sign In</Text>
      <Button title="Sign Up" onPress={() => router.push('/sign-up')}/>
    </View>
  )
}

export default sign_in