import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { icons } from '@/constants/icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as IntentLauncher from 'expo-intent-launcher';



const Settings = ({ navigation }: any) => {
  // Navigation handlers
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleMenuItemPress = (screen) => {
    navigation.navigate(screen);
  };



  // Function to handle URL opening
  const openURL = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    } catch (error) {
      console.error('An error occurred', error);
    }
  };

  // Function to handle email opening
  const openEmail = async (email: string, subject = '', body = '') => {
  await IntentLauncher.startActivityAsync('android.intent.action.SENDTO', {
    data: `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  });
};




  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { flex: 1, backgroundColor: "#fff" }]} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Image source={icons.arrow_back} tintColor={'#FF6E42'} style={styles.backButtonImg} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* General Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('accountsettings')}
            >
              <Text style={styles.menuItemText}>Account</Text>
              {/* <ChevronRight color="#fff" size={20} /> */}
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('notification_preferences')}
            >
              <Text style={styles.menuItemText}>Notifications</Text>
              {/* <ChevronRight color="#fff" size={20} /> */}
            </TouchableOpacity>

            <View style={styles.separator} />

            {/* <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('ActivityStatus')}
            >
              <Text style={styles.menuItemText}>Activity Status</Text>
              {/* <ChevronRight color="#fff" size={20} /> 
            </TouchableOpacity> */}

            <View style={styles.separator} />

            {/* <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('BlockedUser')}
            >
              <Text style={styles.menuItemText}>Blocked Users</Text>
               
            </TouchableOpacity>

            <View style={styles.separator} /> */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('parentalcontrols')}
            >
              <Text style={styles.menuItemText}>Parental Controls</Text>
              {/* <ChevronRight color="#fff" size={20} /> */}
            </TouchableOpacity>
          </View>

          {/* Feedback Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Feedback</Text>

            <TouchableOpacity
              style={styles.menuItem}

              onPress={() => openEmail('web.rafidabdullahsami@gmail.com', 'Feedback on Twimbol', 'I would like share my feedback on..')}
            >
              <Text style={styles.menuItemText}>Send Feedback</Text>
              {/* <ChevronRight color="#fff" size={20} /> */}
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('faq')}
            >
              <Text style={styles.menuItemText}>FAQs</Text>
              {/* <ChevronRight color="#fff" size={20} /> */}
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => openEmail('web.rafidabdullahsami@gmail.com', 'Found a bug', '')}
            >
              <Text style={styles.menuItemText}
              >Report a Bug</Text>
              {/* <ChevronRight color="#fff" size={20} /> */}
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('termsnconditions')}
            >
              <Text style={styles.menuItemText}>Terms & Conditions</Text>
              {/* <ChevronRight color="#fff" size={20} /> */}
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => openURL('https://rafidabdullahsamiweb.pythonanywhere.com/privacy-policy/')}
            >
              <Text style={styles.menuItemText}>Privacy Policy</Text>
              {/* <ChevronRight color="#fff" size={20} /> */}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6E42',
    width: '90%',
    height: 120,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomRightRadius: 20,
    marginBottom: 16,
    elevation: 5,
  },
  backButton: {
    marginRight: 16,
    backgroundColor: 'white',
    paddingLeft: 30,
    paddingRight: 5,
    paddingVertical: 3,
    fontWeight: 'bold',
    marginLeft: -40,
    // marginTop: -20,
    borderRadius: 50,
    marginTop: 20,
  },
  backButtonImg: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    width: '94%',
    backgroundColor: '#FF6E42',
    margin: 16,
    marginBottom: 0,
    borderRadius: 20,
    padding: 16,
    paddingLeft: 30,
    marginLeft: -16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default Settings;