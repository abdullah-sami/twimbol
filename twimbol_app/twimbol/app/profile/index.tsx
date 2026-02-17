import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity,  ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import Profile from '@/components/profile/prof_comps';
import ProfileEdit from '@/components/profile/prof_edit';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const profile = () => {
    const router = useRoute();
    const navigation = useNavigation();


  return (
    <GestureHandlerRootView>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right", "bottom"]}>

    <Profile/>

        </SafeAreaView>

    </GestureHandlerRootView>   
  );
};

const styles = StyleSheet.create({
});

export default profile;