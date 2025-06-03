import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, ChevronRight, Edit2 } from 'lucide-react-native';
import { useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserProfile, TWIMBOL_API_CONFIG } from '@/services/api';
import useFetch from '@/services/useFetch';
import { images } from '@/constants/images';

import * as ImagePicker from 'expo-image-picker';
import { RefreshControl } from 'react-native-gesture-handler';





// Helper function to get the auth token from secure storage
const getAuthToken = async () => {
  try {
    // You might be using a different storage mechanism or library
    // Replace this with your actual token retrieval method
    const token = await AsyncStorage.getItem('access');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// // Helper functions for permission storage
// const PERMISSION_STORAGE_KEY = 'galleryPermission';

// const savePermissionStatus = async (status) => {
//   try {
//     await AsyncStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(status));
//   } catch (error) {
//     console.error('Error saving permission status:', error);
//   }
// };


// const getPermissionStatus = async () => {
//   try {
//     const status = await AsyncStorage.getItem(PERMISSION_STORAGE_KEY);
//     return status ? JSON.parse(status) : null;
//   } catch (error) {
//     console.error('Error retrieving permission status:', error);
//     return null;
//   }
// };

const ProfileEdit = () => {
  const { data: profile, refetch, loading: profileLoading } = useFetch(() => fetchUserProfile());
  const navigation = useNavigation();

  // State for the profile image and loading state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize profile data from the API response
  const [profileData, setProfileData] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    username: '',
    phoneNumber: '',
    emailAddress: '',
    address: '',
    user_social_facebook: '',
    user_social_twitter: '',
    user_social_youtube: ''
    
    // education: ''
  });



  // Update local state when profile data is fetched
  useEffect(() => {
    if (profile) {
      setProfileData({
        userId: profile.id || null,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        username: profile.username || '',
        phoneNumber: profile.user_phone || '',
        emailAddress: profile.email || 'user@gmail.com',
        address: profile.user_address || 'City, District',
        user_social_facebook: profile.user_social_fb || 'facebook.com/',
        user_social_twitter: profile.user_social_twt || 'x.com/@',
        user_social_youtube: profile.user_social_yt || 'youtube.com/'

        // education: profile.education || 'Class 12'
      });

      console.log(profile.id)

      // Set profile image
      const profileImageurl = profile.profile_pic
        ? {uri: `${TWIMBOL_API_CONFIG.BASE_URL}${profile.profile_pic}`}
        : images.defaultProfilePic;
      setProfileImage(profileImageurl);
    }
  }, [profile]);

  



  


  const handleImagePicker = async () => {
    
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      selectionLimit: 1,
    });

    console.log(result.assets[0].uri);

    if (!result.canceled) {
      setProfileImage({uri: result.assets[0].uri});

      handleImageUpload(result)
    }
  }
  
  



  const handleImageUpload = async (image) => {
    setImageLoading(true);
    
    const formData = new FormData();
    formData.append('profile_pic', {
      uri: image.assets[0].uri,
      type: 'image/jpeg',
      name: `profile_pic_${profile.username}.jpg`,
    });

    try {
      // Get auth token
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }


          
      const response = await fetch(`${TWIMBOL_API_CONFIG.BASE_URL}/user/api/update/${profileData.userId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}` // Use proper authentication header
        },
        body: formData,
      });

      
      

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload image: ${errorText}`);
      }

      const data = await response.json();
      console.log('Image uploaded successfully:', data);

      // Refetch the profile data to get updated image URL
      refetch();
      
      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload the image. Please try again.');
      
      // Optionally revert to original image if upload fails
      if (profile?.profile_pic) {
        setProfileImage(`${TWIMBOL_API_CONFIG.BASE_URL}${profile.profile_pic}`);
      } else {
        setProfileImage('https://via.placeholder.com/150');
      }
    } finally {
      setImageLoading(false);
    }
  };



  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData({
        ...profileData,
        [parent]: {
          ...(profileData[parent] || {}),
          [child]: value,
        },
      });
    } else {
      setProfileData({
        ...profileData,
        [field]: value,
      });
    }
  };




  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      
      // Get auth token
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Format data for API
      const apiData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.emailAddress,
        user_phone: profileData.phoneNumber,
        user_address: profileData.address,
        user_social_fb: profileData.user_social_facebook,
        user_social_twt: profileData.user_social_twitter,
        user_social_yt: profileData.user_social_youtube,
        // education: profileData.education
      };
      
      // Make API request
      const userId = await AsyncStorage.getItem('user_id')
      const response = await fetch(`${TWIMBOL_API_CONFIG.BASE_URL}/user/api/update/${userId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Profile data saved:', data);
      
      // Refetch profile data to get latest changes
      await refetch();
      
      Alert.alert('Success', 'Profile updated successfully');
      navigation.navigate('profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', `Failed to update profile: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  

  // Show loading indicator while profile data is being fetched
  if (profileLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>Loading profile data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileImageContainer}>
          {imageLoading ? (
            <View style={[styles.profileImage, styles.profileImageLoading]}>
              <ActivityIndicator size="small" color="#FF6347" />
            </View>
          ) : (
            <Image 
              source={ profileImage ? profileImage : images.defaultProfilePic} 
              style={styles.profileImage} 
              onError={() => setProfileImage('https://via.placeholder.com/150')}
            />
          )}
          <TouchableOpacity 
            style={styles.editImageButton} 
            onPress={handleImagePicker}
            activeOpacity={0.7}
            disabled={imageLoading}
          >
            <Edit2 color="#fff" size={16} />
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={profileData.firstName}
              onChangeText={(text) => handleChange('firstName', text)}
              placeholder="First Name"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={profileData.lastName}
              onChangeText={(text) => handleChange('lastName', text)}
              placeholder="Last Name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, {opacity: 0.6}]}
              value={profileData.username}
              placeholder="Username"
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={profileData.phoneNumber}
              onChangeText={(text) => handleChange('phoneNumber', text)}
              placeholder="Phone Number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, {opacity: 0.6}]}
              value={profileData.emailAddress}
              onChangeText={(text) => handleChange('emailAddress', text)}
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
              
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={profileData.address}
              onChangeText={(text) => handleChange('address', text)}
              placeholder="Address"
            />
          </View>

          <Text style={styles.sectionTitle}>Social Media</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Facebook</Text>
            <TextInput
              style={styles.input}
              value={profileData.user_social_facebook}
              onChangeText={(text) => handleChange('user_social_facebook', text)}
              placeholder="Facebook"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Twitter</Text>
            <TextInput
              style={styles.input}
              value={profileData.user_social_twitter}
              onChangeText={(text) => handleChange('user_social_twitter', text)}
              placeholder="Twitter"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>YouTube</Text>
            <TextInput
              style={styles.input}
              value={profileData.user_social_youtube}
              onChangeText={(text) => handleChange('user_social_youtube', text)}
              placeholder="YouTube"
              autoCapitalize="none"
            />
          </View>
{/* 
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Education</Text>
            <TouchableOpacity style={styles.dropdownInput}>
              <Text>{profileData.education}</Text>
              <ChevronRight size={16} color="#777" />
            </TouchableOpacity>
          </View> */}

          <TouchableOpacity style={styles.navigationItem}>
            <Text style={styles.navigationItemText}>Change Password</Text>
            <ChevronRight size={16} color="#777" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navigationItem}>
            <Text style={styles.navigationItemText}>Blocked Users</Text>
            <ChevronRight size={16} color="#777" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navigationItem}>
            <Text style={[styles.navigationItemText, styles.dangerText]}>Delete or Deactivate</Text>
            <ChevronRight size={16} color="#777" />
          </TouchableOpacity>

        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.navigate('profile')}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Close</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.saveButton, isSubmitting && styles.disabledButton]} 
          onPress={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  header: {
    backgroundColor: '#FF6347',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FF6347',
    borderStyle: 'dashed',
  },
  profileImageLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#FF6347',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dropdownInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 16,
  },
  navigationItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  navigationItemText: {
    fontSize: 16,
    color: '#333',
  },
  dangerText: {
    color: '#f44336',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    color: '#f44336',
    marginLeft: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF6347',
    borderRadius: 25,
    padding: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#FF6347',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF6347',
    borderRadius: 25,
    padding: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#ffaa9a',
  },
});

export default ProfileEdit;