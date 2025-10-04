import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useRouter, useLocalSearchParams} from "expo-router";
import {useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold} from "@expo-google-fonts/poppins";

// Group by date utility
const groupByDate = (notifications: any[]) => {
    return notifications.reduce((acc: Record<string, any[]>, notif) => {
        const notifDate = new Date(notif.date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        let key = notifDate.toDateString();
        if (notifDate.toDateString() === today.toDateString()) {
            key = "Today";
        } else if (notifDate.toDateString() === yesterday.toDateString()) {
            key = "Yesterday";
        }

        if (!acc[key]) acc[key] = [];
        acc[key].push(notif);
        return acc;
    }, {});
};

export default function NotificationScreen() {
    const {notifications} = useLocalSearchParams();
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);

    const [fontsLoaded] = useFonts({
        PoppinsRegular: Poppins_400Regular,
        PoppinsSemiBold: Poppins_600SemiBold,
        PoppinsBold: Poppins_700Bold,
    });

    useEffect(() => {
        if (notifications) {
            const parsed = JSON.parse(notifications as string);
            setData(parsed.map((n: any) => ({...n, read: true}))); // ✅ mark all as read
        }
    }, [notifications]);

    if (!fontsLoaded) {
        return null; // or splash screen
    }

    const grouped = groupByDate(data);

    const handlePress = (item: any) => {
        // Route based on type
        if (item.type === "booking") {
            router.push("/booking-details");
        } else if (item.type === "approval") {
            router.push("/application-status");
        } else if (item.type === "cancellation") {
            router.push("/cancellations");
        } else {
            router.push("/home");
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 30}}>
            {/* 🔝 Header */}
            <Text style={styles.header}>Notifications</Text>

            {Object.keys(grouped).map((date) => (
                <View key={date} style={styles.section}>
                    <Text style={styles.sectionDate}>{date}</Text>

                    {grouped[date].map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.card,
                                item.type === "booking" && styles.bookingCard,
                                item.type === "approval" && styles.approvalCard,
                                item.type === "cancellation" && styles.cancellationCard,
                                item.type === "system" && styles.systemCard,
                            ]}
                            onPress={() => handlePress(item)}
                        >
                            <Ionicons
                                name={item.icon}
                                size={22}
                                color="#004D40"
                                style={styles.icon}
                            />
                            <View style={{flex: 1}}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardMessage}>{item.message}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: "#fff", paddingHorizontal: 16, padding: 20},
    header: {
        fontSize: 18,
        fontFamily: "PoppinsSemiBold",
        textAlign: "center",
        marginVertical: 15,
        marginTop: "30",
        marginBottom: "10",
    },
    section: {marginBottom: 20},
    sectionDate: {
        fontSize: 14,
        fontFamily: "PoppinsSemiBold",
        marginBottom: 10,
        color: "#555",
    },
    card: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
    },
    bookingCard: {backgroundColor: "#B2DFDB"},
    approvalCard: {backgroundColor: "#E0F2F1"},
    cancellationCard: {backgroundColor: "#FFCDD2"},
    systemCard: {backgroundColor: "#FFF9C4"},
    icon: {marginRight: 12, marginTop: 2},
    cardTitle: {
        fontSize: 14,
        fontFamily: "PoppinsSemiBold",
        marginBottom: 5,
    },
    cardMessage: {
        fontSize: 13,
        fontFamily: "PoppinsRegular",
        color: "#333",
    },
});
