import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  TextInput 
} from 'react-native';
import { ArrowLeft, Bell, Calendar, ChevronLeft, Clock } from 'lucide-react-native';
import { TWIMBOL_API_CONFIG } from '@/services/api';

const { width } = Dimensions.get('window');

const ComingSoonPage = ({ navigation, route }) => {
  // Get page title from route params or use default
  const { title = 'Stay Tuned!', featureDescription = '', returnToHome = true } = route.params || {};
  
  const [email, setEmail] = useState('');
  const [notified, setNotified] = useState(false);
  const [error, setError] = useState('');
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(50))[0];
  
  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  const handleNotifyMe = async () => {
    // Basic email validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      // Here you would typically send this to your API
      // For now, just simulate a successful API call
      // const response = await fetch(`${TWIMBOL_API_CONFIG.BASE_URL}/api/notifications/subscribe`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ email, feature: title }),
      // });
      
      // if (!response.ok) throw new Error('Failed to subscribe');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotified(true);
      setError('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Error subscribing for notifications:', err);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {returnToHome && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerRight} />
      </View>
      
      <Animated.View 
        style={[
          styles.contentContainer, 
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateY }]
          }
        ]}
      >
        {/* <Image
          source={require('../assets/images/coming-soon.png')}
          style={styles.image}
          resizeMode="contain"
          defaultSource={require('../assets/images/placeholder.png')}
        /> */}
        
        <Text style={styles.mainTitle}>Coming Soon!</Text>
        
        <Text style={styles.description}>
          {featureDescription || `We're working hard to bring you this exciting new feature. Stay tuned for updates!`}
        </Text>
        
        {/* <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Calendar size={20} color="#FF6B47" />
            <Text style={styles.infoText}>Expected Launch: Q2 2025</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Clock size={20} color="#FF6B47" />
            <Text style={styles.infoText}>Development in Progress</Text>
          </View>
        </View> */}
        
        {/* {!notified ? (
          <View style={styles.notifyContainer}>
            <Text style={styles.notifyTitle}>
              <Bell size={16} color="#333" /> Get Notified When We Launch
            </Text>
            
            <TextInput
              style={styles.emailInput}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <TouchableOpacity 
              style={styles.notifyButton}
              onPress={handleNotifyMe}
            >
              <Text style={styles.notifyButtonText}>Notify Me</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.confirmedContainer}>
            <Text style={styles.confirmedText}>
              Thanks! We'll notify you when this feature launches.
            </Text>
          </View>
        )} */}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF6E42',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
},
headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
},
backButton: {
    padding: 4,
},
headerRight: {
    width: 24,
},
contentContainer: {
    marginTop: 250,
    flex: 1,
    alignItems: 'center',
    padding: 20,
},
image: {
    width: width * 0.7,
    height: width * 0.5,
    marginVertical: 30,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B47',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 40,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#555',
  },
  notifyContainer: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  notifyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emailInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    color: '#e53935',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  notifyButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FF6B47',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmedContainer: {
    width: '100%',
    backgroundColor: '#e6f7ed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  confirmedText: {
    color: '#2e7d32',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ComingSoonPage;