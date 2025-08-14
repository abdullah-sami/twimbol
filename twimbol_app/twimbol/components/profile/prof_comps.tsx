import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserProfile, TWIMBOL_API_CONFIG } from '@/services/api';
import useFetch from '@/services/useFetch';
import { images } from '@/constants/images';
import { RefreshControl } from 'react-native-gesture-handler';

const Profile = () => {
  const navigation = useNavigation();
  const [isloggedin, setisloggedin] = useState(false)
  const [usergroup, setusergroup] = useState('visitor')
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const checkUserId = async () => {
      try {
        const userGroup = await AsyncStorage.getItem('user_group');
        if (userGroup == 'creator') {
          setusergroup(userGroup);
        }
      } catch (error) {
        console.error('Error retrieving user group', error);
      }
    };

    checkUserId();
  }, []);




  const { data: profile, loading: profileLoading, error: profileError, refetch, execute } = useFetch(
    () => fetchUserProfile(),false)



useEffect(() => {
  const checkLoginAndFetch = async () => {
    const userId = await AsyncStorage.getItem('user_id');
    if (userId) {
      setisloggedin(true);
      // Only execute profile fetch if user is logged in
      refetch ();
    } else {
      setisloggedin(false);
    }
  };

  checkLoginAndFetch();
}, []);




  const handleApplyCreator = () => {
    navigation.navigate('(tabs)', { screen: 'create' });
  };

  const handlePrivacyPolicy = (url) => {

    Linking.openURL(url);

  };



  const handleSettingsPress = () => {
    navigation.navigate('settings' as never);
  };


  const handleLogin = () => {
    // @ts-ignore
    navigation.navigate('authentication', { authpage: 'login' });


  };

  const handleLogout = async () => {
    try {
      const userGroup = await AsyncStorage.getItem('user_group');


      await AsyncStorage.multiRemove(['access', 'refresh', 'user_id', 'user', 'user_group']);

      const remainingUserId = await AsyncStorage.getItem('user_id');
      console.log('User ID after logout:', remainingUserId); // Should be null

      navigation.navigate('authentication', { authpage: 'login' });

    } catch (error) {
      console.error('Error during logout:', error);
      navigation.navigate('authentication', { authpage: 'login' });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true); // Show the refresh spinner
    await refetch(); // Call the passed refresh function
    setRefreshing(false);
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#FF6E42']} />
      }>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Text style={styles.greeting}>
  {!isloggedin 
    ? 'Welcome!' 
    : profileLoading 
      ? 'Loading...' 
      : !profile 
        ? `Hello New User!` 
        : !profile.first_name && !profile.last_name 
          ? `Hello New User!` 
          : !profile.last_name 
            ? `Hello ${profile.first_name}!` 
            : !profile.first_name 
              ? `Hello ${profile.last_name}!` 
              : `Hello ${profile.first_name}!`
  }
</Text>

          {/* Avatar Container */}
          <View style={styles.avatarOuterContainer}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  profile && profile.profile_pic
                    ? { uri: `${TWIMBOL_API_CONFIG.BASE_URL}${profile.profile_pic}` }
                    : images.defaultProfilePic
                }
                style={styles.avatar}
              />
            </View>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>
            {!profile
              ? "User"
              : !profile.first_name && !profile.last_name
                ? "User X"
                : `${profile.first_name || ''}${profile.last_name ? ` ${profile.last_name}` : ''}`
            }
          </Text>
          <Text style={styles.userRole}>{isloggedin && profile ? `@${profile.username}` : "@username"}</Text>
        </View>

        {/* Profile Menu Options */}
        <View style={styles.menuContainer}>
          {/* Edit Profile */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('profile_edit' as never)}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name="account-edit-outline" size={24} color="white" />
            </View>
            <Text style={styles.menuText}>Edit Profile</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          {/* Apply for Creator */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleApplyCreator}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name="account-star-outline" size={24} color="white" />
            </View>
            <Text style={styles.menuText}>{usergroup == 'visitor' ? 'Apply for CREATOR' : 'Go to dashboard'}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          {/* Privacy & Policy */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePrivacyPolicy("https://rafidabdullahsamiweb.pythonanywhere.com/privacy-policy")}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name="shield-outline" size={24} color="white" />
            </View>
            <Text style={styles.menuText}>Privacy & Policy</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleSettingsPress()}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name="cog-outline" size={24} color="white" />
            </View>
            <Text style={styles.menuText}>Settings</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtonsContainer}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('(tabs)' as never)}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={isloggedin ? handleLogout : handleLogin}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name={isloggedin ? "logout" : "login"} size={20} color={isloggedin ? "#FF4D4D" : "#FF6E42"} style={styles.logoutIcon} />
            <Text style={isloggedin ? styles.logoutText : styles.loginText}>{isloggedin ? "Log out" : "Login"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    marginLeft: 10,
  },
  profileHeader: {
    backgroundColor: '#FF7751',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 60, // Space for avatar that extends below header
    height: 150,
  },
  greeting: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  avatarOuterContainer: {
    position: 'absolute',
    bottom: -50,
    alignSelf: 'center',
    borderRadius: 60,
    padding: 3,
    backgroundColor: 'white',
  },
  avatarContainer: {
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: '#FF9980',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    height: 90,
    width: 90,
    borderRadius: 45,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userRole: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  menuContainer: {
    marginHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  menuIconContainer: {
    backgroundColor: '#FF7751',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  bottomButtonsContainer: {
    marginHorizontal: 10,
    marginTop: 20,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 25,
    padding: 12,
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFDDDD',
    borderRadius: 25,
    padding: 12,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF4D4D',
  },
  loginText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6E42',
  },
});

export default Profile;