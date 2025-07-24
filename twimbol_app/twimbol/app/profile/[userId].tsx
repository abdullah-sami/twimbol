import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const ProfileUser = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right", "bottom"]}>

      <View>

        <Text>[userId]</Text>
      </View>
    </SafeAreaView>
  )
}

export default ProfileUser

const styles = StyleSheet.create({})