import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { requestForgotPasswordOTP } from "../../../src/api/auth.api";

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSendCode = async () => {
        if (!email.trim()) {
            Alert.alert("Missing Email", "Please enter your email address.");
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }

        setLoading(true);

        try {
            const response = await requestForgotPasswordOTP(email);
            
            Alert.alert(
                "OTP Sent",
                `A verification code has been sent to ${email}. Please check your inbox.`,
                [
                    {
                        text: "OK",
                        onPress: () => {
                            router.push({
                                pathname: "/provider/onboarding/verify-code",
                                params: { email }
                            });
                        }
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert(
                "Error",
                error.message || "Failed to send verification code. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
                Enter your email to reset your password
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleSendCode}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Continue</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 30,
        textAlign: "center",
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#008080",
        paddingVertical: 15,
        borderRadius: 10,
        width: "100%",
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
        opacity: 0.6,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
