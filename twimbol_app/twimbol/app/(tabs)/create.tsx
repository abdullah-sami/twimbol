import { StyleSheet, View, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import ApplyForCreator from '@/components/creator/apply-for-creator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CreatorDashboard from '@/components/creator/dashboard';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Header from '@/components/header';
import { SafeAreaView } from 'react-native-safe-area-context';

const Create = () => {
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserGroup = async () => {
      try {
        const userGroup = await AsyncStorage.getItem('user_group');
        console.log('User group from AsyncStorage:', userGroup); // Debug log
        
        if (userGroup === 'creator' || userGroup === 'admin') {
          setIsCreator(true);
        } else {
          setIsCreator(false);
        }
      } catch (error) {
        console.error('Error retrieving user group:', error);
        setIsCreator(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserGroup();
  }, []);

  if (isLoading) {
    return (
      <GestureHandlerRootView>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
          <Header />
          <View style={[styles.container, styles.centerContent]}>
            <Text>Loading...</Text>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
        <Header />
        <View style={styles.container}>
          {isCreator ? (
            <CreatorDashboard />
          ) : (
            <ApplyForCreator />
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Create;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});