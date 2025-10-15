import { getDetailedProviderProfile } from "@/api/auth.api";
import { API_CONFIG } from "@/constants/config";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const BACKEND_URL = API_CONFIG.BASE_URL;

// Philippines location data
const philippinesData = require("../../assets/data/philippines.json");

interface UserData {
    provider_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    location: string | null;
    exact_location?: string | null;
    birthday?: string | null;
    profile_photo?: string | null;
    verification_status?: string;
}

export default function EditProfileScreen() {
    const router = useRouter();

    // User data
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [homeAddress, setHomeAddress] = useState("");
    const [profileUri, setProfileUri] = useState<string | null>(null);
    const [birthday, setBirthday] = useState<Date | null>(null);
    const [locationCoordinates, setLocationCoordinates] = useState<{ lat: number; lng: number } | undefined>();

    // OTP states (for approved users)
    const [otpRequested, setOtpRequested] = useState(false);
    const [maskedEmail, setMaskedEmail] = useState("");
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpTimer, setOtpTimer] = useState(0);
    const [requestingOtp, setRequestingOtp] = useState(false);
    const [originalEmail, setOriginalEmail] = useState("");

    // Email change OTP states
    const [showSecondOtpModal, setShowSecondOtpModal] = useState(false);
    const [secondOtp, setSecondOtp] = useState("");
    const [newEmailForVerification, setNewEmailForVerification] = useState("");

    // Location cascading states
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedMunicipality, setSelectedMunicipality] = useState("");
    const [selectedBarangay, setSelectedBarangay] = useState("");
    const [showProvinceModal, setShowProvinceModal] = useState(false);
    const [showMunicipalityModal, setShowMunicipalityModal] = useState(false);
    const [showBarangayModal, setShowBarangayModal] = useState(false);

    // Date picker
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    // Load user profile
    useFocusEffect(
        useCallback(() => {
            loadUserProfile();
        }, [])
    );

    // OTP Timer countdown
    useEffect(() => {
        if (otpTimer > 0) {
            const interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else if (otpTimer === 0 && otpRequested) {
            setOtpRequested(false);
        }
    }, [otpTimer, otpRequested]);

    const loadUserProfile = async () => {
        try {
            const token = await AsyncStorage.getItem("providerToken");
            if (!token) {
                Alert.alert("Error", "Please login first");
                router.back();
                return;
            }

            console.log("Loading provider profile...");
            
            // Use the existing API function that has fallback logic
            const data = await getDetailedProviderProfile(token);
            
            console.log("Profile data loaded successfully");

            setUserData(data);
            setFirstName(data.first_name || "");
            setLastName(data.last_name || "");
            setEmail(data.email || "");
            setOriginalEmail(data.email || "");
            setPhone(data.phone_number || "");
            setHomeAddress(data.location || "");
            setProfileUri(data.profile_photo || null);

            // Parse birthday
            if (data.birthday) {
                setBirthday(new Date(data.birthday));
            }

            // Parse location coordinates
            if (data.exact_location) {
                const [lat, lng] = data.exact_location.split(",").map(Number);
                setLocationCoordinates({ lat, lng });
            }

            // Parse cascading location from location string
            parseLocationString(data.location || "");
            
        } catch (error) {
            console.error("Error loading profile:", error);
            Alert.alert(
                "Error Loading Profile", 
                error instanceof Error ? error.message : "Failed to load profile data. Please try again.",
                [
                    { text: "Go Back", onPress: () => router.back() },
                    { text: "Retry", onPress: () => loadUserProfile() }
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    const parseLocationString = (locationStr: string) => {
        // Parse "Barangay, Municipality, Province" format
        const parts = locationStr.split(",").map((p) => p.trim());
        if (parts.length >= 3) {
            setSelectedBarangay(parts[0]);
            setSelectedMunicipality(parts[1]);
            setSelectedProvince(parts[2]);
        }
    };

    const requestOtp = async () => {
        // Only approved users need OTP
        if (userData?.verification_status !== "approved") {
            console.log("User not approved, skipping OTP request");
            return;
        }

        setRequestingOtp(true);

        try {
            const token = await AsyncStorage.getItem("providerToken");
            console.log("Requesting OTP from:", `${BACKEND_URL}/provider/profile/request-otp`);
            
            const response = await fetch(`${BACKEND_URL}/provider/profile/request-otp`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("OTP request response status:", response.status);
            const result = await response.json();
            console.log("OTP request result:", result);

            if (response.ok) {
                setOtpRequested(true);
                setMaskedEmail(result.data?.maskedEmail || "");
                setOtpTimer(600); // 10 minutes = 600 seconds
                Alert.alert(
                    "Verification Code Sent",
                    `A 6-digit code has been sent to ${result.data?.maskedEmail || "your email"}`
                );
            } else {
                // Show detailed error for debugging
                const errorMsg = result.message || "Failed to send verification code";
                console.error("OTP request failed:", errorMsg, result);
                Alert.alert(
                    "Error", 
                    `${errorMsg}\n\nNote: This feature requires backend implementation. See PROVIDER_EDIT_PROFILE_BACKEND_GUIDE.md for details.`
                );
            }
        } catch (error) {
            console.error("Error requesting OTP:", error);
            Alert.alert(
                "Network Error", 
                `Failed to connect to server.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nNote: The backend endpoint may not be implemented yet.`
            );
        } finally {
            setRequestingOtp(false);
        }
    };

    const handleSave = async () => {
        // Check verification status
        if (userData?.verification_status !== "approved") {
            // For rejected/pending users → Direct resubmission (no OTP)
            Alert.alert(
                "Verification Resubmission",
                "Your account is not yet approved. Saving will resubmit your information for verification.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Resubmit",
                        onPress: () => handleVerificationResubmission(),
                    },
                ]
            );
            return;
        }

        // For approved users → OTP required
        if (!otpRequested) {
            Alert.alert(
                "Verification Required",
                "Please request a verification code first before saving changes.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Request Code",
                        onPress: () => requestOtp(),
                    },
                ]
            );
            return;
        }

        // Validation
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert("Validation Error", "First name and last name are required");
            return;
        }

        if (!phone.trim()) {
            Alert.alert("Validation Error", "Phone number is required");
            return;
        }

        if (!homeAddress.trim()) {
            Alert.alert("Validation Error", "Home address is required");
            return;
        }

        // Show OTP modal for verification before saving
        setShowOtpModal(true);
    };

    const verifyOtpAndSave = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert("Error", "Please enter a valid 6-digit verification code");
            return;
        }

        setSaving(true);

        try {
            const token = await AsyncStorage.getItem("providerToken");

            // Prepare update data
            const updateData: any = {
                phone_number: phone,
                provider_location: homeAddress,
            };

            // Add coordinates if available
            if (locationCoordinates) {
                updateData.exact_location = `${locationCoordinates.lat},${locationCoordinates.lng}`;
            }

            // Add email if changed
            if (email !== originalEmail) {
                updateData.provider_email = email;
            }

            const response = await fetch(`${BACKEND_URL}/provider/profile?otp=${otp}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            });

            const result = await response.json();

            if (response.ok) {
                // If email was changed, verify new email
                if (email !== originalEmail) {
                    setNewEmailForVerification(email);
                    setShowOtpModal(false);
                    Alert.alert(
                        "Email Verification Required",
                        `A verification code has been sent to your new email: ${email}. Please enter it to complete the change.`,
                        [{ text: "OK", onPress: () => setShowSecondOtpModal(true) }]
                    );
                } else {
                    Alert.alert("Success", "Profile updated successfully!", [
                        {
                            text: "OK",
                            onPress: () => {
                                setShowOtpModal(false);
                                loadUserProfile(); // Reload profile
                                router.back();
                            },
                        },
                    ]);
                }
            } else {
                Alert.alert("Error", result.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Network error during update");
        } finally {
            setSaving(false);
        }
    };

    const handleVerificationResubmission = async () => {
        setSaving(true);

        try {
            const token = await AsyncStorage.getItem("providerToken");

            const formData = new FormData();

            // Personal information
            formData.append("provider_first_name", firstName);
            formData.append("provider_last_name", lastName);

            if (birthday) {
                formData.append("birthday", birthday.toISOString().split("T")[0]);
            }

            formData.append("provider_location", homeAddress);

            if (locationCoordinates) {
                formData.append("exact_location", `${locationCoordinates.lat},${locationCoordinates.lng}`);
            }

            // Profile photo (if new image selected)
            if (profileUri && !profileUri.startsWith("http")) {
                const photoExt = profileUri.split(".").pop();
                formData.append("provider_profile_photo", {
                    uri: profileUri,
                    type: `image/${photoExt}`,
                    name: `profile.${photoExt}`,
                } as any);
            } else if (profileUri) {
                // Existing Cloudinary URL
                formData.append("profile_photo_url", profileUri);
            }

            const response = await fetch(`${BACKEND_URL}/api/verification/provider/resubmit`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                Alert.alert(
                    "Success",
                    "Your information has been updated and submitted for review.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                loadUserProfile();
                                router.back();
                            },
                        },
                    ]
                );
            } else {
                const errorData = await response.json();
                Alert.alert("Error", errorData.message || "Failed to update information");
            }
        } catch (error) {
            console.error("Error during resubmission:", error);
            Alert.alert("Error", "Network error during resubmission");
        } finally {
            setSaving(false);
        }
    };

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission denied", "We need access to your photos.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            setProfileUri(result.assets[0].uri);
        }
    };

    const getProvinces = () => {
        return Object.keys(philippinesData);
    };

    const getMunicipalities = () => {
        if (!selectedProvince || !philippinesData[selectedProvince]) return [];
        return Object.keys(philippinesData[selectedProvince].municipality_list);
    };

    const getBarangays = () => {
        if (
            !selectedProvince ||
            !selectedMunicipality ||
            !philippinesData[selectedProvince]?.municipality_list[selectedMunicipality]
        )
            return [];
        return philippinesData[selectedProvince].municipality_list[selectedMunicipality].barangay_list;
    };

    const handleProvinceSelect = (province: string) => {
        setSelectedProvince(province);
        setSelectedMunicipality("");
        setSelectedBarangay("");
        setShowProvinceModal(false);
        updateHomeAddress(selectedBarangay, "", province);
    };

    const handleMunicipalitySelect = (municipality: string) => {
        setSelectedMunicipality(municipality);
        setSelectedBarangay("");
        setShowMunicipalityModal(false);
        updateHomeAddress(selectedBarangay, municipality, selectedProvince);
    };

    const handleBarangaySelect = (barangay: string) => {
        setSelectedBarangay(barangay);
        setShowBarangayModal(false);
        updateHomeAddress(barangay, selectedMunicipality, selectedProvince);
    };

    const updateHomeAddress = (barangay: string, municipality: string, province: string) => {
        const parts = [barangay, municipality, province].filter(Boolean);
        setHomeAddress(parts.join(", "));
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#008080" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Header */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>

            {/* Show different UI based on verification status */}
            {userData?.verification_status === "approved" && (
                <View style={styles.otpSection}>
                    <Text style={styles.sectionTitle}>Security Verification Required</Text>
                    <Text style={styles.helperText}>
                        To protect your account, we need to verify your identity before making changes.
                    </Text>

                    {otpRequested ? (
                        <View style={styles.otpRequestedBox}>
                            <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
                            <Text style={styles.otpRequestedText}>Code sent to {maskedEmail}</Text>
                            <Text style={styles.timerText}>
                                Expires in: {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, "0")}
                            </Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.requestOtpButton}
                            onPress={requestOtp}
                            disabled={requestingOtp}
                        >
                            {requestingOtp ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="shield-checkmark" size={20} color="#fff" />
                                    <Text style={styles.requestOtpButtonText}>Request Verification Code</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Rejection warning for rejected/pending users */}
            {userData?.verification_status !== "approved" && (
                <View style={styles.warningBox}>
                    <Ionicons name="alert-circle" size={24} color="#FF9800" />
                    <Text style={styles.warningText}>
                        Your account verification is {userData?.verification_status}. Saving changes will resubmit
                        your information for review.
                    </Text>
                </View>
            )}

            {/* Info banner for approved users who haven't requested OTP */}
            {userData?.verification_status === "approved" && !otpRequested && (
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={24} color="#2196F3" />
                    <Text style={styles.infoText}>
                        Profile editing is locked. Please request a verification code above to unlock fields and make changes.
                    </Text>
                </View>
            )}

            {/* Avatar */}
            <TouchableOpacity 
                style={[
                    styles.avatarContainer,
                    userData?.verification_status === "approved" && !otpRequested && styles.avatarDisabled
                ]} 
                onPress={pickImage}
                disabled={userData?.verification_status === "approved" && !otpRequested}
            >
                {profileUri ? (
                    <Image source={{ uri: profileUri }} style={styles.avatarImage} />
                ) : (
                    <Ionicons name="person-circle-outline" size={80} color="#ccc" />
                )}
                <Text style={styles.changePhoto}>
                    {userData?.verification_status === "approved" && !otpRequested 
                        ? "Request code to change photo" 
                        : "Tap to change photo"}
                </Text>
            </TouchableOpacity>

            {/* Form Fields */}
            <View style={styles.form}>
                {/* First Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>First Name *</Text>
                    <TextInput
                        style={[
                            styles.input,
                            userData?.verification_status === "approved" && !otpRequested && styles.inputDisabled
                        ]}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Enter first name"
                        editable={userData?.verification_status !== "approved" || otpRequested}
                    />
                </View>

                {/* Last Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Last Name *</Text>
                    <TextInput
                        style={[
                            styles.input,
                            userData?.verification_status === "approved" && !otpRequested && styles.inputDisabled
                        ]}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Enter last name"
                        editable={userData?.verification_status !== "approved" || otpRequested}
                    />
                </View>

                {/* Birthday */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Birthday</Text>
                    <TouchableOpacity
                        style={[
                            styles.dateButton,
                            userData?.verification_status === "approved" && !otpRequested && styles.inputDisabled
                        ]}
                        onPress={() => setDatePickerVisible(true)}
                        disabled={userData?.verification_status === "approved" && !otpRequested}
                    >
                        <Text style={styles.dateButtonText}>
                            {birthday ? birthday.toLocaleDateString() : "Select birthday"}
                        </Text>
                        <Ionicons name="calendar-outline" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={(date) => {
                        setBirthday(date);
                        setDatePickerVisible(false);
                    }}
                    onCancel={() => setDatePickerVisible(false)}
                    maximumDate={new Date()}
                />

                {/* Email - Editable for approved users who requested OTP */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email *</Text>
                    <TextInput
                        style={[
                            styles.input,
                            userData?.verification_status === "approved" && !otpRequested && styles.inputDisabled
                        ]}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={userData?.verification_status !== "approved" || otpRequested}
                    />
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number *</Text>
                    <View style={[
                        styles.phoneInputContainer,
                        userData?.verification_status === "approved" && !otpRequested && styles.inputDisabled
                    ]}>
                        <Text style={styles.phonePrefix}>+63</Text>
                        <TextInput
                            style={styles.phoneInput}
                            value={phone}
                            onChangeText={(text) => {
                                // Remove +63 if user types it
                                const cleaned = text.replace(/^\+63/, "").replace(/\D/g, "");
                                setPhone(cleaned);
                            }}
                            placeholder="9XX XXX XXXX"
                            keyboardType="phone-pad"
                            maxLength={10}
                            editable={userData?.verification_status !== "approved" || otpRequested}
                        />
                    </View>
                </View>

                {/* Location Cascading */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Province *</Text>
                    <TouchableOpacity
                        style={[
                            styles.selectButton,
                            userData?.verification_status === "approved" && !otpRequested && styles.inputDisabled
                        ]}
                        onPress={() => setShowProvinceModal(true)}
                        disabled={userData?.verification_status === "approved" && !otpRequested}
                    >
                        <Text style={selectedProvince ? styles.selectButtonText : styles.selectPlaceholder}>
                            {selectedProvince || "Select Province"}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {selectedProvince && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Municipality/City *</Text>
                        <TouchableOpacity
                            style={[
                                styles.selectButton,
                                userData?.verification_status === "approved" && !otpRequested && styles.inputDisabled
                            ]}
                            onPress={() => setShowMunicipalityModal(true)}
                            disabled={userData?.verification_status === "approved" && !otpRequested}
                        >
                            <Text
                                style={selectedMunicipality ? styles.selectButtonText : styles.selectPlaceholder}
                            >
                                {selectedMunicipality || "Select Municipality/City"}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                )}

                {selectedMunicipality && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Barangay *</Text>
                        <TouchableOpacity
                            style={[
                                styles.selectButton,
                                userData?.verification_status === "approved" && !otpRequested && styles.inputDisabled
                            ]}
                            onPress={() => setShowBarangayModal(true)}
                            disabled={userData?.verification_status === "approved" && !otpRequested}
                        >
                            <Text style={selectedBarangay ? styles.selectButtonText : styles.selectPlaceholder}>
                                {selectedBarangay || "Select Barangay"}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Full Address Display */}
                {homeAddress && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Address</Text>
                        <Text style={styles.addressDisplay}>{homeAddress}</Text>
                    </View>
                )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveText}>Save Changes</Text>
                )}
            </TouchableOpacity>

            {/* OTP Verification Modal */}
            <Modal
                visible={showOtpModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowOtpModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter Verification Code</Text>
                        <Text style={styles.modalDescription}>
                            Enter the 6-digit code sent to {maskedEmail}
                        </Text>

                        <TextInput
                            style={styles.otpInput}
                            value={otp}
                            onChangeText={setOtp}
                            placeholder="000000"
                            keyboardType="number-pad"
                            maxLength={6}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowOtpModal(false)}
                            >
                                <Text style={styles.modalCancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalVerifyButton}
                                onPress={verifyOtpAndSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.modalVerifyButtonText}>Verify</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Province Modal */}
            <Modal
                visible={showProvinceModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowProvinceModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.locationModalContent}>
                        <View style={styles.locationModalHeader}>
                            <Text style={styles.locationModalTitle}>Select Province</Text>
                            <TouchableOpacity onPress={() => setShowProvinceModal(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {getProvinces().map((province) => (
                                <TouchableOpacity
                                    key={province}
                                    style={styles.locationItem}
                                    onPress={() => handleProvinceSelect(province)}
                                >
                                    <Text style={styles.locationItemText}>{province}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Municipality Modal */}
            <Modal
                visible={showMunicipalityModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowMunicipalityModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.locationModalContent}>
                        <View style={styles.locationModalHeader}>
                            <Text style={styles.locationModalTitle}>Select Municipality/City</Text>
                            <TouchableOpacity onPress={() => setShowMunicipalityModal(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {getMunicipalities().map((municipality) => (
                                <TouchableOpacity
                                    key={municipality}
                                    style={styles.locationItem}
                                    onPress={() => handleMunicipalitySelect(municipality)}
                                >
                                    <Text style={styles.locationItemText}>{municipality}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Barangay Modal */}
            <Modal
                visible={showBarangayModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowBarangayModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.locationModalContent}>
                        <View style={styles.locationModalHeader}>
                            <Text style={styles.locationModalTitle}>Select Barangay</Text>
                            <TouchableOpacity onPress={() => setShowBarangayModal(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {getBarangays().map((barangay: string) => (
                                <TouchableOpacity
                                    key={barangay}
                                    style={styles.locationItem}
                                    onPress={() => handleBarangaySelect(barangay)}
                                >
                                    <Text style={styles.locationItemText}>{barangay}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: Platform.OS === "ios" ? 60 : 40,
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100,
    },
    loadingText: {
        fontSize: 14,
        color: "#666",
        marginTop: 12,
    },
    backButton: {
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    otpSection: {
        backgroundColor: "#E8F5E9",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#4CAF50",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    helperText: {
        fontSize: 13,
        color: "#666",
        marginBottom: 12,
    },
    otpRequestedBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
    },
    otpRequestedText: {
        fontSize: 14,
        color: "#333",
        marginLeft: 8,
        flex: 1,
    },
    timerText: {
        fontSize: 12,
        color: "#666",
    },
    requestOtpButton: {
        backgroundColor: "#008080",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    requestOtpButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    warningBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF3E0",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#FF9800",
    },
    warningText: {
        fontSize: 13,
        color: "#666",
        marginLeft: 12,
        flex: 1,
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E3F2FD",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#2196F3",
    },
    infoText: {
        fontSize: 13,
        color: "#666",
        marginLeft: 12,
        flex: 1,
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    avatarDisabled: {
        opacity: 0.5,
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    changePhoto: {
        fontSize: 12,
        color: "#008080",
        marginTop: 8,
    },
    form: {
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        color: "#333",
    },
    input: {
        backgroundColor: "#f9f9f9",
        padding: 14,
        borderRadius: 30,
        fontSize: 16,
    },
    inputDisabled: {
        backgroundColor: "#e0e0e0",
        opacity: 0.6,
    },
    phoneInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        borderRadius: 30,
        paddingLeft: 14,
    },
    phonePrefix: {
        fontSize: 16,
        color: "#333",
        fontWeight: "600",
        marginRight: 8,
    },
    phoneInput: {
        flex: 1,
        padding: 14,
        fontSize: 16,
    },
    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#f9f9f9",
        padding: 14,
        borderRadius: 30,
    },
    dateButtonText: {
        fontSize: 16,
        color: "#333",
    },
    selectButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#f9f9f9",
        padding: 14,
        borderRadius: 30,
    },
    selectButtonText: {
        fontSize: 16,
        color: "#333",
    },
    selectPlaceholder: {
        fontSize: 16,
        color: "#999",
    },
    addressDisplay: {
        fontSize: 14,
        color: "#666",
        padding: 12,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
    },
    saveButton: {
        backgroundColor: "#008080",
        paddingVertical: 15,
        borderRadius: 40,
        alignItems: "center",
        marginTop: 20,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        width: "85%",
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
        textAlign: "center",
    },
    modalDescription: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
        textAlign: "center",
    },
    otpInput: {
        backgroundColor: "#f9f9f9",
        padding: 14,
        borderRadius: 8,
        fontSize: 24,
        textAlign: "center",
        marginBottom: 20,
        letterSpacing: 8,
    },
    modalButtons: {
        flexDirection: "row",
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: "#E0F2F1",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    modalCancelButtonText: {
        color: "#008080",
        fontSize: 16,
        fontWeight: "600",
    },
    modalVerifyButton: {
        flex: 1,
        backgroundColor: "#008080",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    modalVerifyButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    locationModalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: "70%",
        width: "100%",
    },
    locationModalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    locationModalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    locationItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    locationItemText: {
        fontSize: 16,
        color: "#333",
    },
});
