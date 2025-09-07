import React, { useState, useEffect, useContext, createContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys (same as in your main component)
const STORAGE_KEYS = {
    PARENT_PASSWORD: 'parent_password',
    TIME_LIMITS: 'time_limits',
    TIME_RESTRICTIONS: 'time_restrictions',
    CONTENT_FILTERS: 'content_filters',
    WATCH_HISTORY: 'watch_history',
    BLOCKED_USERS: 'blocked_users',
    DAILY_USAGE: 'daily_usage',
}; 

// Context for parental controls
const ParentalControlContext = createContext();

// Provider component to wrap your app
export const ParentalControlProvider = ({ children }) => {
    const [timeLimits, setTimeLimits] = useState(null);
    const [timeRestrictions, setTimeRestrictions] = useState(null);
    const [contentFilters, setContentFilters] = useState(null);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [dailyUsage, setDailyUsage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadParentalSettings();
        // Check restrictions every minute
        const interval = setInterval(() => {
            checkTimeRestrictions();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const loadParentalSettings = async () => {
        try {
            const [limits, restrictions, filters, blocked, usage] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.TIME_LIMITS),
                AsyncStorage.getItem(STORAGE_KEYS.TIME_RESTRICTIONS),
                AsyncStorage.getItem(STORAGE_KEYS.CONTENT_FILTERS),
                AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_USERS),
                AsyncStorage.getItem(STORAGE_KEYS.DAILY_USAGE),
            ]);

            setTimeLimits(limits ? JSON.parse(limits) : null);
            setTimeRestrictions(restrictions ? JSON.parse(restrictions) : null);
            setContentFilters(filters ? JSON.parse(filters) : null);
            setBlockedUsers(blocked ? JSON.parse(blocked) : []);
            
            // Load daily usage or initialize for today
            const today = new Date().toDateString();
            const usageData = usage ? JSON.parse(usage) : {};
            setDailyUsage(usageData[today] || 0);
            
        } catch (error) {
            console.error('Error loading parental settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkTimeRestrictions = () => {
        if (!timeRestrictions?.enabled) return true;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [startHour, startMin] = timeRestrictions.startTime.split(':').map(Number);
        const [endHour, endMin] = timeRestrictions.endTime.split(':').map(Number);
        
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        // Handle overnight restrictions (e.g., 21:00 to 07:00)
        if (startTime > endTime) {
            return !(currentTime >= startTime || currentTime <= endTime);
        } else {
            return !(currentTime >= startTime && currentTime <= endTime);
        }
    };

    const value = {
        timeLimits,
        timeRestrictions,
        contentFilters,
        blockedUsers,
        dailyUsage,
        isLoading,
        loadParentalSettings,
        checkTimeRestrictions,
        updateDailyUsage: async (minutes) => {
            const today = new Date().toDateString();
            const newUsage = dailyUsage + minutes;
            setDailyUsage(newUsage);

            try {
                const existingData = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_USAGE);
                const usageData = existingData ? JSON.parse(existingData) : {};
                usageData[today] = newUsage;
                await AsyncStorage.setItem(STORAGE_KEYS.DAILY_USAGE, JSON.stringify(usageData));
            } catch (error) {
                console.error('Error updating daily usage:', error);
            }
        }
    };

    return (
        <ParentalControlContext.Provider value={value}>
            {children}
        </ParentalControlContext.Provider>
    );
};

// Hook to use parental controls
export const useParentalControls = () => {
    const context = useContext(ParentalControlContext);
    if (!context) {
        throw new Error('useParentalControls must be used within ParentalControlProvider');
    }
    return context;
};

// Time Limit Checker Component
export const TimeLimitChecker = ({ children, onTimeLimitExceeded }) => {
    const { timeLimits, dailyUsage } = useParentalControls();
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);

    useEffect(() => {
        if (timeLimits?.enabled && dailyUsage >= timeLimits.dailyLimit) {
            setShowTimeUpModal(true);
            if (onTimeLimitExceeded) {
                onTimeLimitExceeded();
            }
        }
    }, [dailyUsage, timeLimits]);

    if (timeLimits?.enabled && dailyUsage >= timeLimits.dailyLimit) {
        return (
            <View style={styles.restrictionContainer}>
                <Text style={styles.restrictionTitle}>⏰ Time's Up!</Text>
                <Text style={styles.restrictionText}>
                    You've reached your daily limit of {timeLimits.dailyLimit} minutes.
                </Text>
                <Text style={styles.restrictionSubtext}>
                    Try again tomorrow or ask a parent to extend your time.
                </Text>
            </View>
        );
    }

    return children;
};

// Time Restriction Checker Component
export const TimeRestrictionChecker = ({ children, onTimeRestricted }) => {
    const { timeRestrictions } = useParentalControls();
    const [isRestricted, setIsRestricted] = useState(false);

    useEffect(() => {
        const checkRestrictions = () => {
            if (!timeRestrictions?.enabled) return;

            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            
            const [startHour, startMin] = timeRestrictions.startTime.split(':').map(Number);
            const [endHour, endMin] = timeRestrictions.endTime.split(':').map(Number);
            
            const startTime = startHour * 60 + startMin;
            const endTime = endHour * 60 + endMin;

            let restricted = false;
            if (startTime > endTime) {
                // Overnight restriction
                restricted = currentTime >= startTime || currentTime <= endTime;
            } else {
                restricted = currentTime >= startTime && currentTime <= endTime;
            }

            setIsRestricted(restricted);
            if (restricted && onTimeRestricted) {
                onTimeRestricted();
            }
        };

        checkRestrictions();
        const interval = setInterval(checkRestrictions, 60000);
        return () => clearInterval(interval);
    }, [timeRestrictions, onTimeRestricted]);

    if (isRestricted) {
        return (
            <View style={styles.restrictionContainer}>
                <Text style={styles.restrictionTitle}>🌙 Bedtime Mode</Text>
                <Text style={styles.restrictionText}>
                    App usage is restricted during bedtime hours
                </Text>
                <Text style={styles.restrictionSubtext}>
                    Available from {timeRestrictions?.endTime} to {timeRestrictions?.startTime}
                </Text>
            </View>
        );
    }

    return children;
};

// Content Filter Hook
export const useContentFilter = () => {
    const { contentFilters } = useParentalControls();

    const checkContent = (text) => {
        if (!contentFilters?.keywords?.length) return { allowed: true };

        const lowerText = text.toLowerCase();
        const blockedKeywords = contentFilters.keywords.filter(keyword =>
            lowerText.includes(keyword.toLowerCase())
        );

        return {
            allowed: blockedKeywords.length === 0,
            blockedKeywords
        };
    };

    return { checkContent };
};

// Blocked User Checker Hook
export const useBlockedUsers = () => {
    const { blockedUsers } = useParentalControls();

    const isUserBlocked = (username) => {
        return blockedUsers.some(user => 
            user.username.toLowerCase() === username.toLowerCase()
        );
    };

    return { isUserBlocked, blockedUsers };
};

// Content Blocker Component
export const ContentBlocker = ({ content, creator, children, fallback }) => {
    const { checkContent } = useContentFilter();
    const { isUserBlocked } = useBlockedUsers();

    const contentCheck = checkContent(content || '');
    const creatorBlocked = creator ? isUserBlocked(creator) : false;

    if (!contentCheck.allowed || creatorBlocked) {
        if (fallback) {
            return fallback;
        }

        return (
            <View style={styles.blockedContentContainer}>
                <Text style={styles.blockedTitle}>🚫 Content Blocked</Text>
                {!contentCheck.allowed && (
                    <Text style={styles.blockedText}>
                        This content contains filtered keywords: {contentCheck.blockedKeywords?.join(', ')}
                    </Text>
                )}
                {creatorBlocked && (
                    <Text style={styles.blockedText}>
                        Content from @{creator} is blocked
                    </Text>
                )}
            </View>
        );
    }

    return children;
};

// Usage Tracker Hook
export const useUsageTracker = () => {
    const { updateDailyUsage } = useParentalControls();
    const [startTime, setStartTime] = useState(null);

    const startTracking = () => {
        setStartTime(Date.now());
    };

    const stopTracking = () => {
        if (startTime) {
            const duration = Math.round((Date.now() - startTime) / 1000 / 60); // in minutes
            updateDailyUsage(duration);
            setStartTime(null);
        }
    };

    return { startTracking, stopTracking };
};

// Watch History Logger
export const logWatchHistory = async (videoData) => {
    try {
        const historyItem = {
            id: videoData.id || Date.now().toString(),
            title: videoData.title,
            creator: videoData.creator,
            timestamp: new Date().toISOString(),
            watchDuration: videoData.watchDuration || 0,
            url: videoData.url || '',
        };

        const existingHistory = await AsyncStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
        const history = existingHistory ? JSON.parse(existingHistory) : [];
        
        // Add new item to the beginning and limit to last 1000 items
        const updatedHistory = [historyItem, ...history].slice(0, 1000);
        
        await AsyncStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(updatedHistory));
    } catch (error) {
        console.error('Error logging watch history:', error);
    }
};

// Usage Warning Component
export const UsageWarning = () => {
    const { timeLimits, dailyUsage } = useParentalControls();
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        if (timeLimits?.enabled) {
            const warningThreshold = timeLimits.dailyLimit * 0.8; // 80% warning
            setShowWarning(dailyUsage >= warningThreshold && dailyUsage < timeLimits.dailyLimit);
        }
    }, [dailyUsage, timeLimits]);

    if (!showWarning) return null;

    const remainingTime = timeLimits.dailyLimit - dailyUsage;

    return (
        <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
                ⚠️ {remainingTime} minutes remaining today
            </Text>
        </View>
    );
};

// Parental Override Modal (for emergencies)
export const ParentalOverrideModal = ({ visible, onClose, onOverride }) => {
    const [password, setPassword] = useState('');

    const handleOverride = async () => {
        try {
            const storedPassword = await AsyncStorage.getItem(STORAGE_KEYS.PARENT_PASSWORD);
            if (password === storedPassword) {
                onOverride();
                setPassword('');
                onClose();
            } else {
                Alert.alert('Error', 'Incorrect parent password');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to verify password');
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Parental Override</Text>
                    <Text style={styles.modalText}>
                        Enter parent password to temporarily override restrictions:
                    </Text>
                    <TextInput
                        style={styles.modalInput}
                        placeholder="Parent password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.modalButton} onPress={onClose}>
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.modalButton, styles.modalButtonPrimary]} 
                            onPress={handleOverride}
                        >
                            <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                                Override
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    restrictionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF8F0',
        padding: 30,
    },
    restrictionTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FF6E42',
        marginBottom: 15,
        textAlign: 'center',
    },
    restrictionText: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    restrictionSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    blockedContentContainer: {
        backgroundColor: '#FFF0F0',
        borderRadius: 12,
        padding: 20,
        margin: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#FF4444',
    },
    blockedTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF4444',
        marginBottom: 8,
    },
    blockedText: {
        fontSize: 14,
        color: '#666',
    },
    warningContainer: {
        backgroundColor: '#FFF8E1',
        padding: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#FFD700',
    },
    warningText: {
        color: '#FF8F00',
        fontWeight: '600',
        fontSize: 14,
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
        width: '80%',
        maxWidth: 300,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
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
    },
    modalButtonTextPrimary: {
        color: 'white',
        fontWeight: '600',
    },
});