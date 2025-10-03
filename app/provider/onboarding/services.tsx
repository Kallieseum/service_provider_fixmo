import {
    Poppins_400Regular,
    Poppins_600SemiBold,
    useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import AppLoading from "expo-app-loading";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import certificateServicesJson from "../../assets/data/certificateservices.json";

// ---------- Types ----------
type CertificateService = {
    title: string;
    services: string[];
};

type CertificateServicesJSON = {
    categories: CertificateService[];
};

type Certificate = {
    id: number;
    title: string;
};

// pretend these come from backend after approval
const approvedCertificates: Certificate[] = [
    { id: 1, title: "Plumbing NC II" },
    { id: 2, title: "Electrical Installation and Maintenance (EIM) NC II" },
    { id: 3, title: "Carpentry NC II" },
];

const certificateServices: CertificateServicesJSON = certificateServicesJson;

export default function AddServices() {
    const router = useRouter();

    const [selectedService, setSelectedService] = useState("");
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
    const [showApprovedList, setShowApprovedList] = useState(false);
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [images, setImages] = useState<string[]>([]);

    let [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold,
    });
    if (!fontsLoaded) return <AppLoading />;

    // Pick image (max 5)
    const pickImage = async () => {
        if (images.length >= 5) {
            Alert.alert("Limit Reached", "You can upload up to 5 images only.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });
        if (!result.canceled) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    // Final submit
    const handleAddServices = () => {
        if (!selectedService || !selectedCertificate || !description || !price) {
            Alert.alert("Missing Fields", "Please complete all required fields.");
            return;
        }

        // ✅ Navigate to service summary page
        router.push({
            pathname: "/provider/onboarding/servicesavailable",
            params: {
                certificate: selectedCertificate.title,
                service: selectedService,
                description,
                price,
                images: JSON.stringify(images),
            },
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Add Services</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Service Selection */}
                <Text style={styles.label}>Select a Service*</Text>
                <View style={styles.inputBox}>
                    <Picker
                        selectedValue={selectedService}
                        onValueChange={(val) => setSelectedService(val)}
                    >
                        <Picker.Item label="Select Service" value="" />
                        {certificateServices.categories.flatMap((cat) =>
                            cat.services.map((srv, i) => (
                                <Picker.Item key={cat.title + i} label={srv} value={srv} />
                            ))
                        )}
                    </Picker>
                </View>

                {/* Certificates Section */}
                <Text style={styles.label}>Certificates*</Text>
                {selectedCertificate ? (
                    <View style={styles.certificateCard}>
                        <Ionicons name="document-text-outline" size={20} color="#1e6355" />
                        <Text style={{ marginLeft: 8 }}>{selectedCertificate.title}</Text>
                    </View>
                ) : (
                    <Text style={{ color: "#888", marginTop: 8 }}>
                        No certificate added yet.
                    </Text>
                )}

                {/* Add Certificate Button */}
                <TouchableOpacity
                    onPress={() => setShowApprovedList(!showApprovedList)}
                    style={styles.addButton}
                >
                    <Text style={styles.addButtonText}>+ Add Certificate</Text>
                </TouchableOpacity>

                {/* Show Approved Certificates */}
                {showApprovedList && (
                    <View style={styles.dropdownWrapper}>
                        {approvedCertificates.map((cert) => (
                            <TouchableOpacity
                                key={cert.id}
                                style={styles.certOption}
                                onPress={() => {
                                    setSelectedCertificate(cert);
                                    setShowApprovedList(false);
                                }}
                            >
                                <Text>{cert.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Description */}
                <Text style={styles.label}>Service Description*</Text>
                <TextInput
                    style={styles.textArea}
                    multiline
                    placeholder="Describe your service..."
                    placeholderTextColor="#A0A0A0"
                    value={description}
                    onChangeText={setDescription}
                />

                {/* Image Upload */}
                <Text style={styles.label}>Service Image*</Text>
                <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
                    <Ionicons name="cloud-upload-outline" size={32} color="#1e6355" />
                    <Text style={styles.uploadText}>
                        Add up to 5 images {"\n"}(Landscape only)
                    </Text>
                </TouchableOpacity>
                <View style={styles.imageRow}>
                    {images.map((uri, i) => (
                        <Image key={i} source={{ uri }} style={styles.uploadedImage} />
                    ))}
                </View>

                {/* Price */}
                <Text style={styles.label}>Starting Price (₱)*</Text>
                <TextInput
                    style={styles.inputBox}
                    keyboardType="numeric"
                    placeholder="Enter starting price"
                    placeholderTextColor="#A0A0A0"
                    value={price}
                    onChangeText={setPrice}
                />
            </ScrollView>

            {/* Fixed Add Button */}
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity style={styles.submitBtn} onPress={handleAddServices}>
                    <Text style={styles.submitText}>Add Services</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        justifyContent: "center",
    },
    headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold" },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 140,
    },
    label: {
        fontFamily: "Poppins_400Regular",
        fontSize: 14,
        marginBottom: 6,
        marginTop: 12,
    },
    inputBox: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 10,
    },
    certificateCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        marginTop: 10,
        borderRadius: 10,
        backgroundColor: "#e0f7f7",
    },
    addButton: {
        backgroundColor: "#e0f7f7",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        alignSelf: "center",
        marginTop: 20,
    },
    addButtonText: { color: "#1e6355", fontWeight: "bold", fontSize: 14 },
    dropdownWrapper: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        backgroundColor: "#fafafa",
    },
    certOption: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    textArea: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        padding: 12,
        minHeight: 80,
        textAlignVertical: "top",
        fontFamily: "Poppins_400Regular",
    },
    imageUpload: {
        alignItems: "center",
        padding: 15,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        marginBottom: 10,
    },
    uploadText: {
        fontSize: 12,
        textAlign: "center",
        marginTop: 6,
        color: "#888",
        fontFamily: "Poppins_400Regular",
    },
    imageRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginVertical: 10,
    },
    uploadedImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 10,
    },
    fixedButtonContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: "#fff",
    },
    submitBtn: {
        backgroundColor: "#1e6355",
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
    },
    submitText: {
        color: "#fff",
        fontFamily: "Poppins_600SemiBold",
        fontSize: 16,
    },
});
