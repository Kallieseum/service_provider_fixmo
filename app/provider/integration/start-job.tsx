// app/start-job.tsx
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
} from "react-native";
import {useRouter} from "expo-router";

type StartJobProps = {
    visible: boolean;
    onClose: () => void;
};

export default function StartJobPopup({visible, onClose}: StartJobProps) {
    const router = useRouter();

    // 📌 Sample booking data (replace with dynamic later)
    const bookingData = {
        id: "XXXXXX",
        customer: "Maria de la Cruz",
        serviceType: "Electrical Repair",
        date: "June 23, 2025",
        time: "2:00 PM",
        distance: "1.5 km",
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Header Row */}
                    <View style={styles.row}>
                        <Text style={styles.bookingId}>
                            Booking ID: {bookingData.id}
                        </Text>
                        <Text style={styles.distance}>
                            {bookingData.distance}
                        </Text>
                    </View>

                    {/* Booking Details */}
                    <Text style={styles.customer}>{bookingData.customer}</Text>
                    <Text style={styles.service}>
                        Service Type: {bookingData.serviceType}
                    </Text>
                    <Text style={styles.datetime}>
                        {bookingData.date} | {bookingData.time}
                    </Text>

                    {/* Actions */}
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={() => {
                            onClose(); // close popup
                            router.push("/provider/onboarding/pre_homepage");
                        }}
                    >
                        <Text style={styles.startText}>Start Now</Text>
                    </TouchableOpacity>

                    <Pressable onPress={onClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    card: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    bookingId: {
        backgroundColor: "#e6f7f4",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        fontSize: 12,
        color: "#16a34a",
        fontWeight: "bold",
    },
    distance: {
        fontSize: 12,
        color: "#555",
    },
    customer: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#222",
    },
    service: {
        fontSize: 14,
        color: "#333",
        marginTop: 2,
    },
    datetime: {
        fontSize: 13,
        color: "#666",
        marginTop: 2,
        marginBottom: 15,
    },
    startButton: {
        backgroundColor: "#008080",
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: "center",
        marginBottom: 10,
    },
    startText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    cancelText: {
        textAlign: "center",
        color: "#888",
        fontSize: 14,
    },
});
