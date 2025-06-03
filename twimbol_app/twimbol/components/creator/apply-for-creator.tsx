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
  const { data: applicationStatus, refetch: refetchStatus, execute: executeStatus } = useFetch(
    () => (userId ? fetchCreatorApplicationStatus(userId) : Promise.resolve(null)),
    false // Prevent automatic execution
  );

  // Fetch userId from AsyncStorage and trigger application status fetch
  useEffect(() => {
    const checkUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
          setUserId(storedUserId);
          executeStatus(); // Fetch application status immediately
        } else {
          console.error('User ID not found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error retrieving user ID:', error);
      }
    };

    checkUserId();
  }, [executeStatus]);

  // Fetch creator application data only when userId is available
  const { data: application, refetch, execute } = useFetch(
    () => (userId ? fetchCreatorApplication(userId) : Promise.resolve(null)),
    false // Prevent automatic execution
  );

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
        await execute({});
        await executeStatus({});

        if (application && application.detail === 'Creator application submitted successfully.') {
          Alert.alert(
            'Application Submitted',
            'Your creator application has been submitted successfully. We will review your information and get back to you soon.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert(
            'Something went wrong!',
            "We couldn't process your application",
            [{ text: 'OK', onPress: () => {} }]
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

            {applicationStatus && applicationStatus.application_status === '0' ? (
              <>
                <Text>You have already applied for creator.</Text>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.applyButton, isSubmitting && styles.disabledButton]}
                  onPress={() => {
                    navigation.navigate('profile_edit' as never);
                  }}
                >
                  <Text style={styles.applyButtonText}>Complete your profile</Text>
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
              onPress={() => {
                navigation.navigate('terms_of_service' as never);
              }}
            >
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text
              style={[styles.termsText, styles.terms]}
              onPress={() => {
                navigation.navigate('creator_guidelines' as never);
              }}
            >
              Creator Guidelines
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
  applyButton: {
    backgroundColor: '#FF6E42',
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