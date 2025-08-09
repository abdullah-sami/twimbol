import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TermsAndConditions = () => {
  
  
  const navigation = useNavigation();

  // Navigation handler for accepting terms
  const handleAccept = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };



  // Add this function to handle email opening
  const openEmail = async (email, subject = '', body = '') => {
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    try {
      const supported = await Linking.canOpenURL(mailto);
      if (supported) {
        await Linking.openURL(mailto);
      } else {
        console.log("Email client not available");
      }
    } catch (error) {
      console.error('An error occurred opening email', error);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <Text style={styles.headerSubtitle}>Read Important Information</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>1.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Creating & Owning Your Account</Text>
            <Text style={styles.sectionText}>
              To use Twimbol, you'll need an account. Keep your login secure - your account is for your personal or business use only and may not be shared with others. Any activity happening on your account is your responsibility.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionNumber}>2.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>What's Not Allowed?</Text>
            <Text style={styles.sectionText}>
              Post content promoting or links to offensive content, bullying, threats, hate speech, impersonation, spam, or anything that violates our community guidelines. Accounts found to be in violation may be restricted or permanently banned.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionNumber}>3.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Your Content, Your Control</Text>
            <Text style={styles.sectionText}>
              You own the content you create, but you allow us to show it to others by posting content to Twimbol. You can delete content and manage the app. Only post what's truly yours to share.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionNumber}>4.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Suspensions & Account Removal</Text>
            <Text style={styles.sectionText}>
              If you violate our terms, we reserve the right to suspend or remove your account. You can appeal suspensions by emailing us at any time from your settings.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionNumber}>5.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Using Twimbol Right</Text>
            <Text style={styles.sectionText}>
              We highly recommend the most basic tips. Don't try to break, exploit, or reverse-engineer or keep the app online when our servers are down.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionNumber}>6.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Term Updates</Text>
            <Text style={styles.sectionText}>
              We may adjust these terms as Twimbol evolves. We'll notify you of any updates or changes by email continuing to use the app means you accept the new terms of service.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionNumber}>7.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Need Help?</Text>
            <Text style={styles.sectionText}>
              Got questions or concerns or just wanna say hi? Reach us at {' '}<Text
                style={[styles.mailtext, styles.mail]}
                onPress={() => openEmail('web.rafidabdullahsami@gmail.com', 'Terms & Conditions', '')}
              >
                twimbol@gmail.com
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thanks for being part of Twimbol.{'\n'}
            Let's keep it awesome!
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.acceptButtonText}>I understand and accept the terms</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6E42',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  sectionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6E42',
    marginRight: 12,
    marginTop: 2,
    minWidth: 20,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6E42',
    marginBottom: 8,
    lineHeight: 24,
  },
  sectionText: {
    fontSize: 15,
    color: 'rgba(25, 25, 25, 0.95)',
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    backgroundColor: '#FF6E42',
  },
  declineButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  declineButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FF6E42',
    fontSize: 16,
    fontWeight: '600',
  },
    mailtext: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 0,
  },
  mail: {
    color: '#FF6E42',
  },
});

export default TermsAndConditions;