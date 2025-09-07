import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { deleteComment, fetchComments, postComment, TWIMBOL_API_CONFIG } from '@/services/api';
import TimeAgo from '../time';
import { BaseButton, RawButton, RectButton } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCENT_COLOR = '#FF6E42';
const STORAGE_KEYS = {
  PARENT_PASSWORD: 'parent_password',
  SAFETY_PROMPT_SHOWN: 'SAFETY_PROMPT_SHOWN',
};

// Parental Verification Modal Component (similar to Profile component)
const ParentalVerificationModal = ({ 
  visible, 
  onClose, 
  onVerificationSuccess,
  showNoPasswordInstructions = false 
}) => {
  const [parentPassword, setParentPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleParentalVerification = async () => {
    if (!parentPassword.trim()) {
      Alert.alert('Error', 'Please enter the parent password');
      return;
    }

    setIsLoading(true);

    try {
      const storedPassword = await AsyncStorage.getItem(STORAGE_KEYS.PARENT_PASSWORD);
      
      if (parentPassword === storedPassword) {
        onVerificationSuccess();
        setParentPassword('');
        Alert.alert('Success', 'Comments access unlocked');
      } else {
        Alert.alert('Error', 'Incorrect parent password');
        setParentPassword('');
      }
    } catch (error) {
      console.error('Error verifying parent password:', error);
      Alert.alert('Error', 'Failed to verify password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToSettings = () => {
    onClose();
    // Navigate to settings or parental controls screen
    navigation.navigate('settings'); // Adjust the route name as needed
  };

  const handleCancel = () => {
    setParentPassword('');
    onClose();
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setParentPassword('');
      setIsLoading(false);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {showNoPasswordInstructions ? (
            // No Password Set - Show Instructions
            <>
              <Text style={styles.modalTitle}>🔒 Parent Approval Required</Text>
              <Text style={styles.modalText}>
                You need parent approval to access comments.
              </Text>
              <Text style={styles.modalInstructions}>
                Please ask your parent or guardian to:
                {'\n'}• Go to Settings
                {'\n'}• Open Parental Controls
                {'\n'}• Set up a parent password
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={handleCancel}
                >
                  <Text style={styles.modalButtonText}>Go Back</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonPrimary]} 
                  onPress={handleGoToSettings}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                    Go to Settings
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Password Set - Show Verification
            <>
              <Text style={styles.modalTitle}>Parental Verification Required</Text>
              <Text style={styles.modalText}>
                Please enter the parent password to access comments:
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter parent password"
                value={parentPassword}
                onChangeText={setParentPassword}
                secureTextEntry
                autoCapitalize="none"
                autoFocus={true}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={handleCancel}
                  disabled={isLoading}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonPrimary]} 
                  onPress={handleParentalVerification}
                  disabled={isLoading}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const CommentsModal = ({
  visible,
  onClose,
  postId,
  initialCommentsCount = 0,
  onCommentsCountChange,
  userId
}) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  
  // Parental verification states
  const [showParentalModal, setShowParentalModal] = useState(false);
  const [showNoPasswordModal, setShowNoPasswordModal] = useState(false);
  const [isParentalVerified, setIsParentalVerified] = useState(false);
  const [checkingParental, setCheckingParental] = useState(false);
  
  const flatListRef = useRef(null);
  const textInputRef = useRef(null);
  const navigation = useNavigation();

  // Check parental verification when modal opens
  useEffect(() => {
    const checkParentalVerification = async () => {
      if (!visible) return;

      setCheckingParental(true);
      
      try {
        const storedPassword = await AsyncStorage.getItem(STORAGE_KEYS.PARENT_PASSWORD);
        
        if (!storedPassword) {
          // No parental password set, show instruction modal
          setShowNoPasswordModal(true);
        } else {
          // Password is set, show verification modal
          setShowParentalModal(true);
        }
      } catch (error) {
        console.error('Error checking parental password:', error);
        Alert.alert('Error', 'Failed to check parental controls');
      } finally {
        setCheckingParental(false);
      }
    };

    if (visible && !isParentalVerified) {
      checkParentalVerification();
    }
  }, [visible, isParentalVerified]);

  // Handle successful parental verification
  const handleVerificationSuccess = () => {
    setIsParentalVerified(true);
    setShowParentalModal(false);
    setShowNoPasswordModal(false);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowParentalModal(false);
    setShowNoPasswordModal(false);
    onClose(); // Close the main comments modal
  };

  // Navigate to user profile
  const handleUserPress = useCallback((userId) => {
    if (userId) {
      navigation.navigate('profile', { userId: userId });
    }
  }, [navigation]);

  // Get full user name
  const getUserFullName = useCallback((user) => {
    if (!user) return 'User';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName} ${lastName}`.trim() || user.username || 'User';
  }, []);

  // Get profile picture URL with base URL handling
  const getProfilePicUrl = useCallback((profilePic) => {
    if (!profilePic) {
      return 'https://randomuser.me/api/portraits/men/32.jpg';
    }

    // If it's already a full URL, return as is
    if (profilePic.startsWith('http://') || profilePic.startsWith('https://')) {
      return profilePic;
    }

    // If it starts with /media, prepend base URL
    if (profilePic.startsWith('/media/')) {
      return `${TWIMBOL_API_CONFIG.BASE_URL}${profilePic}`;
    }

    // Otherwise, assume it's a relative path and prepend base URL
    return `${TWIMBOL_API_CONFIG.BASE_URL}/${profilePic}`;
  }, []);

  // Fetch comments from API
  const fetchCommentsData = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (!postId) {
      console.log('No postId provided for fetching comments');
      return;
    }

    try {
      setLoading(pageNum === 1 && !isRefresh);

      const data = await fetchComments(postId, pageNum);

      // Update total comments count
      setTotalComments(data.count || 0);

      if (isRefresh || pageNum === 1) {
        setComments(data.results || []);
      } else {
        setComments(prev => [...prev, ...(data.results || [])]);
      }

      // Check if there are more pages
      setHasMore(!!data.next);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching comments:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load comments',
        position: 'top',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [postId]);

  // Post new comment
  const handlePostComment = useCallback(async () => {
    if (!newComment.trim() || posting || !postId) {
      console.log('Cannot post comment:', { newComment: !!newComment.trim(), posting, postId });
      return;
    }

    try {
      setPosting(true);

      const newCommentData = await postComment(postId, newComment.trim());

      // Add the new comment to the top of the list
      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');

      // Update total comments count
      setTotalComments(prev => prev + 1);

      // Update comments count in parent component
      if (onCommentsCountChange) {
        onCommentsCountChange(totalComments + 1);
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Comment posted!',
        position: 'top',
      });

      // Scroll to top to show the new comment
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);

    } catch (error) {
      console.error('Error posting comment:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to post comment',
        position: 'top',
      });
    } finally {
      setPosting(false);
    }
  }, [newComment, posting, postId, totalComments, onCommentsCountChange]);

  // Load more comments (pagination)
  const loadMoreComments = useCallback(() => {
    if (!loading && hasMore) {
      fetchCommentsData(page + 1);
    }
  }, [loading, hasMore, page, fetchCommentsData]);

  // Refresh comments
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCommentsData(1, true);
  }, [fetchCommentsData]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setComments([]);
      setNewComment('');
      setPage(1);
      setHasMore(true);
      setLoading(false);
      setPosting(false);
      setRefreshing(false);
      setTotalComments(0);
      setIsParentalVerified(false);
      setCheckingParental(false);
    }
  }, [visible]);

  // Fetch comments when modal opens and parental verification is complete
  useEffect(() => {
    if (visible && postId && isParentalVerified) {
      fetchCommentsData(1);
    }
  }, [visible, postId, isParentalVerified, fetchCommentsData]);

  // Focus text input when ready
  useEffect(() => {
    if (visible && isParentalVerified) {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 500);
    }
  }, [visible, isParentalVerified]);

  // DELETE comment handler
  const handleDeleteComment = useCallback(async (commentId, post) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment(post, commentId);

              // Remove from local state
              setComments(prev => prev.filter(c => c.id !== commentId));

              // Update count
              setTotalComments(prev => prev - 1);
              if (onCommentsCountChange) {
                onCommentsCountChange(totalComments - 1);
              }

              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Comment removed successfully.',
                position: 'top',
              });
            } catch (error) {
              console.error('Error deleting comment:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete comment.',
                position: 'top',
              });
            }
          }
        }
      ]
    );
  }, [onCommentsCountChange, totalComments]);

  // Render individual comment item
  const renderComment = useCallback(({ item }) => {
    const comment_user = item.created_by?.user;
    const fullName = getUserFullName(comment_user);
    const username = comment_user?.username;
    const profilePicUrl = getProfilePicUrl(comment_user?.profile_pic);
    const commentUserId = comment_user?.id;

    // More robust comparison
    const canDelete = userId && commentUserId &&
      (parseInt(userId) === parseInt(commentUserId) || userId.toString() === commentUserId.toString());

    return (
      <View style={styles.commentItem}>
        <TouchableOpacity
          onPress={() => handleUserPress(commentUserId)}
          style={styles.avatarContainer}
        >
          <Image
            source={{ uri: profilePicUrl }}
            style={styles.commentAvatar}
          />
        </TouchableOpacity>
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <TouchableOpacity
              onPress={() => handleUserPress(commentUserId)}
              style={styles.userInfoContainer}
            >
              <Text style={styles.commentFullName}>
                {fullName}
              </Text>
              {username && (
                <Text style={styles.commentUsername}>
                  @{username}
                </Text>
              )}
            </TouchableOpacity>
            <Text style={styles.commentTime}><TimeAgo time_string={item.created_at} /></Text>
          </View>
          <Text style={styles.commentText}>{item.comment}</Text>

          {canDelete && (
            <TouchableOpacity
              onPress={() => handleDeleteComment(item.id, item.post)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, [getUserFullName, getProfilePicUrl, handleUserPress, userId, handleDeleteComment]);

  // Render loading footer
  const renderFooter = useCallback(() => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={ACCENT_COLOR} />
      </View>
    );
  }, [loading, page]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (loading) return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
        <Text style={styles.loadingText}>Loading comments...</Text>
      </View>
    );

    return (
      <View style={styles.emptyState}>
        <Ionicons name="chatbubbles-outline" size={48} color="#666" />
        <Text style={styles.emptyText}>No comments yet</Text>
        <Text style={styles.emptySubtext}>Be the first to comment!</Text>
      </View>
    );
  }, [loading]);

  // Don't render anything if not visible
  if (!visible) {
    return null;
  }

  // If parental verification is not complete, show checking state
  if (!isParentalVerified) {
    return (
      <>
        {/* Main modal overlay showing checking state */}
        <Modal
          visible={visible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={onClose}
          statusBarTranslucent={false}
        >
          <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Comments</Text>
              <View style={styles.headerRight} />
            </View>
            
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Checking parental permissions...</Text>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Parental verification modals */}
        <ParentalVerificationModal
          visible={showParentalModal}
          onClose={handleModalClose}
          onVerificationSuccess={handleVerificationSuccess}
          showNoPasswordInstructions={false}
        />

        <ParentalVerificationModal
          visible={showNoPasswordModal}
          onClose={handleModalClose}
          onVerificationSuccess={handleVerificationSuccess}
          showNoPasswordInstructions={true}
        />
      </>
    );
  }

  return (
    <Modal
      visible={visible && isParentalVerified}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={styles.headerRight}>
            <Text style={styles.commentsCount}>
              {totalComments > 0 ? totalComments : initialCommentsCount}
            </Text>
          </View>
        </View>

        {/* Comments List */}
        <FlatList
          ref={flatListRef}
          data={comments}
          keyExtractor={(item, index) => `comment-${item.post}-${index}`}
          renderItem={renderComment}
          contentContainerStyle={[
            styles.commentsList,
            comments.length === 0 && { flex: 1 }
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreComments}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />

        {/* Comment Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.inputRow}>
            <TextInput
              ref={textInputRef}
              style={[
                styles.textInput,
                (!userId || posting) && styles.disabledTextInput
              ]}
              placeholder={
                !userId
                  ? "Please log in to comment..."
                  : posting
                    ? "Posting comment..."
                    : "Add a comment..."
              }
              placeholderTextColor={(!userId || posting) ? "#ccc" : "#999"}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handlePostComment}
              blurOnSubmit={false}
              editable={!(!userId || posting)}
              selectTextOnFocus={!(!userId || posting)}
            />
            <TouchableOpacity
              style={[
                styles.postButton,
                { opacity: !newComment.trim() || posting ? 0.5 : 1 }
              ]}
              onPress={handlePostComment}
              disabled={!newComment.trim() || posting}
            >
              {posting ? (
                <ActivityIndicator size="small" color={ACCENT_COLOR} />
              ) : (
                <Ionicons name="send" size={20} color={ACCENT_COLOR} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Main modal styles
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 4,
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  commentsCount: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  commentsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  avatarContainer: {
    marginRight: 12,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userInfoContainer: {
    flex: 1,
    marginRight: 8,
  },
  commentFullName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  commentUsername: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginTop: 4,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  disabledTextInput: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
    color: '#999',
  },
  postButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 6,
    marginTop: 4,
  },
  deleteButtonText: {
    color: '#ff4d4d',
    fontSize: 14,
    fontWeight: '600',
  },

  // Parental verification modal styles (similar to Profile component)
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
    width: '85%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'left',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
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
    fontWeight: '500',
  },
  modalButtonTextPrimary: {
    color: 'white',
    fontWeight: '600',
  },
});

export default CommentsModal;