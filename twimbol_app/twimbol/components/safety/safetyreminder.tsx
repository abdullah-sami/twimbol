import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Shield, AlertTriangle, Users, Eye } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface SafetyReminderModalProps {
  visible: boolean;
  onAccept: () => void;
}

const SafetyReminderModal: React.FC<SafetyReminderModalProps> = ({
  visible,
  onAccept,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const safetyMessages = [
    {
      icon: Shield,
      title: "Stay Safe Online",
      message: "Remember that people online may not be who they say they are. Never share personal information like your real name, address, phone number, or school with strangers.",
    },
    {
      icon: AlertTriangle,
      title: "Real-World Risks",
      message: "Online interactions can have real-world consequences. If someone makes you uncomfortable or asks to meet in person, tell a trusted adult immediately.",
    },
    {
      icon: Users,
      title: "Think Before You Share",
      message: "Once you post something online, it can be seen by many people and may stay online forever. Think carefully about what you share.",
    },
    {
      icon: Eye,
      title: "Report Inappropriate Content",
      message: "If you see anything that makes you uncomfortable or seems inappropriate, report it to us and tell a trusted adult.",
    },
  ];

  const handleNext = async () => {
    if (currentStep < safetyMessages.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save that user has seen safety reminder
      try {
        await AsyncStorage.setItem('safety_reminder_shown', 'true');
        await AsyncStorage.setItem('safety_reminder_date', new Date().toISOString());
      } catch (error) {
        console.error('Error saving safety reminder status:', error);
      }
      onAccept();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentIcon = safetyMessages[currentStep].icon;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => { }} // Prevent dismissal - user must complete
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <CurrentIcon size={48} color="#FF6E42" />
              </View>
              <Text style={styles.title}>{safetyMessages[currentStep].title}</Text>
            </View>

            <View style={styles.content}>
              <Text style={styles.message}>
                {safetyMessages[currentStep].message}
              </Text>
            </View>

            <View style={styles.progressContainer}>
              {safetyMessages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentStep && styles.activeDot,
                  ]}
                />
              ))}
            </View>


            <View style={styles.parentalNotice}>
              <Text style={styles.parentalNoticeText}>
                🛡️ Parents: Your child will need your permission before sharing personal information.
              </Text>
            </View>


            <View style={styles.buttonContainer}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handlePrevious}
                >
                  <Text style={styles.secondaryButtonText}>Previous</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  currentStep === 0 && styles.fullWidthButton,
                ]}
                onPress={handleNext}
              >
                <Text style={styles.primaryButtonText}>
                  {currentStep === safetyMessages.length - 1
                    ? 'I Understand'
                    : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  content: {
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
  },
  activeDot: {
    backgroundColor: '#FF6E42',
    width: 30,
  },
  parentalNotice: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  parentalNoticeText: {
    fontSize: 14,
    color: '#0066CC',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#FF6E42',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  fullWidthButton: {
    flex: 1,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SafetyReminderModal;