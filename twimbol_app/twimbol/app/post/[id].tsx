import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useParams } from 'react-router-native';
import { Heart, MessageSquare, Share2, Bookmark, ArrowLeft } from 'lucide-react-native';

import { TWIMBOL_API_CONFIG } from '@/services/api';
import { useNavigation } from '@react-navigation/native';

const PostDetails = ({ route }) => {
  const { id } = route.params || {};
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


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
    comments 
  } = post;
  
  const userName = user_profile?.user?.first_name + ' ' + user_profile?.user?.last_name;
  const userProfilePic = user_profile?.user?.profile_pic;
  const username = post?.username?.username || '';
  
  return (
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
      
      <ScrollView style={styles.scrollContainer}>
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
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  {/* Comment implementation goes here */}
                  <Text>Comment placeholder</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.commentInputContainer}>
        {/* Comment input implementation goes here */}
        <View style={styles.commentInputPlaceholder}>
          <Text style={styles.commentInputText}>Write a comment...</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  scrollContainer: {
    flex: 1,
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
  commentItem: {
    marginBottom: 16,
  },
  commentInputContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentInputPlaceholder: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 12,
  },
  commentInputText: {
    color: '#888',
  },
});

export default PostDetails;