import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Heart, MessageSquare, Share2, Bookmark } from 'lucide-react-native';
import { images } from '@/constants/images';
import useFetch from '@/services/useFetch';
import { fetchNotifications, fetchPostResults, TWIMBOL_API_CONFIG } from '@/services/api';
import TimeAgo from '@/components/time';
import Header from '@/components/header';
import { Gesture, GestureHandlerRootView, RefreshControl } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ParentalControlProvider, TimeLimitChecker, TimeRestrictionChecker } from '@/components/safety/parentalcontrolsmanager';

const PostsFeed = () => {

  const { data: posts, loading: postsLoading, error: postsError, refetch } = useFetch(
    () => fetchPostResults(),)


  const navigation = useNavigation()




  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true); // Show the refresh spinner
    await refetch(); // Call the passed refresh function
    setRefreshing(false); // Hide the refresh spinner
  };

  

  const renderPost = ({ item }) => {



    const postBanner = {uri: item.post_banner || null}


    return (
      <TouchableOpacity style={styles.postCard} onPress={()=>{navigation.navigate('post', {id: item.id})}}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <Image source={item ? { uri: `${TWIMBOL_API_CONFIG.BASE_URL}${item.user_profile.user.profile_pic}` } : images.defaultProfilePic} style={styles.avatar} />
            <View>
              <Text style={styles.userName}>{`${item.user_profile.user.first_name} ${item.user_profile.user.last_name}`}</Text>
              <Text style={styles.timeAgo}><TimeAgo time_string={item.created_at} /></Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={styles.moreOptions}>•••</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.postText} numberOfLines={2}>{item.post_description}</Text>

        {postBanner &&
          <View style={styles.postImageContainer}>
            <Image source={postBanner} style={styles.postImage} />
          </View>
        }

        <View style={styles.interactionBar}>
          <View style={styles.interactionStats}>
            <TouchableOpacity style={styles.interactionButton}>
              <Heart size={20} color="#666" />
            </TouchableOpacity>
            <Text style={styles.statsText}>{item.like_count}</Text>
          </View>

          <View style={styles.interactionStats}>
            <TouchableOpacity style={styles.interactionButton}>
              <MessageSquare size={20} color="#666" />
            </TouchableOpacity>
            <Text style={styles.statsText}>{(item.comments).length}</Text>
          </View>

          <TouchableOpacity style={styles.interactionButton}>
            <Share2 size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.interactionButton}>
            <Bookmark size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }



  return (
    <ParentalControlProvider>
      <TimeLimitChecker>
        <TimeRestrictionChecker>
          
    <GestureHandlerRootView className="flex-1">
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
      <Header />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Posts</Text>
          {/* <TouchableOpacity style={styles.bookmarkButton}>
            <Bookmark size={24} color="#fff" fill="#FF6B47" />
          </TouchableOpacity> */}
        </View>

        {postsLoading && (
          <ActivityIndicator
            size="large" color="#FF6E42" className='my-20' />

        )}
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContainer}

          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#FF6B47']}

            />
          }

        />

      </View>
</SafeAreaView>
    </GestureHandlerRootView>

   

        </TimeRestrictionChecker>
      </TimeLimitChecker>
    </ParentalControlProvider>


  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FF6B47',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedContainer: {
    padding: 8,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  timeAgo: {
    fontSize: 12,
    color: '#888',
  },
  moreOptions: {
    fontSize: 18,
    fontWeight: 'bold',
    transform: [{ rotate: '90deg' }],
  },
  postText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 12,
  },
  postImageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'cover',
    overflow: 'hidden',
  },
  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  interactionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  interactionButton: {
    marginRight: 6,
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  }
});

export default PostsFeed;