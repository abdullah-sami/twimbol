import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { MoreVertical, Settings, Home, Film, Users, CheckSquare } from 'lucide-react-native';
import useFetch from '@/services/useFetch';
import { fetchNotifications } from '@/services/api';
import TimeAgo from '@/components/time';
import { useRoute, useNavigation } from '@react-navigation/native';
// import { useNavigation } from 'expo-router';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import NotificationItem from '@/components/notifications/notification';
// import NotificationPreferences from '@/components/notifications/preferences';


import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';


const Notifications = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();



  const { data: notifications, loading: notificationsLoading, error: notificationsError, refetch, execute } = useFetch(
    () => fetchNotifications(),)


  
  const handleNotificationSettings = () =>{
    
  }


    

  return (
    <GestureHandlerRootView className="flex-1">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={()=>navigation.navigate('notification_preferences' as never)}>
            <Settings size={22} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.subHeader}>
          <Text style={styles.subHeaderText}>
            You've got <Text style={styles.unreadCount}>{notifications?notifications.length:0} unread</Text> notifications
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>


          <FlatList
            showsVerticalScrollIndicator={false}
            data={notifications}
            renderItem={({ item }) => (
              <NotificationItem
                item={item}
                handleNotificationPress={() => {
                  navigation.navigate(item.page, { id: item.post_id });
                }}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            numColumns={1}
            scrollEnabled={true}

            ListEmptyComponent={() => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 200 }}>
                <Text>No notifications available</Text>
              </View>
            )}
          />



        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

export default Notifications

const styles = StyleSheet.create({
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  settingsButton: {
    padding: 8,
  },
  subHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#666',
  },
  unreadCount: {
    color: '#FF6E42',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
})