import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { setupNotificationListeners, clearBadgeCount } from '../utils/notificationhelper';
import { getUnreadCount, markNotificationAsRead } from '../api/notifications.api';

type NotificationContextType = {
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
    handleNotificationTap: (response: Notifications.NotificationResponse) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        // Initial load
        refreshUnreadCount();

        // Setup notification listeners
        cleanupRef.current = setupNotificationListeners(
            (notification) => {
                // Notification received while app is open
                console.log('Received notification:', notification);
                refreshUnreadCount();
            },
            (response) => {
                // Notification tapped
                handleNotificationTap(response);
            }
        );

        // Cleanup on unmount
        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, []);

    const refreshUnreadCount = async () => {
        try {
            const token = await AsyncStorage.getItem('providerToken');
            if (token) {
                const count = await getUnreadCount(token);
                setUnreadCount(count);
            }
        } catch (error) {
            console.error('Error refreshing unread count:', error);
        }
    };

    const handleNotificationTap = async (response: Notifications.NotificationResponse) => {
        const data: any = response.notification.request.content.data;
        const token = await AsyncStorage.getItem('providerToken');

        console.log('Notification tapped with data:', data);

        // Mark as read
        if (data.notificationId && token) {
            await markNotificationAsRead(Number(data.notificationId), token);
            refreshUnreadCount();
        }

        // Navigate based on notification type
        if (data.type === 'booking' || data.type === 'appointment') {
            router.push('/provider/integration/fixmoto');
        } else if (data.type === 'message') {
            if (data.conversationId) {
                router.push({
                    pathname: '/messaging/chat',
                    params: {
                        conversationId: data.conversationId,
                        customerId: data.customerId || '',
                        customerName: data.customerName || 'Customer',
                        customerPhone: data.customerPhone || '',
                        customerPhoto: data.customerPhoto || '',
                        appointmentStatus: data.appointmentStatus || 'active',
                    },
                });
            } else {
                router.push('/messaging');
            }
        } else if (data.type === 'verification' || data.type === 'certificate') {
            router.push('/provider/onboarding/providerprofile');
        } else if (data.type === 'completion' || data.type === 'rating') {
            router.push('/provider/integration/fixmoto');
        } else if (data.type === 'backjob') {
            router.push('/provider/integration/fixmoto');
        } else {
            // Default: go to home
            router.push('/provider/onboarding/pre_homepage');
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                unreadCount,
                refreshUnreadCount,
                handleNotificationTap,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
}

