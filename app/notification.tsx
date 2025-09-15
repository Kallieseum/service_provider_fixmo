import {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import {useRouter} from 'expo-router';
import {useUserContext} from '@/context/UserContext';

export default function NotificationScreen() {
    const {user, notifications, markAllAsRead} = useUserContext();
    const insets = useSafeAreaInsets();
    const lastNotifId = useRef<number | null>(null);
    const router = useRouter();

    // Mark all as read when opening screen
    useEffect(() => {
        markAllAsRead();
    }, []);

    // Handle tap on system notification popup
    useEffect(() => {
        const sub = Notifications.addNotificationResponseReceivedListener((response) => {
            const screen = response.notification.request.content.data?.screen;
            if (screen === 'notification') {
                router.push('/notification');
            }
        });
        return () => sub.remove();
    }, [router]);

    // Group by date
    const grouped = notifications.reduce<Record<string, typeof notifications>>((acc, notif) => {
        const date = new Date().toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(notif);
        return acc;
    }, {});

    return (
        <ScrollView
            style={[styles.container, {paddingTop: insets.top + 10}]}
            contentContainerStyle={{paddingBottom: 30}}
        >
            <Text style={styles.title}>Notifications</Text>

            {Object.keys(grouped).map((date) => (
                <View key={date} style={styles.section}>
                    <Text style={styles.sectionDate}>
                        {date === new Date().toDateString() ? 'Today' : date}
                    </Text>

                    {grouped[date].map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.card,
                                item.type === 'booking' && styles.bookingCard,
                                item.type === 'approval' && styles.approvalCard,
                                item.type === 'system' && styles.systemCard,
                            ]}
                        >
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardMessage}>{item.body}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff', paddingHorizontal: 20},
    title: {fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center'},
    section: {marginBottom: 20},
    sectionDate: {fontSize: 14, fontWeight: '600', marginBottom: 10, color: '#555'},
    card: {backgroundColor: '#f2f2f2', borderRadius: 12, padding: 15, marginBottom: 10},
    bookingCard: {backgroundColor: '#B2EBF2'},
    approvalCard: {backgroundColor: '#C8E6C9'},
    systemCard: {backgroundColor: '#FFECB3'},
    cardTitle: {fontWeight: 'bold', marginBottom: 5, fontSize: 14},
    cardMessage: {fontSize: 13, color: '#333'},
});
