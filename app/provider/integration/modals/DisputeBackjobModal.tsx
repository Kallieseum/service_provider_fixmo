import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { disputeBackjob, uploadBackjobEvidence } from '@/api/backjob.api';

interface DisputeBackjobModalProps {
  visible: boolean;
  backjobId: number;
  appointmentId: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface EvidenceFile {
  uri: string;
  type: string;
  name: string;
}

export default function DisputeBackjobModal({
  visible,
  backjobId,
  appointmentId,
  onClose,
  onSuccess,
}: DisputeBackjobModalProps) {
  const [disputeReason, setDisputeReason] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setDisputeReason('');
    setEvidenceFiles([]);
    setEvidenceNotes('');
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newFiles: EvidenceFile[] = result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
          name: asset.fileName || `evidence_${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
        }));

        setEvidenceFiles([...evidenceFiles, ...newFiles].slice(0, 5)); // Max 5 files
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'video/*'],
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newFiles: EvidenceFile[] = result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.name,
        }));

        setEvidenceFiles([...evidenceFiles, ...newFiles].slice(0, 5)); // Max 5 files
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...evidenceFiles];
    newFiles.splice(index, 1);
    setEvidenceFiles(newFiles);
  };

  const handleSubmit = async () => {
    if (!disputeReason.trim()) {
      Alert.alert('Required', 'Please provide a reason for the dispute');
      return;
    }

    try {
      setLoading(true);

      const authToken = await AsyncStorage.getItem('providerToken');
      if (!authToken) {
        Alert.alert('Error', 'Not authenticated. Please log in again.');
        return;
      }

      // Upload evidence files first (if any)
      let uploadedFileUrls: string[] = [];
      if (evidenceFiles.length > 0) {
        console.log('📎 Uploading evidence files...');
        const uploadResponse = await uploadBackjobEvidence(
          appointmentId,
          evidenceFiles,
          authToken
        );

        if (uploadResponse.success) {
          uploadedFileUrls = uploadResponse.data.files.map((f) => f.url);
          console.log(`✅ ${uploadedFileUrls.length} file(s) uploaded`);
        } else {
          console.warn('⚠️ Evidence upload failed, continuing without files');
        }
      }

      // Submit dispute
      const response = await disputeBackjob(
        backjobId,
        {
          dispute_reason: disputeReason.trim(),
          dispute_evidence: uploadedFileUrls.length > 0 ? {
            description: evidenceNotes.trim() || 'Evidence supporting the dispute',
            files: uploadedFileUrls,
            notes: evidenceNotes.trim(),
          } : undefined,
        },
        authToken
      );

      if (response.success) {
        Alert.alert(
          'Dispute Submitted',
          'Your dispute has been submitted successfully. The admin will review it shortly.',
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                onSuccess();
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to submit dispute');
      }
    } catch (error: any) {
      console.error('Error submitting dispute:', error);
      Alert.alert('Error', error.message || 'Failed to submit dispute');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} disabled={loading}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dispute Backjob</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={24} color="#2196F3" />
            <Text style={styles.infoText}>
              Explain why you believe this backjob request is not valid. Include evidence if available.
            </Text>
          </View>

          {/* Dispute Reason */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Reason for Dispute <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={6}
              placeholder="Explain why this backjob is not valid...&#10;Example: The issue reported is not related to my original work. The customer damaged the pipes after I left."
              value={disputeReason}
              onChangeText={setDisputeReason}
              editable={!loading}
              maxLength={1000}
            />
            <Text style={styles.charCount}>{disputeReason.length}/1000</Text>
          </View>

          {/* Evidence Upload */}
          <View style={styles.section}>
            <Text style={styles.label}>Evidence (Optional)</Text>
            <Text style={styles.hint}>
              Upload photos or videos to support your dispute (max 5 files)
            </Text>

            <View style={styles.uploadButtons}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickImage}
                disabled={loading || evidenceFiles.length >= 5}
              >
                <Ionicons name="camera-outline" size={20} color="#008080" />
                <Text style={styles.uploadButtonText}>Pick from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickDocument}
                disabled={loading || evidenceFiles.length >= 5}
              >
                <Ionicons name="document-outline" size={20} color="#008080" />
                <Text style={styles.uploadButtonText}>Pick Document</Text>
              </TouchableOpacity>
            </View>

            {/* File List */}
            {evidenceFiles.length > 0 && (
              <View style={styles.fileList}>
                {evidenceFiles.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
                    {file.type.startsWith('image/') && (
                      <Image source={{ uri: file.uri }} style={styles.filePreview} />
                    )}
                    {file.type.startsWith('video/') && (
                      <View style={[styles.filePreview, styles.videoPlaceholder]}>
                        <Ionicons name="videocam" size={24} color="#FFF" />
                      </View>
                    )}
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {file.name}
                      </Text>
                      <Text style={styles.fileType}>
                        {file.type.split('/')[0]}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFile(index)}
                      style={styles.removeButton}
                      disabled={loading}
                    >
                      <Ionicons name="close-circle" size={24} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Evidence Notes */}
            {evidenceFiles.length > 0 && (
              <TextInput
                style={styles.input}
                placeholder="Additional notes about the evidence..."
                value={evidenceNotes}
                onChangeText={setEvidenceNotes}
                editable={!loading}
                maxLength={500}
              />
            )}
          </View>

          {/* Warning */}
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color="#FF9800" />
            <Text style={styles.warningText}>
              False disputes may affect your provider rating and account status.
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!disputeReason.trim() || loading) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!disputeReason.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Dispute</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#1976D2',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  hint: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#666',
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#333',
    marginTop: 12,
  },
  charCount: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E0F2F1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#008080',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontFamily: 'PoppinsMedium',
    color: '#008080',
  },
  fileList: {
    marginTop: 16,
    gap: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 12,
  },
  filePreview: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  videoPlaceholder: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontFamily: 'PoppinsMedium',
    color: '#333',
  },
  fileType: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#666',
    textTransform: 'capitalize',
  },
  removeButton: {
    padding: 4,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    alignItems: 'center',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#F57C00',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsMedium',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#008080',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    color: '#FFF',
  },
});
