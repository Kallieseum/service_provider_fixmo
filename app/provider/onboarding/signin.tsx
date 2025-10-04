import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { loginProvider } from "../../../src/api/auth.api";

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        // Validation
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        if (!password.trim()) {
            Alert.alert('Error', 'Please enter your password');
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            // Call login API
            const response = await loginProvider(email.trim(), password);

            if (response.success && response.token) {
                // Store token in AsyncStorage
                await AsyncStorage.setItem('providerToken', response.token);
                await AsyncStorage.setItem('providerId', response.providerId.toString());
                await AsyncStorage.setItem('providerUserName', response.providerUserName);

                // Navigate to home screen with provider data
                router.replace({
                    pathname: "/provider/onboarding/pre_homepage",
                    params: {
                        providerId: response.providerId.toString(),
                        providerUserName: response.providerUserName,
                        firstName: response.provider.firstName,
                        lastName: response.provider.lastName,
                    },
                });
            } else {
                Alert.alert('Login Failed', response.message || 'Invalid credentials');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            Alert.alert(
                'Login Failed',
                error.message || 'Unable to login. Please check your credentials and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.screen}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={60}
            >
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Image
                        source={require("../../../app/assets/images/fixmo-logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email address"
                        placeholderTextColor="#888"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.input, styles.passwordInput]}
                            placeholder="Password"
                            placeholderTextColor="#888"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#555"/>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]} 
                        onPress={handleSignIn}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Sign in</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push("/provider/onboarding/forgot-password")}>
                        <Text style={styles.link}>Forgot the password?</Text>
                    </TouchableOpacity>

                    <View style={{height: 80}}/>

                    <TouchableOpacity onPress={() => router.push("/provider/onboarding/email")}>
                        <Text style={styles.link}>
                            Don't have an account? <Text style={styles.linkText}>Sign up</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        paddingHorizontal: 30,
        justifyContent: "center",
        flexGrow: 1,
    },
    logo: {
        width: 120,
        height: 120,
        alignSelf: "center",
        marginBottom: 40,
    },
    input: {
        backgroundColor: "#f2f2f2",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 15,
        color: "#000",
    },
    passwordInput: {
        paddingRight: 45,
    },
    passwordContainer: {
        position: "relative",
    },
    eyeIcon: {
        position: "absolute",
        right: 15,
        top: 12,
    },
    button: {
        backgroundColor: "#399d9d",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: "#7cc",
        opacity: 0.6,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    link: {
        marginTop: 15,
        textAlign: "center",
        color: "#555",
        fontSize: 14,
    },
    linkText: {
        fontWeight: "bold",
        color: "#399d9d",
    },
});
