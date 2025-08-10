import React from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, } from 'react-native'
import { Search, Calendar, User, MapPin, Users, Bookmark } from 'lucide-react-native';
import ComingSoonPage from '@/components/ComingSoon'
import { useNavigation, useRoute } from '@react-navigation/native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react';
import { images } from '@/constants/images';
import Header from '@/components/header';
import { ParentalControlProvider, TimeLimitChecker, TimeRestrictionChecker } from '@/components/safety/parentalcontrolsmanager';

const event = () => {
  const [selectedCategory, setSelectedCategory] = useState('Others');
  const [selectedTab, setSelectedTab] = useState('Explore');

  const categories = ['All', 'Video', 'Reel', 'Others'];
  const tabs = ['Explore', 'My Events'];
  // const tabs = ['Explore', 'My Events', 'Create New'];


  const navigation = useNavigation();

  const upcomingEvents = [
    {
      id: 1,
      title: 'Selection for Leadership Camp',
      date: '17 March, 2025',
      location: 'Central Office, Dhaka',
      participants: 172,
      image: images.safeinternet // placeholder
    },
    {
      id: 2,
      title: 'Badge Recognition Program',
      date: '28 March, 2025',
      location: 'Main Office',
      participants: 89,
      image: images.safeinternet // placeholder
    }
  ];

  const renderHeader = () => (
    <>
      <Header />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        {/* <TouchableOpacity style={styles.bookmarkButton}>
            <Bookmark size={24} color="#fff" fill="#FF6B47" />
          </TouchableOpacity> */}
      </View>
    </>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            selectedTab === tab && styles.activeTab
          ]}
          onPress={() => setSelectedTab(tab)}
        >
          <Text style={[
            styles.tabText,
            selectedTab === tab && styles.activeTabText
          ]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderUpcomingEvents = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {upcomingEvents.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventImagePlaceholder}>
              <Text style={styles.eventDate}>{event.date}</Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <View style={styles.eventLocation}>
                <MapPin size={16} color="#666" />
                <Text style={styles.locationText}>{event.location}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.activeCategoryButton
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.activeCategoryText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEvent = () => (
    <TouchableOpacity style={styles.Event} onPress={() => { navigation.navigate('events', { eventid: 1 }) }}>
      <View style={styles.ImageContainer}>
        <View style={styles.ImagePlaceholder}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>X</Text>
          </View>
        </View>
      </View>
      <View style={styles.Info}>
        <Text style={styles.Date}>17 March, 2025</Text>
        <Text style={styles.Title}>Selection for Leadership Camp</Text>
        <View style={styles.Details}>
          <View style={styles.Location}>
            <MapPin size={16} color="#666" />
            <Text style={styles.LocationText}>Central Office, Dhaka</Text>
          </View>
          <View style={styles.Participants}>
            <Users size={16} color="#666" />
            <Text style={styles.ParticipantsText}>172 Participants</Text>
          </View>
        </View>
        <View style={styles.Actions}>
          <TouchableOpacity style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>Read More</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );


  return (
    <ParentalControlProvider>
      <TimeLimitChecker>
        <TimeRestrictionChecker>

          <GestureHandlerRootView style={styles.container}>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'left', 'right']}>
              {renderHeader()}
              <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} style={{ marginBottom: 50 }}>
                {renderTabs()}

                {selectedTab === 'Explore' ?
                  renderUpcomingEvents() : <></>}


                {renderCategories()}

                {renderEvent()}
              </ScrollView>
            </SafeAreaView>
          </GestureHandlerRootView>
        </TimeRestrictionChecker>
      </TimeLimitChecker>
    </ParentalControlProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FF6B47',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#FF6E42',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  eventCard: {
    width: 200,
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventImagePlaceholder: {
    height: 80,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  eventInfo: {
    padding: 12,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeCategoryButton: {
    backgroundColor: '#FF6E42',
  },
  categoryText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: 'white',
  },
  Event: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginBottom: 20,
  },
  ImageContainer: {
    height: 200,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ImagePlaceholder: {
    flex: 1,
    width: '100%',
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#FF6E42',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  Info: {
    padding: 20,
  },
  Date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  Title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  Details: {
    marginBottom: 20,
  },
  Location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  LocationText: {
    fontSize: 14,
    color: '#666',
  },
  Participants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ParticipantsText: {
    fontSize: 14,
    color: '#666',
  },
  Actions: {
    flexDirection: 'row',
    gap: 10,
  },
  readMoreButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  readMoreText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  registerButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FF6E42',
  },
  registerText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  bottomEventCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomEventImage: {
    height: 120,
    backgroundColor: '#ffeaa7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6E42',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 24,
  },
});

export default event;