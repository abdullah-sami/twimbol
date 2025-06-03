import { StyleSheet, Text, View, Image, TextInput, ImageBackground, Dimensions } from 'react-native'
import React from 'react'
import { ReelThumbnail } from './reels_feed';
import { icons } from '@/constants/icons'
import { Link, useRouter } from "expo-router";
import { VideoThumbnail } from './videos_feed';
import { PostThumbnail } from './posts_feed';


const { width } = Dimensions.get('window');


const SearchResult  = ({post_id, video_data, reels_data, post_description, post_type, post_title, post_by, username, post_banner, created_at}:any) => {
    var post_type_view = "post"
    
    if(post_type=="post"){post_type_view = "post"}else if(post_type=="youtube_video_upload"){post_type_view = "video"}else if(post_type=="youtube_video"){post_type_view = "video"}else if (post_type=="reel"){post_type_view = "reel"}

    const router = useRouter();
      const handleReelPress = (postId:any) => {
        router.push(`../reel/${postId}`); 
    };

  return (
        <>

        {post_type_view=="reel" ? (

                        <View style={styles.thumbnail_container}>
        <ReelThumbnail reel_per_column={3} style={styles.reel_results} post_id={post_id} reel_title={post_title} reel_by={post_by} username={username} reel_thumbnail={reels_data.video_url.replace('mp4', 'jpg')} onPress={handleReelPress}/>  
                  <Image source={icons.three_dot} tintColor={'#010101'} style={styles.reel_thumb_options} />
        
        </View>
                        

        
        
        
        ): post_type_view=="video" ?  (
            
            <VideoThumbnail post_id={post_id} video_title={post_title} video_by={post_by} username={username} video_thumbnail={video_data?video_data.thumbnail_url:null} onPress={handleReelPress}/>
        
        ) : post_type_view=="post" ?(
            
            <PostThumbnail post_id={post_id} post_title={post_title} post_desc={post_description} post_by={post_by} username={username} post_thumbnail={post_banner?post_banner:null} onPress={handleReelPress} created_at={created_at}/>

        ) : (

            <Link href={`../${post_type_view}/${post_id}`}>
            <View>
                <Text>{post_title}</Text>
                <Text>{post_by.first_name} {post_by.last_name}</Text>
                {reels_data ? (
                    <Image source={reels_data.thumbnail_url}/>):(
                        
                        <Text>No thumbnail for the post</Text>
                )}
            </View>
            </Link>
        )}
        
        </>
  )
}



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
    reel_results:{
        margin: 'auto'
    },
    reel_thumb_options:{
        width: 20,
        height: 20,
        marginHorizontal: 5,
        padding: 3,
        position: 'absolute',
        bottom: 25,
        right: 10
      },
    })




export default SearchResult