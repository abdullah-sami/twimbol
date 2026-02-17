import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { TWIMBOL_API_CONFIG } from '@/services/api';


const NotificationPreferences = ({ navigation }) => {
  const [preferences, setPreferences] = useState({
    all_notifications: true,
    email_notifications: true,
    push_notifications: true,
    follow_notifications: true,
    likes_notifications: true,
    comments_notifications: true,
    new_events_notifications: true,
    event_reminders_notifications: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    checkAuthAndLoadPreferences();
  }, []);

  const checkAuthAndLoadPreferences = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('user_id');
      
      if (!storedUserId) {
        // User is logged out, redirect to login
        Alert.alert(
          'Authentication Required',
          'Please log in to access notification preferences.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'), // Adjust navigation as needed
            },
          ]
        );
        return;
      }

      setUserId(storedUserId);
      await loadPreferences();
    } catch (error) {
      console.error('Error checking authentication:', error);
      Alert.alert('Error', 'Failed to verify authentication.');
    }
  };

  const loadPreferences = async () => {
    try {
      const token = await AsyncStorage.getItem('access'); 
      
      const response = await fetch(
        `${TWIMBOL_API_CONFIG.BASE_URL}/api/notifications/preferences/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      } else {
        throw new Error('Failed to load preferences');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      Alert.alert('Error', 'Failed to load notification preferences.');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (field, value) => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setUpdating(true);
    
    try {
      const token = await AsyncStorage.getItem('access');
      
      // Optimistically update UI
      const updatedPreferences = { ...preferences, [field]: value };
      setPreferences(updatedPreferences);

      const response = await fetch(
        `${TWIMBOL_API_CONFIG.BASE_URL}/api/notifications/preferences/`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ [field]: value }),
        }
      );

      if (!response.ok) {
        // Revert optimistic update on failure
        setPreferences(preferences);
        throw new Error('Failed to update preferences');
      }

      const updatedData = await response.json();
      setPreferences(updatedData);
      
    } catch (error) {
      console.error('Error updating preferences:', error);
      Alert.alert('Error', 'Failed to update notification preferences.');
      // Revert the optimistic update
      setPreferences(preferences);
    } finally {
      setUpdating(false);
    }
  };

  const PreferenceToggle = ({ 
    icon, 
    title, 
    description, 
    field, 
    disabled = false 
  }) => (
    <View style={[styles.preferenceItem, disabled && styles.disabledItem]}>
      <View style={styles.preferenceLeft}>
        <Icon 
          name={icon} 
          size={24} 
          color={disabled ? '#ccc' : '#333'} 
          style={styles.preferenceIcon}
        />
        <View style={styles.preferenceTextContainer}>
          <Text style={[styles.preferenceTitle, disabled && styles.disabledText]}>
            {title}
          </Text>
          <Text style={[styles.preferenceDescription, disabled && styles.disabledText]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={preferences[field]}
        onValueChange={(value) => updatePreferences(field, value)}
        disabled={disabled || updating}
        trackColor={{ false: '#E0E0E0', true: '#FF6B35' }}
        thumbColor={preferences[field] ? '#FFFFFF' : '#FFFFFF'}
        style={styles.switch}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Master Toggle */}
        <View style={styles.section}>
          <PreferenceToggle
            icon="notifications-off"
            title="Turn off all notifications"
            description="Disable all notifications and alerts"
            field="all_notifications"
          />
        </View>

        {/* Social Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOCIAL</Text>
          
          <PreferenceToggle
            icon="person-add"
            title="New Followers"
            description="Get notified when someone follows you"
            field="follow_notifications"
            disabled={!preferences.all_notifications}
          />
          
          <PreferenceToggle
            icon="thumb-up"
            title="Likes on my Posts"
            description="Receive alerts when someone likes your posts"
            field="likes_notifications"
            disabled={!preferences.all_notifications}
          />
          
          <PreferenceToggle
            icon="comment"
            title="Comments on my posts"
            description="Be updated when someone comments"
            field="comments_notifications"
            disabled={!preferences.all_notifications}
          />
        </View>

        {/* Events Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EVENTS</Text>
          
          <PreferenceToggle
            icon="event"
            title="New Event Announcements"
            description="Get notified about new upcoming events"
            field="new_events_notifications"
            disabled={!preferences.all_notifications}
          />
          
          <PreferenceToggle
            icon="schedule"
            title="Event Reminders"
            description="Reminders before an event starts"
            field="event_reminders_notifications"
            disabled={!preferences.all_notifications}
          />
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  preferenceItem: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledItem: {
    opacity: 0.6,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIcon: {
    marginRight: 16,
  },
  preferenceTextContainer: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  disabledText: {
    color: '#ccc',
  },
  switch: {
    marginLeft: 12,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default NotificationPreferences;