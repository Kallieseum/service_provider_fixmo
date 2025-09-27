import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Modal,
    Alert,
    Platform,
} from "react-native";
import {useRouter} from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {Picker} from "@react-native-picker/picker";
import {useState} from "react";
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

export default function RequirementsUpload() {
    const router = useRouter();

    // Professional Info
    const [uliNumber, setUliNumber] = useState("");
    const [showTooltip, setShowTooltip] = useState(false);

    // Security
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // TESDA Certificates
    const [certificates, setCertificates] = useState<Certificate[]>([
        {type: "", number: "", expiry: null, file: null},
    ]);

    const [showDatePicker, setShowDatePicker] = useState<number | null>(null);

    // Add new certificate
    const addCertificate = () => {
        setCertificates([
            ...certificates,
            {type: "", number: "", expiry: null, file: null},
        ]);
    };

    const isPasswordValid = (password: string) => {
        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return regex.test(password);
    };

    const handleNext = () => {
        if (
            !uliNumber ||
            !password ||
            !confirmPassword ||
            certificates.some(
                (cert) =>
                    !cert.type || !cert.number || !cert.expiry || !cert.file
            )
        ) {
            Alert.alert(
                "Missing Information",
                "Please complete all required fields."
            );
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Password Mismatch", "Passwords do not match.");
            return;
        }

        if (!isPasswordValid(password)) {
            Alert.alert(
                "Invalid Password",
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
            );
            return;
        }

        router.push("/provider/onboarding/drugtestupload");
    };

    return (
        <View style={{flex: 1}}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.contentWrapper}>
                    {/* Professional Info */}
                    <Text style={styles.sectionHeader}>Professional Information</Text>
                    <View style={styles.section}>
                        <Text style={styles.title}>Unique Learner Identifier</Text>
                        <View style={styles.uliRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your 12-digit ULI"
                                keyboardType="numeric"
                                maxLength={12}
                                value={uliNumber}
                                onChangeText={setUliNumber}
                            />
                            <TouchableOpacity onPress={() => setShowTooltip(true)}>
                                <Ionicons
                                    name="help-circle-outline"
                                    size={20}
                                    color="#008080"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Security */}
                    <Text style={styles.sectionHeader}>Security</Text>
                    <View style={styles.section}>
                        <Text style={styles.title}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <Text style={styles.passwordNote}>
                            Must be at least 8 characters and include uppercase,
                            lowercase, number, and special character.
                        </Text>

                        <Text style={styles.title}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

                    {/* TESDA Certificates */}
                    <Text style={styles.sectionHeader}>TESDA Certificates</Text>
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
                                    {certificateServices.categories.map(
                                        (cat: CertificateService, i: number) => (
                                            <Picker.Item
                                                key={i}
                                                label={cat.title}
                                                value={cat.title}
                                            />
                                        )
                                    )}
                                </Picker>
                            </View>

                            {/* Certificate Number */}
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

                            {/* Expiry Date */}
                            <Text style={styles.title}>Expiry Date</Text>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(index)}
                                style={styles.input}
                            >
                                <Text>
                                    {cert.expiry
                                        ? cert.expiry.toDateString()
                                        : "Select expiry date"}
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

                            {/* Upload Certificate */}
                            <Text style={styles.title}>Upload Certificate File</Text>
                            <TouchableOpacity
                                onPress={async () => {
                                    const result =
                                        await DocumentPicker.getDocumentAsync({
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
                                <Ionicons
                                    name="cloud-upload-outline"
                                    size={40}
                                    color="#008080"
                                />
                            </TouchableOpacity>

                            {cert.file && (
                                <Text style={styles.note}>
                                    Selected File: {cert.file.split("/").pop()}
                                </Text>
                            )}

                            {/* Remove Button */}
                            {certificates.length > 1 && (
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => {
                                        const updated = certificates.filter(
                                            (_, i) => i !== index
                                        );
                                        setCertificates(updated);
                                    }}
                                >
                                    <Ionicons name="trash-outline" size={16} color="red"/>
                                    <Text style={styles.removeText}>Remove</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    {/* Add Certificate */}
                    <TouchableOpacity
                        onPress={addCertificate}
                        style={styles.addButton}
                    >
                        <Text style={styles.addButtonText}>+ Add Certificate</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Fixed Next Button */}
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>
            </View>

            {/* Tooltip */}
            <Modal visible={showTooltip} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setShowTooltip(false)}
                >
                    <View style={styles.tooltipBox}>
                        <Text style={styles.tooltipText}>
                            The Unique Learner Identifier (ULI) is a 12-digit number
                            assigned to every student or trainee enrolled in TESDA
                            programs.
                        </Text>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: "#fff",
        paddingBottom: 140,
    },
    contentWrapper: {flex: 1},
    section: {marginBottom: 40},
    sectionHeader: {
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 30,
        marginBottom: 10,
        color: "#555",
    },
    title: {fontSize: 16, fontWeight: "bold", marginBottom: 8, marginTop: 10},
    uliRow: {flexDirection: "row", alignItems: "center"},
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
    passwordNote: {fontSize: 12, color: "#888", marginTop: 4, marginBottom: 12},
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
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    tooltipBox: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 10,
        maxWidth: 300,
    },
    tooltipText: {fontSize: 14, color: "#333"},
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
