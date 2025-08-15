import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Animated, Share } from 'react-native';
import { Heart, MessageSquare, Share2, Bookmark } from 'lucide-react-native';
import { images } from '@/constants/images';
import useFetch from '@/services/useFetch';
import { deleteLikes, fetchNotifications, fetchPostResults, postLikes, TWIMBOL_API_CONFIG } from '@/services/api';
import TimeAgo from '@/components/time';
import Header from '@/components/header';
import { Gesture, GestureHandlerRootView, RefreshControl } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ParentalControlProvider, TimeLimitChecker, TimeRestrictionChecker } from '@/components/safety/parentalcontrolsmanager';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommentsModal from '@/components/comments/comments';
import Toast from 'react-native-toast-message';

const PostsFeed = () => {
  const { data: posts, loading: postsLoading, error: postsError, refetch } = useFetch(
    () => fetchPostResults(),)

  const navigation = useNavigation()
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setuserId] = useState('')
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  
  // Store like states for each post individually
  const [postLikeStates, setPostLikeStates] = useState({});
  
  // Comments modal state
  const [showComments, setShowComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentsCount, setCommentsCount] = useState({});

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('user_id');
      if (id) {
        setuserId(id);
      }
    };
    fetchUserId();
  }, []);

  // Initialize like states when posts are loaded
  useEffect(() => {
    if (posts && posts.length > 0) {
      const initialStates = {};
      const initialCommentsCounts = {};
      posts.forEach(post => {
        // Use the liked_by_user field from API response
        initialStates[post.id] = {
          liked: post.liked_by_user || false,
          count: post.like_count || 0
        };
        // Initialize comments count for each post
        initialCommentsCounts[post.id] = post.comments ? post.comments.length : 0;
      });
      setPostLikeStates(initialStates);
      setCommentsCount(initialCommentsCounts);
    }
  }, [posts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const toggleLike = useCallback(async (postId) => {
    const currentState = postLikeStates[postId];
    if (!currentState) return;

    const newLikedState = !currentState.liked;
    const newCount = newLikedState ? currentState.count + 1 : currentState.count - 1;

    // Optimistically update the UI
    setPostLikeStates(prev => ({
      ...prev,
      [postId]: {
        liked: newLikedState,
        count: newCount
      }
    }));

    try {
      if (newLikedState) {
        await postLikes(postId);
      } else {
        await deleteLikes(postId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert the optimistic update on error
      setPostLikeStates(prev => ({
        ...prev,
        [postId]: currentState
      }));
    }
  }, [postLikeStates]);

  const handleShare = async (postId) => {
      try {
        const result = await Share.share({
          message: `Read this post on Twimbool!\nhttps://twimbol.com/posts/${postId}`,
        });
  
        if (result.action === Share.sharedAction) {
          Toast.show({
            type: 'success',
            text1: 'Shared!',
            text2: 'Reel shared with friends 🚀',
            position: 'bottom',
          });
        }
      } catch (error) {
        console.error('Sharing failed:', error);
        Toast.show({
          type: 'error',
          text1: 'Oops!',
          text2: 'Failed to share. Try again.',
          position: 'bottom',
        });
      }
    };

  const showToastMessage = useCallback((message) => {
    setToastMessage(message);
    setShowToast(true);

    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowToast(false));
  }, [toastOpacity]);

  // Comments modal handlers
  const handleCommentsOpen = useCallback((postId) => {
    setSelectedPostId(postId);
    setShowComments(true);
  }, []);

  const handleCommentsClose = useCallback(() => {
    setShowComments(false);
    setSelectedPostId(null);
  }, []);

  const handleCommentsCountChange = useCallback((postId, newCount) => {
    setCommentsCount(prev => ({
      ...prev,
      [postId]: newCount
    }));
  }, []);

  const renderPost = ({ item }) => {
    const postBanner = { uri: item.post_banner || null }
    const likeState = postLikeStates[item.id] || { liked: false, count: 0 };

    return (
      <TouchableOpacity style={styles.postCard} onPress={() => { navigation.navigate('post', { id: item.id }) }}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <Image source={item ? { uri: `${TWIMBOL_API_CONFIG.BASE_URL}${item.user_profile.user.profile_pic}` } : images.defaultProfilePic} style={styles.avatar} />
            <View>
              <Text style={styles.userName}>{`${item.user_profile.user.first_name} ${item.user_profile.user.last_name}`}</Text>
              <Text style={styles.timeAgo}><TimeAgo time_string={item.created_at} /></Text>
            </View>
          </View>
          {/* <TouchableOpacity>
            <Text style={styles.moreOptions}>•••</Text>
          </TouchableOpacity> */}
        </View>

        <Text style={styles.postText} numberOfLines={2}>{item.post_description}</Text>

        {postBanner &&
          <View style={styles.postImageContainer}>
            <Image source={postBanner} style={styles.postImage} />
          </View>
        }

        <View style={styles.interactionBar}>
          <View style={styles.interactionStats}>
            <TouchableOpacity
              style={styles.interactionButton}
              onPress={() => {
                if (!userId) {
                  showToastMessage("Please log in to like posts!");
                  return;
                }
                toggleLike(item.id);
              }}
            >
              <Ionicons
                name={likeState.liked ? "heart" : "heart-outline"}
                size={20}
                color={likeState.liked ? "#FF4B4B" : "#666"}
              />
            </TouchableOpacity>
            <Text style={styles.statsText}>{likeState.count}</Text>
          </View>

          <View style={styles.interactionStats}>
            <TouchableOpacity 
              style={styles.interactionButton}
              onPress={() => {
                if (!userId) {
                  showToastMessage("Please log in to comment!");
                  return;
                }
                handleCommentsOpen(item.id);
              }}
            >
              <MessageSquare size={20} color="#666" />
            </TouchableOpacity>
            <Text style={styles.statsText}>{commentsCount[item.id] || 0}</Text>
          </View>

          <TouchableOpacity style={styles.interactionButton} onPress={() => handleShare(item.id)}>
            <Share2 size={20} color="#666" />
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
                </View>

                {posts && posts.length > 0 ? (
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
                  />) : <ActivityIndicator
                  size="large" color="#FF6E42" className='my-20' />}

              </View>
               {showToast && (
                        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
                          <Text style={styles.toastText}>{toastMessage}</Text>
                        </Animated.View>
                      )}

              {/* Comments Modal */}
              {showComments && selectedPostId && (
                <CommentsModal
                  visible={showComments}
                  onClose={handleCommentsClose}
                  postId={selectedPostId}
                  initialCommentsCount={commentsCount[selectedPostId] || 0}
                  onCommentsCountChange={handleCommentsCountChange}
                  userId={userId}
                />
              )}
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
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    zIndex: 1000,
    alignSelf: 'center',
  },
  toastText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PostsFeed;