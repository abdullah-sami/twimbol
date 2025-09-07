import React, { useState } from 'react';
import { View, StyleSheet, Text, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileEdit from '@/components/profile/prof_edit';
import { SafeAreaView } from 'react-native-safe-area-context';

// Storage key for parental controls password
const PARENT_PASSWORD_KEY = 'parent_password';

const Profile = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showParentalModal, setShowParentalModal] = useState<boolean>(false);
  const [showNoPasswordModal, setShowNoPasswordModal] = useState<boolean>(false);
  const [parentPassword, setParentPassword] = useState<string>('');
  const [isParentalVerified, setIsParentalVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useFocusEffect(
    React.useCallback(() => {
      const checkAuth = async () => {
        const userId = await AsyncStorage.getItem('user_id');
        const isAuthenticated = !!userId;
        setIsLoggedIn(isAuthenticated);

        if (!isAuthenticated) {
          navigation.replace('authentication', { authpage: 'login' });
        } else {
          // Check parental verification when screen is focused
          await checkParentalVerification();
        }
      };

      checkAuth();
    }, [navigation]) 
  );

  const checkParentalVerification = async () => {
    try {
      const storedPassword = await AsyncStorage.getItem(PARENT_PASSWORD_KEY);
      
      if (!storedPassword) {
        // No parental password set, show instruction modal
        setShowNoPasswordModal(true);
      } else {
        // Password is set, show verification modal
        setShowParentalModal(true);
      }
    } catch (error) {
      console.error('Error checking parental password:', error);
      Alert.alert('Error', 'Failed to check parental controls');
    }
  };

  const handleParentalVerification = async () => {
    if (!parentPassword.trim()) {
      Alert.alert('Error', 'Please enter the parent password');
      return;
    }

    setIsLoading(true);

    try {
      const storedPassword = await AsyncStorage.getItem(PARENT_PASSWORD_KEY);
      
      if (parentPassword === storedPassword) {
        setIsParentalVerified(true);
        setShowParentalModal(false);
        setParentPassword('');
        Alert.alert('Success', 'Profile editing unlocked');
      } else {
        Alert.alert('Error', 'Incorrect parent password');
        setParentPassword('');
      }
    } catch (error) {
      console.error('Error verifying parent password:', error);
      Alert.alert('Error', 'Failed to verify password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToSettings = () => {
    setShowNoPasswordModal(false);
    // Navigate to settings or parental controls screen
    navigation.navigate('settings'); // Adjust the route name as needed
  };

  const handleCancel = () => {
    setShowParentalModal(false);
    setShowNoPasswordModal(false);
    setParentPassword('');
    navigation.goBack(); // Go back to previous screen
  };

  if (!isLoggedIn) {
    return null;
  }

  // If parental verification is not complete, don't show the profile edit
  if (!isParentalVerified) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Checking parental permissions...</Text>
        </View>

        {/* Parental Password Modal */}
        <Modal visible={showParentalModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Parental Verification Required</Text>
              <Text style={styles.modalText}>
                Please enter the parent password to update your profile:
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter parent password"
                value={parentPassword}
                onChangeText={setParentPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={handleCancel}
                  disabled={isLoading}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonPrimary]} 
                  onPress={handleParentalVerification}
                  disabled={isLoading}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* No Password Set Modal */}
        <Modal visible={showNoPasswordModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>🔒 Parent Approval Required</Text>
              <Text style={styles.modalText}>
                You need parent approval to update your profile.
              </Text>
              <Text style={styles.modalInstructions}>
                Please ask your parent or guardian to:
                {'\n'}• Go to Settings
                {'\n'}• Open Parental Controls
                {'\n'}• Set up a parent password
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={handleCancel}
                >
                  <Text style={styles.modalButtonText}>Go Back</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonPrimary]} 
                  onPress={handleGoToSettings}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                    Go to Settings
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right", "bottom"]}>
      <ProfileEdit />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'left',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  modalButtonPrimary: {
    backgroundColor: '#FF6E42',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalButtonTextPrimary: {
    color: 'white',
    fontWeight: '600',
  },
});

export default Profile;