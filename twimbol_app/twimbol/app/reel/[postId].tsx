import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Text, Image, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';
import {
  GestureHandlerRootView,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import useFetch from '@/services/useFetch';
import { fetchReelResults, TWIMBOL_API_CONFIG } from '@/services/api';

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
      fetch(`${TWIMBOL_API_CONFIG.BASE_URL}/api/reels/${postId}`).then(res => res.json()),
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={reelsData || []}
        keyExtractor={(item) => item.post}
        renderItem={({ item }) => (
          <VideoItem
            video={item}
            isActive={reelsData[activeVideoIndex]?.post === item.post}
            setVideoRef={(ref) => {
              videoRefs.current[item.post] = ref;
            }}
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
      />
    </GestureHandlerRootView>
  );
};

const VideoItem = ({ video, isActive, setVideoRef }) => {
  const videoRef = useRef(null);
  const doubleTapRef = useRef();
  const scale = useSharedValue(1);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);

  // Mock data for UI display
  const engagementData = {
    likes: '337K',
    comments: '15K',
    shares: '25K',
    username: `${video.user_profile.user.first_name} ${video.user_profile.user.last_name || ''}` || 'User',
    description: video.reel_description || 'Ooey - So Sick of Love',
    pp: video.user_profile.user.profile_pic?`${TWIMBOL_API_CONFIG.BASE_URL}${video.user_profile.user.profile_pic}` : 'https://randomuser.me/api/portraits/men/32.jpg'
  };


  // Set up video ref
  useEffect(() => {
    if (videoRef.current) {
      setVideoRef({
        playAsync: () => {
          videoRef.current.playAsync();
          setIsPlaying(true);
        },
        pauseAsync: () => {
          videoRef.current.pauseAsync();
          setIsPlaying(false);
        }
      });
    }

    return () => setVideoRef(null);
  }, [setVideoRef]);

  // Handle active state changes
  useEffect(() => {
    setIsPlaying(isActive);
  }, [isActive]);

  // Handle double tap animation
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onDoubleTap = useCallback(() => {
    setLiked(true);
    scale.value = withSpring(1.5, { damping: 10 });
    setTimeout(() => {
      scale.value = withTiming(1, { duration: 300 });
    }, 300);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      videoRef.current?.pauseAsync();
      setIsPlaying(false);
    } else {
      videoRef.current?.playAsync();
      setIsPlaying(true);
    }

    // Show play icon briefly
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 800);
  }, [isPlaying]);

  const toggleLike = useCallback(() => setLiked(prev => !prev), []);
  const toggleSaved = useCallback(() => setSaved(prev => !prev), []);

  const formatTimeToMMSS = useCallback((milliseconds) => {
    if (!milliseconds) return '0:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }, []);

  // Handle video playback status updates
  const onPlaybackStatusUpdate = useCallback((status) => {
    if (status.isLoaded) {
      setVideoDuration(status.durationMillis || 0);
      setCurrentPosition(status.positionMillis || 0);
    }
  }, []);

  const displayDuration = formatTimeToMMSS(videoDuration);

  return (
    <View style={styles.videoContainer}>
      <TapGestureHandler
        waitFor={doubleTapRef}
        onActivated={togglePlayPause}
      >
        <TapGestureHandler
          ref={doubleTapRef}
          numberOfTaps={2}
          onActivated={onDoubleTap}
        >
          <View>
            <Video
              ref={videoRef}
              source={{ uri: video.video_url }}
              style={styles.video}
              resizeMode="cover"
              shouldPlay={isActive && isPlaying}
              isLooping
              useNativeControls={false}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              progressUpdateIntervalMillis={500}
            />
            <Animated.View style={[styles.heartOverlay, animatedStyle]}>
              {scale.value > 1 && (
                <Ionicons name="heart" size={100} color="white" />
              )}
            </Animated.View>

            {/* Play/Pause indicator */}
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

      {/* Duration indicator at top */}
      <View style={styles.durationContainer}>
        <Text style={styles.durationText}>{displayDuration}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${videoDuration ? (currentPosition / videoDuration) * 100 : 0}%` }
          ]}
        />
      </View>

      {/* Right side action buttons */}
      <View style={styles.rightOverlay}>
        <TouchableOpacity style={styles.actionButton} onPress={toggleLike}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={28}
            color={liked ? "#FF4B4B" : "white"}
          />
          <Text style={styles.actionText}>{engagementData.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={28} color="white" />
          <Text style={styles.actionText}>{engagementData.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
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

      {/* Bottom user info */}
      <View style={styles.bottomOverlay}>
        <View style={styles.userInfoContainer}>
          <View style={styles.profileContainer}>
            <Image
              source={{uri: engagementData.pp}}
              style={styles.profileImage}
            />
            <Text style={styles.username}>{engagementData.username}</Text>
          </View>
          <TouchableOpacity style={styles.followButton}>
            <Ionicons name="person-add-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.description}>{engagementData.description}</Text>

        {/* Music player indicator */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    height: height,
    width: '100%',
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
    borderColor: 'white',
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
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
});

export default ReelsPlayer;