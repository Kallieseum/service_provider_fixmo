import { API_CONFIG } from "@/constants/config";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const BACKEND_URL = API_CONFIG.BASE_URL;

// Philippines location data
const philippinesData = require("../../../assets/data/philippines.json");

interface VerificationModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    rejectionReason?: string;
    currentUserData?: {
        first_name?: string;
        last_name?: string;
        birthday?: string;
        location?: string;
        exact_location?: string;
        profile_photo?: string;
        valid_id?: string;
    };
}

const VerificationModal: React.FC<VerificationModalProps> = ({
    visible,
    onClose,
    onSuccess,
    rejectionReason,
    currentUserData,
}) => {
    const [firstName, setFirstName] = useState(currentUserData?.first_name || "");
    const [lastName, setLastName] = useState(currentUserData?.last_name || "");
    const [birthday, setBirthday] = useState<Date | null>(
        currentUserData?.birthday ? new Date(currentUserData.birthday) : null
    );
    const [location, setLocation] = useState(currentUserData?.location || "");
    const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(
        currentUserData?.profile_photo || null
    );
    const [validIdUri, setValidIdUri] = useState<string | null>(currentUserData?.valid_id || null);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Location cascading
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedMunicipality, setSelectedMunicipality] = useState("");
    const [selectedBarangay, setSelectedBarangay] = useState("");
    const [showProvinceModal, setShowProvinceModal] = useState(false);
    const [showMunicipalityModal, setShowMunicipalityModal] = useState(false);
    const [showBarangayModal, setShowBarangayModal] = useState(false);

    const pickProfilePhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "Gallery permission is required");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfilePhotoUri(result.assets[0].uri);
        }
    };

    const pickValidId = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "Gallery permission is required");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setValidIdUri(result.assets[0].uri);
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
        updateLocation("", "", province);
    };

    const handleMunicipalitySelect = (municipality: string) => {
        setSelectedMunicipality(municipality);
        setSelectedBarangay("");
        setShowMunicipalityModal(false);
        updateLocation("", municipality, selectedProvince);
    };

    const handleBarangaySelect = (barangay: string) => {
        setSelectedBarangay(barangay);
        setShowBarangayModal(false);
        updateLocation(barangay, selectedMunicipality, selectedProvince);
    };

    const updateLocation = (barangay: string, municipality: string, province: string) => {
        const parts = [barangay, municipality, province].filter(Boolean);
        setLocation(parts.join(", "));
    };

    const handleSubmit = async () => {
        // Validation
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert("Validation Error", "First name and last name are required");
            return;
        }

        if (!birthday) {
            Alert.alert("Validation Error", "Birthday is required");
            return;
        }

        if (!location.trim()) {
            Alert.alert("Validation Error", "Location is required");
            return;
        }

        if (!profilePhotoUri) {
            Alert.alert("Validation Error", "Profile photo is required");
            return;
        }

        if (!validIdUri) {
            Alert.alert("Validation Error", "Valid ID is required");
            return;
        }

        setSubmitting(true);

        try {
            const token = await AsyncStorage.getItem("providerToken");
            if (!token) {
                Alert.alert("Error", "Please login first");
                return;
            }

            const formData = new FormData();
            formData.append("provider_first_name", firstName);
            formData.append("provider_last_name", lastName);
            formData.append("birthday", birthday.toISOString().split("T")[0]);
            formData.append("provider_location", location);

            // Add exact_location if available
            if (currentUserData?.exact_location) {
                formData.append("exact_location", currentUserData.exact_location);
            }

            // Handle profile photo
            if (profilePhotoUri.startsWith("http")) {
                // Existing Cloudinary URL
                formData.append("profile_photo_url", profilePhotoUri);
            } else {
                // New photo selected
                const photoExt = profilePhotoUri.split(".").pop();
                formData.append("provider_profile_photo", {
                    uri: profilePhotoUri,
                    type: `image/${photoExt}`,
                    name: `profile.${photoExt}`,
                } as any);
            }

            // Handle valid ID
            if (validIdUri.startsWith("http")) {
                // Existing Cloudinary URL
                formData.append("valid_id_url", validIdUri);
            } else {
                // New ID selected
                const idExt = validIdUri.split(".").pop();
                formData.append("provider_valid_id", {
                    uri: validIdUri,
                    type: `image/${idExt}`,
                    name: `valid_id.${idExt}`,
                } as any);
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
                    rejectionReason
                        ? "Verification documents resubmitted successfully! Your documents will be reviewed again."
                        : "Verification documents submitted successfully! Please wait for admin approval.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                onSuccess();
                                handleClose();
                            },
                        },
                    ]
                );
            } else {
                const errorData = await response.json();
                Alert.alert("Error", errorData.message || "Failed to submit verification");
            }
        } catch (error) {
            console.error("Error submitting verification:", error);
            Alert.alert("Error", "Network error while submitting verification");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose}>
                        <Ionicons name="close" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {rejectionReason ? "Resubmit Verification" : "Submit Verification"}
                    </Text>
                    <View style={{ width: 28 }} />
                </View>

                {rejectionReason && (
                    <View style={styles.rejectionBanner}>
                        <Ionicons name="alert-circle" size={24} color="#ff4444" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.rejectionTitle}>Verification Rejected</Text>
                            <Text style={styles.rejectionReason}>{rejectionReason}</Text>
                        </View>
                    </View>
                )}

                <ScrollView style={styles.form}>
                    {/* First Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>First Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="Enter first name"
                        />
                    </View>

                    {/* Last Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Last Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Enter last name"
                        />
                    </View>

                    {/* Birthday */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Birthday *</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setDatePickerVisible(true)}
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

                    {/* Location Cascading */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Province *</Text>
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={() => setShowProvinceModal(true)}
                        >
                            <Text style={selectedProvince ? styles.selectText : styles.selectPlaceholder}>
                                {selectedProvince || "Select Province"}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {selectedProvince && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Municipality/City *</Text>
                            <TouchableOpacity
                                style={styles.selectButton}
                                onPress={() => setShowMunicipalityModal(true)}
                            >
                                <Text
                                    style={selectedMunicipality ? styles.selectText : styles.selectPlaceholder}
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
                                style={styles.selectButton}
                                onPress={() => setShowBarangayModal(true)}
                            >
                                <Text style={selectedBarangay ? styles.selectText : styles.selectPlaceholder}>
                                    {selectedBarangay || "Select Barangay"}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Profile Photo */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Profile Photo *</Text>
                        <TouchableOpacity style={styles.photoButton} onPress={pickProfilePhoto}>
                            {profilePhotoUri ? (
                                <Image source={{ uri: profilePhotoUri }} style={styles.photoPreview} />
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <Ionicons name="camera" size={40} color="#999" />
                                    <Text style={styles.photoPlaceholderText}>Tap to upload</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Valid ID */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Valid ID *</Text>
                        <TouchableOpacity style={styles.photoButton} onPress={pickValidId}>
                            {validIdUri ? (
                                <Image source={{ uri: validIdUri }} style={styles.photoPreview} />
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <Ionicons name="card" size={40} color="#999" />
                                    <Text style={styles.photoPlaceholderText}>Tap to upload</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit for Review</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Location Selection Modals */}
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
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    rejectionBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffe6e6",
        padding: 16,
        margin: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ff4444",
    },
    rejectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ff4444",
        marginBottom: 4,
    },
    rejectionReason: {
        fontSize: 14,
        color: "#666",
    },
    form: {
        flex: 1,
        padding: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
    },
    dateButtonText: {
        fontSize: 16,
        color: "#333",
    },
    selectButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
    },
    selectText: {
        fontSize: 16,
        color: "#333",
    },
    selectPlaceholder: {
        fontSize: 16,
        color: "#999",
    },
    photoButton: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        overflow: "hidden",
    },
    photoPreview: {
        width: "100%",
        height: 200,
        resizeMode: "cover",
    },
    photoPlaceholder: {
        height: 200,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
    },
    photoPlaceholderText: {
        marginTop: 8,
        fontSize: 14,
        color: "#999",
    },
    submitButton: {
        backgroundColor: "#008080",
        margin: 16,
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    locationModalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: "70%",
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

export default VerificationModal;
