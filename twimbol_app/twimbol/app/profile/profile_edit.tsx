import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileEdit from '@/components/profile/prof_edit';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useFocusEffect(
    React.useCallback(() => {
      const checkAuth = async () => {
        const userId = await AsyncStorage.getItem('user_id');
        const isAuthenticated = !!userId;
        setIsLoggedIn(isAuthenticated);

        if (!isAuthenticated) {
          // Replace instead of navigate to prevent stacking
          navigation.replace('authentication', { authpage: 'login' });
        }
      };

      checkAuth();
    }, [navigation])
  );

  if (!isLoggedIn) {
    return null; // or a loading spinner
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right", "bottom"]}>
      <ProfileEdit />
    </SafeAreaView>
  );
};

export default Profile;