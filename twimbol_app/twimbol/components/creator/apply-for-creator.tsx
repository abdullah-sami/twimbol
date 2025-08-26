import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking
} from 'react-native';
import { ChevronLeft, AlertTriangle } from 'lucide-react-native';
import { useNavigation } from 'expo-router';
import { fetchCreatorApplication, fetchCreatorApplicationStatus } from '@/services/api';
import useFetch from '@/services/useFetch';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ApplyForCreator = () => {
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // Fetch creator application status only when userId is available
  const { 
    data: applicationStatus, 
    refetch: refetchStatus, 
    execute: executeStatus, 
    loading: statusLoading,
    error: statusError 
  } = useFetch(
    () => (userId ? fetchCreatorApplicationStatus(userId) : Promise.resolve(null)),
    false // Prevent automatic execution
  );

  // Fetch creator application data only when userId is available
  const { data: application, refetch, execute } = useFetch(
    () => (userId ? fetchCreatorApplication(userId) : Promise.resolve(null)),
    false // Prevent automatic execution
  );

  // Fetch userId from AsyncStorage and trigger application status fetch
  useEffect(() => {
    const checkUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        console.log('User ID from AsyncStorage:', storedUserId); // Debug log
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          console.error('User ID not found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error retrieving user ID:', error);
      }
    };

    checkUserId();
  }, []);

  // Execute status check when userId is available - FIXED: Added executeStatus to dependency array
  useEffect(() => {
    if (userId) {
      console.log('Executing status check for userId:', userId); // Debug log
      executeStatus();
    }
  }, [userId, executeStatus]); // Added executeStatus to dependencies

  // Debug log for application status
  useEffect(() => {
    console.log('Application status data:', applicationStatus); // Debug log
    console.log('Status loading:', statusLoading); // Debug log
    console.log('Status error:', statusError); // Debug log
  }, [applicationStatus, statusLoading, statusError]);

  // ADDED: Auto-fetch status when component mounts and userId is ready
  useEffect(() => {
    const initializePage = async () => {
      if (userId) {
        console.log('Auto-fetching application status on page load');
        await executeStatus();
      }
    };

    initializePage();
  }, [userId]); // Only depend on userId to avoid infinite loops

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (userId) {
        await refetchStatus(); // Refresh application status
        await refetch(); // Refresh application data
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (userId) {
        const result = await execute({});
        
        // FIXED: Ensure status is refreshed after submission
        console.log('Application submitted, refreshing status...');
        await executeStatus();
        
        // Add a small delay to ensure the backend has processed the submission
        setTimeout(async () => {
          await executeStatus();
          console.log('Status refreshed after delay');
        }, 1000);

        if (result && result.detail === 'Creator application submitted successfully.') {
          Alert.alert(
            'Application Submitted',
            'Your creator application has been submitted successfully. We will review your information and get back to you soon.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert(
            'Something went wrong!',
            "We couldn't process your application",
            [{ text: 'OK', onPress: () => { } }]
          );
        }
      } else {
        Alert.alert('Error', 'User ID is not available. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit your application. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle URL opening
  const openURL = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    } catch (error) {
      console.error('An error occurred', error);
    }
  };

  // More robust check for application status
  const hasAlreadyApplied = () => {
    if (!applicationStatus) return false;
    
    // Check different possible status indicators
    if (applicationStatus.application_status === '0') return true;
    if (applicationStatus.application_status === 0) return true;
    if (applicationStatus.status === 'pending') return true;
    if (applicationStatus.status === 'submitted') return true;
    if (applicationStatus.has_applied === true) return true;
    
    return false;
  };

  const getApplicationStatusText = () => {
    if (!applicationStatus) return null;
    
    const status = applicationStatus.application_status || applicationStatus.status;
    
    switch (status) {
      case '0':
      case 0:
      case 'pending':
      case 'submitted':
        return {
          title: "Application Submitted",
          subtitle: "We are reviewing your application and will get back to you soon."
        };
      case '1':
      case 1:
      case 'approved':
        return {
          title: "Application Approved",
          subtitle: "Congratulations! Your creator application has been approved."
        };
      case '2':
      case 2:
      case 'rejected':
        return {
          title: "Application Rejected",
          subtitle: "Unfortunately, your application was not approved. You can apply again."
        };
      default:
        return {
          title: "Application Submitted",
          subtitle: "We are reviewing your application and will get back to you soon."
        };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#FF6E42']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Apply for Creator</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Not Allowed Section */}
          <View style={styles.notAllowedContainer}>
            <View style={styles.alertIconContainer}>
              <AlertTriangle size={32} color="#fff" />
            </View>
            <Text style={styles.notAllowedText}>Not Allowed</Text>
            <Text style={styles.notAllowedDescription}>
              You have to be a creator to access the dashboard.
            </Text>
          </View>

          {/* Application Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Creator Application</Text>

            {statusLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FF6E42" />
                <Text style={styles.loadingText}>Checking application status...</Text>
              </View>
            ) : statusError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error loading application status</Text>
                <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={() => executeStatus()}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : hasAlreadyApplied() ? (
              <View style={styles.alreadyAppliedContainer}>
                <Text style={styles.alreadyAppliedText}>
                  {getApplicationStatusText()?.title || "Application Submitted"}
                </Text>
                <Text style={styles.alreadyAppliedSubtext}>
                  {getApplicationStatusText()?.subtitle || "We are reviewing your application."}
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.completeProfileButton, isSubmitting && styles.disabledButton]}
                  onPress={() => {
                    navigation.navigate('profile_edit' as never);
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.completeProfileButtonText}>Complete your profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.applyButton, isSubmitting && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.applyButtonText}>Submit Application</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Terms and Conditions */}
          <Text style={styles.termsText}>
            By applying, you agree to our{' '}
            <Text
              style={[styles.termsText, styles.terms]}
              onPress={() => openURL('https://rafidabdullahsamiweb.pythonanywhere.com/privacy-policy/')}
            >
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text
              style={[styles.termsText, styles.terms]}
              onPress={() => openURL('https://rafidabdullahsamiweb.pythonanywhere.com/privacy-policy/')}
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6E42',
    paddingVertical: 32,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  notAllowedContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  alertIconContainer: {
    backgroundColor: '#FF6E42',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  notAllowedText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notAllowedDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#FF6E42',
    fontSize: 14,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#FF6E42',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  alreadyAppliedContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  alreadyAppliedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6E42',
    textAlign: 'center',
    marginBottom: 8,
  },
  alreadyAppliedSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: '#FF6E42',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  completeProfileButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ffaa9a',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completeProfileButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  terms: {
    color: '#FF6E42',
  },
});

export default ApplyForCreator;