import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ---------- Types ----------
type Certificate = {
    id: number;
    title: string;
    number: string;
    expiry: string;
    status: "Approved" | "Pending" | "Rejected";
};

// ---------- Sample Approved Certificates ----------
const approvedCertificates: Certificate[] = [
    {
        id: 1,
        title: "RAC Servicing NC II",
        number: "00000000",
        expiry: "mm/dd/yyyy",
        status: "Approved",
    },
    {
        id: 2,
        title: "Plumbing NC II",
        number: "11111111",
        expiry: "12/12/2026",
        status: "Approved",
    },
];

export default function ApprovedServicesScreen() {
    const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const openModal = (cert: Certificate) => {
        setSelectedCert(cert);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedCert(null);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Approved Certificates</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {approvedCertificates.map((cert) => (
                    <TouchableOpacity
                        key={cert.id}
                        style={styles.certificateCard}
                        onPress={() => openModal(cert)}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Ionicons
                                name="ribbon-outline"
                                size={24}
                                color="#008080"
                                style={{ marginRight: 8 }}
                            />
                            <View>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>Accepted</Text>
                                </View>
                                <Text style={styles.certTitle}>{cert.title}</Text>
                                <Text style={styles.certDetails}>
                                    Certificate Number: {cert.number}
                                </Text>
                                <Text style={styles.certDetails}>
                                    Expiry Date: {cert.expiry}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {approvedCertificates.length === 0 && (
                    <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
                        You can now add services
                    </Text>
                )}
            </ScrollView>

            {/* Modal Popup */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedCert && (
                            <>
                                <Text style={styles.modalTitle}>
                                    {selectedCert.title}
                                </Text>
                                <Text>Certificate Number: {selectedCert.number}</Text>
                                <Text>Expiry Date: {selectedCert.expiry}</Text>
                                <Text>Status: {selectedCert.status}</Text>

                                {/* Close Button */}
                                <Pressable style={styles.closeButton} onPress={closeModal}>
                                    <Text style={styles.closeText}>Back to Services</Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    certificateCard: {
        backgroundColor: "#e0f7f7",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    certTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 4,
    },
    certDetails: {
        fontSize: 14,
        color: "#555",
        marginTop: 2,
    },
    statusBadge: {
        backgroundColor: "#4CAF50",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        alignSelf: "flex-start",
        marginBottom: 4,
    },
    statusText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: "#008080",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
    },
    closeText: {
        color: "#fff",
        fontWeight: "bold",
    },
});
