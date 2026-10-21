import { Redirect, Slot } from 'expo-router';

export default function _layout() {
    const isAuthenticated = false; // Replace with your authentication logic
    isAuthenticated ? <Slot /> : <Redirect href="/(auth)/sign-in" />;
    
}