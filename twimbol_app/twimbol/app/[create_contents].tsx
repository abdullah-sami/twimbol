import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute } from '@react-navigation/native';
import CreatePost from '@/components/creator/post_upload';
import CreateReel from '@/components/creator/reel_upload';
import CreateVideo from '@/components/creator/video_upload';


const CreateContents = () => {



  const router = useRoute();
  const { create_contents } = router.params as { create_contents: string }

  const navigation = useNavigation<NativeStackNavigationProp<any>>()

  return (
    create_contents=='post' ? 
    <CreatePost/> : 
    
    create_contents=='reel' ? 
    <CreateReel/> : 

    create_contents=='video' ? 
    <CreateVideo/> : 
    
    ''
  )
}

export default CreateContents

const styles = StyleSheet.create({})