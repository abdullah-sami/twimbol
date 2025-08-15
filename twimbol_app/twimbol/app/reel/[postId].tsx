import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Text, Image, TouchableOpacity, Share, Animated } from 'react-native';
import Toast from 'react-native-toast-message';
import { Video } from 'expo-av';
import {
  GestureHandlerRootView,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import ReanimatedAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import useFetch from '@/services/useFetch';
import { deleteLikes, fetchFirstReel, fetchReelResults, postLikes, TWIMBOL_API_CONFIG } from '@/services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ParentalControlProvider, TimeLimitChecker, TimeRestrictionChecker } from '@/components/safety/parentalcontrolsmanager';
import { getRandomColor } from '@/components/color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommentsModal from '@/components/comments/comments';

const { height } = Dimensions.get('window');

const ReelsPlayer = ({ route }) => {
  const { postId } = route.params || {};

  // Use a single fetch hook with dependency on postId
  const {
    data: reelsData,
    loading,
    error,
    refetch
  } = useFetch(() => {
    // First fetch the target reel
    if (!postId) return fetchReelResults();

    return Promise.all([
      fetchFirstReel(postId),
      fetchReelResults()
    ]).then(([targetReel, reelsData]) => {
      // If we have both target reel and general reels
      if (targetReel && reelsData && reelsData.length > 0) {
        // Remove the target reel from general reels if it exists there
        const filteredReels = reelsData.filter(reel => reel.post !== postId);
        // Put target reel at the beginning
        return [targetReel, ...filteredReels];
      } else if (targetReel) {
        // Only target reel available
        return [targetReel];
      } else {
        // Only general reels available
        return reelsData;
      }
    });
  }, [postId]);

  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const videoRefs = useRef({});
  const flatListRef = useRef(null);

  const [userId, setuserId] = useState('')

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('user_id');
      if (id) {
        setuserId(id);
      }
    };
    fetchUserId();
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  // Handle viewable items changed
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (activeVideoIndex !== newIndex) {
        setActiveVideoIndex(newIndex);
      }
    }
  }).current;

  // Play/pause videos when active index changes
  useEffect(() => {
    if (!reelsData || reelsData.length === 0) return;

    // Pause all videos
    Object.keys(videoRefs.current).forEach(key => {
      const ref = videoRefs.current[key];
      if (ref && typeof ref.pauseAsync === 'function') {
        const result = ref.pauseAsync();
        if (result && typeof result.then === 'function') {
          result.catch(() => { });
        }
      }
    });

    // Play only the active video
    const activeRef = videoRefs.current[reelsData[activeVideoIndex]?.post];
    if (activeRef && typeof activeRef.playAsync === 'function') {
      const result = activeRef.playAsync();
      if (result && typeof result.then === 'function') {
        result.catch(() => { });
      }
    }
  }, [activeVideoIndex, reelsData]);

  if (loading && !reelsData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading reels...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load reels</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>{error.message}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ParentalControlProvider>
      <TimeLimitChecker>
        <TimeRestrictionChecker>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top", "left", "right", "bottom"]}>
              <FlatList
                ref={flatListRef}
                data={reelsData || []}
                extraData={reelsData}
                keyExtractor={(item) => item.post}
                renderItem={({ item }) => (
                  <VideoItem
                    video={item}
                    isActive={reelsData[activeVideoIndex]?.post === item.post}
                    setVideoRef={(ref) => {
                      videoRefs.current[item.post] = ref;
                    }}
                    userId={userId}
                  />
                )}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{
                  itemVisiblePercentThreshold: 80,
                }}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                initialNumToRender={2}
                maxToRenderPerBatch={3}
                windowSize={5}
                snapToInterval={height}
                snapToAlignment="start"
                decelerationRate="fast"
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
              />
            </SafeAreaView>
          </GestureHandlerRootView>
        </TimeRestrictionChecker>
      </TimeLimitChecker>
    </ParentalControlProvider>
  );
};

const VideoItem = ({ video, isActive, setVideoRef, userId }) => {
  const videoRef = useRef(null);
  const doubleTapRef = useRef();
  const scale = useSharedValue(1);
  const [likes, setLikes] = useState(video.like_count || 0);
  const [liked, setLiked] = useState(video.liked_by_user);
  const [saved, setSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);

  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(video?.comments || 0);

  
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Mock data for UI display
  const engagementData = {
    comments: commentsCount,
    liked: liked,
    shares: 0,
    username: `${video.user_profile.user.first_name} ${video.user_profile.user.last_name || ''}` || 'User',
    description: video.reel_description || 'Ooey - So Sick of Love',
    pp: video.user_profile.user.profile_pic ? `${TWIMBOL_API_CONFIG.BASE_URL}${video.user_profile.user.profile_pic}` : 'https://randomuser.me/api/portraits/men/32.jpg'
  };

  // Handle share functionality
  const handleShare = async (reelId) => {
    try {
      const result = await Share.share({
        message: `🎬 Watch this reel on Twimbool!\nhttps://twimbol.com/reel/${reelId}`,
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

  // FIXED: Handle comments modal with proper video pause/resume
  const handleCommentsPress = useCallback(() => {
    if (!video?.post) {
      console.warn('No postId found for this reel');
      return;
    }

    if (videoRef.current && isPlaying) {
      videoRef.current.pauseAsync().catch(console.error);
      setIsPlaying(false);
    }

    console.log('Comments button pressed, current showComments:', showComments);
    setShowComments(true);
  }, [isPlaying, showComments, video.post]);

  const handleCommentsClose = useCallback(() => {
    console.log('Comments modal closing, current showComments:', showComments);
    setShowComments(false);

    // Resume video when closing comments if it was active
    if (isActive && videoRef.current) {
      setTimeout(() => {
        videoRef.current.playAsync().catch(console.error);
        setIsPlaying(true);
      }, 300);
    }
  }, [isActive, showComments]);

  const handleCommentsCountChange = useCallback((newCount) => {
    console.log('Comments count changed from', commentsCount, 'to:', newCount);
    setCommentsCount(newCount);
  }, [commentsCount]);

  const [profileBorderColor] = useState(getRandomColor());

  // Set up video ref
  useEffect(() => {
    if (videoRef.current) {
      setVideoRef({
        playAsync: () => {
          if (videoRef.current) {
            videoRef.current.playAsync();
            setIsPlaying(true);
          }
        },
        pauseAsync: () => {
          if (videoRef.current) {
            videoRef.current.pauseAsync();
            setIsPlaying(false);
          }
        }
      });
    }

    return () => setVideoRef(null);
  }, [setVideoRef]);

  // Handle active state changes
  useEffect(() => {
    if (!showComments) {
      setIsPlaying(isActive);
    }
  }, [isActive, showComments]);

  // Handle double tap animation - FIXED: Use ReanimatedAnimated for animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onDoubleTap = useCallback(async () => {
    if (userId){
    if (!liked) {
      setLiked(true);
      setLikes((prevLikes) => prevLikes + 1);

      try {
        const res = await postLikes(video.post);
      } catch (error) {
        console.error('Error posting likes:', error);
        setLiked(false);
      }
    } else {
      return;
    }}

    scale.value = withSpring(1.5, { damping: 10 });
    setTimeout(() => {
      scale.value = withTiming(1, { duration: 300 });
    }, 300);
  }, [liked, setLikes, video.post, scale]);

  const toggleLike = useCallback(async () => {
    if (!liked) {
      setLiked(true);
      setLikes((prevLikes) => prevLikes + 1);

      try {
        const res = await postLikes(video.post);
      } catch (error) {
        console.error('Error posting likes:', error);
        setLiked(false);
      }
    } else {
      setLiked(false);
      setLikes((prevLikes) => prevLikes - 1);

      try {
        const res = await deleteLikes(video.post);
      } catch (error) {
        console.error('Error deleting likes:', error);
        setLiked(true);
      }
    }
  }, [liked, setLikes, video.post]);

  const toggleSaved = useCallback(() => setSaved(prev => !prev), []);

  const togglePlayPause = useCallback(() => {
    if (showComments) return;

    if (isPlaying) {
      videoRef.current?.pauseAsync();
      setIsPlaying(false);
    } else {
      videoRef.current?.playAsync();
      setIsPlaying(true);
    }

    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 800);
  }, [isPlaying, showComments]);

  const formatTimeToMMSS = useCallback((milliseconds) => {
    if (!milliseconds || milliseconds < 0) return '0:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }, []);

  const onPlaybackStatusUpdate = useCallback((status) => {
    if (status.isLoaded) {
      if (status.durationMillis) {
        setVideoDuration(status.durationMillis);
      }
      if (status.positionMillis !== undefined) {
        setCurrentPosition(status.positionMillis);
      }
    }
  }, []);

  const displayDuration = `${formatTimeToMMSS(currentPosition)} / ${formatTimeToMMSS(videoDuration)}`;

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.videoContainer}>
        <TapGestureHandler
          waitFor={doubleTapRef}
          onActivated={togglePlayPause}
          enabled={!showComments}
        >
          <TapGestureHandler
            ref={doubleTapRef}
            numberOfTaps={2}
            onActivated={onDoubleTap}
            enabled={!showComments}
          >
            <View>
              <Video
                ref={videoRef}
                source={{ uri: video.video_url }}
                style={styles.video}
                resizeMode="cover"
                shouldPlay={isActive && isPlaying && !showComments}
                isLooping
                useNativeControls={false}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                progressUpdateIntervalMillis={100}
              />
              <ReanimatedAnimated.View style={[styles.heartOverlay, animatedStyle]}>
                {scale.value > 1 && (
                  <Ionicons name="heart" size={100} color="white" />
                )}
              </ReanimatedAnimated.View>

              {showPlayIcon && (
                <View style={styles.playIconContainer}>
                  <Ionicons
                    name={isPlaying ? "play-circle" : "pause-circle"}
                    size={80}
                    color="rgba(255, 255, 255, 0.8)"
                  />
                </View>
              )}
            </View>
          </TapGestureHandler>
        </TapGestureHandler>

        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>{displayDuration}</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${videoDuration ? (currentPosition / videoDuration) * 100 : 0}%` }
            ]}
          />
        </View>

        <View style={styles.rightOverlay}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (!userId) {
                showToastMessage("Please log in to like posts!");
                return;
              }
              toggleLike();
            }}
          >
            <Ionicons
              name={engagementData.liked ? "heart" : "heart-outline"}
              size={28}
              color={engagementData.liked ? "#FF4B4B" : "white"}
            />
            <Text style={styles.actionText}>{likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCommentsPress}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={28} color="white" />
            <Text style={styles.actionText}>{engagementData.comments}</Text>
          </TouchableOpacity>

          {showComments && (
            <CommentsModal
              visible={showComments}
              onClose={handleCommentsClose}
              postId={video?.post}
              initialCommentsCount={commentsCount}
              onCommentsCountChange={handleCommentsCountChange}
              userId={userId}
            />
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(video.post)}
          >
            <Ionicons name="arrow-redo-outline" size={28} color="white" />
            <Text style={styles.actionText}>{engagementData.shares}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={toggleSaved}>
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={28}
              color={saved ? "#FFDD00" : "white"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomOverlay}>
          <View style={styles.userInfoContainer}>
            <View style={styles.profileContainer}>
              <Image
                source={{ uri: engagementData.pp }}
                style={[styles.profileImage, { borderColor: profileBorderColor }]}
              />
              <Text style={styles.username}>{engagementData.username}</Text>
            </View>
            <TouchableOpacity style={styles.followButton}>
              <Ionicons name="person-add-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.description}>{engagementData.description}</Text>

          {video.music_info && (
            <View style={styles.musicContainer}>
              <Ionicons name="musical-notes-outline" size={16} color="white" />
              <View style={styles.musicTrack}>
                <Image
                  source={{ uri: video.music_cover || 'https://i.scdn.co/image/ab67616d0000b2732df02f0877da45b745829432' }}
                  style={styles.musicThumbnail}
                />
                <Text style={styles.musicTitle} numberOfLines={1}>
                  {video.music_info}
                </Text>
              </View>
            </View>
          )}
        </View>

        {showToast && (
          <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    width: '100%',
    height: height,
    backgroundColor: 'black',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  durationContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  durationText: {
    color: 'white',
    fontSize: 12,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF4B4B',
  },
  rightOverlay: {
    position: 'absolute',
    right: 16,
    bottom: 140,
    alignItems: 'center',
  },
  actionButton: {
    marginBottom: 24,
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 80,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  followButton: {
    backgroundColor: '#FF4B4B',
    borderRadius: 20,
    padding: 8,
  },
  description: {
    color: 'white',
    fontSize: 14,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  musicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicTrack: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicThumbnail: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  musicTitle: {
    color: 'white',
    fontSize: 12,
    marginLeft: 8,
    maxWidth: 150,
  },
  heartOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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

export default ReelsPlayer;