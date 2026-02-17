import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  ScrollView,
  Animated
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { useEffect } from 'react';
import { GestureHandlerRootView, RefreshControl } from 'react-native-gesture-handler';
import { TWIMBOL_API_CONFIG } from '@/services/api';
import { images } from '@/constants/images';
import { navigate } from 'expo-router/build/global-state/routing';
import { Navigation } from 'lucide-react-native';
import { useNavigation } from 'expo-router';



const { width } = Dimensions.get('window');

// Calculate thumbnail width based on showing 3 thumbnails per row with small gaps
const THUMBNAIL_WIDTH_3_REELS = (width - 42) / 3;
const THUMBNAIL_WIDTH_2_REELS = (width - 64) / 2;
// Standard Instagram-style aspect ratio for reels (9:16 vertical)
const THUMBNAIL_HEIGHT = THUMBNAIL_WIDTH_3_REELS * (16 / 9);
const THUMBNAIL_HEIGHT_2_REELS = THUMBNAIL_WIDTH_2_REELS * (16 / 9);






// In reels_feed.tsx - Fix the ReelThumbnail component

export const ReelThumbnail = ({
  item = null,
  onPress = null,
  showProfileInfo = true,
  showViews = true,
  post_id,
  reel_title = null,
  reel_by = null,
  reel_thumbnail = null,
  profile = null,
  username = null,
  reel_per_column = 3
}: any) => {

  const navigation = useNavigation()

  const pp = item && item.user_profile && item.user_profile.user && item.user_profile.user.profile_pic
    ? `${TWIMBOL_API_CONFIG.BASE_URL}${item.user_profile.user.profile_pic}`
    : reel_by && reel_by.user && reel_by.user.profile_pic
      ? `${TWIMBOL_API_CONFIG.BASE_URL}${reel_by.user.profile_pic}`
      : images.defaultProfilePic

  // Fix: Use the correct postId based on available data
  const handlePress = () => {
    const postIdToUse = item?.post || post_id;
    if (postIdToUse) {
      navigation.navigate('reel' as never, { postId: postIdToUse });
    } else if (onPress) {
      onPress(postIdToUse);
    }
  };

  return (
    <TouchableOpacity
      style={(reel_per_column == 3) ? (styles.row_3_container) : (styles.row_2_container)}
      onPress={handlePress} // Use the fixed handler
      activeOpacity={1}
    >
      {/* Rest of your component remains the same */}
      <View style={(reel_per_column == 3) ? (styles.row_3_thumbnailContainer) : (styles.row_2_thumbnailContainer)}>
        <ImageBackground
          source={item ? { uri: `${item.video_url.replace('.mp4', '.png')}` } : { uri: reel_thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        >
          {/* Star indicator */}
          <View style={styles.starIndicator}>
            <Image
              source={require('../assets/icons/star.png')} 
              tintColor={"#fff"}
              style={{ width: 15, height: 15 }}
            />
          </View>

          {/* Caption */}
          {(item || reel_title) && (
            <Text numberOfLines={1} style={styles.caption}>
              {item ? item.reel_title : reel_title}
            </Text>
          )}

          {/* Profile info */}
          {(showProfileInfo || reel_by) && (
            <View style={styles.profileInfo}>
              <Image
                source={{ uri: pp }}
                style={styles.profilePic}
              />
              <View style={styles.profileDet}>
                <Text numberOfLines={1} style={styles.user_fullname} className='text-md font-bold'>
                  {item ? (`${item.user_profile.user.first_name} ${item.user_profile.user.last_name ? item.user_profile.user.last_name : ''}`) : (`${reel_by.user.first_name} ${reel_by.user.last_name ? reel_by.user.last_name : ''}`)}
                </Text>
                <Text numberOfLines={1} style={styles.username} className=''>
                  {item ? (`@${item.user_profile.user.username}`) : (`@${username.username}`)}
                </Text>
              </View>
            </View>
          )}
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );
};



const ReelThumbnailPreloader = () => {
  // Create an animated value for opacity
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Generate random delay between 0 and 500ms
    const randomDelay = Math.random() * 500;

    // Create a sequence of animations
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 0.6, // Dim to 60% opacity (darker)
      duration: 800,
      useNativeDriver: true,
    });

    const fadeOut = Animated.timing(fadeAnim, {
      toValue: 1, // Return to full opacity
      duration: 800,
      useNativeDriver: true,
    });

    // Add initial delay before starting the loop
    setTimeout(() => {
      // Run the animation sequence in a loop
      Animated.loop(
        Animated.sequence([fadeIn, fadeOut])
      ).start();
    }, randomDelay);

    // Clean up animation when component unmounts
    return () => {
      fadeAnim.stopAnimation();
    };
  }, []);


  return (
    <>
      <TouchableOpacity
        style={styles.row_3_container}
        onPress={() => { }}
      >
        <View style={styles.row_3_thumbnailContainer}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <ImageBackground
              source={images.rankingGradient}
              style={styles.thumbnail}
              resizeMode="cover"
              tintColor={"#ccc"}
            >
              <View style={styles.starIndicator}>
                <FontAwesome name="star" size={15} color="#fff" />
              </View>
              <Text style={styles.caption}>Loading...</Text>
            </ImageBackground>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </>
  );
};



const ReelsFeed = ({ reels, onReelPress, layout = "grid", range = Number.MAX_VALUE, reel_per_column = 3 }: any) => {


  if (reels && range) {
    reels.slice(0, range);
  }

  return (

    <View style={layout === "grid" ? styles.gridContainer : styles.listContainer}>
      {reels && reels.length > 0 ? (
        (reels.slice(0, range)).map((reel: any) => (
          <ReelThumbnail
            key={reel.post}
            item={reel}
            onPress={onReelPress}
            reel_per_column={reel_per_column}
          />
        ))
      ) : (<>
        {Array.from({ length: 9 }).map((_, i) => (
          <ReelThumbnailPreloader key={i} />
        ))}</>

      )}
    </View>
  );
};



// Helper function to format numbers
const formatNumber = (num: any) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};














const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 1,
    width: '98.5%',
    margin: 'auto',
    marginTop: 10,
    paddingBottom: 50,
  },
  listContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  row_3_container: {
    width: THUMBNAIL_WIDTH_3_REELS,
    marginBottom: 5,
    backgroundColor: '#fff',
    borderRadius: 7.5,
    elevation: 3,
    marginHorizontal: 3
  },
  row_3_thumbnailContainer: {
    width: THUMBNAIL_WIDTH_3_REELS,
    height: THUMBNAIL_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 7.5,
  },


  row_2_container: {
    width: THUMBNAIL_WIDTH_2_REELS,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 5,
    elevation: 3,
  },
  row_2_thumbnailContainer: {
    width: THUMBNAIL_WIDTH_2_REELS,
    height: THUMBNAIL_HEIGHT_2_REELS,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 10,
  },


  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  starIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  //   durationContainer: {
  //     position: 'absolute',
  //     bottom: 8,
  //     right: 8,
  //     backgroundColor: 'rgba(0, 0, 0, 0.6)',
  //     paddingHorizontal: 6,
  //     paddingVertical: 2,
  //     borderRadius: 4,
  //   },
  //   durationText: {
  //     color: 'white',
  //     fontSize: 10,
  //     fontWeight: '500',
  //   },
  caption: {
    fontSize: 12,
    color: '#fff',
    paddingBottom: 5,
    paddingHorizontal: 5,
    position: 'absolute',
    bottom: 0,
    display: 'none',

  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    padding: 3,
    position: 'absolute',
    top: 12,
    left: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 50,

  },
  viewsText: {
    fontSize: 10,
    color: '#fff',
    marginLeft: 4,
  },
  profileInfo: {
    width: '70%',
    maxWidth: 130,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 5,
    padding: 3,
    paddingHorizontal: 6,
    position: 'absolute',
    bottom: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(100, 100, 100, .3)',
  },
  profilePic: {
    width: 22,
    height: 22,
    borderRadius: 50,
  },
  user_fullname: {
    fontSize: 10,
    color: '#fff',
    flex: 1,
  },
  username: {
    fontSize: 8,
    color: '#f0f0fa',
    flex: 0,
  },
  profileDet: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: 3,
  },








  // ReelsThumbnailPreloader styles










});

export default ReelsFeed;