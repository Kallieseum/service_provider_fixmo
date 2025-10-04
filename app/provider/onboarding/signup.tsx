 import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { verifyAndRegisterProvider } from '../../../src/api/auth.api';

interface Certificate {
  name: string;
  number: string;
  expiryDate: string;
  imageUri: string;
}

interface Profession {
  id: number;
  name: string;
  experience: string;
}

export default function SignUpScreen() {
  const router = useRouter();
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();

  // Basic Information
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [exactLocation, setExactLocation] = useState('');
  const [birthday, setBirthday] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uli, setUli] = useState('');

  // File uploads
  const [profilePhoto, setProfilePhoto] = useState<any>(null);
  const [validId, setValidId] = useState<any>(null);

  // Professions (simplified - you can expand this with a modal picker)
  const [professions, setProfessions] = useState<Profession[]>([
    { id: 1, name: 'Plumber', experience: '' },
  ]);

  // Certificates
  const [certificates, setCertificates] = useState<Certificate[]>([
    { name: '', number: '', expiryDate: '', imageUri: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const pickImage = async (type: 'profile' | 'id') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [3, 2],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'profile') {
          setProfilePhoto(result.assets[0]);
        } else {
          setValidId(result.assets[0]);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickCertificateImage = async (index: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newCertificates = [...certificates];
        newCertificates[index].imageUri = result.assets[0].uri;
        setCertificates(newCertificates);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick certificate image');
    }
  };

  const addCertificate = () => {
    setCertificates([...certificates, { name: '', number: '', expiryDate: '', imageUri: '' }]);
  };

  const removeCertificate = (index: number) => {
    if (certificates.length > 1) {
      setCertificates(certificates.filter((_, i) => i !== index));
    }
  };

  const updateCertificate = (index: number, field: keyof Certificate, value: string) => {
    const newCertificates = [...certificates];
    newCertificates[index][field] = value;
    setCertificates(newCertificates);
  };

  const updateProfessionExperience = (index: number, experience: string) => {
    const newProfessions = [...professions];
    newProfessions[index].experience = experience;
    setProfessions(newProfessions);
  };

  const validateForm = (): boolean => {
    // Basic validation
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please enter your first and last name');
      return false;
    }

    if (!userName.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return false;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }

    if (!location.trim()) {
      Alert.alert('Error', 'Please enter your location');
      return false;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (!profilePhoto) {
      Alert.alert('Error', 'Please upload a profile photo');
      return false;
    }

    if (!validId) {
      Alert.alert('Error', 'Please upload a valid ID');
      return false;
    }

    // Validate professions
    for (const prof of professions) {
      if (!prof.experience || parseInt(prof.experience) < 0) {
        Alert.alert('Error', `Please enter valid experience for ${prof.name}`);
        return false;
      }
    }

    // Validate certificates
    for (const cert of certificates) {
      if (!cert.name.trim()) {
        Alert.alert('Error', 'Please enter certificate names');
        return false;
      }
      if (!cert.number.trim()) {
        Alert.alert('Error', 'Please enter certificate numbers');
        return false;
      }
      if (!cert.expiryDate) {
        Alert.alert('Error', 'Please enter certificate expiry dates');
        return false;
      }
      if (!cert.imageUri) {
        Alert.alert('Error', 'Please upload certificate images');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const formData = new FormData();

      // Add OTP and email
      formData.append('otp', otp);
      formData.append('provider_email', email);

      // Add basic information
      formData.append('provider_password', password);
      formData.append('provider_first_name', firstName);
      formData.append('provider_last_name', lastName);
      formData.append('provider_userName', userName);
      formData.append('provider_phone_number', phoneNumber);
      formData.append('provider_location', location);
      formData.append('provider_exact_location', exactLocation || '');
      formData.append('provider_birthday', birthday.toISOString().split('T')[0]);
      
      if (uli.trim()) {
        formData.append('provider_uli', uli);
      }

      // Add professions and experiences as JSON strings
      formData.append('professions', JSON.stringify(professions.map(p => p.id)));
      formData.append('experiences', JSON.stringify(professions.map(p => parseInt(p.experience))));

      // Add certificate details as JSON strings
      formData.append('certificateNames', JSON.stringify(certificates.map(c => c.name)));
      formData.append('certificateNumbers', JSON.stringify(certificates.map(c => c.number)));
      formData.append('expiryDates', JSON.stringify(certificates.map(c => c.expiryDate)));

      // Add profile photo
      formData.append('provider_profile_photo', {
        uri: profilePhoto.uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      // Add valid ID
      formData.append('provider_valid_id', {
        uri: validId.uri,
        type: 'image/jpeg',
        name: 'id.jpg',
      } as any);

      // Add certificate images
      certificates.forEach((cert, index) => {
        formData.append('certificate_images', {
          uri: cert.imageUri,
          type: 'image/jpeg',
          name: `certificate_${index}.jpg`,
        } as any);
      });

      // Submit registration
      const response = await verifyAndRegisterProvider(formData);

      Alert.alert(
        'Success',
        'Registration successful! Please wait for admin verification.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to a "pending verification" screen or login
              router.replace('/provider/onboarding/applicationreview');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthday(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#008080" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Registration</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Personal Information */}
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              value={userName}
              onChangeText={setUserName}
              placeholder="Choose a unique username"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+1234567890"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location (City, State) *</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g., New York, NY"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Exact Location (Optional)</Text>
            <TextInput
              style={styles.input}
              value={exactLocation}
              onChangeText={setExactLocation}
              placeholder="Detailed address or coordinates"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth *</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{birthday.toISOString().split('T')[0]}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={birthday}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ULI (Optional - 17 alphanumeric)</Text>
            <TextInput
              style={styles.input}
              value={uli}
              onChangeText={setUli}
              placeholder="e.g., ULI123456789ABCD"
              maxLength={17}
            />
          </View>

          {/* Password */}
          <Text style={styles.sectionTitle}>Security</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Min 8 characters"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              secureTextEntry={!showPassword}
            />
          </View>

          {/* File Uploads */}
          <Text style={styles.sectionTitle}>Identity Verification</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Profile Photo *</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickImage('profile')}
            >
              <Ionicons name="camera" size={24} color="#008080" />
              <Text style={styles.uploadButtonText}>
                {profilePhoto ? 'Photo Selected ✓' : 'Upload Profile Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Valid ID *</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickImage('id')}
            >
              <Ionicons name="card" size={24} color="#008080" />
              <Text style={styles.uploadButtonText}>
                {validId ? 'ID Selected ✓' : 'Upload Valid ID'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Professions */}
          <Text style={styles.sectionTitle}>Professional Experience</Text>

          {professions.map((profession, index) => (
            <View key={index} style={styles.professionItem}>
              <Text style={styles.professionName}>{profession.name}</Text>
              <TextInput
                style={styles.experienceInput}
                value={profession.experience}
                onChangeText={(text) => updateProfessionExperience(index, text)}
                placeholder="Years of experience"
                keyboardType="numeric"
              />
            </View>
          ))}

          {/* Certificates */}
          <Text style={styles.sectionTitle}>Certificates</Text>

          {certificates.map((cert, index) => (
            <View key={index} style={styles.certificateItem}>
              <View style={styles.certificateHeader}>
                <Text style={styles.certificateTitle}>Certificate {index + 1}</Text>
                {certificates.length > 1 && (
                  <TouchableOpacity onPress={() => removeCertificate(index)}>
                    <Ionicons name="trash" size={20} color="#ff4444" />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={styles.input}
                value={cert.name}
                onChangeText={(text) => updateCertificate(index, 'name', text)}
                placeholder="Certificate Name"
              />

              <TextInput
                style={styles.input}
                value={cert.number}
                onChangeText={(text) => updateCertificate(index, 'number', text)}
                placeholder="Certificate Number"
              />

              <TextInput
                style={styles.input}
                value={cert.expiryDate}
                onChangeText={(text) => updateCertificate(index, 'expiryDate', text)}
                placeholder="Expiry Date (YYYY-MM-DD)"
              />

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickCertificateImage(index)}
              >
                <Ionicons name="document" size={24} color="#008080" />
                <Text style={styles.uploadButtonText}>
                  {cert.imageUri ? 'Certificate Image Selected ✓' : 'Upload Certificate Image'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={addCertificate}>
            <Ionicons name="add-circle" size={24} color="#008080" />
            <Text style={styles.addButtonText}>Add Another Certificate</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Complete Registration</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#008080',
    marginTop: 20,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#008080',
    borderRadius: 8,
    borderStyle: 'dashed',
    paddingVertical: 15,
    gap: 10,
  },
  uploadButtonText: {
    color: '#008080',
    fontSize: 14,
    fontWeight: '500',
  },
  professionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  professionName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  experienceInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 100,
    textAlign: 'center',
  },
  certificateItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    gap: 10,
  },
  certificateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  certificateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#008080',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#008080',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
