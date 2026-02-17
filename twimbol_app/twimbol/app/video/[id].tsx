import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'

const video_details = () => {
    const {id} = useLocalSearchParams();

  return (
    <View>
      <Text>video post id is: {id}</Text>
    </View>
  )
}

export default video_details

const styles = StyleSheet.create({})