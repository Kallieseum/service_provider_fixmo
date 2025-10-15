import { submitCustomerRating } from '@/api/ratings.api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function RateCustomerScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const appointmentId = parseInt(params.appointment_id as string);
    const customerId = parseInt(params.customer_id as string);
    const customerName = params.customer_name as string || 'Customer';
    const serviceTitle = params.service_title as string || 'Service';
    const scheduledDate = params.scheduled_date as string;

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Log received parameters for debugging
    console.log('🎯 RateCustomerScreen params:', {
        appointmentId,
        customerId,
        customerName,
        serviceTitle,
        scheduledDate,
        isAppointmentIdValid: !isNaN(appointmentId),
        isCustomerIdValid: !isNaN(customerId)
    });

    // Validate required params on mount
    React.useEffect(() => {
        if (isNaN(appointmentId) || isNaN(customerId)) {
            Alert.alert(
                'Invalid Data',
                'Missing required information. Please try again.',
                [
                    {
                        text: 'Go Back',
                        onPress: () => router.back(),
                    }
                ]
            );
        }
    }, []);

    // Prevent back button - rating is required
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                Alert.alert(
                    'Rating Required',
                    'You must rate this customer before continuing. This helps maintain quality in our service community.',
                    [
                        {
                            text: 'OK',
                            style: 'cancel',
                        },
                    ]
                );
                return true; // Prevent default back action
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    const handleStarPress = (star: number) => {
        setRating(star);
    };

    const handleSubmit = async () => {
        // Validate rating
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a rating before submitting.');
            return;
        }

        // Validate appointment ID
        if (!appointmentId) {
            Alert.alert('Error', 'Appointment ID is missing. Please try again.');
            console.error('Missing appointmentId:', appointmentId);
            return;
        }

        // Validate customer ID
        if (!customerId) {
            Alert.alert('Error', 'Customer ID is missing. Please try again.');
            console.error('Missing customerId:', customerId);
            return;
        }

        try {
            setSubmitting(true);

            const token = await AsyncStorage.getItem('providerToken');

            if (!token) {
                Alert.alert('Error', 'Authentication required.');
                return;
            }

            console.log('📝 Submitting rating with data:', {
                appointmentId,
                customerId,
                rating,
                hasComment: comment.trim().length > 0
            });

            // Submit rating using API helper function
            const response = await submitCustomerRating(
                token,
                appointmentId,
                customerId,
                rating,
                comment.trim() || undefined
            );

            if (!response.success) {
                console.error('❌ Rating submission failed:', response);
                throw new Error(response.message || 'Failed to submit rating');
            }

            console.log('✅ Rating submitted successfully');

            Alert.alert(
                'Success',
                'Thank you for rating this customer!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            router.back();
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('❌ Submit rating error:', error);
            console.error('❌ Error details:', {
                message: error.message,
                appointmentId,
                customerId,
                rating
            });
            
            Alert.alert(
                'Error', 
                error.message || 'Failed to submit rating. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header - Required Rating Notice */}
                    <View style={styles.header}>
                        <View style={styles.requiredBadge}>
                            <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
                            <Text style={styles.requiredText}>Required</Text>
                        </View>
                    </View>

                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="star" size={64} color="#FFD700" />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Rate Your Customer</Text>
                    <Text style={styles.subtitle}>
                        Please rate your experience with this customer.
                    </Text>
                    <Text style={styles.requiredNote}>
                        ⚠️ Rating is required to maintain service quality
                    </Text>

                    {/* Customer Info Card */}
                    <View style={styles.customerCard}>
                        <View style={styles.customerAvatar}>
                            <Ionicons name="person" size={32} color="#00796B" />
                        </View>
                        <View style={styles.customerInfo}>
                            <Text style={styles.customerName}>{customerName}</Text>
                            <Text style={styles.serviceText}>{serviceTitle}</Text>
                            {scheduledDate && (
                                <Text style={styles.dateText}>
                                    {formatDate(scheduledDate)}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Star Rating */}
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => handleStarPress(star)}
                                style={styles.starButton}
                            >
                                <Ionicons
                                    name={star <= rating ? 'star' : 'star-outline'}
                                    size={48}
                                    color={star <= rating ? '#FFD700' : '#DDD'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Rating Labels */}
                    {rating > 0 && (
                        <Text style={styles.ratingLabel}>
                            {rating === 1 && '⭐ Poor'}
                            {rating === 2 && '⭐⭐ Fair'}
                            {rating === 3 && '⭐⭐⭐ Good'}
                            {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                            {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                        </Text>
                    )}

                    {/* Comment Input */}
                    <View style={styles.commentContainer}>
                        <Text style={styles.commentLabel}>
                            Share your experience (Optional)
                        </Text>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Tell us about your experience with this customer..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            value={comment}
                            onChangeText={setComment}
                            maxLength={500}
                        />
                        <Text style={styles.characterCount}>{comment.length}/500</Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (rating === 0 || submitting) && styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={rating === 0 || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Rating</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    requiredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE5E5',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },
    requiredText: {
        fontSize: 14,
        color: '#FF6B6B',
        fontWeight: '600',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 8,
    },
    requiredNote: {
        fontSize: 13,
        textAlign: 'center',
        color: '#FF9800',
        marginBottom: 24,
        fontWeight: '500',
    },
    customerCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    customerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E0F2F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    customerInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    customerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    serviceText: {
        fontSize: 14,
        color: '#00796B',
        marginBottom: 2,
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
    },
    starButton: {
        padding: 4,
    },
    ratingLabel: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        color: '#FFB300',
        marginBottom: 24,
    },
    commentContainer: {
        marginBottom: 24,
    },
    commentLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    commentInput: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#333',
        textAlignVertical: 'top',
        minHeight: 100,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    characterCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: '#00796B',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#CCC',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
});
