import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Image, Modal, ActivityIndicator, } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Share2, Heart, User, Phone, Mail, Building, } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';

interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    participants: number;
    maxParticipants: number;
    organizer: string;
    description: string;
    requirements: string[];
    agenda: { time: string; activity: string }[];
    image: string;
}

interface ParticipationForm {
    fullName: string;
    email: string;
    phone: string;
    organization: string;
    experience: string;
    motivation: string;
}

const EventDetails = ({ route }: any) => {

    const navigation = useNavigation();
    const { eventid } = route.params as { eventid: string };

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [showParticipationForm, setShowParticipationForm] = useState(false);
    const [isParticipating, setIsParticipating] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState<ParticipationForm>({
        fullName: '',
        email: '',
        phone: '',
        organization: '',
        experience: '',
        motivation: ''
    });

    useEffect(() => {
        fetchEventDetails();
    }, [eventid]);

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            // Mock event data - replace with actual API call
            const mockEvent: Event = {
                id: eventid,
                title: 'Selection for Leadership Camp',
                date: '17 March, 2025',
                time: '9:00 AM - 5:00 PM',
                location: 'Central Office, Dhaka',
                participants: 172,
                maxParticipants: 200,
                organizer: 'Leadership Development Team',
                description: `Join us for an intensive leadership development program designed to identify and nurture future leaders. This comprehensive selection process will evaluate participants across multiple dimensions including communication skills, problem-solving abilities, team collaboration, and leadership potential.

The program includes interactive workshops, group activities, case study discussions, and individual assessments. Selected participants will advance to the next phase of our leadership development initiative.

What to expect:
• Leadership assessment activities
• Team building exercises
• Communication workshops
• Networking opportunities
• Career guidance sessions

This is an excellent opportunity for professionals looking to enhance their leadership capabilities and advance their careers.`,
                requirements: [
                    'Minimum 2 years of professional experience',
                    'Strong communication skills',
                    'Willingness to commit to full program duration',
                    'Valid identification document'
                ],
                agenda: [
                    { time: '9:00 AM', activity: 'Registration & Welcome' },
                    { time: '9:30 AM', activity: 'Opening Ceremony' },
                    { time: '10:00 AM', activity: 'Leadership Assessment - Part 1' },
                    { time: '12:00 PM', activity: 'Lunch Break' },
                    { time: '1:00 PM', activity: 'Group Activities' },
                    { time: '3:00 PM', activity: 'Individual Interviews' },
                    { time: '4:30 PM', activity: 'Closing & Next Steps' }
                ],
                image: 'https://via.placeholder.com/400x200'
            };

            setEvent(mockEvent);
            // Check if user is already participating
            checkParticipationStatus();
        } catch (error) {
            Alert.alert('Error', 'Failed to load event details');
        } finally {
            setLoading(false);
        }
    };

    const checkParticipationStatus = async () => {
        // Mock check - replace with actual API call
        setIsParticipating(false);
    };

    const handleInputChange = (field: keyof ParticipationForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.fullName.trim()) {
            Alert.alert('Error', 'Please enter your full name');
            return false;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email address');
            return false;
        }
        if (!formData.phone.trim()) {
            Alert.alert('Error', 'Please enter your phone number');
            return false;
        }
        if (!formData.motivation.trim()) {
            Alert.alert('Error', 'Please explain your motivation for participating');
            return false;
        }
        return true;
    };

    const handleParticipate = async () => {
        if (isParticipating) {
            Alert.alert(
                'Cancel Participation',
                'Are you sure you want to cancel your participation?',
                [
                    { text: 'No', style: 'cancel' },
                    { text: 'Yes', onPress: cancelParticipation }
                ]
            );
            return;
        }

        if (!validateForm()) return;

        try {
            setSubmitting(true);
            // Mock API call - replace with actual submission
            await new Promise(resolve => setTimeout(resolve, 2000));

            setIsParticipating(true);
            setShowParticipationForm(false);
            Alert.alert('Success', 'You have successfully registered for the event!');

            // Reset form
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                organization: '',
                experience: '',
                motivation: ''
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to register for the event. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const cancelParticipation = async () => {
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsParticipating(false);
            Alert.alert('Success', 'Your participation has been cancelled.');
        } catch (error) {
            Alert.alert('Error', 'Failed to cancel participation. Please try again.');
        }
    };

    const handleShare = () => {
        // Implement share functionality
        Alert.alert('Share', 'Share functionality would be implemented here');
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6E42" />
                    <Text style={styles.loadingText}>Loading event details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!event) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Event not found</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FF6E42' }} edges={['top', 'left', 'right']}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backIcon}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Event Details</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                        <Heart size={20} color={isLiked ? "#FF6E42" : "white"} fill={isLiked ? "#FF6E42" : "none"} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                        <Share2 size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Event Image */}
                <Image source={{ uri: event.image }} style={styles.eventImage} />

                {/* Event Info */}
                <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.organizer}>Organized by {event.organizer}</Text>

                    {/* Event Details */}
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailItem}>
                            <Calendar size={20} color="#666" />
                            <Text style={styles.detailText}>{event.date}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Clock size={20} color="#666" />
                            <Text style={styles.detailText}>{event.time}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <MapPin size={20} color="#666" />
                            <Text style={styles.detailText}>{event.location}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Users size={20} color="#666" />
                            <Text style={styles.detailText}>
                                {event.participants}/{event.maxParticipants} participants
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About this Event</Text>
                        <Text style={styles.description}>{event.description}</Text>
                    </View>

                    {/* Requirements */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Requirements</Text>
                        {event.requirements.map((req, index) => (
                            <Text key={index} style={styles.requirement}>• {req}</Text>
                        ))}
                    </View>

                    {/* Agenda */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Agenda</Text>
                        {event.agenda.map((item, index) => (
                            <View key={index} style={styles.agendaItem}>
                                <Text style={styles.agendaTime}>{item.time}</Text>
                                <Text style={styles.agendaActivity}>{item.activity}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Participation Button */}
            <View style={styles.participationContainer}>
                <TouchableOpacity
                    style={[
                        styles.participationButton,
                        isParticipating && styles.participatingButton
                    ]}
                    onPress={() => {
                        if (isParticipating) {
                            handleParticipate();
                        } else {
                            setShowParticipationForm(true);
                        }
                    }}
                >
                    <Text style={[
                        styles.participationButtonText,
                        isParticipating && styles.participatingButtonText
                    ]}>
                        {isParticipating ? 'Cancel Participation' : 'Participate in Event'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Participation Form Modal */}
            <Modal
                visible={showParticipationForm}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setShowParticipationForm(false)}
                        >
                            <Text style={styles.modalCloseButton}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Event Registration</Text>
                        <View style={{ width: 50 }} />
                    </View>

                    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Full Name *</Text>
                            <TextInput
                                style={styles.formInput}
                                value={formData.fullName}
                                onChangeText={(text) => handleInputChange('fullName', text)}
                                placeholder="Enter your full name"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Email Address *</Text>
                            <TextInput
                                style={styles.formInput}
                                value={formData.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Phone Number *</Text>
                            <TextInput
                                style={styles.formInput}
                                value={formData.phone}
                                onChangeText={(text) => handleInputChange('phone', text)}
                                placeholder="Enter your phone number"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Organization</Text>
                            <TextInput
                                style={styles.formInput}
                                value={formData.organization}
                                onChangeText={(text) => handleInputChange('organization', text)}
                                placeholder="Enter your organization"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Professional Experience</Text>
                            <TextInput
                                style={[styles.formInput, styles.textArea]}
                                value={formData.experience}
                                onChangeText={(text) => handleInputChange('experience', text)}
                                placeholder="Briefly describe your professional experience"
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Motivation *</Text>
                            <TextInput
                                style={[styles.formInput, styles.textArea]}
                                value={formData.motivation}
                                onChangeText={(text) => handleInputChange('motivation', text)}
                                placeholder="Why do you want to participate in this event?"
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={handleParticipate}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit Registration</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
    backButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#FF6E42',
        borderRadius: 20,
    },
    backButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FF6E42',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backIcon: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        padding: 5,
    },
    content: {
        flex: 1,
    },
    eventImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#e0e0e0',
    },
    eventInfo: {
        backgroundColor: 'white',
        padding: 20,
    },
    eventTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    organizer: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    detailsContainer: {
        marginBottom: 20,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 10,
    },
    detailText: {
        fontSize: 16,
        color: '#333',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    requirement: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    agendaItem: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingVertical: 5,
    },
    agendaTime: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF6E42',
        width: 80,
    },
    agendaActivity: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    participationContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    participationButton: {
        backgroundColor: '#FF6E42',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    participatingButton: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#FF6E42',
    },
    participationButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    participatingButtonText: {
        color: '#FF6E42',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalCloseButton: {
        fontSize: 16,
        color: '#FF6E42',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    formInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#FF6E42',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EventDetails;