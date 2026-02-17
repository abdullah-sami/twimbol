import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    Modal,
    Switch,
    FlatList,
    Platform,
    ActivityIndicator,
    KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TWIMBOL_API_CONFIG } from '@/services/api';

// Storage Keys
const STORAGE_KEYS = {
    PARENT_PASSWORD: 'parent_password',
    PARENT_ACCOUNT_ADDED: 'Parent_Account_Added',
    PARENT_EMAIL: 'parent_email',
    CHILD_ID: 'user_id', 
    TIME_LIMITS: 'time_limits',
    TIME_RESTRICTIONS: 'time_restrictions',
    CONTENT_FILTERS: 'content_filters',
    WATCH_HISTORY: 'watch_history',
    BLOCKED_USERS: 'blocked_users',
    DAILY_USAGE: 'daily_usage',
};

// API Configuration
const API_BASE_URL = TWIMBOL_API_CONFIG.BASE_URL; // Replace with your actual API base URL

// API Helper Functions
const requestOTP = async (childId, parentEmail) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/parent/request_otp/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                child_id: childId,
                parent_email: parentEmail,
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        return { success: false, error: 'Network error. Please try again.' };
    }
};

const verifyOTP = async (childId, parentEmail, otpCode) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/parent/verify_otp/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                child_id: childId,
                parent_email: parentEmail,
                otp_code: otpCode,
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        return { success: false, error: 'Network error. Please try again.' };
    }
};

// Parent Account Linking Component
const ParentAccountLinking = ({ onAccountLinked }) => {
    const [currentStep, setCurrentStep] = useState('email'); // 'email' or 'otp'
    const [parentEmail, setParentEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [childId, setChildId] = useState(null);

    useEffect(() => {
        loadChildId();
    }, []);

    const loadChildId = async () => {
        try {
            const id = await AsyncStorage.getItem(STORAGE_KEYS.CHILD_ID);
            if (id) {
                setChildId(parseInt(id));
            } else {
                // If child_id is not stored, you might need to get it from your user session
                // For now, setting a placeholder - replace with actual implementation
                Alert.alert('Error', 'Child ID not found. Please log in again.');
            }
        } catch (error) {
            console.error('Error loading child ID:', error);
        }
    };

    const handleRequestOTP = async () => {
        if (!parentEmail.trim()) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        if (!childId) {
            Alert.alert('Error', 'Child ID not found. Please try again.');
            return;
        }

        setLoading(true);
        const result = await requestOTP(childId, parentEmail.trim());
        setLoading(false);

        if (result.success) {
            Alert.alert('Success', result.message);
            setCurrentStep('otp');
        } else {
            Alert.alert('Error', result.error);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otpCode.trim() || otpCode.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        const result = await verifyOTP(childId, parentEmail.trim(), otpCode.trim());
        setLoading(false);

        if (result.success) {
            try {
                // Save parent account linking status
                await AsyncStorage.setItem(STORAGE_KEYS.PARENT_ACCOUNT_ADDED, 'true');
                await AsyncStorage.setItem(STORAGE_KEYS.PARENT_EMAIL, parentEmail.trim());
                
                Alert.alert('Success', 'Parent account linked successfully!');
                onAccountLinked();
            } catch (error) {
                Alert.alert('Error', 'Failed to save account information');
            }
        } else {
            Alert.alert('Error', result.error);
        }
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    if (currentStep === 'email') {
        return (
            <View style={styles.linkingContainer}>
                <Text style={styles.title}>Link Parent Account</Text>
                <Text style={styles.subtitle}>
                    Please enter your email address to receive an OTP for verification
                </Text>

                <TextInput
                    style={styles.emailInput}
                    placeholder="Enter parent email address"
                    value={parentEmail}
                    onChangeText={setParentEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <TouchableOpacity 
                    style={[
                        styles.primaryButton, 
                        (!isValidEmail(parentEmail) || loading) && styles.disabledButton
                    ]} 
                    onPress={handleRequestOTP}
                    disabled={!isValidEmail(parentEmail) || loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.primaryButtonText}>Send OTP</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.infoText}>
                    An OTP will be sent to your email for verification
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.linkingContainer}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
                Please enter the 6-digit OTP sent to {parentEmail}
            </Text>

            <TextInput
                style={styles.otpInput}
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="numeric"
                maxLength={6}
                textAlign="center"
            />

            <TouchableOpacity 
                style={[
                    styles.primaryButton,
                    (otpCode.length !== 6 || loading) && styles.disabledButton
                ]} 
                onPress={handleVerifyOTP}
                disabled={otpCode.length !== 6 || loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Text style={styles.primaryButtonText}>Verify OTP</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setCurrentStep('email')}
                disabled={loading}
            >
                <Text style={styles.secondaryButtonText}>Change Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleRequestOTP}
                disabled={loading}
            >
                <Text style={styles.secondaryButtonText}>Resend OTP</Text>
            </TouchableOpacity>
        </View>
    );
};

// Main Parental Controls Component
const ParentalControlsMain = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentView, setCurrentView] = useState('main');
    const [passwordSet, setPasswordSet] = useState(false);
    const [parentAccountAdded, setParentAccountAdded] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);

    useEffect(() => {
        checkParentalStatus();
    }, []);

    const checkParentalStatus = async () => {
        try {
            const [password, accountAdded] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.PARENT_PASSWORD),
                AsyncStorage.getItem(STORAGE_KEYS.PARENT_ACCOUNT_ADDED)
            ]);
            
            setPasswordSet(!!password);
            setParentAccountAdded(accountAdded === 'true');
        } catch (error) {
            console.error('Error checking parental status:', error);
            setPasswordSet(false);
            setParentAccountAdded(false);
        } finally {
            setIsCheckingStatus(false);
        }
    };

    const renderCurrentView = () => {
        // Show loading while checking status
        if (isCheckingStatus) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0066cc" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            );
        }

        // If parent account is not linked, show linking screen
        if (!parentAccountAdded) {
            return (
                <ParentAccountLinking 
                    onAccountLinked={() => setParentAccountAdded(true)}
                />
            );
        }

        // If not authenticated, show password screen
        if (!isAuthenticated) {
            return (
                <PasswordScreen
                    passwordSet={passwordSet}
                    onAuthenticated={() => setIsAuthenticated(true)}
                    onPasswordSet={() => {
                        setPasswordSet(true);
                        setIsAuthenticated(true);
                    }}
                />
            );
        }

        // Show main menu or sub-screens
        switch (currentView) {
            case 'settings':
                return <ParentalSettingsMenu onBack={() => setCurrentView('main')} />;
            case 'history':
                return <WatchHistoryComponent onBack={() => setCurrentView('main')} />;
            case 'blocked':
                return <BlockedUsersComponent onBack={() => setCurrentView('main')} />;
            default:
                return <MainMenu onNavigate={setCurrentView} />;
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView
                style={[styles.container, { flex: 1, backgroundColor: "#fff" }]}
                edges={["top", "left", "right"]}
            >
                {renderCurrentView()}
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

// Password Screen Component
const PasswordScreen = ({ passwordSet, onAuthenticated, onPasswordSet }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSettingPassword, setIsSettingPassword] = useState(!passwordSet);

    const handlePasswordSubmit = async () => {
        if (isSettingPassword) {
            if (password.length < 4) {
                Alert.alert('Error', 'Password must be at least 4 characters long');
                return;
            }
            if (password !== confirmPassword) {
                Alert.alert('Error', 'Passwords do not match');
                return;
            }
            try {
                await AsyncStorage.setItem(STORAGE_KEYS.PARENT_PASSWORD, password);
                onPasswordSet();
                onAuthenticated();
            } catch (error) {
                Alert.alert('Error', 'Failed to save password');
            }
        } else {
            try {
                const storedPassword = await AsyncStorage.getItem(STORAGE_KEYS.PARENT_PASSWORD);
                if (password === storedPassword) {
                    onAuthenticated();
                } else {
                    Alert.alert('Error', 'Incorrect password');
                    setPassword('');
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to verify password');
            }
        }
    };

    return (
        <View style={styles.passwordContainer}>
            <Text style={styles.title}>
                {isSettingPassword ? 'Set Parental Password' : 'Enter Parental Password'}
            </Text>

            <TextInput
                style={styles.passwordInput}
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                maxLength={20}
            />

            {isSettingPassword && (
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    maxLength={20}
                />
            )}

            <TouchableOpacity style={styles.primaryButton} onPress={handlePasswordSubmit}>
                <Text style={styles.primaryButtonText}>
                    {isSettingPassword ? 'Set Password' : 'Enter'}
                </Text>
            </TouchableOpacity>

            {passwordSet && isSettingPassword && (
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setIsSettingPassword(false)}
                >
                    <Text style={styles.secondaryButtonText}>I already have a password</Text>
                </TouchableOpacity>
            )}

            {passwordSet && !isSettingPassword && (
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setIsSettingPassword(true)}
                >
                    <Text style={styles.secondaryButtonText}>Reset Password</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

// Main Menu Component
const MainMenu = ({ onNavigate }) => {
    return (
        <View style={styles.menuContainer}>
            <Text style={styles.title}>Parental Controls</Text>

            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => onNavigate('settings')}
            >
                <Text style={styles.menuItemText}>⚙️ Settings & Controls</Text>
                <Text style={styles.menuItemSubtext}>Time limits, restrictions, content filters</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => onNavigate('history')}
            >
                <Text style={styles.menuItemText}>📺 Watch History</Text>
                <Text style={styles.menuItemSubtext}>View your child's activity</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => onNavigate('blocked')}
            >
                <Text style={styles.menuItemText}>🚫 Blocked Users</Text>
                <Text style={styles.menuItemSubtext}>Manage blocked accounts</Text>
            </TouchableOpacity>
        </View>
    );
};

// Parental Settings Menu Component
const ParentalSettingsMenu = ({ onBack }) => {
    const [timeLimitEnabled, setTimeLimitEnabled] = useState(false);
    const [dailyLimit, setDailyLimit] = useState('180');
    const [bedtimeEnabled, setBedtimeEnabled] = useState(false);
    const [bedtimeStart, setBedtimeStart] = useState('21:00');
    const [bedtimeEnd, setBedtimeEnd] = useState('07:00');
    const [contentFilters, setContentFilters] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const timeLimits = await AsyncStorage.getItem(STORAGE_KEYS.TIME_LIMITS);
            const timeRestrictions = await AsyncStorage.getItem(STORAGE_KEYS.TIME_RESTRICTIONS);
            const filters = await AsyncStorage.getItem(STORAGE_KEYS.CONTENT_FILTERS);

            if (timeLimits) {
                const limits = JSON.parse(timeLimits);
                setTimeLimitEnabled(limits.enabled);
                setDailyLimit(limits.dailyLimit.toString());
            }

            if (timeRestrictions) {
                const restrictions = JSON.parse(timeRestrictions);
                setBedtimeEnabled(restrictions.enabled);
                setBedtimeStart(restrictions.startTime);
                setBedtimeEnd(restrictions.endTime);
            }

            if (filters) {
                const filterData = JSON.parse(filters);
                setContentFilters(filterData.keywords.join(', '));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const saveTimeLimits = async () => {
        try {
            const limits = {
                enabled: timeLimitEnabled,
                dailyLimit: parseInt(dailyLimit) || 180,
            };
            await AsyncStorage.setItem(STORAGE_KEYS.TIME_LIMITS, JSON.stringify(limits));
            Alert.alert('Success', 'Time limits saved');
        } catch (error) {
            Alert.alert('Error', 'Failed to save time limits');
        }
    };

    const saveTimeRestrictions = async () => {
        try {
            const restrictions = {
                enabled: bedtimeEnabled,
                startTime: bedtimeStart,
                endTime: bedtimeEnd,
            };
            await AsyncStorage.setItem(STORAGE_KEYS.TIME_RESTRICTIONS, JSON.stringify(restrictions));
            Alert.alert('Success', 'Bedtime restrictions saved');
        } catch (error) {
            Alert.alert('Error', 'Failed to save bedtime restrictions');
        }
    };

    const saveContentFilters = async () => {
        try {
            const keywords = contentFilters
                .split(',')
                .map(keyword => keyword.trim())
                .filter(keyword => keyword.length > 0);

            const filters = { keywords };
            await AsyncStorage.setItem(STORAGE_KEYS.CONTENT_FILTERS, JSON.stringify(filters));
            Alert.alert('Success', 'Content filters saved');
        } catch (error) {
            Alert.alert('Error', 'Failed to save content filters');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
                keyboardShouldPersistTaps="handled"
                style={styles.settingsContainer}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Settings & Controls</Text>
                </View>

                {/* Time Limits Section */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>⏰ Daily Time Limits</Text>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Enable Time Limits</Text>
                        <Switch
                            value={timeLimitEnabled}
                            onValueChange={setTimeLimitEnabled}
                            trackColor={{ false: '#E0E0E0', true: '#FF6E42' }}
                            thumbColor={timeLimitEnabled ? '#FFFFFF' : '#F4F3F4'}
                        />
                    </View>

                    {timeLimitEnabled && (
                        <>
                            <View style={styles.settingRow}>
                                <Text style={styles.settingLabel}>Daily Limit (minutes)</Text>
                                <TextInput
                                    style={styles.numberInput}
                                    value={dailyLimit}
                                    onChangeText={setDailyLimit}
                                    keyboardType="numeric"
                                    placeholder="180"
                                />
                            </View>
                            <TouchableOpacity style={styles.saveButton} onPress={saveTimeLimits}>
                                <Text style={styles.saveButtonText}>Save Time Limits</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Bedtime Restrictions Section */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>🌙 Bedtime Restrictions</Text>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Enable Bedtime Mode</Text>
                        <Switch
                            value={bedtimeEnabled}
                            onValueChange={setBedtimeEnabled}
                            trackColor={{ false: '#E0E0E0', true: '#FF6E42' }}
                            thumbColor={bedtimeEnabled ? '#FFFFFF' : '#F4F3F4'}
                        />
                    </View>

                    {bedtimeEnabled && (
                        <>
                            <View style={styles.settingRow}>
                                <Text style={styles.settingLabel}>Bedtime Start</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={bedtimeStart}
                                    onChangeText={setBedtimeStart}
                                    placeholder="21:00"
                                />
                            </View>
                            <View style={styles.settingRow}>
                                <Text style={styles.settingLabel}>Wake Up Time</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={bedtimeEnd}
                                    onChangeText={setBedtimeEnd}
                                    placeholder="07:00"
                                />
                            </View>
                            <TouchableOpacity style={styles.saveButton} onPress={saveTimeRestrictions}>
                                <Text style={styles.saveButtonText}>Save Bedtime Settings</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Content Filters Section */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>🔍 Content Filters</Text>
                    <Text style={styles.settingDescription}>
                        Enter keywords to filter out content (separated by commas)
                    </Text>

                    <TextInput
                        style={styles.filtersInput}
                        value={contentFilters}
                        onChangeText={setContentFilters}
                        placeholder="inappropriate, violence, scary"
                        multiline
                        autoCapitalize='none'
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                    <TouchableOpacity style={styles.saveButton} onPress={saveContentFilters}>
                        <Text style={styles.saveButtonText}>Save Content Filters</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// Watch History Component
const WatchHistoryComponent = ({ onBack }) => {
    const [watchHistory, setWatchHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWatchHistory();
    }, []);

    const loadWatchHistory = async () => {
        try {
            const history = await AsyncStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
            if (history) {
                setWatchHistory(JSON.parse(history));
            }
        } catch (error) {
            console.error('Error loading watch history:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = async () => {
        Alert.alert(
            'Clear History',
            'Are you sure you want to clear all watch history?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem(STORAGE_KEYS.WATCH_HISTORY);
                            setWatchHistory([]);
                            Alert.alert('Success', 'Watch history cleared');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear history');
                        }
                    },
                },
            ]
        );
    };

    const renderHistoryItem = ({ item }) => (
        <View style={styles.historyItem}>
            <Text style={styles.historyTitle}>{item.title}</Text>
            <Text style={styles.historyCreator}>@{item.creator}</Text>
            <Text style={styles.historyTime}>{new Date(item.timestamp).toLocaleString()}</Text>
            <Text style={styles.historyDuration}>Watched: {item.watchDuration}s</Text>
        </View>
    );

    return (
        <View style={styles.historyContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Watch History</Text>
                <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text>Loading...</Text>
                </View>
            ) : watchHistory.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No watch history yet</Text>
                </View>
            ) : (
                <FlatList
                    data={watchHistory}
                    renderItem={renderHistoryItem}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    contentContainerStyle={styles.historyList}
                />
            )}
        </View>
    );
};

// Blocked Users Component
const BlockedUsersComponent = ({ onBack }) => {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [newUsername, setNewUsername] = useState('');

    useEffect(() => {
        loadBlockedUsers();
    }, []);

    const loadBlockedUsers = async () => {
        try {
            const blocked = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_USERS);
            if (blocked) {
                setBlockedUsers(JSON.parse(blocked));
            }
        } catch (error) {
            console.error('Error loading blocked users:', error);
        }
    };

    const addBlockedUser = async () => {
        if (!newUsername.trim()) return;

        const newUser = {
            id: Date.now().toString(),
            username: newUsername.trim(),
            blockedAt: new Date().toISOString(),
        };

        const updatedList = [...blockedUsers, newUser];

        try {
            await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(updatedList));
            setBlockedUsers(updatedList);
            setNewUsername('');
            Alert.alert('Success', `@${newUsername} has been blocked`);
        } catch (error) {
            Alert.alert('Error', 'Failed to block user');
        }
    };

    const unblockUser = async (userId) => {
        const updatedList = blockedUsers.filter(user => user.id !== userId);

        try {
            await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(updatedList));
            setBlockedUsers(updatedList);
            Alert.alert('Success', 'User unblocked');
        } catch (error) {
            Alert.alert('Error', 'Failed to unblock user');
        }
    };

    const renderBlockedUser = ({ item }) => (
        <View style={styles.blockedUserItem}>
            <View style={styles.userInfo}>
                <Text style={styles.username}>@{item.username}</Text>
                <Text style={styles.blockedDate}>
                    Blocked: {new Date(item.blockedAt).toLocaleDateString()}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.unblockButton}
                onPress={() => unblockUser(item.id)}
            >
                <Text style={styles.unblockButtonText}>Unblock</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.blockedContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Blocked Users</Text>
            </View>

            <View style={styles.addUserSection}>
                <TextInput
                    style={styles.usernameInput}
                    placeholder="Enter username to block"
                    value={newUsername}
                    onChangeText={setNewUsername}
                />
                <TouchableOpacity style={styles.blockButton} onPress={addBlockedUser}>
                    <Text style={styles.blockButtonText}>Block</Text>
                </TouchableOpacity>
            </View>

            {blockedUsers.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No blocked users</Text>
                </View>
            ) : (
                <FlatList
                    data={blockedUsers}
                    renderItem={renderBlockedUser}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.blockedList}
                />
            )}
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    
    // Loading Screen
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666666',
        fontWeight: '500',
    },
    
    // Parent Account Linking
    linkingContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
    },
    emailInput: {
        borderWidth: 2,
        borderColor: '#E5E5E5',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        marginBottom: 25,
        backgroundColor: '#FAFAFA',
    },
    otpInput: {
        borderWidth: 2,
        borderColor: '#E5E5E5',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        marginBottom: 25,
        backgroundColor: '#FAFAFA',
        textAlign: 'center',
        fontWeight: '600',
        letterSpacing: 8,
    },
    primaryButton: {
        backgroundColor: '#FF6E42',
        paddingVertical: 16,
        paddingHorizontal: 30,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#FF6E42',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    disabledButton: {
        backgroundColor: '#CCCCCC',
        elevation: 0,
        shadowOpacity: 0,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    secondaryButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#FF6E42',
    },
    secondaryButtonText: {
        color: '#FF6E42',
        fontSize: 16,
        fontWeight: '500',
    },
    infoText: {
        fontSize: 14,
        color: '#888888',
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    },
    
    // Password Screen
    passwordContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        backgroundColor: '#FFFFFF',
    },
    passwordInput: {
        borderWidth: 2,
        borderColor: '#E5E5E5',
        borderRadius: 12,
        padding: 15,
        fontSize: 18,
        marginBottom: 20,
        backgroundColor: '#FAFAFA',
        textAlign: 'center',
        fontWeight: '500',
    },
    
    // Main Menu
    menuContainer: {
        flex: 1,
        paddingTop: 40,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
    },
    menuItem: {
        backgroundColor: '#FAFAFA',
        padding: 20,
        borderRadius: 16,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#FF6E42',
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    menuItemText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 5,
    },
    menuItemSubtext: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 18,
    },
    
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 8,
        marginRight: 10,
    },
    backButtonText: {
        fontSize: 16,
        color: '#FF6E42',
        fontWeight: '600',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        marginRight: 50,
    },
    clearButton: {
        padding: 8,
    },
    clearButtonText: {
        fontSize: 16,
        color: '#FF4444',
        fontWeight: '600',
    },
    
    // Settings Screen
    settingsContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    settingsSection: {
        margin: 20,
        padding: 20,
        backgroundColor: '#FAFAFA',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 15,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    settingLabel: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '500',
        flex: 1,
    },
    settingDescription: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 15,
        lineHeight: 20,
    },
    numberInput: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        padding: 10,
        width: 80,
        textAlign: 'center',
        fontSize: 16,
        backgroundColor: '#FFFFFF',
    },
    timeInput: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        padding: 10,
        width: 100,
        textAlign: 'center',
        fontSize: 16,
        backgroundColor: '#FFFFFF',
    },
    filtersInput: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        minHeight: 80,
        marginBottom: 15,
    },
    saveButton: {
        backgroundColor: '#FF6E42',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        elevation: 2,
        shadowColor: '#FF6E42',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    
    // Watch History
    historyContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    historyList: {
        padding: 20,
    },
    historyItem: {
        backgroundColor: '#FAFAFA',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#FF6E42',
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
    },
    historyCreator: {
        fontSize: 14,
        color: '#FF6E42',
        fontWeight: '500',
        marginBottom: 4,
    },
    historyTime: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 2,
    },
    historyDuration: {
        fontSize: 12,
        color: '#888888',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
    
    // Blocked Users
    blockedContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    addUserSection: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#FAFAFA',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        alignItems: 'center',
    },
    usernameInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        marginRight: 15,
    },
    blockButton: {
        backgroundColor: '#FF4444',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#FF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    blockButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    blockedList: {
        padding: 20,
    },
    blockedUserItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#FF4444',
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
    },
    blockedDate: {
        fontSize: 12,
        color: '#666666',
    },
    unblockButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    unblockButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
});


export default ParentalControlsMain;