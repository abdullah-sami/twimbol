import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { useEffect } from 'react';
import { GestureHandlerRootView, RefreshControl } from 'react-native-gesture-handler';
import { TWIMBOL_API_CONFIG } from '@/services/api';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';

const { width } = Dimensions.get('window');

// Calculate thumbnail width based on showing 3 thumbnails per row with small gaps
const THUMBNAIL_WIDTH_3_REELS = (width - 28) / 3;
const THUMBNAIL_WIDTH_2_REELS = (width - 64) / 2;
// Standard Instagram-style aspect ratio for reels (9:16 vertical)
const THUMBNAIL_HEIGHT = THUMBNAIL_WIDTH_3_REELS * (16 / 9);
const THUMBNAIL_HEIGHT_2_REELS = THUMBNAIL_WIDTH_2_REELS * (16 / 9);






export const PostThumbnail = ({post_id, post_title, post_desc, post_by, username, post_thumbnail, created_at, onPress}:any) =>{

      const profile_pic = `${TWIMBOL_API_CONFIG.BASE_URL}${post_by.user.profile_pic}`
      const profile_name = `${post_by.user.first_name} ${post_by.user.last_name}`
      const thumbnail = `${TWIMBOL_API_CONFIG.BASE_URL}${post_thumbnail}`
    
    return (<>


    <TouchableOpacity style={styles.thumbnail_container} onPress={() => onPress(post_id?post_id:null)}>
    
    
          <ImageBackground
          style={styles.thumbnail }
            source={{uri: thumbnail}}
          >
    
    
          </ImageBackground>
          <View style={styles.video_thumb_info}>
            <Image source={post_by?{uri: profile_pic}:images.defaultProfilePic}  style={styles.video_thumb_info_pic}/>
          <View style={styles.video_thumb_info_det}>
          <Text style={styles.video_thumb_title} className='font-bold'>{post_title}</Text>
          <Text numberOfLines={1} style={styles.video_thumb_info_name}>{profile_name} {' '}
            <Text numberOfLines={1} style={styles.video_thumb_info_username}>@{username.username}</Text>
            </Text>
          
          </View>
          <Image source={icons.three_dot} tintColor={'#010101'} style={styles.post_thumb_options} />
          </View>
    
    
        </TouchableOpacity>
        </>
    )
}









export const PostFeed = ({posts, onReelPress, layout = "grid", range=Number.MAX_VALUE, reel_per_column=3}:any) =>{

    if(posts && range){
      posts.slice(0, range);
    }
    const handlePostPress = ()=>{}
    return (
        <>



    
        <View>
          {posts && posts.length > 0 ? (
            (posts.slice(0,range)).map((post: any) => (
              <PostThumbnail
                post_by={post.user_profile.user}
              />
            ))
          ) : (
            <Text>No reels to display</Text>
          )}
        </View>



        </>
    )
    
}

// Helper function to format numbers
const formatNumber = (num:any) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};




// export default PostFeed


const styles = StyleSheet.create({

    thumbnail_container: {
        width: (width * .9),
        height: (width * 9/16)+30,
        flex: 1,
        // justifyContent: 'center',
        // alignContent: 'center',
        marginVertical: 10,
        margin: 'auto',
        // alignItems: 'center',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center'
    
        
      },
      thumbnail: {
        width: width*.85,
        height: ((width*.8) * 9/16),
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 10,
        elevation: 3,
        justifyContent: 'center',
        alignItems: 'center',
    
    
      },
      video_thumb_play_btn:{
        width: 40,
        height: 40,
      },
      video_thumb_title:{
        fontSize: 16,
        color: '#010101',
        width: '90%',
        // paddingTop: 10,
    
        
      },
      video_thumb_info:{
        width: '100%',
        padding: 5,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    
        
      },
      video_thumb_info_pic:{
        width: 40,
        height: 40,
        borderRadius: 50,
        marginHorizontal: 5,
        padding: 3,
        borderColor: 'rgba(0,0,0,0.2)',
        // borderBlockColor: '#000',
        borderWidth: 1,
        elevation: 3,
        
      },
      video_thumb_info_det:{
        marginLeft: 10,
        flex: 1,
        flexDirection: 'column'
        
      },
      video_thumb_info_name:{
        fontSize: 13,
        color: '#010101'
        
      },
      video_thumb_info_username:{
        fontSize: 12,
        color: '#FF6E42',
        paddingHorizontal: 10,
    
        
      },
      post_thumb_options:{
        width: 20,
        height: 20,
        marginHorizontal: 5,
        padding: 3,
        position: 'absolute',
        bottom: 25,
        right: 10
      }

})