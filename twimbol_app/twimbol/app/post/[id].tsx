import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { Heart, MessageSquare, Share2, Bookmark, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TWIMBOL_API_CONFIG } from '@/services/api';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PostDetails = ({ route }) => {
  const { id } = route.params || {};
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState([]);

  const navigation = useNavigation()

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${TWIMBOL_API_CONFIG.BASE_URL}/api/posts/${id}`);

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        setPost(data);
        setComments(data.results || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load post');
        setLoading(false);
        console.error('Error fetching post:', err);
      }
    };

    fetchPostData();
  }, [id]);

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

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('access');
      
      const response = await fetch(`${TWIMBOL_API_CONFIG.BASE_URL}/api/posts/${id}/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: commentText
        })
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const newComment = await response.json();
      setComments([newComment, ...comments]);
      setCommentText('');
      Keyboard.dismiss();
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
    like_count,
    post_banner,
    user_profile,
  } = post;

  const userName = user_profile?.user?.first_name + ' ' + user_profile?.user?.last_name;
  const userProfilePic = user_profile?.user?.profile_pic;
  const username = post?.username?.username || '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right", "bottom"]}>
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

              <TouchableOpacity>
                <Text style={styles.moreOptions}>•••</Text>
              </TouchableOpacity>
            </View>

            {post_title && (
              <Text style={styles.postTitle}>{post_title}</Text>
            )}

            <Text style={styles.postDescription}>{post_description}</Text>

            {post_banner && (
              <Image
                source={{ uri: post_banner }}
                style={styles.postImage}
                resizeMode="cover"
              />
            )}

            <View style={styles.statsContainer}>
              <Text style={styles.likeStats}>
                {like_count} {like_count === 1 ? 'like' : 'likes'}
              </Text>
              <Text style={styles.commentStats}>
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.interactionBar}>
              <TouchableOpacity style={styles.interactionButton}>
                <Heart size={22} color="#666" />
                <Text style={styles.interactionText}>Like</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.interactionButton}>
                <MessageSquare size={22} color="#666" />
                <Text style={styles.interactionText}>Comment</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.interactionButton}>
                <Share2 size={22} color="#666" />
                <Text style={styles.interactionText}>Share</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.commentsSection}>
              <Text style={styles.commentsHeader}>Comments</Text>

              {comments.length === 0 ? (
                <Text style={styles.noComments}>No comments yet. Be the first to comment!</Text>
              ) : (
                comments.map((item) => (
                  <View key={item.post} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      {item.user.profile_pic ? (
                        <Image
                          source={{ uri: `${TWIMBOL_API_CONFIG.BASE_URL}${item.user.profile_pic}` }}
                          style={styles.commentAvatar}
                        />
                      ) : (
                        <View style={[styles.commentAvatar, styles.placeholderAvatar]}>
                          <Text style={styles.avatarInitial}>
                            {item.user.first_name?.charAt(0) || 'U'}
                          </Text>
                        </View>
                      )}
                      <View style={styles.commentUserInfo}>
                        <Text style={styles.commentUserName}>
                          {item.user.first_name} {item.user.last_name}
                        </Text>
                        <Text style={styles.commentTime}>
                          {formatDate(item.created_at)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.commentContent}>{item.comment}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity 
              style={[
                styles.commentSubmitButton,
                (isSubmitting || !commentText.trim()) && styles.disabledButton
              ]} 
              onPress={handleSubmitComment}
              disabled={isSubmitting || !commentText.trim()}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.commentSubmitText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingBottom: 80, // Add padding to prevent content from being hidden behind input
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
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 16,
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
  },
  commentInputPlaceholder: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 12,
  },
  commentInputText: {
    color: '#888',
  },
  commentItem: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentUserInfo: {
    flex: 1,
  },
  commentUserName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#222',
  },
  commentTime: {
    fontSize: 12,
    color: '#888',
  },
  commentContent: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 8,
  },
  commentSubmitButton: {
    backgroundColor: '#FF6B47',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentSubmitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PostDetails;