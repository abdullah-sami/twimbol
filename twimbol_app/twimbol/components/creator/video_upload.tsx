import { useNavigation } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    SafeAreaView,
    StatusBar,
    Platform,
    Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { TWIMBOL_API_CONFIG } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateVideo = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [reelFile, setReelFile] = useState(null);
    const [videoUri, setVideoUri] = useState(null);
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState(null);

    const navigation = useNavigation();

    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    
    
    
   
    
    const pickVideo = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'We need access to your media library to upload videos');
            return;
        }
    
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: false,
                quality: 1,
            });
    
            if (!result.canceled) {
                const selectedUri = result.assets[0].uri;
                const name = selectedUri.split('/').pop();
    
                // Check file info including size
                const fileInfo = await FileSystem.getInfoAsync(selectedUri);
                console.log('File info:', fileInfo);
    
                // Convert bytes to MB for display
                const fileSizeInMB = (fileInfo.size / (1024 * 1024)).toFixed(2);
                setFileSize(fileSizeInMB);
    
                // Check if file size is too large (e.g., over 100MB)
                if (fileInfo.size > 100 * 1024 * 1024) {
                    Alert.alert(
                        'File too large',
                        'The selected video is larger than 100MB. Please choose a smaller video.'
                    );
                    return;
                }
    
                setVideoUri(selectedUri);
                setFileName(name);
                setReelFile(result.assets[0]);
    
                console.log(`Selected video: ${name} (${fileSizeInMB} MB)`);
            }
        } catch (error) {
            console.error('Error picking video:', error);
            Alert.alert('Error', 'Failed to select video');
        }
    };

    const uploadVideo = async () => {
        if (!videoUri) {
            Alert.alert('Error', 'Please select a video first');
            return;
        }

        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            console.log('Starting upload...');
            console.log('Video URI:', videoUri);
            console.log('File name:', fileName);
            console.log('File size:', fileSize, 'MB');
            
            // Check token before upload
            const token = await AsyncStorage.getItem('access');
            if (!token) {
                throw new Error('Authentication token not found');
            }
            console.log('Token available:', token ? 'Yes' : 'No');
            
            // Create form data
            const formData = new FormData();
            
            // Append video with appropriate mime type
            const fileType = fileName.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';
            
            formData.append('video', {
                uri: Platform.OS === 'ios' ? videoUri.replace('file://', '') : videoUri,
                name: fileName,
                type: fileType,
            });
            
            formData.append('title', title);
            
            if (description.trim()) {
                formData.append('description', description);
            }
            
            
            
            // Log API endpoint
            const apiEndpoint = `${TWIMBOL_API_CONFIG.BASE_URL}/create/video/`;
            console.log('API endpoint:', apiEndpoint);
            
            // Use the fetch API for upload
            console.log('Using fetch API for upload');
            
            const headers = {
                'Authorization': `Bearer ${token}`,
                // Do not set 'Content-Type' manually for multipart/form-data
            };
            
            
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: headers,
                body: formData,
            });
            
            console.log('Response status:', response);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Upload response data:', data);
            
            Alert.alert('Success', 'Video uploaded successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Upload error details:', error);
            
            // More descriptive error messages
            if (error.message.includes('Network request failed')) {
                Alert.alert(
                    'Network Error', 
                    'Failed to connect to the server. Please check your internet connection and try again.'
                );
            } else if (error.message.includes('403')) {
                Alert.alert(
                    'Permission Error', 
                    'CSRF verification failed. Please try again or restart the app.'
                );
                
                // Try to refresh the CSRF token
                getCsrfTokenFromServer();
            } else {
                Alert.alert('Error', `Failed to upload video: ${error.message}`);
            }
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    // Add timeout progress simulation for user feedback during upload
    useEffect(() => {
        let progressInterval;
        
        if (uploading) {
            progressInterval = setInterval(() => {
                setProgress(prevProgress => {
                    // Cap progress at 90% until we get actual confirmation
                    return prevProgress < 90 ? prevProgress + 5 : prevProgress;
                });
            }, 500);
        }
        
        return () => {
            if (progressInterval) clearInterval(progressInterval);
        };
    }, [uploading]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#FF6E42" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Upload Video</Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
                {/* Title Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Title :</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter title"
                    />
                </View>

                {/* Description Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description :</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Enter description"
                        multiline={true}
                        numberOfLines={4}
                    />
                </View>

                {/* File Upload */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Choose file :</Text>
                    <TouchableOpacity
                        style={styles.uploadContainer}
                        onPress={pickVideo}
                        activeOpacity={0.7}
                        disabled={uploading}
                    >
                        {reelFile ? (
                            <View style={styles.fileSelectedContainer}>
                                <Text style={styles.fileSelectedText}>File selected</Text>
                                <Text style={styles.fileName}>{fileName}</Text>
                                {fileSize && <Text style={styles.fileSize}>{fileSize} MB</Text>}
                            </View>
                        ) : (
                            <View style={styles.uploadContent}>
                                <View style={styles.uploadPlaceholder}>
                                    <Plus size={24} color="#000" />
                                    <Text style={styles.uploadText}>Click to upload video</Text>
                                    
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Uploading Progress (Conditionally rendered) */}
                {uploading && (
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${progress}%` }]} />
                        <Text style={styles.progressText}>{progress.toFixed(0)}% Uploaded</Text>
                    </View>
                )}

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.button, uploading && styles.disabledButton]} 
                        onPress={uploadVideo}
                        disabled={uploading}
                    >
                        <Text style={styles.buttonText}>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: 'white', borderColor: 'red', borderWidth: 1 }]} 
                        onPress={() => { navigation.goBack() }}
                        disabled={uploading}
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
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ECECEC',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    uploadContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ECECEC',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    uploadContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadText: {
        color: '#666',
        fontSize: 14,
    },
    fileSelectedContainer: {
        alignItems: 'center',
    },
    fileSelectedText: {
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    fileName: {
        color: '#666',
        fontSize: 13,
    },
    fileSize: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
    progressContainer: {
        marginBottom: 20,
        backgroundColor: '#E0E0E0',
        height: 20,
        borderRadius: 10,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FF6E42',
    },
    progressText: {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        color: '#333',
        fontSize: 12,
        fontWeight: 'bold',
        lineHeight: 20,
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
    disabledButton: {
        backgroundColor: '#CCCCCC',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default CreateVideo;