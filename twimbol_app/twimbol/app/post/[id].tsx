import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Keyboard, KeyboardAvoidingView, Platform, Alert, FlatList, Share, Modal, Dimensions, StatusBar, PanResponder, Animated } from 'react-native';
import { Heart, MessageSquare, Share2, Bookmark, ArrowLeft } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

import { TWIMBOL_API_CONFIG, fetchComments, postComment, deleteComment, postLikes, deleteLikes, fetchPost } from '@/services/api';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TimeAgo from '@/components/time';
import useFetch from '@/services/useFetch';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PostDetails = ({ route }) => {
  const { id } = route.params || {};

  const { data: data, loading: loading, error: postError, refetch } = useFetch(
    () => fetchPost({ postId: id }),)

  const [post, setPost] = useState(null);
  // const [loading, setLoading] = useState(true);
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

  // Like states
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likingInProgress, setLikingInProgress] = useState(false);

  // Full screen image viewer state
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const [fullScreenImageUri, setFullScreenImageUri] = useState('');
  const [imageScale] = useState(new Animated.Value(1));
  const [imageTranslateX] = useState(new Animated.Value(0));
  const [imageTranslateY] = useState(new Animated.Value(0));

  const textInputRef = useRef(null);
  const navigation = useNavigation();

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

  // Fetch post data
  useEffect(() => {
    if (data) {
      setPost(data);
      setLiked(data.liked_by_user);
      setLikeCount(data.like_count || 0);
    }
  }, [data]);

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
      console.error('Error fetching comments:', error);
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

  // Get full user name
  const getUserFullName = useCallback((user) => {
    if (!user) return 'User';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName} ${lastName}`.trim() || user.username || 'User';
  }, []);

  // Get profile picture URL
  const getProfilePicUrl = useCallback((profilePic) => {
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
  }, []);

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
      console.error('Error toggling like:', error);
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

    try {
      setIsSubmitting(true);

      const newCommentData = await postComment(id, commentText.trim());

      // Add new comment to top of list
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
      console.error('Error posting comment:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to post comment',
        position: 'top',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [commentText, isSubmitting, id, userId]);

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
    // Reset image transformations
    imageScale.setValue(1);
    imageTranslateX.setValue(0);
    imageTranslateY.setValue(0);
  }, [imageScale, imageTranslateX, imageTranslateY]);

  const closeFullScreenImage = useCallback(() => {
    setShowFullScreenImage(false);
    setFullScreenImageUri('');
  }, []);

  // Pan responder for image gestures
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

        // If dragged down significantly, close the modal
        if (gestureState.dy > 100 && Math.abs(gestureState.vx) < Math.abs(gestureState.vy)) {
          closeFullScreenImage();
        } else {
          // Spring back to center if not closing
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

  // Render individual comment
  const renderComment = useCallback(({ item }) => {
    const comment_user = item.created_by?.user;
    const fullName = getUserFullName(comment_user);
    const username = comment_user?.username;
    const profilePicUrl = getProfilePicUrl(comment_user?.profile_pic);
    const commentUserId = comment_user?.id;

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
            <Text style={styles.commentTime}>
              <TimeAgo time_string={item.created_at} />
            </Text>
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
      console.error('Sharing failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Failed to share. Try again.',
        position: 'bottom',
      });
    }
  };

  // Render loading footer for comments
  const renderFooter = useCallback(() => {
    if (!commentsLoading || page === 1) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#666" />
      </View>
    );
  }, [commentsLoading, page]);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B47" />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!post) return null;

  const {
    post_title,
    post_description,
    created_at,
    post_banner,
    user_profile,
  } = post;

  const userName = user_profile?.user?.first_name + ' ' + user_profile?.user?.last_name;
  const userProfilePic = user_profile?.user?.profile_pic;
  const username = post?.username?.username || '';

  return (<GestureHandlerRootView style={{flex: 1}}>
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
              <View style={styles.postHeader}>
                <View style={styles.userInfo}>
                  {userProfilePic ? (
                    <Image
                      source={{ uri: `${TWIMBOL_API_CONFIG.BASE_URL}${userProfilePic}` }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatar, styles.placeholderAvatar]}>
                      <Text style={styles.avatarInitial}>
                        {userName?.charAt(0) || username?.charAt(0) || 'U'}
                      </Text>
                    </View>
                  )}

                  <View>
                    <Text style={styles.userName}>{userName || username}</Text>
                    <Text style={styles.timeAgo}>{formatDate(created_at)}</Text>
                  </View>
                </View>
              </View>

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
                <TouchableOpacity
                  style={styles.interactionButton}
                  onPress={toggleLike}
                  disabled={likingInProgress}
                >
                  <Ionicons
                    name={liked ? "heart" : "heart-outline"}
                    size={22}
                    color={liked ? "#FF4B4B" : "#666"}
                  />
                  <Text style={[styles.interactionText, liked && { color: "#FF4B4B" }]}>
                    Like
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.interactionButton}
                  onPress={() => textInputRef.current?.focus()}
                >
                  <MessageSquare size={22} color="#666" />
                  <Text style={styles.interactionText}>Comment</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.interactionButton} onPress={() => handleShare(id)}>
                  <Share2 size={22} color="#666" />
                  <Text style={styles.interactionText}>Share</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.commentsSection}>
                <Text style={styles.commentsHeader}>
                  Comments ({totalComments})
                </Text>

                {commentsLoading && comments.length === 0 ? (
                  <View style={styles.loadingState}>
                    <ActivityIndicator size="large" color="#666" />
                    <Text style={styles.loadingText}>Loading comments...</Text>
                  </View>
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
              </View>
            </View>
          </ScrollView>

          <View style={styles.commentInputContainer}>
            <TextInput
              ref={textInputRef}
              style={[
                styles.commentInput,
                (!userId || isSubmitting) && styles.disabledInput
              ]}
              placeholder={
                !userId
                  ? "Please log in to comment..."
                  : isSubmitting
                    ? "Posting comment..."
                    : "Write a comment..."
              }
              placeholderTextColor={(!userId || isSubmitting) ? "#ccc" : "#999"}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSubmitComment}
              blurOnSubmit={false}
              editable={!(!userId || isSubmitting)}
            />
            <TouchableOpacity
              style={[
                styles.commentSubmitButton,
                (isSubmitting || !commentText.trim() || !userId) && styles.disabledButton
              ]}
              onPress={handleSubmitComment}
              disabled={isSubmitting || !commentText.trim() || !userId}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* Full Screen Image Modal */}
          <Modal
            visible={showFullScreenImage}
            transparent={true}
            animationType="fade"
            onRequestClose={closeFullScreenImage}
          >
            <StatusBar hidden={true} />
            <View style={styles.fullScreenContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeFullScreenImage}
              >
                <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>

              <View style={styles.imageContainer} {...panResponder.panHandlers}>
                <Animated.Image
                  source={{ uri: fullScreenImageUri }}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  placeholderAvatar: {
    backgroundColor: '#FF6B47',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  timeAgo: {
    fontSize: 12,
    color: '#888',
  },
  moreOptions: {
    fontSize: 20,
    fontWeight: 'bold',
    transform: [{ rotate: '90deg' }],
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
});

export default PostDetails;