import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQScreen = () => {
  const [expandedItems, setExpandedItems] = useState({});

  const faqData = [
    {
      id: 1,
      question: "What is Twimbol?",
      answer: "Twimbol is a safe and fun social media platform for kids to share challenge videos, make friends, and earn rewards like toys, badges, and Twimbbucks (our in-app currency)."
    },
    {
      id: 2,
      question: "How do I create an account for my child?",
      answer: "A parent or guardian must sign up using an email account. We require parental verification to ensure child safety and proper account management."
    },
    {
      id: 3,
      question: "Is Twimbol safe for children?",
      answer: "Yes! Twimbol is built with safety first. Parents verify every account, and kids can only use positive interactions like gifts, stickers, and emojis—no bullying, dislikes, or harmful comments are allowed."
    },
    {
      id: 4,
      question: "What are Twimbbucks and how can my child use them?",
      answer: "Twimbbucks are a virtual currency kids earn by posting videos, joining challenges, and receiving gifts. They can be used for profile upgrades, styling, or rewards."
    },
    {
      id: 5,
      question: "Who can my child connect with on Twimbol?",
      answer: "Kids can interact with verified friends, join community challenges, and follow creators. Parents have full control over friend approvals and privacy settings."
    },
    {
      id: 6,
      question: "Can parents monitor their child's activity?",
      answer: "Absolutely. Parents can view account activity, manage privacy settings, approve connections, and ensure their child's experience stays positive and safe."
    }
  ];

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const FAQItem = ({ item }) => {
    const isExpanded = expandedItems[item.id];

    return (
        
      <View style={styles.faqItem}>
        <TouchableOpacity
          style={styles.questionContainer}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.questionText}>{item.question}</Text>
          <View style={[styles.iconContainer, isExpanded && styles.iconExpanded]}>
            <Text style={styles.icon}>{isExpanded ? '−' : '+'}</Text>
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.answerContainer}>
            <Text style={styles.answerText}>{item.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FF6E42"}} edges={["top", "left", "right"]}>
    <View style={styles.container}>
      <Text style={styles.title}>Frequently Asked Questions</Text>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {faqData.map((item) => (
          <FAQItem key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
</SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  faqItem: {
    width: '90%',
    margin: 'auto',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 15,
    lineHeight: 22,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6E42',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '0deg' }],
  },
  iconExpanded: {
    backgroundColor: '#E55A35',
  },
  icon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  answerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 5,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  answerText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666666',
    textAlign: 'left',
  },
});

export default FAQScreen;