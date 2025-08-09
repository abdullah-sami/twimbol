import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Keyboard, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchLogin, fetchUserProfile } from '@/services/api';
import useFetch from '@/services/useFetch';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';




const Login = ({ handleRegisterPress }: { handleRegisterPress: any }) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [isUserFocused, setIsUserFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [issubmitting, setissubmitting] = useState(false)
  const [errrmsg, seterrrmsg] = useState('')
  const [successmsg, setsuccessmsg] = useState(null)


  const { data: authTokens, loading, error, reset, execute } = useFetch(() =>
    fetchLogin({
      username: user,
      password: password
    }), false)

  const { data: profile, loading: profileloading, error: profileerror, reset: profilereset, execute: profileexecute } = useFetch(() =>
    fetchUserProfile(), false)

  // Create refs for the input fields
  const userInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // const handlefoocus = () => {
  //   setIsEmailFocused(true);
  // }

  const router = useRouter();
  const navigation = useNavigation<NativeStackNavigationProp<any>>()


  useEffect(() => {
    const checkLoggedInStatus = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (userId) {
          navigation.navigate('profile' as never); // Navigate to profile if user_id exists
        } else {
          console.log('No user ID found');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoggedInStatus();
  }, [navigation]);



  useEffect(() => {
    // Clear any previous states when component loads
    seterrrmsg('');
    setsuccessmsg(null);

    // Only reset if the functions are available
    if (reset) {
      reset();
    }
    if (profilereset) {
      profilereset();
    }
  }, []);

  const handleLogin = async () => {
    setissubmitting(true);

    if (user === '' || password === '') {
      alert('Please fill in all fields');
      setissubmitting(false);
      return;
    }

    await execute({
      username: user,
      password: password,
    });



  };











  // Watch for when authTokens is populated
  useEffect(() => {
    const afterLogin = async () => {
      if (authTokens) {
        seterrrmsg(''); // Clear any error messages on success
        await AsyncStorage.setItem('access', authTokens.access);
        await AsyncStorage.setItem('refresh', authTokens.refresh);
        await AsyncStorage.setItem('user_id', authTokens.user.id.toString());

        setsuccessmsg('Login Successful!');

        // Now fetch the user profile
        profileexecute({});




      } else if (error) {
        setissubmitting(false);
        if (error instanceof Error) {
          seterrrmsg(error.message);
        } else {
          seterrrmsg('Login failed. Please try again.');
        }
      }
    };

    afterLogin();
  }, [authTokens, error]);



  // Use useEffect to monitor profile changes
  useEffect(() => {
    if (profile) {
      console.log('Profile data:', profile);

      // Store user group in AsyncStorage
      AsyncStorage.setItem('user_group', profile.user_group[0])
        .then(() => console.log('user_group stored successfully'))
        .catch((error) => console.error('Error storing user_group:', error));

      AsyncStorage.getItem('user_group').then((value) => console.log(value))

      // Navigate to profile page
      navigation.navigate('profile' as never);
    }
  }, [profile]);



  const forgotPasswordPress = () => {

    navigation.navigate('authentication', { authpage: 'forgotpassword' });
  }



  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Section with greeting */}
      <View style={styles.topSection}>
        <Text style={styles.greeting}>Hello !</Text>
        <Text style={styles.welcomeText}>Welcome to Twimbol</Text>
      </View>

      {/* Bottom Section with login form */}
      <View style={styles.bottomSection}>
        <Text style={styles.loginTitle}>Login</Text>



        {/* Email Input */}
        <View style={[
          styles.inputContainer,
          isUserFocused && styles.inputContainerFocused
        ]}>
          <MaterialCommunityIcons
            name="account"
            size={22}
            color={isUserFocused ? "#FF7751" : "#888"}
            style={styles.inputIcon}
          />
          <TextInput
            ref={userInputRef}
            style={styles.input}
            placeholder="Username"
            value={user}
            onChangeText={(text) => setUser(text)}
            autoCapitalize="none"
            // onFocus={() => setIsEmailFocused(true)}
            // onBlur={() => setIsEmailFocused(false)}
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current && passwordInputRef.current.focus()}
            blurOnSubmit={false}
          />
        </View>



        {/* Password Input */}
        <View style={[
          styles.inputContainer,
          isPasswordFocused && styles.inputContainerFocused
        ]}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={22}
            color={isPasswordFocused ? "#FF7751" : "#888"}
            style={styles.inputIcon}
          />
          <TextInput
            ref={passwordInputRef}
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={!passwordVisible}
            // onFocus={() => setIsPasswordFocused(true)}
            // onBlur={() => setIsPasswordFocused(false)}
            returnKeyType="done"
            // onSubmitEditing={handleLogin}
            autoCapitalize='none'
          />
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <MaterialCommunityIcons
              name={passwordVisible ? "eye-off-outline" : "eye-outline"}
              size={24}
              color={isPasswordFocused ? "#FF7751" : "#888"}
            />
          </TouchableOpacity>
        </View>


        {/* Message display */}
        {errrmsg && errrmsg.length > 0 && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errrmsg} Check username and password.</Text>
          </View>
        )}
        {successmsg && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{successmsg}</Text>
          </View>
        )}

        {/* Forgot Password Link */}
        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          activeOpacity={0.7}
          onPress={forgotPasswordPress}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={loading ? true : false}
        >
          {issubmitting == true ? (

            <ActivityIndicator size="small" color="#fff" />

          ) : (

            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>



        {/* Registration Option */}
        <View style={styles.registerContainer}>
          <Text style={styles.notRegisteredText}>Not registered yet?</Text>
          <TouchableOpacity
            onPress={handleRegisterPress}
            activeOpacity={0.7}
          >
            <Text style={styles.registerText}>Register</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF7751', // Orange background color
  },
  topSection: {
    flex: 2,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  greeting: {
    fontSize: 38,
    fontWeight: 'bold',
    color: 'white',
  },
  welcomeText: {
    fontSize: 24,
    color: 'white',
    marginTop: 8,
  },
  bottomSection: {
    flex: 3,
    backgroundColor: 'white',
    // borderTopLeftRadius: 30,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 150,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF7751',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 55,
  },
  inputContainerFocused: {
    borderColor: '#FF7751',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FF7751',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 55,
    color: '#333',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#FF7751',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#FF7751',
    borderRadius: 25,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },


  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
    marginTop: 50,
    marginBottom: 20,
    width: '75%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
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
  successContainer: {
    backgroundColor: '#E6FFED',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    textAlign: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  notRegisteredText: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  registerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF7751',
  },
});

export default Login;