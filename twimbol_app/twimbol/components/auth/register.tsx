import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Keyboard, ActivityIndicator, Alert, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchRegister } from '@/services/api';
import useFetch from '@/services/useFetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { DatePickerInput, formatDate } from '../time';

const Register = ({ handleLoginPress }: { handleLoginPress: any }) => {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState('');
  const [birthday, setBirthday] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isUserFocused, setIsUserFocused] = useState(false);
  const [isBirthdayFocused, setIsBirthdayFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const emailInputRef = useRef(null);
  const userInputRef = useRef(null);
  const birthdayInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const navigation = useNavigation();

  const { data: userData, loading, error, reset, execute } = useFetch(() =>
    fetchRegister({
      username: user,
      password: password,
      email: email,
      birthday: formatDate(birthday),
    }), false
  );


  // Form validation
  const validateForm = () => {
    if (!email || !user || !password || !confirmPassword || !birthday) {
      Alert.alert('Error', 'All fields are required');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignUp = () => {
    if (!validateForm()) return;

    // Execute with the registration parameters explicitly passed here
    execute({
      username: user,
      email: email,
      password: password,
      birthday: formatDate(birthday),
    });
    console.log('Registering user:', { username: user, email, password, birthday: formatDate(birthday) });
    Keyboard.dismiss();
  };

  // Show error message if registration fails
  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error.message || 'Please try again later');
    }
  }, [error]);

  // Navigate when userData is updated
  useEffect(() => {
    if (userData && userData.user) {
      Alert.alert(
        'Success',
        'Registration successful!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Explicitly navigate to login page
              handleLoginPress();
            }
          }
        ]
      );
    }
  }, [userData, handleLoginPress]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
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


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Top orange section */}
        <View style={styles.topSection} />

        {/* Main content section */}
        <View style={styles.contentSection}>
          <Text style={styles.signUpTitle}>Sign Up</Text>

          {/* Email Input */}
          <View style={[styles.inputContainer, isEmailFocused && styles.inputContainerFocused]}>
            <MaterialCommunityIcons
              name="email-outline"
              size={22}
              color={isEmailFocused ? '#FF7751' : '#888'}
              style={styles.inputIcon}
            />
            <TextInput
              ref={emailInputRef}
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              returnKeyType="next"
              onSubmitEditing={() => userInputRef.current && userInputRef.current.focus()}
              blurOnSubmit={false}
              editable={!loading}
            />
          </View>

          {/* Username Input */}
          <View style={[styles.inputContainer, isUserFocused && styles.inputContainerFocused]}>
            <MaterialCommunityIcons
              name="account"
              size={22}
              color={isUserFocused ? '#FF7751' : '#888'}
              style={styles.inputIcon}
            />
            <TextInput
              ref={userInputRef}
              style={styles.input}
              placeholder="Username"
              value={user}
              onChangeText={(text) => setUser(text)}
              autoCapitalize="none"
              onFocus={() => setIsUserFocused(true)}
              onBlur={() => setIsUserFocused(false)}
              returnKeyType="next"
              onSubmitEditing={() => birthdayInputRef.current && birthdayInputRef.current.focus()}
              blurOnSubmit={false}
              editable={!loading}
            />
          </View>

          {/* Birthday input */}
          <DatePickerInput
            birthday={birthday}
            setBirthday={setBirthday}
            isBirthdayFocused={isBirthdayFocused}
            setIsBirthdayFocused={setIsBirthdayFocused}
            styles={styles}
            loading={loading}
            passwordInputRef={passwordInputRef}
          />

          {/* Password Input */}
          <View style={[styles.inputContainer, isPasswordFocused && styles.inputContainerFocused]}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={22}
              color={isPasswordFocused ? '#FF7751' : '#888'}
              style={styles.inputIcon}
            />
            <TextInput
              ref={passwordInputRef}
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={!passwordVisible}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              returnKeyType="next"
              autoCapitalize="none"
              onSubmitEditing={() => confirmPasswordInputRef.current && confirmPasswordInputRef.current.focus()}
              blurOnSubmit={false}
              editable={!loading}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon} disabled={loading}>
              <MaterialCommunityIcons
                name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color={isPasswordFocused ? '#FF7751' : '#888'}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View style={[styles.inputContainer, isConfirmPasswordFocused && styles.inputContainerFocused]}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={22}
              color={isConfirmPasswordFocused ? '#FF7751' : '#888'}
              style={styles.inputIcon}
            />
            <TextInput
              ref={confirmPasswordInputRef}
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
              secureTextEntry={!confirmPasswordVisible}
              onFocus={() => setIsConfirmPasswordFocused(true)}
              onBlur={() => setIsConfirmPasswordFocused(false)}
              returnKeyType="done"
              autoCapitalize="none"
              onSubmitEditing={handleSignUp}
              editable={!loading}
            />
            <TouchableOpacity onPress={toggleConfirmPasswordVisibility} style={styles.eyeIcon} disabled={loading}>
              <MaterialCommunityIcons
                name={confirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color={isConfirmPasswordFocused ? '#FF7751' : '#888'}
              />
            </TouchableOpacity>
          </View>

          {/* Error message display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error.message || 'Registration failed. Please try again.'}</Text>
            </View>
          )}

          {/* Terms and Conditions */}
          <Text style={styles.termsText}>
            By registering, you agree to our{' '}
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



          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
            onPress={handleSignUp}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Login Option */}
          <View style={styles.loginContainer}>
            <Text style={styles.alreadyAccountText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLoginPress} disabled={loading}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF7751',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  topSection: {
    height: 150,
    backgroundColor: '#FF7751',
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 40,
    borderTopRightRadius: 30,
  },
  signUpTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF7751',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: '#FF7751',
    shadowColor: '#FF7751',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  eyeIcon: {
    padding: 5,
  },
  input: {
    flex: 1,
    height: 55,
    color: '#333',
    fontSize: 16,
  },
  signUpButton: {
    backgroundColor: '#FF7751',
    borderRadius: 25,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FF7751',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  signUpButtonDisabled: {
    backgroundColor: '#FFA78F',
    shadowOpacity: 0.1,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  alreadyAccountText: {
    fontSize: 14,
    color: '#666',
  },
  loginText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF7751',
  },
  errorContainer: {
    backgroundColor: '#FFE8E6',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 0,
  },
  terms: {
    color: '#FF6E42',
  },
});

export default Register;