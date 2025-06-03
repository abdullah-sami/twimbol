import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ComingSoonPage from '@/components/ComingSoon'
import { useNavigation, useRoute } from '@react-navigation/native'

const event = () => {
  const navigation = useNavigation()
  const route = useRoute()
  return (
    <>
    <ComingSoonPage navigation={navigation} route={route}/>
    </>
  )
}

export default event

const styles = StyleSheet.create({})