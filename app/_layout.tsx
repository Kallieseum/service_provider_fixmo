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
try {
    SplashScreen.preventAutoHideAsync();
} catch (error) {
    console.warn('SplashScreen.preventAutoHideAsync() not available:', error);
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        PoppinsRegular: require("./assets/fonts/Poppins-Regular.ttf"),
        PoppinsSemiBold: require("./assets/fonts/Poppins-SemiBold.ttf"),
        PoppinsBold: require("./assets/fonts/Poppins-Bold.ttf"),
    });

    useEffect(() => {
        async function hideSplash() {
            if (fontsLoaded) {
                try {
                    await SplashScreen.hideAsync();
                } catch (error) {
                    console.log('SplashScreen.hideAsync() not available');
                }
            }
        }

        hideSplash();
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

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
