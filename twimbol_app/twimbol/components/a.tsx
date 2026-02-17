import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Calculate thumbnail width based on showing 3 thumbnails per row with small gaps
const THUMBNAIL_WIDTH = (width - 8) / 3;
// Standard Instagram-style aspect ratio for reels (9:16 vertical)
const THUMBNAIL_HEIGHT = THUMBNAIL_WIDTH * (16 / 9);

const ReelThumbnail = ({ 
  item, 
  onPress, 
  showProfileInfo = true, 
  showViews = true
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(item.id)}
      activeOpacity={0.9}
    >
      {/* Thumbnail Image */}
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: item.thumbnail }} 
          style={styles.thumbnail} 
          resizeMode="cover"
        />
        
        {/* Play indicator */}
        <View style={styles.playIndicator}>
          <Ionicons name="play" size={14} color="white" />
        </View>
        
        {/* Duration */}
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
      
      {/* Caption - optional based on feed design */}
      {item.caption && (
        <Text numberOfLines={1} style={styles.caption}>
          {item.caption}
        </Text>
      )}
      
      {/* Views count - optional */}
      {showViews && (
        <View style={styles.viewsContainer}>
          <FontAwesome name="play" size={10} color="#888" />
          <Text style={styles.viewsText}>{formatNumber(item.views)}</Text>
        </View>
      )}
      
      {/* Profile info - optional */}
      {showProfileInfo && (
        <View style={styles.profileInfo}>
          <Image 
            source={{ uri: item.user.profilePic }} 
            style={styles.profilePic} 
          />
          <Text numberOfLines={1} style={styles.username}>
            {item.user.username}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Reel Feed Component - Grid of thumbnails
const ReelsFeed = ({ reels, onReelPress, layout = "grid" }) => {
  return (
    <View style={layout === "grid" ? styles.gridContainer : styles.listContainer}>
      {reels.map((reel) => (
        <ReelThumbnail
          key={reel.id}
          item={reel}
          onPress={onReelPress}
          showProfileInfo={layout === "list"}
          showViews={layout === "list"}
        />
      ))}
    </View>
  );
};

// Helper function to format numbers
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Example usage
const ExampleReelsFeed = () => {
  // Mock data
  const reelsData = [
    {
      id: '1',
      thumbnail: 'https://example.com/thumbnail1.jpg',
      duration: '0:30',
      caption: 'Sunset vibes #travel',
      views: 45632,
      user: {
        username: 'traveler',
        profilePic: 'https://randomuser.me/api/portraits/women/43.jpg',
      },
    },
    {
      id: '2',
      thumbnail: 'https://example.com/thumbnail2.jpg',
      duration: '0:15',
      caption: 'New dance #trend',
      views: 89421,
      user: {
        username: 'dancer',
        profilePic: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
    },
    {
      id: '3',
      thumbnail: 'https://example.com/thumbnail3.jpg',
      duration: '0:45',
      caption: 'Cooking tutorial',
      views: 32100,
      user: {
        username: 'chef',
        profilePic: 'https://randomuser.me/api/portraits/women/21.jpg',
      },
    },
    {
      id: '4',
      thumbnail: 'https://example.com/thumbnail4.jpg',
      duration: '0:22',
      caption: 'Workout routine',
      views: 15800,
      user: {
        username: 'fitness',
        profilePic: 'https://randomuser.me/api/portraits/men/11.jpg',
      },
    },
    {
      id: '5',
      thumbnail: 'https://example.com/thumbnail5.jpg',
      duration: '1:00',
      caption: 'DIY project',
      views: 28700,
      user: {
        username: 'crafty',
        profilePic: 'https://randomuser.me/api/portraits/women/15.jpg',
      },
    },
    {
      id: '6',
      thumbnail: 'https://example.com/thumbnail6.jpg',
      duration: '0:18',
      caption: 'Cute pets',
      views: 65400,
      user: {
        username: 'petlover',
        profilePic: 'https://randomuser.me/api/portraits/men/22.jpg',
      },
    },
  ];

  const handleReelPress = (reelId) => {
    console.log(`Opening reel: ${reelId}`);
    // Navigation to the full reel view would go here
  };

  return (
    <ReelsFeed 
      reels={reelsData} 
      onReelPress={handleReelPress} 
      layout="grid" // or "list" for a single column layout
    />
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 1,
  },
  listContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  container: {
    width: THUMBNAIL_WIDTH,
    marginBottom: 2,
    backgroundColor: '#fff',
  },
  thumbnailContainer: {
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  playIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  caption: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    paddingHorizontal: 4,
  },
  viewsText: {
    fontSize: 10,
    color: '#888',
    marginLeft: 4,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  profilePic: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  username: {
    fontSize: 11,
    color: '#333',
    flex: 1,
  },
});

export default ExampleReelsFeed;