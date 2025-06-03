import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Keyboard, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';


const ForgotPassword = ({handleBackToLogin}:any) => {
  const [email, setEmail] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  
  // Create ref for the input field
  const emailInputRef = useRef(null);

  const handleResetPassword = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    
    // Implement password reset functionality here
    console.log('Password reset requested for:', email);
    Alert.alert(
      "Password Reset Sent",
      "If an account exists with this email, you will receive password reset instructions.",
      [{ text: "OK" }]
    );
    Keyboard.dismiss();
  };

  

  return (

    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Top orange section */}
        <View style={styles.topSection}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToLogin}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Main content section */}
        <View style={styles.contentSection}>
          <Text style={styles.forgotPasswordTitle}>Forgot Password</Text>
          
          <Text style={styles.instructionText}>
            Enter your email address below and we'll send you instructions to reset your password.
          </Text>
          
          {/* Email Input */}
          <View style={[
            styles.inputContainer, 
            isEmailFocused && styles.inputContainerFocused
          ]}>
            <MaterialCommunityIcons 
              name="email-outline" 
              size={22} 
              color={isEmailFocused ? "#FF7751" : "#888"} 
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
              returnKeyType="done"
              onSubmitEditing={handleResetPassword}
            />
          </View>
          
          {/* Reset Password Button */}
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={handleResetPassword}
            activeOpacity={0.8}
          >
            <Text style={styles.resetButtonText}>Reset Password</Text>
          </TouchableOpacity>
          
          {/* Back to Login Option */}
          <View style={styles.backToLoginContainer}>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  topSection: {
    height: 120,
    backgroundColor: '#FF7751',
    borderBottomRightRadius: 50,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'flex-start',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 40,
  },
  forgotPasswordTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF7751',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    marginBottom: 30,
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
  input: {
    flex: 1,
    height: 55,
    color: '#333',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#FF7751',
    borderRadius: 25,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF7751',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backToLoginContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF7751',
  },
});

export default ForgotPassword;