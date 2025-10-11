import { BookingProvider } from "@/context/BookingContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { KeyboardAvoidingView, Platform, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Prevent the splash screen from auto-hiding before asset loading is complete
// Only call if the native module is available
try {
    SplashScreen.preventAutoHideAsync();
} catch (error) {
    // Native module not available, splash screen will auto-hide
    console.warn('SplashScreen.preventAutoHideAsync() not available:', error);
}

export default function Layout() {
    const [fontsLoaded] = useFonts({
        PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
        PoppinsSemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
        PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
    });

    // 👀 Keep splash screen until fonts are loaded
    useEffect(() => {
        async function hideSplash() {
            if (fontsLoaded) {
                try {
                    await SplashScreen.hideAsync();
                } catch (error) {
                    // Native module not available or already hidden
                    console.log('SplashScreen.hideAsync() not available');
                }
            }
        }

        hideSplash();
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null; // Show nothing until fonts load
    }

    // ✅ Apply Poppins globally
    const oldRender = Text.render;
    Text.render = function (...args) {
        const origin = oldRender.call(this, ...args);
        return {
            ...origin,
            props: {
                ...origin.props,
                style: [{fontFamily: "PoppinsRegular"}, origin.props.style],
            },
        };
    };

    return (
        <NotificationProvider>
            <BookingProvider>
                <SafeAreaView style={{flex: 1}}>
                    <StatusBar style="dark"/>
                    <KeyboardAvoidingView
                        style={{flex: 1}}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                    >
                        <Slot/>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </BookingProvider>
        </NotificationProvider>
    );
}
