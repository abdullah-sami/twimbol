import { Text, View, Image, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Link from "expo-router/link";
import React from "react";
import { Stack } from "expo-router";
import { images } from "@/constants/images";
import AsyncStorage from "@react-native-async-storage/async-storage";



import ReelsFeed from "@/components/reels_feed";
import Header from "@/components/header";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { GestureHandlerRootView, FlatList, ScrollView, RefreshControl } from "react-native-gesture-handler";
import useFetch from '@/services/useFetch'

import { fetchSearchResults, fetchReelResults } from '@/services/api'
import SafetyReminderModal from "@/components/safety/safetyreminder";



export default function Index() {
  const router = useRouter();

  const handleReelPress = (postId: any) => {
    router.push(`../reel/${postId}`);
  };

  const { data: reels, loading: reelsLoading, error: reelsError, refetch } = useFetch(() => fetchReelResults());

  const [reelsData, setReelsData] = useState(reels || []); // Initialize with existing data or an empty array
  const [refreshing, setRefreshing] = useState(false);

    // Safety reminder modal state
  const [showSafetyModal, setShowSafetyModal] = useState(false);



  // Check if safety reminder should be shown
  useEffect(() => {
    const checkSafetyReminder = async () => {
      try {
        const lastShown = await AsyncStorage.getItem('safetyReminderLastShown');
        const today = new Date().toDateString();
        
        // Show modal if never shown before or if it's a new day
        if (!lastShown || lastShown !== today) {
          setShowSafetyModal(true);
        }
      } catch (error) {
        console.error('Error checking safety reminder:', error);
        // Show modal as fallback if there's an error
        setShowSafetyModal(true);
      }
    };
    checkSafetyReminder();
  }, []);
  // Handle safety reminder acceptance
  const handleSafetyReminderAccept = async () => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem('safetyReminderLastShown', today);
      setShowSafetyModal(false);
    } catch (error) {
      console.error('Error saving safety reminder date:', error);
      setShowSafetyModal(false); // Still close the modal even if saving fails
    }
  };





  // Fetch data only if reelsData is empty
  useEffect(() => {
    if (!reelsData || reelsData.length === 0) {
      refetch().then(() => {
        setReelsData(reels); // Update reelsData after fetching
      });
    }
  }, [reels, reelsData, refetch]);

  const handleRefresh = async () => {
    setRefreshing(true); // Show the refresh spinner
    await refetch(); // Call the passed refresh function
    setReelsData(reels); // Update the reels data
    setRefreshing(false); // Hide the refresh spinner
  };



  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: showSafetyModal ? "#FF6E42" : "#fff" }} edges={["top", "left", "right"]}>
        <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
          {/* Header */}
          <Header />

          {/* Main */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#FF6B47']}
              />
            }
          >
            {/* Reels */}
            <ReelsFeed reels={reelsData} layout="grid" onReelPress={handleReelPress} range={30} />
          </ScrollView>
          {/* Safety Reminder Modal */}
          <SafetyReminderModal
            visible={showSafetyModal}
            onAccept={handleSafetyReminderAccept}
            
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}


const styles = StyleSheet.create({

});

