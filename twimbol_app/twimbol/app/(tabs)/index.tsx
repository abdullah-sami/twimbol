import { Text, View, Image, StyleSheet, ActivityIndicator } from "react-native";
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
import { SafeAreaView } from "react-native-safe-area-context";



export default function Index() {
  const router = useRouter();

  const handleReelPress = (postId: any) => {
    router.push(`../reel/${postId}`);
  };

  const { data: reels, loading: reelsLoading, error: reelsError, refetch } = useFetch(() => fetchReelResults());

  const [reelsData, setReelsData] = useState(reels || []); // Initialize with existing data or an empty array
  const [refreshing, setRefreshing] = useState(false);

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
    <GestureHandlerRootView className="flex-1">
        <View className="flex-1 bg-bgPrimary">
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
        </View>
    </GestureHandlerRootView>
  );
}


const styles = StyleSheet.create({

});

