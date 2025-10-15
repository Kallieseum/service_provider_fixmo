import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CancelAppointmentModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (reason: string, customReason?: string) => Promise<void>;
    customerName?: string;
    serviceTitle?: string;
}

const CANCELLATION_REASONS = [
    'Emergency came up, unable to attend the scheduled appointment',
    'Scheduling conflict, I have another appointment at the same time',
    'Equipment malfunction, unable to complete the service',
    'Illness/Health issues',
    'Vehicle breakdown, cannot reach location',
    'Weather conditions preventing travel',
    'Family emergency',
    'Double-booked by mistake',
    'Customer requested to cancel',
    'Other (please specify)',
];

export default function CancelAppointmentModal({
    visible,
    onClose,
    onConfirm,
    customerName,
    serviceTitle,
}: CancelAppointmentModalProps) {
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [customReason, setCustomReason] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    const handleConfirm = async () => {
        // Validation
        if (!selectedReason) {
            Alert.alert('Required', 'Please select a cancellation reason.');
            return;
        }

        if (selectedReason === 'Other (please specify)' && !customReason.trim()) {
            Alert.alert('Required', 'Please provide a reason for cancellation.');
            return;
        }

        const finalReason = selectedReason === 'Other (please specify)' 
            ? customReason.trim() 
            : selectedReason;

        try {
            setSubmitting(true);
            await onConfirm(finalReason, selectedReason === 'Other (please specify)' ? customReason : undefined);
            
            // Reset state
            setSelectedReason('');
            setCustomReason('');
        } catch (error: any) {
            console.error('Error cancelling appointment:', error);
            Alert.alert('Error', error.message || 'Failed to cancel appointment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setSelectedReason('');
            setCustomReason('');
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerIconContainer}>
                            <Ionicons name="warning" size={32} color="#FF6B6B" />
                        </View>
                        <Text style={styles.headerTitle}>Cancel Appointment</Text>
                        <Text style={styles.headerSubtitle}>
                            This action cannot be undone
                        </Text>
                    </View>

                    {/* Appointment Info */}
                    {(customerName || serviceTitle) && (
                        <View style={styles.appointmentInfo}>
                            {customerName && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="person" size={16} color="#666" />
                                    <Text style={styles.infoText}>{customerName}</Text>
                                </View>
                            )}
                            {serviceTitle && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="construct" size={16} color="#666" />
                                    <Text style={styles.infoText}>{serviceTitle}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Scrollable Content */}
                    <ScrollView 
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.sectionTitle}>Reason for Cancellation *</Text>
                        <Text style={styles.sectionSubtitle}>
                            Please select why you need to cancel this appointment
                        </Text>

                        {/* Reason Options */}
                        <View style={styles.reasonsContainer}>
                            {CANCELLATION_REASONS.map((reason, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.reasonOption,
                                        selectedReason === reason && styles.reasonOptionSelected,
                                    ]}
                                    onPress={() => setSelectedReason(reason)}
                                    disabled={submitting}
                                >
                                    <View style={styles.radioButton}>
                                        {selectedReason === reason && (
                                            <View style={styles.radioButtonInner} />
                                        )}
                                    </View>
                                    <Text
                                        style={[
                                            styles.reasonText,
                                            selectedReason === reason && styles.reasonTextSelected,
                                        ]}
                                    >
                                        {reason}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Custom Reason Input */}
                        {selectedReason === 'Other (please specify)' && (
                            <View style={styles.customReasonContainer}>
                                <Text style={styles.customReasonLabel}>
                                    Please specify your reason:
                                </Text>
                                <TextInput
                                    style={styles.customReasonInput}
                                    placeholder="Enter your reason for cancellation..."
                                    placeholderTextColor="#999"
                                    value={customReason}
                                    onChangeText={setCustomReason}
                                    multiline
                                    numberOfLines={4}
                                    maxLength={200}
                                    editable={!submitting}
                                />
                                <Text style={styles.characterCount}>
                                    {customReason.length}/200
                                </Text>
                            </View>
                        )}

                        {/* Warning Message */}
                        <View style={styles.warningBox}>
                            <Ionicons name="information-circle" size={20} color="#FF9800" />
                            <Text style={styles.warningText}>
                                The customer will be notified via email and push notification about this cancellation.
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleClose}
                            disabled={submitting}
                        >
                            <Text style={styles.cancelButtonText}>Keep Appointment</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirmButton,
                                submitting && styles.buttonDisabled,
                            ]}
                            onPress={handleConfirm}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="close-circle" size={20} color="#FFF" />
                                    <Text style={styles.confirmButtonText}>Cancel Appointment</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFE5E5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    appointmentInfo: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    scrollView: {
        maxHeight: 400,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#666',
        marginBottom: 16,
    },
    reasonsContainer: {
        gap: 10,
        marginBottom: 20,
    },
    reasonOption: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFF',
    },
    reasonOptionSelected: {
        borderColor: '#FF6B6B',
        backgroundColor: '#FFF5F5',
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#CCC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF6B6B',
    },
    reasonText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    reasonTextSelected: {
        color: '#FF6B6B',
        fontWeight: '600',
    },
    customReasonContainer: {
        marginBottom: 20,
    },
    customReasonLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    customReasonInput: {
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        color: '#333',
        textAlignVertical: 'top',
        minHeight: 100,
    },
    characterCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 6,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFF9E6',
        borderRadius: 12,
        padding: 14,
        gap: 10,
        marginBottom: 20,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: '#FF9800',
        lineHeight: 18,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },
    confirmButton: {
        backgroundColor: '#FF6B6B',
    },
    confirmButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
