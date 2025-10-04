import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CompleteServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (finalPrice: number, description: string) => Promise<void>;
  starting_price?: number;
  currentDescription?: string;
  clientName?: string;
}

export default function CompleteServiceModal({
  visible,
  onClose,
  onComplete,
  starting_price = 0,
  currentDescription = '',
  clientName = 'Client',
}: CompleteServiceModalProps) {
  const [finalPrice, setFinalPrice] = useState(starting_price.toString());
  const [repairDescription, setRepairDescription] = useState(currentDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    // Use starting price if no adjustment is provided
    const priceInput = finalPrice.trim();
    const price = priceInput ? parseFloat(priceInput) : starting_price;

    if (isNaN(price) || price < 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price amount.');
      return;
    }

    if (!repairDescription.trim()) {
      Alert.alert('Description Required', 'Please provide a repair description.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onComplete(price, repairDescription.trim());
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Complete Service</Text>
              <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Client Info */}
            <View style={styles.clientInfo}>
              <Ionicons name="person-circle-outline" size={32} color="#00796B" />
              <Text style={styles.clientName}>{clientName}</Text>
            </View>

            {/* Final Price Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Final Price (Adjustment) <Text style={styles.optional}>(Optional)</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>₱</Text>
                <TextInput
                  style={styles.input}
                  value={finalPrice}
                  onChangeText={setFinalPrice}
                  placeholder={starting_price > 0 ? starting_price.toFixed(2) : "0.00"}
                  keyboardType="decimal-pad"
                  editable={!isSubmitting}
                />
              </View>
              <Text style={styles.hint}>
                Leave empty to use the starting price (₱{starting_price.toFixed(2)})
              </Text>
            </View>

            {/* Repair Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Repair Description <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={repairDescription}
                onChangeText={setRepairDescription}
                placeholder="Describe the work completed, parts replaced, etc."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
              <Text style={styles.hint}>
                Provide details about the service performed
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.completeButton, isSubmitting && styles.buttonDisabled]}
                onPress={handleComplete}
                disabled={isSubmitting}
              >
                <Text style={styles.completeButtonText}>
                  {isSubmitting ? 'Completing...' : 'Complete Service'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'PoppinsSemiBold',
    color: '#333',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2F1',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  clientName: {
    fontSize: 16,
    fontFamily: 'PoppinsMedium',
    color: '#00796B',
    marginLeft: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'PoppinsMedium',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  optional: {
    color: '#757575',
    fontWeight: 'normal',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontFamily: 'PoppinsMedium',
    color: '#00796B',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#333',
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  hint: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#999',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'PoppinsMedium',
    color: '#666',
  },
  completeButton: {
    backgroundColor: '#00796B',
  },
  completeButtonText: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
