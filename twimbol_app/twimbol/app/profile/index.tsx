import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import Profile from '@/components/profile/prof_comps';
import ProfileEdit from '@/components/profile/prof_edit';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const profile = () => {
    const router = useRoute();
    const navigation = useNavigation();


  return (
    <GestureHandlerRootView>
    <Profile/>

    </GestureHandlerRootView>   
  );
};

const styles = StyleSheet.create({
});

export default profile;