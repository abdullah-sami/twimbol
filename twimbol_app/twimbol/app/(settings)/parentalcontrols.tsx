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


// Storage Keys
const STORAGE_KEYS = {
    PARENT_PASSWORD: 'parent_password',
    TIME_LIMITS: 'time_limits',
    TIME_RESTRICTIONS: 'time_restrictions',
    CONTENT_FILTERS: 'content_filters',
    WATCH_HISTORY: 'watch_history',
    BLOCKED_USERS: 'blocked_users',
    DAILY_USAGE: 'daily_usage',
};

// Main Parental Controls Component
const ParentalControlsMain = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentView, setCurrentView] = useState('main');
    const [passwordSet, setPasswordSet] = useState(false);
    const [isCheckingPassword, setIsCheckingPassword] = useState(true); // Add loading state

    useEffect(() => {
        checkPasswordExists();
    }, []);

    const checkPasswordExists = async () => {
        try {
            const password = await AsyncStorage.getItem(STORAGE_KEYS.PARENT_PASSWORD);
            setPasswordSet(!!password);
        } catch (error) {
            console.error('Error checking password:', error);
            setPasswordSet(false); // Explicitly set to false on error
        } finally {
            setIsCheckingPassword(false); // Always stop loading
        }
    };

    const renderCurrentView = () => {
        // Show loading while checking if password exists
        if (isCheckingPassword) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0066cc" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            );
        }

        if (!isAuthenticated) {
            return (
                <PasswordScreen
                    passwordSet={passwordSet}
                    onAuthenticated={() => setIsAuthenticated(true)}
                    onPasswordSet={() => {
                        setPasswordSet(true);
                        setIsAuthenticated(true); // Auto-authenticate after setting password
                    }}
                />
            );
        }

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
    // Fix: Start with login mode if password exists, setup mode if it doesn't
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

            {/* Fix: Show "I already have a password" button when in setup mode AND password exists */}
            {passwordSet && isSettingPassword && (
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setIsSettingPassword(false)}
                >
                    <Text style={styles.secondaryButtonText}>I already have a password</Text>
                </TouchableOpacity>
            )}

            {/* Optional: Add a "Reset Password" button when in login mode */}
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
    const [dailyLimit, setDailyLimit] = useState('180'); // 3 hours in minutes
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
                    {/* Your existing content */}

                    <TextInput
                        style={styles.filtersInput}
                        value={contentFilters}
                        onChangeText={setContentFilters}
                        placeholder="inappropriate, violence, scary"
                        multiline
                        autoCapitalize='none'
                        numberOfLines={3}
                        textAlignVertical="top" // Important for Android
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
    passwordContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        marginBottom: 30,
    },
    passwordInput: {
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#FAFAFA',
    },
    primaryButton: {
        backgroundColor: '#FF6E42',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 15,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#FF6E42',
        fontSize: 14,
    },
    menuContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    menuItem: {
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#FF6E42',
    },
    menuItemText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 5,
    },
    menuItemSubtext: {
        fontSize: 14,
        color: '#666666',
    },
    settingsContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    backButtonText: {
        color: '#FF6E42',
        fontSize: 16,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    clearButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    clearButtonText: {
        color: '#FF4444',
        fontSize: 14,
    },
    settingsSection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 15,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    settingLabel: {
        fontSize: 16,
        color: '#333333',
        flex: 1,
    },
    settingDescription: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 15,
    },
    numberInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        width: 80,
        textAlign: 'center',
    },
    timeInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        width: 100,
        textAlign: 'center',
    },
    filtersInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 15,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: '#FF6E42',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    historyContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666666',
    },
    historyList: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    historyItem: {
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    historyCreator: {
        fontSize: 14,
        color: '#FF6E42',
        marginBottom: 4,
    },
    historyTime: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 2,
    },
    historyDuration: {
        fontSize: 12,
        color: '#666666',
    },
    blockedContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    addUserSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'center',
    },
    usernameInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        marginRight: 10,
    },
    blockButton: {
        backgroundColor: '#FF4444',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    blockButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    blockedList: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    blockedUserItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 2,
    },
    blockedDate: {
        fontSize: 12,
        color: '#666666',
    },
    unblockButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    unblockButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
});

export default ParentalControlsMain;