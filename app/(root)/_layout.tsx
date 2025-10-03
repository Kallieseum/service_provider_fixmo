import { BookingProvider, useBookingContext } from "@/context/BookingContext";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { KeyboardAvoidingView, Platform, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync().catch(() => {
    // In case splash screen is not available on the platform
    console.warn('SplashScreen.preventAutoHideAsync() failed');
});

// 📌 Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// 🔔 A child component to hook into notifications
function NotificationHandler() {
    const notificationListener = useRef<any>();
    const {addBooking} = useBookingContext();

    useEffect(() => {
        notificationListener.current =
            Notifications.addNotificationReceivedListener((notification) => {
                const {title, body} = notification.request.content;
                if (title && body) {
                    addBooking({title, body});
                }
            });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
        };
    }, []);

    return null;
}

export default function Layout() {
    const [fontsLoaded] = useFonts({
        PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
        PoppinsSemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
        PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
    });

    useEffect(() => {
        const requestPermissions = async () => {
            const {status} = await Notifications.requestPermissionsAsync();
            if (status !== "granted") {
                alert("Permission for notifications not granted!");
            }
        };
        requestPermissions();
    }, []);

    // 👀 Keep splash screen until fonts are loaded
    useEffect(() => {
        async function hideSplash() {
            if (fontsLoaded) {
                try {
                    await SplashScreen.hideAsync();
                } catch (error) {
                    // Handle the case where splash screen is not available
                    console.warn('SplashScreen.hideAsync() failed:', error);
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
        <BookingProvider>
            <SafeAreaView style={{flex: 1}}>
                <StatusBar style="dark"/>
                <KeyboardAvoidingView
                    style={{flex: 1}}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <NotificationHandler/>
                    <Slot/>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </BookingProvider>
    );
}
