import React from "react";
import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";

export default function ArrivedScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Checkmark Icon */}
            <Ionicons name="checkmark-circle" size={100} color="#16a34a"/>

            {/* Title */}
            <Text style={styles.title}>You’ve Arrived!</Text>

            {/* Message */}
            <Text style={styles.message}>
                Please meet your client and begin the service. Good luck!
            </Text>

            {/* Buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.button, {backgroundColor: "#3b82f6"}]}
                    onPress={() => router.push("./provider/integration/fixmotoday")}
                >
                    <Text style={styles.buttonText}>Back to Today</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, {backgroundColor: "#16a34a"}]}
                    onPress={() => router.push("/provider/integration/start-job")}
                >
                    <Text style={styles.buttonText}>Start Job</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginTop: 16,
        marginBottom: 8,
        textAlign: "center",
    },
    message: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
});
