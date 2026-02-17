import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TWIMBOL_API_CONFIG } from '@/services/api';

// Move PasswordInput outside of the main component to prevent re-creation
const PasswordInput = React.memo(({
    label,
    value,
    onChangeText,
    error,
    placeholder,
    showPassword,
    onToggleVisibility
}) => (
    <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.passwordInputWrapper}>
            <TextInput
                style={[styles.textInput, error && styles.inputError]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                blurOnSubmit={false}
                returnKeyType="next"
            />
            <TouchableOpacity
                style={styles.eyeButton}
                onPress={onToggleVisibility}
            >
                <Icon
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#666"
                />
            </TouchableOpacity>
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
));

const AccountSettings = ({ navigation }) => {
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Change Password Modal States
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [isdelete, setisdelete] = useState(false)

    // Delete/Deactivate Modal States
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');
    const [currentAction, setCurrentAction] = useState(null); // Store current action info

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        try {
            const storedUserId = await AsyncStorage.getItem('user_id');

            if (!storedUserId) {
                navigation.navigate('authentication' as never, { authpage: 'login' })
            }

            setUserId(storedUserId);
        } catch (error) {
            console.error('Error checking authentication:', error);
            Alert.alert('Error', 'Failed to verify authentication.');
        }
    };

    const validatePassword = () => {
        const errors = {};

        if (!passwordData.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }

        if (!passwordData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 8) {
            errors.newPassword = 'Password must be at least 8 characters';
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChangePassword = async () => {
        if (!validatePassword()) return;

        setLoading(true);

        try {
            const token = await AsyncStorage.getItem('access');

            const response = await fetch(
                `${TWIMBOL_API_CONFIG.BASE_URL}/user/change-password/`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        old_password: passwordData.currentPassword,
                        new_password: passwordData.newPassword,
                    }),
                }
            );

            if (response.ok) {
                Alert.alert(
                    'Success',
                    'Your password has been changed successfully.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setChangePasswordVisible(false);
                                setPasswordData({
                                    currentPassword: '',
                                    newPassword: '',
                                    confirmPassword: '',
                                });
                                setPasswordErrors({});
                            },
                        },
                    ]
                );
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            Alert.alert('Error', error.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    const handleAccountAction = async (action) => {
        const isDelete = action === 'delete';
        setisdelete(isDelete);
        const endpoint = isDelete ? 'delete' : `api/deactivate/${userId}/`; 
        const actionText = isDelete ? 'delete' : 'deactivate';

        Alert.alert(
            `${isDelete ? 'Delete' : 'Deactivate'} Account`,
            `Are you sure you want to ${actionText} your account? ${isDelete
                ? 'This action cannot be undone and all your data will be permanently deleted.'
                : 'You can reactivate your account later by logging in.'
            }`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: isDelete ? 'Delete' : 'Deactivate',
                    style: 'destructive',
                    onPress: () => showConfirmationModal(endpoint, actionText),
                },
            ]
        );
    };

    const showConfirmationModal = (endpoint, actionText) => {
        // Store the current action info
        setCurrentAction({
            endpoint,
            actionText,
            isDelete: endpoint === 'delete'
        });
        setDeleteModalVisible(true);
        setConfirmationText('');
    };

    const executeAccountAction = async () => {
        if (!currentAction) return;
        
        setLoading(true);

        try {
            const token = await AsyncStorage.getItem('access');

            const response = await fetch(
                `${TWIMBOL_API_CONFIG.BASE_URL}/user/${currentAction.endpoint}/`,
                {
                    method: isdelete?'POST':'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                // Clear user data and redirect to login
                try {
                    await AsyncStorage.multiRemove(['access', 'refresh', 'user_id', 'user', 'user_group']);

                    const remainingUserId = await AsyncStorage.getItem('user_id');
                    console.log('User ID after logout:', remainingUserId); // Should be null

                } catch (error) {
                    console.error('Error during logout:', error);
                }

                Alert.alert(
                    'Account Updated',
                    `Your account has been ${currentAction.actionText}d successfully.`,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('authentication', { authpage: 'login' }),
                        },
                    ]
                );
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${currentAction.actionText} account`);
            }
        } catch (error) {
            console.error(`Error ${currentAction.actionText} account:`, error);
            Alert.alert('Error', error.message || `Failed to ${currentAction.actionText} account.`);
        } finally {
            setLoading(false);
            setDeleteModalVisible(false);
            setCurrentAction(null);
        }
    };

    // Memoized handlers to prevent re-renders
    const handleCurrentPasswordChange = useCallback((text) => {
        setPasswordData(prev => ({
            ...prev,
            currentPassword: text
        }));
    }, []);

    const handleNewPasswordChange = useCallback((text) => {
        setPasswordData(prev => ({
            ...prev,
            newPassword: text
        }));
    }, []);

    const handleConfirmPasswordChange = useCallback((text) => {
        setPasswordData(prev => ({
            ...prev,
            confirmPassword: text
        }));
    }, []);

    const toggleCurrentPasswordVisibility = useCallback(() => {
        setShowPasswords(prev => ({
            ...prev,
            current: !prev.current
        }));
    }, []);

    const toggleNewPasswordVisibility = useCallback(() => {
        setShowPasswords(prev => ({
            ...prev,
            new: !prev.new
        }));
    }, []);

    const toggleConfirmPasswordVisibility = useCallback(() => {
        setShowPasswords(prev => ({
            ...prev,
            confirm: !prev.confirm
        }));
    }, []);

    const handleConfirmationTextChange = useCallback((text) => {
        setConfirmationText(text);
    }, []);

    const SettingsOption = ({ icon, title, description, onPress, danger = false }) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, danger && styles.dangerIconContainer]}>
                    <Icon
                        name={icon}
                        size={24}
                        color={danger ? '#FF4444' : '#FF6B35'}
                    />
                </View>
                <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingTitle, danger && styles.dangerText]}>
                        {title}
                    </Text>
                    <Text style={styles.settingDescription}>
                        {description}
                    </Text>
                </View>
            </View>
            <Icon name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Settings</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Security Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SECURITY</Text>

                    <SettingsOption
                        icon="lock"
                        title="Change Password"
                        description="Update your account password"
                        onPress={() => setChangePasswordVisible(true)}
                    />
                </View>

                {/* Account Management Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACCOUNT MANAGEMENT</Text>

                    <SettingsOption
                        icon="pause-circle-outline"
                        title="Deactivate Account"
                        description="Temporarily disable your account"
                        onPress={() => handleAccountAction('deactivate')}
                        danger={true}
                    />

                    <SettingsOption
                        icon="delete-forever"
                        title="Delete Account"
                        description="Permanently delete your account and data"
                        onPress={() => handleAccountAction('delete')}
                        danger={true}
                    />
                </View>
            </ScrollView>

            {/* Change Password Modal */}
            <Modal
                visible={changePasswordVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setChangePasswordVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Change Password</Text>
                            <TouchableOpacity
                                onPress={() => setChangePasswordVisible(false)}
                                style={styles.modalCloseButton}
                            >
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <PasswordInput
                                label="Current Password"
                                value={passwordData.currentPassword}
                                onChangeText={handleCurrentPasswordChange}
                                error={passwordErrors.currentPassword}
                                placeholder="Enter current password"
                                showPassword={showPasswords.current}
                                onToggleVisibility={toggleCurrentPasswordVisibility}
                            />

                            <PasswordInput
                                label="New Password"
                                value={passwordData.newPassword}
                                onChangeText={handleNewPasswordChange}
                                error={passwordErrors.newPassword}
                                placeholder="Enter new password"
                                showPassword={showPasswords.new}
                                onToggleVisibility={toggleNewPasswordVisibility}
                            />

                            <PasswordInput
                                label="Confirm New Password"
                                value={passwordData.confirmPassword}
                                onChangeText={handleConfirmPasswordChange}
                                error={passwordErrors.confirmPassword}
                                placeholder="Confirm new password"
                                showPassword={showPasswords.confirm}
                                onToggleVisibility={toggleConfirmPasswordVisibility}
                            />

                            <View style={styles.passwordRequirements}>
                                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                                <Text style={styles.requirementItem}>• At least 8 characters long</Text>
                                <Text style={styles.requirementItem}>• Must be different from current password</Text>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setChangePasswordVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleChangePassword}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.confirmButtonText}>Change Password</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete/Deactivate Confirmation Modal */}
            <Modal
                visible={deleteModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmationModal}>
                        <Icon name="warning" size={48} color="#FF4444" style={styles.warningIcon} />

                        <Text style={styles.confirmationTitle}>Final Confirmation</Text>
                        <Text style={styles.confirmationMessage}>
                            To confirm this action, please type "CONFIRM" in the box below:
                        </Text>

                        <TextInput
                            style={styles.confirmationInput}
                            value={confirmationText}
                            onChangeText={handleConfirmationTextChange}
                            placeholder="Type CONFIRM"
                            placeholderTextColor="#999"
                            autoCapitalize="characters"
                            blurOnSubmit={false}
                            returnKeyType="done"
                        />

                        <View style={styles.confirmationFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.dangerButton,
                                    confirmationText !== 'CONFIRM' && styles.disabledButton
                                ]}
                                onPress={() => executeAccountAction()}
                                disabled={loading || confirmationText !== 'CONFIRM'}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.dangerButtonText}>Confirm</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#FF6B35',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 16,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    settingItem: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF0EC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    dangerIconContainer: {
        backgroundColor: '#FFE8E8',
    },
    settingTextContainer: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    dangerText: {
        color: '#FF4444',
    },
    settingDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        width: '90%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    modalCloseButton: {
        padding: 4,
    },
    modalContent: {
        padding: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    passwordInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    textInput: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#333',
    },
    inputError: {
        borderColor: '#FF4444',
    },
    eyeButton: {
        padding: 12,
    },
    errorText: {
        fontSize: 14,
        color: '#FF4444',
        marginTop: 4,
    },
    passwordRequirements: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
    },
    requirementsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    requirementItem: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
        marginRight: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
    },
    confirmButton: {
        backgroundColor: '#FF6B35',
        marginLeft: 8,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
    },

    // Confirmation Modal Styles
    confirmationModal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        width: '90%',
        alignItems: 'center',
    },
    warningIcon: {
        marginBottom: 16,
    },
    confirmationTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    confirmationMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    confirmationInput: {
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
    },
    confirmationFooter: {
        flexDirection: 'row',
        width: '100%',
    },
    dangerButton: {
        backgroundColor: '#FF4444',
        marginLeft: 8,
    },
    dangerButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    disabledButton: {
        opacity: 0.5,
    },
});

export default AccountSettings;