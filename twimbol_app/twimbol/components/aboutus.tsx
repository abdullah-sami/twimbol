import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
} from 'react-native';

const AboutUs = () => {
  const handleContactPress = () => {
    Linking.openURL('mailto:contact.twimbol@gmail.com');
  };

  const handleWebsitePress = () => {
    Linking.openURL('https://www.twimbol.com');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+8801882971484');
  };

  const categories = [
    'Innovation and Technology',
    'Social Impact & Leadership',
    'Content Creator',
    'Arts & Creativity',
    'Kids Journalism',
    'Academic Excellence',
    'Media & Communication',
    'Kids Well-being',
    'Athletic',
    'Entrepreneurship',
    'Environmental Activism',
    'Volunteering',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Twimbol</Text>
          <Text style={styles.headerSubtitle}>
            Technology, Information and Internet
          </Text>
        </View>

        <View style={styles.content}>
          {/* Introduction */}
          <View style={styles.introContainer}>
            <Text style={styles.introText}>
              Twimbol is a safe, vibrant platform where kids shine by sharing their
              talents, creativity, and achievements with the world.
            </Text>
          </View>

          {/* Our Mission */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Our Mission</Text>
            </View>
            <View style={styles.missionContent}>
              <Text style={styles.missionText}>
                At Twimbol, we believe in nurturing the potential of every child. We aim to:
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletText}>• Encourage creativity and innovation</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletText}>• Promote safe and responsible technology use</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletText}>• Recognize and reward young talents</Text>
              </View>
            </View>
          </View>

          {/* Junior Talent Award 2025 */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderWhite}>
              <Text style={styles.sectionHeaderText}>Junior Talent Award 2025</Text>
            </View>
            <View style={styles.awardContent}>
              <Text style={styles.awardDescription}>
                One of our flagship initiatives is the Junior Talent Award, which honors
                exceptional young individuals in categories such as:
              </Text>
              
              {categories.map((category, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryBullet} />
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              ))}

              <View style={styles.learnMoreContainer}>
                <Text style={styles.learnMoreText}>Learn more and apply here:</Text>
                <TouchableOpacity onPress={handleWebsitePress}>
                  <Text style={styles.websiteLink}>www.twimbol.com</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Our Community */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Our Community</Text>
            </View>
            <View style={styles.communityContent}>
              <Text style={styles.communityText}>
                Twimbol is supported by a diverse panel of judges and well-wishers who
                are leaders in their respective fields. Their expertise ensures a fair
                and inspiring environment for all participants.
              </Text>
            </View>
          </View>

          {/* Contact Us */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderWhite}>
              <Text style={styles.sectionHeaderText}>Contact Us</Text>
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactDescription}>
                Have questions or want to get involved? Reach out to us:
              </Text>
              
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>📍</Text>
                <Text style={styles.contactText}>
                  Address: 27/12, Topkhana Road, Dhaka-1000
                </Text>
              </View>

              <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
                <Text style={styles.contactIcon}>📞</Text>
                <Text style={styles.contactTextLink}>
                  Phone: +880 1882-971484
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactItem} onPress={handleContactPress}>
                <Text style={styles.contactIcon}>✉️</Text>
                <Text style={styles.contactTextLink}>
                  Email: contact.twimbol@gmail.com
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Message */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Join us in celebrating the brilliance of our youth. Together, we can
              build a brighter future!
            </Text>
          </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FF6E42',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  introContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  introText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    backgroundColor: '#FF6E42',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  sectionHeaderWhite: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  missionContent: {
    backgroundColor: 'rgba(255, 110, 66, 0.1)',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  missionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  bulletPoint: {
    marginBottom: 8,
  },
  bulletText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  awardContent: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  awardDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
    lineHeight: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6E42',
    marginRight: 12,
  },
  categoryText: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  learnMoreContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  learnMoreText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  websiteLink: {
    fontSize: 14,
    color: '#FF6E42',
    fontWeight: '600',
  },
  communityContent: {
    backgroundColor: 'rgba(255, 110, 66, 0.1)',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  communityText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  contactContent: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  contactDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contactIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  contactText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  contactTextLink: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#FF6E42',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 15,
    color: 'white',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default AboutUs;