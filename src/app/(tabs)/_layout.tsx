import { Redirect, Slot } from 'expo-router';

export default function _layout() {
    const isAuthenticated = true; // Replace with your authentication logic
    if(!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

    return <Slot />;
    
}