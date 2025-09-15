import {Slot} from 'expo-router';
import {SafeAreaView} from 'react-native-safe-area-context';
import {KeyboardAvoidingView, Platform} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {useEffect, useRef} from 'react';
import * as Notifications from 'expo-notifications';
import {UserProvider, useUserContext} from '@/context/UserContext';


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// 🔔 A child component to hook into notifications
function NotificationHandler() {
    const notificationListener = useRef<any>();
    const {addNotification} = useUserContext();

    useEffect(() => {
        notificationListener.current =
            Notifications.addNotificationReceivedListener((notification) => {
                const {title, body} = notification.request.content;
                if (title && body) {
                    addNotification({title, body});
                }
            });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(
                    notificationListener.current
                );
            }
        };
    }, []);

    return null;
}

export default function Layout() {
    useEffect(() => {
        const requestPermissions = async () => {
            const {status} = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission for notifications not granted!');
            }
        };
        requestPermissions();
    }, []);

    return (
        <UserProvider>
            <SafeAreaView style={{flex: 1}}>
                <StatusBar style="dark"/>
                <KeyboardAvoidingView
                    style={{flex: 1}}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    {/* 🔔 Global listener */}
                    <NotificationHandler/>
                    <Slot/>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </UserProvider>
    );
}
