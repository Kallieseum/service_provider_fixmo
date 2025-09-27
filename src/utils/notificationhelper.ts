import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// Configure foreground behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
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
            alert("Failed to get push token for push notification!");
            return;
        }

        token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
        alert("Must use physical device for Push Notifications");
    }

    return token;
}

// Send local notification
export async function sendLocalNotification(title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
        content: {title, body},
        trigger: null, // instant
    });
}
