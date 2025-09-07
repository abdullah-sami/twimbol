import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Keyboard, KeyboardAvoidingView, Platform, Alert, FlatList, Share, Modal, Dimensions, StatusBar, PanResponder, Animated } from 'react-native';
import { Heart, MessageSquare, Share2, Bookmark, ArrowLeft } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

import { TWIMBOL_API_CONFIG, fetchComments, postComment, deleteComment, postLikes, deleteLikes, fetchPost, followUser } from '@/services/api';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TimeAgo from '@/components/time';
import useFetch from '@/services/useFetch';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ContextMenu from '@/components/post/contextmenu';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ACCENT_COLOR = '#FF6E42';
const STORAGE_KEYS = {
  PARENT_PASSWORD: 'parent_password',
  SAFETY_PROMPT_SHOWF: 'SAFETY_PROMPT_SHOWF',
};

// Safety Prompt Component
const SafetyPrompt = ({ visible, onClose, onParentalOverride }) => {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleParentalAccess = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter the parental password');
      return;
    }

    setVerifying(true);
    try {
      const storedPassword = await AsyncStorage.getItem(STORAGE_KEYS.PARENT_PASSWORD);
      if (password === storedPassword) {
        onParentalOverride();
        setPassword('');
        setShowPasswordInput(false);
      } else {
        Alert.alert('Error', 'Incorrect parental password');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify password');
    } finally {
      setVerifying(false);
    }
  };

  const resetForm = () => {
    setShowPasswordInput(false);
    setPassword('');
    setVerifying(false);
  };

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => {}} // Prevent closing without password
    >
      <View style={styles.safetyModalOverlay}>
        <View style={styles.safetyModalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.safetyHeader}>
              <View style={styles.safetyIconContainer}>
                <Ionicons name="shield-checkmark" size={32} color={ACCENT_COLOR} />
              </View>
              <Text style={styles.safetyTitle}>Parental Supervision Required</Text>
            </View>

            {/* Safety Guidelines */}
            <View style={styles.safetyContent}>
              <Text style={styles.safetySubtitle}>Before allowing comments, please remember:</Text>
              
              <View style={styles.safetyPoint}>
                <Ionicons name="lock-closed" size={16} color={ACCENT_COLOR} />
                <Text style={styles.safetyPointText}>
                  <Text style={styles.bold}>Never share personal information</Text> like your real name, address, phone number, or school
                </Text>
              </View>

              <View style={styles.safetyPoint}>
                <Ionicons name="flag" size={16} color={ACCENT_COLOR} />
                <Text style={styles.safetyPointText}>
                  <Text style={styles.bold}>Report inappropriate comments</Text> that make you uncomfortable or seem suspicious
                </Text>
              </View>

              <View style={styles.safetyPoint}>
                <Ionicons name="people" size={16} color={ACCENT_COLOR} />
                <Text style={styles.safetyPointText}>
                  <Text style={styles.bold}>Talk to a parent or guardian</Text> if someone asks to meet you or sends strange messages
                </Text>
              </View>

              <View style={styles.safetyPoint}>
                <Ionicons name="heart" size={16} color={ACCENT_COLOR} />
                <Text style={styles.safetyPointText}>
                  <Text style={styles.bold}>Be kind and respectful</Text> to others in your comments
                </Text>
              </View>

              <View style={styles.safetyPoint}>
                <Ionicons name="alert-circle" size={16} color={ACCENT_COLOR} />
                <Text style={styles.safetyPointText}>
                  <Text style={styles.bold}>Think before you post</Text> - comments can be seen by many people
                </Text>
              </View>
            </View>

            {/* Parental Access Section - Always show, make it more prominent */}
            <View style={styles.requiredParentalSection}>
              <Text style={styles.requiredParentalTitle}>
                Parental Password Required to Continue
              </Text>
              
              {!showPasswordInput ? (
                <TouchableOpacity 
                  style={styles.showPasswordButton}
                  onPress={() => setShowPasswordInput(true)}
                >
                  <Ionicons name="key" size={20} color="white" />
                  <Text style={styles.showPasswordButtonText}>Enter Password</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.parentalInputContainer}>
                  <Text style={styles.parentalInputLabel}>Enter Parental Password:</Text>
                  <TextInput
                    style={styles.parentalInput}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoFocus={true}
                    editable={!verifying}
                  />
                  <View style={styles.parentalInputButtons}>
                    <TouchableOpacity 
                      style={styles.parentalCancelButton}
                      onPress={() => setShowPasswordInput(false)}
                      disabled={verifying}
                    >
                      <Text style={styles.parentalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.parentalSubmitButton,
                        (!password.trim() || verifying) && styles.disabledButton
                      ]}
                      onPress={handleParentalAccess}
                      disabled={verifying || !password.trim()}
                    >
                      {verifying ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.parentalSubmitText}>Verify & Continue</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Reusable Components
const LoadingState = ({ message = "Loading..." }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#FF6B47" />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

const ErrorState = ({ message, onRetry, retryText = "Go Back" }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{message}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>{retryText}</Text>
    </TouchableOpacity>
  </View>
);

const UserAvatar = ({ profilePic, userName, username, size = 48, onPress }) => {
  const getProfilePicUrl = (profilePic) => {
    if (!profilePic) {
      return 'https://randomuser.me/api/portraits/men/32.jpg';
    }

    if (profilePic.startsWith('http://') || profilePic.startsWith('https://')) {
      return profilePic;
    }

    if (profilePic.startsWith('/media/')) {
      return `${TWIMBOL_API_CONFIG.BASE_URL}${profilePic}`;
    }

    return `${TWIMBOL_API_CONFIG.BASE_URL}/${profilePic}`;
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (profilePic) {
    return (
      <TouchableOpacity onPress={onPress}>
        <Image
          source={{ uri: getProfilePicUrl(profilePic) }}
          style={[styles.avatar, avatarStyle]}
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.avatar, styles.placeholderAvatar, avatarStyle]}>
        <Text style={[styles.avatarInitial, { fontSize: size * 0.4 }]}>
          {userName?.charAt(0) || username?.charAt(0) || 'U'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const InteractionButton = ({ icon, text, onPress, isActive = false, disabled = false }) => (
  <TouchableOpacity
    style={styles.interactionButton}
    onPress={onPress}
    disabled={disabled}
  >
    {icon}
    <Text style={[styles.interactionText, isActive && { color: "#FF4B4B" }]}>
      {text}
    </Text>
  </TouchableOpacity>
);

const PostHeader = ({ user_profile, userName, username, user_id, userId, followsUser, onFollowPress, created_at, onMoreOptions }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.postHeader}>
      <View style={styles.userInfo}>
        <UserAvatar
          profilePic={user_profile?.user?.profile_pic}
          userName={userName}
          username={username}
          size={48}
        />
        <View>
          <View style={styles.creatorInfoContainer}>
            <Text style={styles.userName}>{userName || username}</Text>
            {userId && (
              <TouchableOpacity
                style={styles.followButton}
                onPress={() => onFollowPress(user_id)}
              >
                <Ionicons
                  name={followsUser ? "checkmark" : "person-add-outline"}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.timeAgo}>{formatDate(created_at)}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onMoreOptions}>
        <Text style={styles.moreOptions}>•••</Text>
      </TouchableOpacity>
    </View>
  );
};

const CommentItem = ({ item, userId, onUserPress, onDelete }) => {
  const getUserFullName = (user) => {
    if (!user) return 'User';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName} ${lastName}`.trim() || user.username || 'User';
  };

  const comment_user = item.created_by?.user;
  const fullName = getUserFullName(comment_user);
  const username = comment_user?.username;
  const commentUserId = comment_user?.id;

  const canDelete = userId && commentUserId &&
    (parseInt(userId) === parseInt(commentUserId) || userId.toString() === commentUserId.toString());

  return (
    <View style={styles.commentItem}>
      <View style={styles.avatarContainer}>
        <UserAvatar
          profilePic={comment_user?.profile_pic}
          userName={fullName}
          username={username}
          size={40}
          onPress={() => onUserPress(commentUserId)}
        />
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <TouchableOpacity
            onPress={() => onUserPress(commentUserId)}
            style={styles.userInfoContainer}
          >
            <Text style={styles.commentFullName}>{fullName}</Text>
            {username && (
              <Text style={styles.commentUsername}>@{username}</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.commentTime}>
            <TimeAgo time_string={item.created_at} />
          </Text>
        </View>
        <Text style={styles.commentText}>{item.comment}</Text>

        {canDelete && (
          <TouchableOpacity
            onPress={() => onDelete(item.id, item.post)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const FullScreenImageModal = ({ visible, imageUri, onClose }) => {
  const [imageScale] = useState(new Animated.Value(1));
  const [imageTranslateX] = useState(new Animated.Value(0));
  const [imageTranslateY] = useState(new Animated.Value(0));

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        imageTranslateX.setOffset(imageTranslateX._value);
        imageTranslateY.setOffset(imageTranslateY._value);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: imageTranslateX, dy: imageTranslateY }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        imageTranslateX.flattenOffset();
        imageTranslateY.flattenOffset();

        if (gestureState.dy > 100 && Math.abs(gestureState.vx) < Math.abs(gestureState.vy)) {
          onClose();
        } else {
          Animated.spring(imageTranslateX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
          Animated.spring(imageTranslateY, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      imageScale.setValue(1);
      imageTranslateX.setValue(0);
      imageTranslateY.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar hidden={true} />
      <View style={styles.fullScreenContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>

        <View style={styles.imageContainer} {...panResponder.panHandlers}>
          <Animated.Image
            source={{ uri: imageUri }}
            style={[
              styles.fullScreenImage,
              {
                transform: [
                  { scale: imageScale },
                  { translateX: imageTranslateX },
                  { translateY: imageTranslateY },
                ],
              },
            ]}
            resizeMode="contain"
          />
        </View>

        <View style={styles.imageActions}>
          <Text style={styles.swipeHint}>Swipe down to close</Text>
        </View>
      </View>
    </Modal>
  );
};

// Main Component
const PostDetails = ({ route }) => {
  const { id } = route.params || {};
  const navigation = useNavigation();

  const { data: data, loading: loading, error: postError, refetch } = useFetch(
    () => fetchPost({ postId: id })
  );

  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [userId, setUserId] = useState('');
  const [followsUser, setFollowsUser] = useState(false);

  // Like states
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likingInProgress, setLikingInProgress] = useState(false);

  // Full screen image viewer state
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const [fullScreenImageUri, setFullScreenImageUri] = useState('');

  // Context menu state
  const [showContextMenu, setShowContextMenu] = useState(false);

  // Safety prompt states
  const [showSafetyPrompt, setShowSafetyPrompt] = useState(false);
  const [safetyPromptPassed, setSafetyPromptPassed] = useState(false);
  const [parentalOverride, setParentalOverride] = useState(false);

  const textInputRef = useRef(null);

  // Get user ID from AsyncStorage
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('user_id');
      if (id) {
        setUserId(id);
      }
    };
    fetchUserId();
  }, []);

  // Update post data and follow status when data changes
  useEffect(() => {
    if (data) {
      setPost(data);
      setLiked(data.liked_by_user);
      setLikeCount(data.like_count || 0);
      setFollowsUser(data.user_profile?.followed_by_user || false);
    }
  }, [data]);

  // Check if safety prompt should be shown when trying to comment
  const checkSafetyPrompt = async () => {
    if (safetyPromptPassed || parentalOverride) {
      return true;
    }

    try {
      const lastShown = await AsyncStorage.getItem(STORAGE_KEYS.SAFETY_PROMPT_SHOWF);
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      // Show prompt if never shown or shown more than 24 hours ago
      if (!lastShown || parseInt(lastShown) < oneDayAgo) {
        setShowSafetyPrompt(true);
        return false;
      } else {
        setSafetyPromptPassed(true);
        return true;
      }
    } catch (error) {
      console.error('Error checking safety prompt:', error);
      setShowSafetyPrompt(true);
      return false;
    }
  };

  // Handle safety prompt close
  const handleSafetyPromptClose = () => {
    setShowSafetyPrompt(false);
    setSafetyPromptPassed(true);
    // Focus on input after prompt is closed
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 500);
  };

  // Handle parental override
  const handleParentalOverride = () => {
    setShowSafetyPrompt(false);
    setParentalOverride(true);
    setSafetyPromptPassed(true);
    // Focus on input after override
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 500);
  };

  // Fetch comments
  const fetchCommentsData = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (!id) return;

    try {
      setCommentsLoading(pageNum === 1 && !isRefresh);

      const data = await fetchComments(id, pageNum);

      setTotalComments(data.count || 0);

      if (isRefresh || pageNum === 1) {
        setComments(data.results || []);
      } else {
        setComments(prev => [...prev, ...(data.results || [])]);
      }

      setHasMore(!!data.next);
      setPage(pageNum);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load comments',
        position: 'top',
      });
    } finally {
      setCommentsLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  // Load comments when post is loaded
  useEffect(() => {
    if (post && id) {
      fetchCommentsData(1);
    }
  }, [post, id, fetchCommentsData]);

  // Handle user profile navigation
  const handleUserPress = useCallback((userId) => {
    if (userId) {
      navigation.navigate('profile', { userId: userId });
    }
  }, [navigation]);

  // Toggle like functionality
  const toggleLike = useCallback(async () => {
    if (likingInProgress) return;

    if (!userId) {
      Toast.show({
        type: 'info',
        text1: 'Login Required',
        text2: 'Please log in to like posts!',
        position: 'top',
      });
      return;
    }

    const originalLiked = liked;
    const originalCount = likeCount;

    // Optimistic update
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    setLikingInProgress(true);

    try {
      if (!liked) {
        await postLikes(id);
      } else {
        await deleteLikes(id);
      }
    } catch (error) {
      // Revert on error
      setLiked(originalLiked);
      setLikeCount(originalCount);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update like',
        position: 'top',
      });
    } finally {
      setLikingInProgress(false);
    }
  }, [liked, likeCount, userId, id, likingInProgress]);

  // Handle comment focus - check safety prompt first
  const handleCommentFocus = async () => {
    if (!userId) {
      Toast.show({
        type: 'info',
        text1: 'Login Required',
        text2: 'Please log in to comment!',
        position: 'top',
      });
      return;
    }

    const canProceed = await checkSafetyPrompt();
    if (canProceed) {
      textInputRef.current?.focus();
    }
  };

  // Handle comment submission
  const handleSubmitComment = useCallback(async () => {
    if (!commentText.trim() || isSubmitting || !id) return;

    if (!userId) {
      Toast.show({
        type: 'info',
        text1: 'Login Required',
        text2: 'Please log in to comment!',
        position: 'top',
      });
      return;
    }

    // Check safety prompt before submitting
    const canProceed = await checkSafetyPrompt();
    if (!canProceed) return;

    try {
      setIsSubmitting(true);

      const newCommentData = await postComment(id, commentText.trim());

      setComments(prev => [newCommentData, ...prev]);
      setCommentText('');
      setTotalComments(prev => prev + 1);

      Keyboard.dismiss();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Comment posted!',
        position: 'top',
      });

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to post comment',
        position: 'top',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [commentText, isSubmitting, id, userId, checkSafetyPrompt]);

  // Handle comment deletion
  const handleDeleteComment = useCallback(async (commentId, postId) => {
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
              await deleteComment(postId, commentId);

              setComments(prev => prev.filter(c => c.id !== commentId));
              setTotalComments(prev => prev - 1);

              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Comment removed successfully.',
                position: 'top',
              });
            } catch (error) {
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
  }, []);

  // Load more comments
  const loadMoreComments = useCallback(() => {
    if (!commentsLoading && hasMore) {
      fetchCommentsData(page + 1);
    }
  }, [commentsLoading, hasMore, page, fetchCommentsData]);

  // Refresh comments
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCommentsData(1, true);
  }, [fetchCommentsData]);

  // Full screen image handlers
  const openFullScreenImage = useCallback((imageUri) => {
    setFullScreenImageUri(imageUri);
    setShowFullScreenImage(true);
  }, []);

  const closeFullScreenImage = useCallback(() => {
    setShowFullScreenImage(false);
    setFullScreenImageUri('');
  }, []);

  const handleFollowPress = useCallback(async (user_id) => {
    if (!user_id) return;

    const previousFollowState = followsUser;
    setFollowsUser(prev => !prev);

    try {
      const response = await followUser(user_id);

      if (response.ok) {
        Toast.show({
          type: followsUser ? 'info' : 'success',
          text1: 'Success',
          text2: followsUser ? 'Unfollowed user!' : 'Followed user!',
          position: 'top',
        });
      } else {
        setFollowsUser(previousFollowState);
      }
    } catch (error) {
      setFollowsUser(previousFollowState);
    }
  }, [followsUser]);

  // Context menu handlers
  const handleMoreOptions = useCallback(() => {
    setShowContextMenu(true);
  }, []);
  
  const handleContextMenuClose = useCallback(() => {
    setShowContextMenu(false);
  }, []);

  const showToastMessage = useCallback((message) => {
    Toast.show({
      type: 'info',
      text1: 'Info',
      text2: message,
      position: 'top',
    });
  }, []);

  const handlePostHidden = useCallback(() => {
    Toast.show({
      type: 'success',
      text1: 'Post Hidden',
      text2: 'The post has been hidden from your feed.',
      position: 'top',
    });
    navigation.goBack();
  }, [navigation]);

  const handleUserBlocked = useCallback(() => {
    Toast.show({
      type: 'success',
      text1: 'User Blocked',
      text2: 'You will no longer see posts from this user.',
      position: 'top',
    });
    navigation.goBack();
  }, [navigation]);
  
  const handleShare = async (postId) => {
    try {
      const result = await Share.share({
        message: `Read this post on Twimbool!\nhttps://twimbol.com/posts/${postId}`,
      });

      if (result.action === Share.sharedAction) {
        Toast.show({
          type: 'success',
          text1: 'Shared!',
          text2: 'Reel shared with friends 🚀',
          position: 'bottom',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Failed to share. Try again.',
        position: 'bottom',
      });
    }
  };

  const renderComment = useCallback(({ item }) => (
    <CommentItem
      item={item}
      userId={userId}
      onUserPress={handleUserPress}
      onDelete={handleDeleteComment}
    />
  ), [userId, handleUserPress, handleDeleteComment]);

  const renderFooter = useCallback(() => {
    if (!commentsLoading || page === 1) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#666" />
      </View>
    );
  }, [commentsLoading, page]);

  // Early returns after all hooks
  if (loading) {
    return <LoadingState message="Loading post..." />;
  }

  if (error || postError) {
    return (
      <ErrorState
        message={error || postError}
        onRetry={() => navigation.goBack()}
      />
    );
  }

  if (!post) {
    return <LoadingState message="Loading post..." />;
  }

  const {
    post_title,
    post_description,
    created_at,
    post_banner,
    user_profile,
  } = post;

  const userName = user_profile?.user?.first_name + ' ' + user_profile?.user?.last_name;
  const username = post?.username?.username || '';
  const user_id = post?.user_id || user_profile?.user?.id;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top", "left", "right", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <ArrowLeft size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Post</Text>
              <View style={styles.headerRight} />
            </View>

            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContentContainer}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.postContainer}>
                <PostHeader
                  user_profile={user_profile}
                  userName={userName}
                  username={username}
                  user_id={user_id}
                  userId={userId}
                  followsUser={followsUser}
                  onFollowPress={handleFollowPress}
                  created_at={created_at}
                  onMoreOptions={handleMoreOptions}
                />

                {post_title && (
                  <Text style={styles.postTitle}>{post_title}</Text>
                )}

                <Text style={styles.postDescription}>{post_description}</Text>

                {post_banner && (
                  <TouchableOpacity
                    onPress={() => openFullScreenImage(post_banner)}
                    activeOpacity={0.9}
                    style={styles.postImageContainer}
                  >
                    <Image
                      source={{ uri: post_banner }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                      <Ionicons name="expand-outline" size={24} color="white" />
                    </View>
                  </TouchableOpacity>
                )}

                <View style={styles.statsContainer}>
                  <Text style={styles.likeStats}>
                    {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                  </Text>
                  <Text style={styles.commentStats}>
                    {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.interactionBar}>
                  <InteractionButton
                    icon={
                      <Ionicons
                        name={liked ? "heart" : "heart-outline"}
                        size={22}
                        color={liked ? "#FF4B4B" : "#666"}
                      />
                    }
                    text="Like"
                    onPress={toggleLike}
                    isActive={liked}
                    disabled={likingInProgress}
                  />

                  <InteractionButton
                    icon={<MessageSquare size={22} color="#666" />}
                    text="Comment"
                    onPress={handleCommentFocus}
                  />

                  <InteractionButton
                    icon={<Share2 size={22} color="#666" />}
                    text="Share"
                    onPress={() => handleShare(id)}
                  />
                </View>

                {/* <View style={styles.divider} />

                <View style={styles.commentsSection}>
                  <Text style={styles.commentsHeader}>
                    Comments ({totalComments})
                  </Text>

                  {commentsLoading && comments.length === 0 ? (
                    <LoadingState message="Loading comments..." />
                  ) : (
                    <FlatList
                      data={comments}
                      keyExtractor={(item, index) => `comment-${item.id}-${index}`}
                      renderItem={renderComment}
                      onEndReached={loadMoreComments}
                      onEndReachedThreshold={0.1}
                      ListFooterComponent={renderFooter}
                      refreshing={refreshing}
                      onRefresh={handleRefresh}
                      scrollEnabled={false}
                      ListEmptyComponent={() => (
                        <Text style={styles.noComments}>
                          No comments yet. Be the first to comment!
                        </Text>
                      )}
                    />
                  )}
                </View> {/* Comments Section */}
              </View>
            </ScrollView>

            <View style={styles.commentInputContainer}>
              <TextInput
                ref={textInputRef}
                style={[
                  styles.commentInput,
                  (!userId || isSubmitting || (!safetyPromptPassed && !parentalOverride)) && styles.disabledInput
                ]}
                placeholder={
                  !userId
                    ? "Please log in to comment..."
                    : (!safetyPromptPassed && !parentalOverride)
                      ? "Tap to verify parental permission..."
                      : isSubmitting
                        ? "Posting comment..."
                        : "Write a comment..."
                }
                placeholderTextColor={(!userId || isSubmitting || (!safetyPromptPassed && !parentalOverride)) ? "#ccc" : "#999"}
                value={commentText}
                onChangeText={setCommentText}
                onFocus={handleCommentFocus}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleSubmitComment}
                blurOnSubmit={false}
                editable={userId && (safetyPromptPassed || parentalOverride) && !isSubmitting}
              />
              <TouchableOpacity
                style={[
                  styles.commentSubmitButton,
                  (isSubmitting || !commentText.trim() || !userId || (!safetyPromptPassed && !parentalOverride)) && styles.disabledButton
                ]}
                onPress={handleSubmitComment}
                disabled={isSubmitting || !commentText.trim() || !userId || (!safetyPromptPassed && !parentalOverride)}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            <FullScreenImageModal
              visible={showFullScreenImage}
              imageUri={fullScreenImageUri}
              onClose={closeFullScreenImage}
            />

            {/* Safety Prompt */}
            <SafetyPrompt
              visible={showSafetyPrompt}
              onClose={handleSafetyPromptClose}
              onParentalOverride={handleParentalOverride}
            />

            {/* Context Menu */}
            <ContextMenu
              visible={showContextMenu}
              onClose={handleContextMenuClose}
              post={post}
              userId={userId}
              onPostHidden={handlePostHidden}
              onUserBlocked={handleUserBlocked}
              showToastMessage={showToastMessage}
              allPosts={[]} // Single post, so empty array
            />
          </View>
          <Toast />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  backButton: {
    padding: 4,
  },
  headerRight: {
    width: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e53935',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF6B47',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
    width: '100%',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
    elevation: 3,
  },
  placeholderAvatar: {
    backgroundColor: '#FF6B47',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  followButton: {
    backgroundColor: '#FF4B4B',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
  },
  creatorInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeAgo: {
    fontSize: 12,
    color: '#888',
  },
  moreOptions: {
    fontSize: 18,
    fontWeight: 'bold',
    transform: [{ rotate: '90deg' }],
    color: '#666',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  postDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    marginBottom: 16,
  },
  postImageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  likeStats: {
    fontSize: 14,
    color: '#666',
  },
  commentStats: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  interactionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  commentsSection: {
    marginTop: 12,
  },
  commentsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noComments: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
    paddingVertical: 20,
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
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 8,
    fontSize: 16,
  },
  disabledInput: {
    opacity: 0.6,
    color: '#999',
  },
  commentSubmitButton: {
    backgroundColor: '#FF6B47',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  // Full screen image styles
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth,
    height: screenHeight,
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenHeight,
  },
  imageActions: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHint: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  // Safety prompt styles
  safetyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  safetyModalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  safetyHeader: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  safetyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  safetyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  safetyContent: {
    padding: 20,
  },
  safetySubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  safetyPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 8,
  },
  safetyPointText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginLeft: 12,
  },
  bold: {
    fontWeight: '600',
    color: '#333',
  },
  requiredParentalSection: {
    margin: 20,
    marginTop: 12,
    padding: 20,
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: ACCENT_COLOR,
  },
  requiredParentalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  showPasswordButton: {
    backgroundColor: ACCENT_COLOR,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showPasswordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  parentalInputContainer: {
    marginTop: 12,
  },
  parentalInputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  parentalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  parentalInputButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  parentalCancelButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  parentalCancelText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  parentalSubmitButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    marginLeft: 8,
    backgroundColor: ACCENT_COLOR,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  parentalSubmitText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PostDetails;