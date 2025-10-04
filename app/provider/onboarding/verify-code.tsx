import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { requestForgotPasswordOTP, verifyProviderOTP } from "../../../src/api/auth.api";

const CELL_COUNT = 6;

export default function VerifyCode() {
    const router = useRouter();
    const {email} = useLocalSearchParams<{ email: string }>(); // ✅ pull email from params
    const [value, setValue] = useState("");
    const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });
    const [timer, setTimer] = useState(40);
    const [isResendVisible, setIsResendVisible] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [otpStatus, setOtpStatus] = useState<'none' | 'verifying' | 'valid' | 'invalid'>('none');
    const [otpMessage, setOtpMessage] = useState('');

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(
                () => setTimer((prev) => prev - 1),
                1000
            );
            return () => clearInterval(interval);
        } else {
            setIsResendVisible(true);
        }
    }, [timer]);

    const formatTime = () => {
        const mins = Math.floor(timer / 60);
        const secs = timer % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    useEffect(() => {
        if (value.length === CELL_COUNT && !verifying) {
            handleVerifyOTP();
        } else if (value.length < CELL_COUNT) {
            setOtpStatus('none');
            setOtpMessage('');
        }
    }, [value]);

    const handleVerifyOTP = async () => {
        if (verifying) return; // Prevent multiple calls
        
        setVerifying(true);
        setOtpStatus('verifying');
        setOtpMessage('Verifying OTP...');

        try {
            // Verify OTP with backend
            const result = await verifyProviderOTP(email, value);
            
            if (result.valid) {
                setOtpStatus('valid');
                setOtpMessage('✓ OTP verified successfully');
                setVerifying(false);
                
                // Wait a moment to show success state
                setTimeout(() => {
                    router.replace({
                        pathname: "/provider/onboarding/create-new-password",
                        params: { email, otp: value },
                    });
                }, 800);
            } else {
                // Invalid OTP - show red state and alert
                setOtpStatus('invalid');
                setOtpMessage('Invalid OTP. Please try again.');
                setVerifying(false);
                
                Alert.alert(
                    "Invalid OTP",
                    "The code you entered is incorrect. Please try again.",
                    [{ text: "OK", onPress: () => setValue("") }]
                );
            }
        } catch (error: any) {
            console.error('OTP verification error:', error);
            setOtpStatus('invalid');
            setOtpMessage(error.message || 'Invalid OTP. Please try again.');
            setVerifying(false);
            
            Alert.alert(
                "Invalid OTP",
                error.message || "The code you entered is incorrect. Please try again.",
                [{ text: "OK", onPress: () => setValue("") }]
            );
        }
    };

    const handleResend = async () => {
        setResending(true);

        try {
            await requestForgotPasswordOTP(email);
            Alert.alert("OTP Sent", `A new verification code has been sent to ${email}`);
            setTimer(40);
            setIsResendVisible(false);
            setValue("");
        } catch (error: any) {
            Alert.alert(
                "Error",
                error.message || "Failed to resend OTP. Please try again."
            );
        } finally {
            setResending(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <Text style={styles.title}>Enter One-Time Pin</Text>
                    <Text style={styles.subtitle}>
                        A One-Time Pin was sent to{" "}
                        <Text style={styles.email}>{email}</Text>
                    </Text>

                    <CodeField
                        ref={ref}
                        {...props}
                        value={value}
                        onChangeText={setValue}
                        cellCount={CELL_COUNT}
                        rootStyle={styles.codeFieldRoot}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        editable={!verifying && otpStatus !== 'valid'}
                        renderCell={({index, symbol, isFocused}) => (
                            <Text
                                key={index}
                                style={[
                                    styles.cell,
                                    isFocused && styles.focusCell,
                                    otpStatus === 'valid' && styles.validCell,
                                    otpStatus === 'invalid' && styles.invalidCell,
                                ]}
                                onLayout={getCellOnLayoutHandler(index)}
                            >
                                {symbol || (isFocused ? <Cursor/> : null)}
                            </Text>
                        )}
                    />

                    {/* Status Message with Icon */}
                    {otpMessage && (
                        <View style={styles.statusContainer}>
                            {otpStatus === 'verifying' && (
                                <ActivityIndicator size="small" color="#008080" style={styles.statusIcon} />
                            )}
                            {otpStatus === 'valid' && (
                                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.statusIcon} />
                            )}
                            {otpStatus === 'invalid' && (
                                <Ionicons name="close-circle" size={20} color="#F44336" style={styles.statusIcon} />
                            )}
                            <Text style={[
                                styles.statusMessage,
                                otpStatus === 'valid' && styles.validMessage,
                                otpStatus === 'invalid' && styles.invalidMessage,
                            ]}>
                                {otpMessage}
                            </Text>
                        </View>
                    )}

                    {isResendVisible ? (
                        <TouchableOpacity onPress={handleResend} disabled={resending}>
                            {resending ? (
                                <ActivityIndicator size="small" color="#008080" />
                            ) : (
                                <Text style={styles.resendButton}>Resend Code</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.resend}>
                            Didn’t receive the code? Request again in{" "}
                            {formatTime()}
                        </Text>
                    )}
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#fff",
    },
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
        textAlign: "center",
        color: "#555",
    },
    email: {
        fontWeight: "bold",
        color: "#000",
    },
    codeFieldRoot: {
        marginBottom: 20,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    cell: {
        width: 50,
        height: 50,
        lineHeight: 48,
        fontSize: 24,
        borderWidth: 1,
        borderColor: "#ccc",
        textAlign: "center",
        marginHorizontal: 4,
        borderRadius: 15,
    },
    focusCell: {
        borderColor: "#008080",
    },
    validCell: {
        borderWidth: 2,
        borderColor: "#4CAF50",
        backgroundColor: "#E8F5E9",
    },
    invalidCell: {
        borderWidth: 2,
        borderColor: "#F44336",
        backgroundColor: "#FFEBEE",
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 10,
    },
    statusIcon: {
        marginRight: 8,
    },
    statusMessage: {
        fontSize: 14,
        textAlign: "center",
    },
    validMessage: {
        color: "#4CAF50",
        fontWeight: "600",
    },
    invalidMessage: {
        color: "#F44336",
        fontWeight: "600",
    },
    resend: {
        marginTop: 20,
        textAlign: "center",
        color: "#888",
    },
    resendButton: {
        marginTop: 20,
        textAlign: "center",
        color: "#008080",
        fontWeight: "bold",
        fontSize: 16,
    },
});
