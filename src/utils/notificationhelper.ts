import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { registerPushToken, removePushToken } from "../api/notifications.api";

// Configure foreground behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Request permissions and get push token
export async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
        const {status: existingStatus} = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const {status} = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            console.warn("Push notification permission denied");
            return;
        }

        try {
            // Get project ID from environment or use undefined for development
            const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
            
            if (!projectId) {
                console.warn('⚠️ EXPO_PUBLIC_PROJECT_ID not set. Push notifications may not work in production.');
                console.log('For development, you can test with Expo Go or set the project ID.');
            }

            // Request token with or without projectId
            const tokenData = projectId 
                ? await Notifications.getExpoPushTokenAsync({ projectId })
                : await Notifications.getExpoPushTokenAsync();
            
            token = tokenData.data;
            console.log('📱 Push token obtained:', token);
        } catch (error: any) {
            console.error('Error getting push token:', error);
            console.log('💡 Tip: Make sure EXPO_PUBLIC_PROJECT_ID is set in your .env file');
            console.log('💡 Or test with Expo Go app for development');
        }
    } else {
        console.warn("Must use physical device for Push Notifications");
    }

    return token;
}

/**
 * Register push token with backend after login
 */
export async function registerPushTokenWithBackend(
    userId: number,
    userType: 'customer' | 'provider',
    authToken: string
): Promise<boolean> {
    try {
        // Get push token
        const pushToken = await registerForPushNotificationsAsync();
        
        if (!pushToken) {
            console.warn('No push token available');
            return false;
        }

        // Detect platform
        const devicePlatform = Platform.OS === 'ios' ? 'ios' : 'android';

        // Register with backend
        const result = await registerPushToken(
            pushToken,
            userId,
            userType,
            devicePlatform,
            authToken
        );

        if (result.success) {
            // Store token locally for later cleanup
            await AsyncStorage.setItem('pushToken', pushToken);
            console.log('✅ Push token registered with backend');
            return true;
        } else {
            console.error('Failed to register push token:', result.message);
            return false;
        }
    } catch (error) {
        console.error('Error registering push token with backend:', error);
        return false;
    }
}

/**
 * Remove push token on logout
 */
export async function unregisterPushToken(authToken: string): Promise<void> {
    try {
        const pushToken = await AsyncStorage.getItem('pushToken');
        
        if (pushToken) {
            await removePushToken(pushToken, authToken);
            await AsyncStorage.removeItem('pushToken');
            console.log('✅ Push token removed');
        }
    } catch (error) {
        console.error('Error unregistering push token:', error);
    }
}

// Send local notification
export async function sendLocalNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data: data || {},
        },
        trigger: null, // instant
    });
}

/**
 * Set up notification listeners
 */
export function setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
) {
    // Listener for notifications received while app is foregrounded
    const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
        console.log('📬 Notification received:', notification);
        if (onNotificationReceived) {
            onNotificationReceived(notification);
        }
    });

    // Listener for when a notification is tapped
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('👆 Notification tapped:', response);
        if (onNotificationTapped) {
            onNotificationTapped(response);
        }
    });

    // Return cleanup function
    return () => {
        receivedListener.remove();
        responseListener.remove();
    };
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
}

/**
 * Get notification badge count
 */
export async function getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
}

/**
 * Set notification badge count
 */
export async function setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear badge count
 */
export async function clearBadgeCount() {
    await Notifications.setBadgeCountAsync(0);
}

