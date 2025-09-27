import React, {useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Platform,
    SafeAreaView,
} from "react-native";
import {useRouter} from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {Picker} from "@react-native-picker/picker";
import {Ionicons} from "@expo/vector-icons";
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
    type: string;
    number: string;
    expiry: Date | null;
    file: string | null;
};

// ---------- Data ----------
const certificateServices: CertificateServicesJSON = certificateServicesJson;

export default function AddNewCertificate() {
    const router = useRouter();
    const [certificates, setCertificates] = useState<Certificate[]>([
        {type: "", number: "", expiry: null, file: null},
    ]);
    const [showDatePicker, setShowDatePicker] = useState<number | null>(null);

    const addCertificate = () => {
        setCertificates([
            ...certificates,
            {type: "", number: "", expiry: null, file: null},
        ]);
    };

    const handleAdd = () => {
        if (
            certificates.some(
                (cert) => !cert.type || !cert.number || !cert.expiry || !cert.file
            )
        ) {
            alert("Please complete all certificate fields.");
            return;
        }

        router.push("/provider/onboarding/mycertificate"); // Navigate to MyCertificates
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: "#fff"}}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#333"/>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Certificate</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.contentWrapper}>
                    {certificates.map((cert, index) => (
                        <View key={index} style={styles.section}>
                            <Text style={styles.title}>Certificate Type</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={cert.type}
                                    onValueChange={(val) => {
                                        const updated = [...certificates];
                                        updated[index].type = val;
                                        setCertificates(updated);
                                    }}
                                >
                                    <Picker.Item label="Select Certificate" value=""/>
                                    {certificateServices.categories.map((cat, i) => (
                                        <Picker.Item key={i} label={cat.title} value={cat.title}/>
                                    ))}
                                </Picker>
                            </View>

                            <Text style={styles.title}>Certificate Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter certificate number"
                                value={cert.number}
                                onChangeText={(val) => {
                                    const updated = [...certificates];
                                    updated[index].number = val;
                                    setCertificates(updated);
                                }}
                            />

                            <Text style={styles.title}>Expiry Date</Text>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(index)}
                                style={styles.input}
                            >
                                <Text>
                                    {cert.expiry ? cert.expiry.toDateString() : "Select expiry date"}
                                </Text>
                            </TouchableOpacity>

                            {showDatePicker === index && (
                                <DateTimePicker
                                    value={cert.expiry || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(null);
                                        if (selectedDate) {
                                            const updated = [...certificates];
                                            updated[index].expiry = selectedDate;
                                            setCertificates(updated);
                                        }
                                    }}
                                />
                            )}

                            <Text style={styles.title}>Upload Certificate File</Text>
                            <View style={{alignItems: "center"}}>
                                <TouchableOpacity
                                    onPress={async () => {
                                        const result = await DocumentPicker.getDocumentAsync({
                                            type: "*/*",
                                            copyToCacheDirectory: true,
                                        });
                                        if (
                                            "assets" in result &&
                                            result.assets &&
                                            result.assets.length > 0
                                        ) {
                                            const updated = [...certificates];
                                            updated[index].file = result.assets[0].uri;
                                            setCertificates(updated);
                                        }
                                    }}
                                    style={styles.circleButton}
                                >
                                    <Ionicons name="cloud-upload-outline" size={40} color="#008080"/>
                                </TouchableOpacity>
                            </View>

                            {cert.file && (
                                <Text style={styles.note}>
                                    Selected File: {cert.file.split("/").pop()}
                                </Text>
                            )}

                            {certificates.length > 1 && (
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => {
                                        const updated = certificates.filter((_, i) => i !== index);
                                        setCertificates(updated);
                                    }}
                                >
                                    <Ionicons name="trash-outline" size={16} color="red"/>
                                    <Text style={styles.removeText}>Remove</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity onPress={addCertificate} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+ Add Certificate</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Fixed Add Button */}
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity style={styles.nextButton} onPress={handleAdd}>
                    <Text style={styles.nextText}>Add</Text>
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
        backgroundColor: "#fff",
    },
    headerTitle: {fontSize: 18, fontWeight: "600", marginLeft: 12},
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 140,
    },
    contentWrapper: {flex: 1},
    section: {marginBottom: 40},
    title: {fontSize: 16, fontWeight: "bold", marginBottom: 8, marginTop: 10},
    input: {
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 30,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#f0f0f0",
        marginTop: 10,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 30,
        backgroundColor: "#f0f0f0",
        marginTop: 10,
        overflow: "hidden",
    },
    circleButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12,
    },
    note: {fontSize: 12, color: "#888", textAlign: "center", marginTop: 8},
    fixedButtonContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: "#fff",
    },
    nextButton: {
        backgroundColor: "#008080",
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
    },
    nextText: {color: "#fff", fontSize: 16, fontWeight: "bold"},
    addButton: {
        backgroundColor: "#e0f7f7",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        alignSelf: "center",
        marginBottom: 20,
    },
    addButtonText: {color: "#008080", fontWeight: "bold", fontSize: 14},
    removeButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        alignSelf: "flex-end",
        gap: 4,
    },
    removeText: {color: "red", fontSize: 12, fontWeight: "600"},
});
