import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView ,
  Image,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import {icons} from '@/constants/icons';

const Settings = ({ navigation }:any) => {
  // Navigation handlers
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleMenuItemPress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Image source={icons.arrow_back} tintColor={'#FF6E42'} style={styles.backButtonImg}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* General Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => handleMenuItemPress('Account')}
          >
            <Text style={styles.menuItemText}>Account</Text>
            {/* <ChevronRight color="#fff" size={20} /> */}
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => handleMenuItemPress('Notifications')}
          >
            <Text style={styles.menuItemText}>Notifications</Text>
            {/* <ChevronRight color="#fff" size={20} /> */}
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => handleMenuItemPress('ActivityStatus')}
          >
            <Text style={styles.menuItemText}>Activity Status</Text>
            {/* <ChevronRight color="#fff" size={20} /> */}
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => handleMenuItemPress('BlockedUser')}
          >
            <Text style={styles.menuItemText}>Blocked Users</Text>
            {/* <ChevronRight color="#fff" size={20} /> */}
          </TouchableOpacity>
        </View>

        {/* Feedback Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feedback</Text>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => handleMenuItemPress('SendFeedback')}
          >
            <Text style={styles.menuItemText}>Send Feedback</Text>
            {/* <ChevronRight color="#fff" size={20} /> */}
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuItemPress('FAQs')}
          >
            <Text style={styles.menuItemText}>FAQs</Text>
            {/* <ChevronRight color="#fff" size={20} /> */}
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuItemPress('ReportBug')}
          >
            <Text style={styles.menuItemText}>Report a Bug</Text>
            {/* <ChevronRight color="#fff" size={20} /> */}
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuItemPress('TermsConditions')}
          >
            <Text style={styles.menuItemText}>Terms & Conditions</Text>
            {/* <ChevronRight color="#fff" size={20} /> */}
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuItemPress('PrivacyPolicy')}
          >
            <Text style={styles.menuItemText}>Privacy Policy</Text>
            {/* <ChevronRight color="#fff" size={20} /> */}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    height:100,
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
    marginTop: -20,
    borderRadius: 50,
  },
  backButtonImg: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
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