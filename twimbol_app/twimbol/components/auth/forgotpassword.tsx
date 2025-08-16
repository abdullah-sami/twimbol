import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Keyboard, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TWIMBOL_API_CONFIG } from '@/services/api';

interface ForgotPasswordProps {
}

import { useNavigation } from '@react-navigation/native';
const ForgotPassword: React.FC<ForgotPasswordProps> = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Code & Password
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isCodeFocused, setIsCodeFocused] = useState(false);
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleBackToLogin = () => {
    navigation.navigate('authentication' as never, { authpage: 'login' });
  };


  // Create refs for input fields
  const emailInputRef = useRef<TextInput>(null);
  const codeInputRef = useRef<TextInput>(null);
  const newPasswordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);


  const handleRequestResetCode = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${TWIMBOL_API_CONFIG.BASE_URL}/user/forgot-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Reset Code Sent",
          "A 6-digit reset code has been sent to your email. Please check your inbox.",
          [{ text: "OK" }]
        );
        setStep(2);
        Keyboard.dismiss();
      } else {
        Alert.alert("Error", data.detail || "Failed to send reset code. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please check your connection and try again.");
      console.error('Password reset request error:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleResetPassword = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter the reset code");
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert("Error", "Please enter your new password");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${TWIMBOL_API_CONFIG.BASE_URL}/user/reset-password-confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          code: code.trim(),
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Password Reset Successful",
          "Your password has been reset successfully. Please login with your new password.",
          [
            {
              text: "OK",
              onPress: handleBackToLogin
            }
          ]
        );
      } else {
        Alert.alert("Error", data.detail || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please check your connection and try again.");
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmailStep = () => {
    setStep(1);
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const renderEmailStep = () => (
    <>
      <Text style={styles.title}>Forgot Password</Text>

      <Text style={styles.instructionText}>
        Enter your email address below and we'll send you a 6-digit reset code.
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
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => setIsEmailFocused(true)}
          onBlur={() => setIsEmailFocused(false)}
          returnKeyType="done"
          onSubmitEditing={handleRequestResetCode}
          editable={!loading}
        />
      </View>

      {/* Send Code Button */}
      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleRequestResetCode}
        activeOpacity={0.8}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'Sending...' : 'Send Reset Code'}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderCodeAndPasswordStep = () => (
    <>
      <Text style={styles.title}>Enter Reset Code</Text>

      <Text style={styles.instructionText}>
        We've sent a 6-digit code to {email}. Enter the code and your new password below.
      </Text>

      {/* Reset Code Input */}
      <View style={[
        styles.inputContainer,
        isCodeFocused && styles.inputContainerFocused
      ]}>
        <MaterialCommunityIcons
          name="shield-key-outline"
          size={22}
          color={isCodeFocused ? "#FF7751" : "#888"}
          style={styles.inputIcon}
        />
        <TextInput
          ref={codeInputRef}
          style={styles.input}
          placeholder="6-digit code"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={6}
          onFocus={() => setIsCodeFocused(true)}
          onBlur={() => setIsCodeFocused(false)}
          returnKeyType="next"
          onSubmitEditing={() => newPasswordInputRef.current?.focus()}
          editable={!loading}
        />
      </View>

      {/* New Password Input */}
      <View style={[
        styles.inputContainer,
        isNewPasswordFocused && styles.inputContainerFocused
      ]}>
        <MaterialCommunityIcons
          name="lock-outline"
          size={22}
          color={isNewPasswordFocused ? "#FF7751" : "#888"}
          style={styles.inputIcon}
        />
        <TextInput
          ref={newPasswordInputRef}
          style={styles.input}
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNewPassword}
          onFocus={() => setIsNewPasswordFocused(true)}
          onBlur={() => setIsNewPasswordFocused(false)}
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
          editable={!loading}
        />
        <TouchableOpacity
          onPress={() => setShowNewPassword(!showNewPassword)}
          style={styles.eyeIcon}
        >
          <MaterialCommunityIcons
            name={showNewPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password Input */}
      <View style={[
        styles.inputContainer,
        isConfirmPasswordFocused && styles.inputContainerFocused
      ]}>
        <MaterialCommunityIcons
          name="lock-check-outline"
          size={22}
          color={isConfirmPasswordFocused ? "#FF7751" : "#888"}
          style={styles.inputIcon}
        />
        <TextInput
          ref={confirmPasswordInputRef}
          style={styles.input}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          onFocus={() => setIsConfirmPasswordFocused(true)}
          onBlur={() => setIsConfirmPasswordFocused(false)}
          returnKeyType="done"
          onSubmitEditing={handleResetPassword}
          editable={!loading}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.eyeIcon}
        >
          <MaterialCommunityIcons
            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      {/* Password Requirements */}
      <Text style={styles.passwordRequirements}>
        Password must be at least 8 characters long
      </Text>

      {/* Reset Password Button */}
      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        activeOpacity={0.8}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>

      {/* Back to Email Step */}
      <View style={styles.secondaryActionContainer}>
        <TouchableOpacity onPress={handleBackToEmailStep} disabled={loading}>
          <Text style={styles.secondaryActionText}>Use different email</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Top orange section */}
        <View style={styles.topSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={step === 1 ? handleBackToLogin : handleBackToEmailStep}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Main content section */}
        <View style={styles.contentSection}>
          {step === 1 ? renderEmailStep() : renderCodeAndPasswordStep()}

          {/* Back to Login Option */}
          <View style={styles.backToLoginContainer}>
            <TouchableOpacity onPress={handleBackToLogin} disabled={loading}>
              <Text style={styles.backToLoginText}>Back to Login</Text>
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
  title: {
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
    marginBottom: 15,
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
  eyeIcon: {
    padding: 5,
  },
  passwordRequirements: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  primaryButton: {
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
    marginTop: 15,
  },
  buttonDisabled: {
    backgroundColor: '#FFB399',
    shadowOpacity: 0.1,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryActionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textDecorationLine: 'underline',
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