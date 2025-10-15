import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text } from "react-native";

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

    // Keep splash screen until fonts are loaded
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

    return <Slot />;
}
