import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TWIMBOL_API_CONFIG } from '@/services/api';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  const navigation = useNavigation();

  // Fetch userId from AsyncStorage
  useEffect(() => {
    const checkUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          console.error('User ID not found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error retrieving user ID:', error);
      }
    };

    checkUserId();
  }, []);

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('access');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const handleImageUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'You need to grant permission to access the gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      console.log('Selected Image:', result.assets[0].uri);
      setBannerImage(result.assets[0].uri); // Update the banner image
    } else {
      console.log('User cancelled image picker');
    }
  };

  const handlePost = async () => {
    if (!title) {
      Alert.alert('Error', 'Add a title!');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('post_type', 'post');
    formData.append('post_title', title);
    formData.append('post_description', description);
    formData.append('created_by', userId || '4'); // Replace with the actual user ID
    if (bannerImage){
      formData.append('post_banner', {
        uri: bannerImage,
      type: 'image/jpeg',
      name: `post_banner_${Date.now()}.jpg`,
    });
  }

    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${TWIMBOL_API_CONFIG.BASE_URL}/api/posts/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload post: ${errorText}`);
      }

      const data = await response.json();
      console.log('Post uploaded successfully:', data);

      Alert.alert('Success', 'Post uploaded successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error uploading post:', error);
      Alert.alert('Error', 'Failed to upload the post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF6E42" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Create Post</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title :</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter post title"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description :</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter post description"
            multiline={true}
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Post Banner :</Text>
          <TouchableOpacity style={styles.uploadContainer} onPress={handleImageUpload}>
            {bannerImage ? (
              <Image source={{ uri: bannerImage }} style={styles.bannerImage} alt="Post banner" />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Plus size={24} color="#000" />
                <Text style={styles.uploadText}>Click to upload image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.disabledButton]}
            onPress={handlePost}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Uploading...' : 'Post'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: 'white', borderColor: 'red', borderWidth: 1 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.buttonText, { color: 'black' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF6E42',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  uploadContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    marginTop: 8,
    color: '#333',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 16,
  },
  button: {
    backgroundColor: '#FF6E42',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#ffaa9a',
  },
});

export default CreatePost;