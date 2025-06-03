import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Navigation } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const CreatorDashboard = () => {
  // Analytics data
  const analytics = {
    views: '27.8K',
    likes: '7.8K',
    followers: '13.6K',
  };

  // Recent uploads data
  const recentUploads = [
    {
      id: 1,
      thumbnail: require('@/assets/images/banners/kids.jpg'), // Replace with your actual asset
      title: 'Summer vlog #3',
      likes: '23.7K',
      comments: '856',
    },
  ];

  const navigation = useNavigation()

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Creator Dashboard</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Analytics Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Analytics (Total):</Text>

          <View style={styles.analyticsContainer}>
            {/* Views */}
            <View style={styles.analyticsItem}>
              <View style={[styles.analyticCircle, { backgroundColor: '#FF4D4D' }]}>
                <Text style={styles.analyticValue}>{analytics.views}</Text>
              </View>
              <View style={styles.labelContainer}>
                <View style={[styles.labelDot, { backgroundColor: '#FF4D4D' }]} />
                <Text style={styles.labelText}>Views</Text>
              </View>
            </View>

            {/* Likes */}
            <View style={styles.analyticsItem}>
              <View style={[styles.analyticCircle, styles.mediumCircle, { backgroundColor: '#FFB800' }]}>
                <Text style={styles.analyticValue}>{analytics.likes}</Text>
              </View>
              <View style={styles.labelContainer}>
                <View style={[styles.labelDot, { backgroundColor: '#FFB800' }]} />
                <Text style={styles.labelText}>Likes</Text>
              </View>
            </View>

            {/* Followers */}
            <View style={styles.analyticsItem}>
              <View style={[styles.analyticCircle, { backgroundColor: '#FF8A65' }]}>
                <Text style={styles.analyticValue}>{analytics.followers}</Text>
              </View>
              <View style={styles.labelContainer}>
                <View style={[styles.labelDot, { backgroundColor: '#FF8A65' }]} />
                <Text style={styles.labelText}>Followers</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Create New Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create New:</Text>

          <View style={styles.createButtonsContainer}>
            <TouchableOpacity style={styles.createButton} onPress={()=>{navigation.navigate('createcontents', {create_contents: 'post'})}}>
              <Text style={styles.createButtonText}>Post</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.createButton}onPress={()=>{navigation.navigate('createcontents', {create_contents: 'reel'})}}>
              <Text style={styles.createButtonText}>Reel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.createButton}onPress={()=>{navigation.navigate('createcontents', {create_contents: 'video'})}}>
              <Text style={styles.createButtonText}>Video</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Uploads Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Uploads:</Text>

          {recentUploads.map((upload) => (
            <View key={upload.id} style={styles.uploadItem}>
              <Image source={upload.thumbnail} style={styles.thumbnail} />
              <View style={styles.uploadInfoContainer}>
                <Text style={styles.uploadTitle}>{upload.title}</Text>
              </View>
              <View style={styles.uploadStatsContainer}>
                <Text style={styles.statsText}>❤️ {upload.likes}</Text>
                <Text style={styles.statsText}>💬 {upload.comments}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingBottom: 40,
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#222',
      },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  analyticsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analyticsItem: {
    alignItems: 'center',
  },
  analyticCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediumCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  analyticValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  labelText: {
    fontSize: 12,
    color: '#666',
  },
  createButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  createButton: {
    backgroundColor: '#FFF8E1',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#333',
  },
  uploadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  thumbnail: {
    width: 60,
    height: 45,
    borderRadius: 8,
    marginRight: 12,
  },
  uploadInfoContainer: {
    flex: 1,
  },
  uploadTitle: {
    fontWeight: '500',
    color: '#333',
  },
  uploadStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
});

export default CreatorDashboard;