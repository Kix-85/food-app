import CustomButton from '@/components/CustomButton'
import CustomInput from '@/components/CustomInput'
import { Link, router } from 'expo-router'
import React from 'react'
import { Alert, Text, View } from 'react-native'

const sign_in = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    email: '',
    password: ''
  });
  const submit = async () => {
    if(!form.email || !form.password) {
      Alert.alert('Error', 'Please enter valid email and password');
    }
    setIsSubmitting(true);
    try {
      // Call Appwrite signin function

      Alert.alert('success', 'User signed in succesfully');
      router.replace('/');
    } catch(error: any) {
      Alert.alert('Error', error.message);
    } finally{
      setIsSubmitting(false);
    }
  } 
  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
        <CustomInput
          placeholder="Enter your email.."
          value={form.email}
          onChangeText={(prev) => {setForm({...form, email: prev})}}
          label="Email"
          keyboardType="email-address"
        />
        <CustomInput
          placeholder="Enter your password.."
          value={''}
          onChangeText={() => {}}
          label="Password"
          secureTextEntry={true}
        />
        <CustomButton
          title="Sign In"
        />
        <View className="flex justify-center items-center mt-5 flex-row gap-1">
          <Text className="base-regular text-gray-100">
            Don't have an account?
          </Text>
          <Link href={'/sign-up'}>
              <Text className="base-bold text-primary">Sign Up</Text>
          </Link>
        </View>
    </View>
  )
}

export default sign_in