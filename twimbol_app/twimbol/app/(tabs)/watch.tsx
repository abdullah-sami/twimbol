import { Text, View, Image, StyleSheet, ActivityIndicator } from "react-native";
import Link from "expo-router/link";
import React from "react";
import { Stack } from "expo-router";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";


import ReelsFeed from "@/components/reels_feed";
import VideosFeed from "@/components/videos_feed";
import VideoThumbnail from "../../components/videos_feed";
import  Header  from "@/components/header";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { GestureHandlerRootView, FlatList, ScrollView, RefreshControl } from "react-native-gesture-handler";

import useFetch from '@/services/useFetch'

import {fetchReelResults} from '@/services/api'
 



export default function Index() {
  
  
  const router = useRouter();
  const handleReelPress = (postId:any) => {
    router.push(`../reel/${postId}`); 
};


const {data: reels, loading: reelsLoading, error: reelsError, refetch} = useFetch(
  () => fetchReelResults(),
  
);



const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true); // Show the refresh spinner
    await refetch(); // Call the passed refresh function
    setRefreshing(false); // Hide the refresh spinner
  };


  return (
    <GestureHandlerRootView className="flex-1">
    <View 
      className="flex-1 bg-bgPrimary"
    >
      {/* Header */}

      <Header/>




      {/* main */}

      {/* Reels */}

      

      

<ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#" // Change the color of the spinner
              />
            }
          >
      
      <ReelsFeed reels={reels}
      onRefresh={handleRefresh}
      layout="grid"
      onReelPress={handleReelPress}
      range={4}
      reel_per_column={2}
      />


      
    </ScrollView>


      <VideoThumbnail/>


      
      



    </View>
    </GestureHandlerRootView>
);
}



const styles = StyleSheet.create({

});
