import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Keyboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Login from '@/components/auth/login';
import Register from '@/components/auth/register';
import { Link } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useRoute, useNavigation } from '@react-navigation/native';
import ForgotPassword from '@/components/auth/forgotpassword';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';


const auth = () => {


  
    const router = useRoute();
    const { authpage } = router.params as { authpage: string }

  const navigation = useNavigation<NativeStackNavigationProp<any>>()

  const handleRegisterPress = () => {
    navigation.navigate('authentication', { authpage: 'register' });
    
  };


  const handleLoginPress = () => {
    navigation.navigate('authentication', { authpage: 'login' });
  };

  const handleBackToLogin = () => {
    navigation.navigate('authentication', { authpage: 'login' });
  };


  return (

    authpage == 'login' ?(

      
      <Login handleRegisterPress={handleRegisterPress}/>
      
    ) : authpage == 'register' ? (

      <Register handleLoginPress={handleLoginPress}/>
    
    ) : authpage == 'forgotpassword' ? (
      <ForgotPassword handleBackToLogin={handleBackToLogin}/>
    ) : authpage == 'logout' ? (
      <ForgotPassword handleBackToLogin={handleBackToLogin}/>
    ) :(<></>)
  // <Register/>
  


  
)
};

const styles = StyleSheet.create({
 
});

export default auth;