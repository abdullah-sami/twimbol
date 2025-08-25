import React, { useState, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TWIMBOL_API_CONFIG } from '@/services/api';

// Report Modal Component
const ReportModal = ({ visible, onClose, onSubmitReport }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');

  const reasons = [
    { key: 'spam', label: 'Spam' },
    { key: 'abuse', label: 'Abuse' },
    { key: 'false', label: 'False News' },
    { key: 'hate', label: 'Hate Speech' },
    { key: 'nsfw', label: 'Not Safe For Work' },
    { key: 'other', label: 'Other' },
  ];

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for reporting.');
      return;
    }
    onSubmitReport(selectedReason, description);
    setSelectedReason('');
    setDescription('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.reportModal}>
          <Text style={styles.reportTitle}>Report Post</Text>
          
          <Text style={styles.sectionTitle}>Reason for reporting:</Text>
          {reasons.map(reason => (
            <TouchableOpacity
              key={reason.key}
              style={[
                styles.reasonOption,
                selectedReason === reason.key && styles.reasonSelected
              ]}
              onPress={() => setSelectedReason(reason.key)}
            >
              <Text style={[
                styles.reasonText,
                selectedReason === reason.key && styles.reasonTextSelected
              ]}>
                {reason.label}
              </Text>
            </TouchableOpacity>
          ))}
          
          <Text style={styles.sectionTitle}>Additional details (optional):</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Provide more details..."
            multiline={true}
            numberOfLines={3}
          />
          
          <View style={styles.reportButtonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main ContextMenu Component
const ContextMenu = ({ 
  visible, 
  onClose, 
  post, 
  userId, 
  onPostHidden, 
  onUserBlocked, 
  showToastMessage,
  allPosts // Optional: for blocking all posts from a user
}) => {
  const [showReportModal, setShowReportModal] = useState(false);

  const handleHidePost = useCallback(async () => {
    if (!post || !userId) {
      showToastMessage?.("Please log in to hide posts!");
      onClose();
      return;
    }

    try {
      const response = await fetch(`${TWIMBOL_API_CONFIG.BASE_URL}/api/post_hide/${post.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('access')}`,
        },
      });

      if (response.ok) {
        onPostHidden?.(post.id);
        showToastMessage?.("Post hidden successfully!");
      } else {
        throw new Error('Failed to hide post');
      }
    } catch (error) {
      console.error('Error hiding post:', error);
      showToastMessage?.("Failed to hide post. Please try again.");
    }
    
    onClose();
  }, [post, userId, onPostHidden, showToastMessage, onClose]);

  const handleReportPost = useCallback(() => {
    onClose();
    setShowReportModal(true);
  }, [onClose]);

  const handleSubmitReport = useCallback(async (reason, description) => {
    if (!post || !userId) {
      showToastMessage?.("Please log in to report posts!");
      return;
    }

    try {
      const response = await fetch(`${TWIMBOL_API_CONFIG.BASE_URL}/api/post_report/${post.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('access')}`,
        },
        body: JSON.stringify({
          reason: reason,
          description: description,
        }),
      });

      if (response.ok) {
        showToastMessage?.("Post reported successfully!");
      } else {
        throw new Error('Failed to report post');
      }
    } catch (error) {
      console.error('Error reporting post:', error);
      showToastMessage?.("Failed to report post. Please try again.");
    }
  }, [post, userId, showToastMessage]);

  const handleBlockUser = useCallback(async () => {
    if (!post || !userId) {
      showToastMessage?.("Please log in to block users!");
      onClose();
      return;
    }

    const userName = `${post.user_profile.user.first_name} ${post.user_profile.user.last_name}`;

    Alert.alert(
      "Block User",
      `Are you sure you want to block ${userName}? You won't see their posts anymore.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${TWIMBOL_API_CONFIG.BASE_URL}/user/profile/block/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${await AsyncStorage.getItem('access')}`,
                },
                body: JSON.stringify({
                  user_id: post.user_profile.user.id,
                }),
              });

              if (response.ok) {
                // If allPosts is provided, hide all posts from this user
                if (allPosts && onPostHidden) {
                  const userPosts = allPosts.filter(p => 
                    p.user_profile.user.id === post.user_profile.user.id
                  ).map(p => p.id);
                  
                  userPosts.forEach(postId => onPostHidden(postId));
                }
                
                onUserBlocked?.(post.user_profile.user.id);
                showToastMessage?.("User blocked successfully!");
              } else {
                throw new Error('Failed to block user');
              }
            } catch (error) {
              console.error('Error blocking user:', error);
              showToastMessage?.("Failed to block user. Please try again.");
            }
          },
        },
      ]
    );
    
    onClose();
  }, [post, userId, allPosts, onPostHidden, onUserBlocked, showToastMessage, onClose]);

  if (!post) return null;

  const userName = `${post.user_profile.user.first_name} ${post.user_profile.user.last_name}`;

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <View style={styles.contextMenu}>
            <TouchableOpacity 
              style={styles.contextMenuItem} 
              onPress={handleHidePost}
            >
              <Ionicons name="eye-off-outline" size={20} color="#666" />
              <Text style={styles.contextMenuText}>Hide Post</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contextMenuItem} 
              onPress={handleReportPost}
            >
              <Ionicons name="flag-outline" size={20} color="#666" />
              <Text style={styles.contextMenuText}>Report Post</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.contextMenuItem, styles.dangerMenuItem]} 
              onPress={handleBlockUser}
            >
              <Ionicons name="person-remove-outline" size={20} color="#FF4B4B" />
              <Text style={[styles.contextMenuText, styles.dangerText]}>
                Block {userName}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmitReport={handleSubmitReport}
      />
    </>
  );
};

const styles = StyleSheet.create({
  // Context Menu Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenu: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contextMenuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  dangerMenuItem: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  dangerText: {
    color: '#FF4B4B',
  },
  // Report Modal Styles
  reportModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxWidth: '90%',
    width: 350,
    maxHeight: '80%',
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  reasonOption: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  reasonSelected: {
    borderColor: '#FF6B47',
    backgroundColor: '#FFF5F4',
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
  },
  reasonTextSelected: {
    color: '#FF6B47',
    fontWeight: '500',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 20,
  },
  reportButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FF6B47',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default ContextMenu;