import React, {useRef, useCallback, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TouchableOpacity,
    Modal,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useRouter, useLocalSearchParams} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import {useFonts} from "expo-font";

import ApprovedScreenWrapper from "../../../src/navigation/ApprovedScreenWrapper";
import OngoingServiceDetails from "../../provider/integration/ongoing-service-details";

SplashScreen.preventAutoHideAsync();

type ScheduledWork = {
    status: "scheduled" | "ongoing" | "finished";
    client: string;
    service: string;
    datetime: string;
};

export default function Homepage() {
    const scrollRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);

    // Load fonts
    const [fontsLoaded] = useFonts({
        PoppinsRegular: require("../../assets/fonts/Poppins-Regular.ttf"),
        PoppinsBold: require("../../assets/fonts/Poppins-Bold.ttf"),
        PoppinsSemiBold: require("../../assets/fonts/Poppins-SemiBold.ttf"),
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) await SplashScreen.hideAsync();
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    // User & approval state
    const {client, service, datetime, status} = useLocalSearchParams();
    const isApproved = true;

    const formattedName = "Juan Dela Cruz";

    // Greeting
    const greetingText = (() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning,";
        if (hour < 18) return "Good Afternoon,";
        return "Good Evening,";
    })();

    // Appointment
    const sampleAppointment: ScheduledWork = {
        status: "ongoing",
        client: "Maria de la Cruz",
        service: "Electrical Repair",
        datetime: "June 23, 2025 | 2:00 PM",
    };

    const appointment: ScheduledWork | null = client
        ? {
            status: (status as "ongoing" | "scheduled" | "finished") || "ongoing",
            client: client as string,
            service: service as string,
            datetime: datetime as string,
        }
        : sampleAppointment;

    const statusColors: Record<string, string> = {
        scheduled: "#4CAF50",
        ongoing: "#F44336",
        finished: "#9E9E9E",
    };

    // Notifications
    const sampleNotifications = [
        {
            id: "1",
            title: "New Scheduled Booking!",
            message: "Click here to view details and prepare for the appointment.",
            date: "2025-09-27",
            type: "booking",
            icon: "calendar-outline",
            read: false,
        },
        {
            id: "2",
            title: "Congratulations!",
            message: "Your application has been approved. Click here to see details.",
            date: "2025-09-26",
            type: "approval",
            icon: "checkmark-circle-outline",
            read: true,
        },
        {
            id: "3",
            title: "Service Cancelled",
            message: "You cancelled the service due to personal reasons.",
            date: "2025-09-25",
            type: "cancellation",
            icon: "close-circle-outline",
            read: false,
        },
    ];
    const notificationCount = sampleNotifications.filter((n) => !n.read).length;

    return (
        <ApprovedScreenWrapper activeTab="home" isApproved={isApproved}>
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={[styles.scrollContent, {paddingTop: insets.top + 20}]}
                onLayout={onLayoutRootView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.greetingRow}>
                        <Ionicons name="person-circle-outline" size={45} color="#008080" style={styles.avatar}/>
                        <View style={styles.greetingBlock}>
                            <Text style={styles.greeting}>{greetingText}</Text>
                            <Text style={styles.name}>{formattedName}</Text>
                        </View>
                    </View>

                    <Pressable
                        onPress={() =>
                            router.push({
                                pathname: "/notification",
                                params: {notifications: JSON.stringify(sampleNotifications)},
                            })
                        }
                    >
                        <View style={styles.bellWrapper}>
                            <Ionicons name="notifications-outline" size={26} color="#333"/>
                            {notificationCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{notificationCount}</Text>
                                </View>
                            )}
                        </View>
                    </Pressable>
                </View>

                {/* FixMo Today */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>FixMo Today</Text>
                    {isApproved && appointment ? (
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <View style={styles.appointmentBox}>
                                <View
                                    style={[styles.statusTag, {backgroundColor: statusColors[appointment.status] || "#777"}]}>
                                    <Text style={styles.statusText}>
                                        {appointment.status === "ongoing" ? "On going" : appointment.status}
                                    </Text>
                                </View>
                                <Text style={styles.clientName}>{appointment.client}</Text>
                                <Text style={styles.serviceType}>
                                    Service Type: <Text style={styles.highlightService}>{appointment.service}</Text>
                                </Text>

                                <View style={styles.row}>
                                    <View style={styles.row}>
                                        <Ionicons name="calendar-outline" size={16} color="#00796B"/>
                                        <Text style={styles.datetime}>{appointment.datetime}</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.chatButton}
                                        onPress={() =>
                                            router.push({
                                                pathname: "/provider/integration/messagescreen",
                                                params: {
                                                    clientId: "1",
                                                    clientName: appointment.client,
                                                },
                                            })
                                        }
                                    >
                                        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#00796B"/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.pendingBox}>
                            <Ionicons name="hammer-outline" size={40} color="#009688"/>
                            <Text style={styles.pendingText}>
                                Your account is currently under review. Once <Text
                                style={styles.highlight}>approved</Text>, you'll start
                                receiving bookings here.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Availability */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Availability</Text>
                    <View style={styles.pendingBox}>
                        <Text style={styles.pendingText}>
                            {isApproved
                                ? "You can now manage your availability in Calendar."
                                : "Availability will be enabled once your account is approved."}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Modal for Ongoing Service */}
            <Modal animationType="slide" transparent visible={modalVisible}
                   onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalBackground}>
                    <View style={styles.modalCard}>
                        <Pressable style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={22} color="#333"/>
                        </Pressable>
                        <OngoingServiceDetails/>
                    </View>
                </View>
            </Modal>
        </ApprovedScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContent: {paddingBottom: 100},
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        alignItems: "center",
        marginVertical: 20,
    },
    greetingRow: {flexDirection: "row", alignItems: "center"},
    avatar: {marginRight: 10},
    greetingBlock: {flexDirection: "column"},
    greeting: {fontSize: 14, color: "#333", fontFamily: "PoppinsRegular"},
    name: {fontSize: 17, color: "#008080", fontFamily: "PoppinsBold"},
    bellWrapper: {position: "relative"},
    section: {marginHorizontal: 20, marginBottom: 20},
    sectionTitle: {fontSize: 18, marginBottom: 10, fontFamily: "PoppinsRegular"},
    pendingBox: {backgroundColor: "#f2f2f2", borderRadius: 30, padding: 15, alignItems: "center"},
    pendingText: {fontSize: 14, color: "#555", textAlign: "center", fontFamily: "PoppinsRegular"},
    highlight: {color: "#009688", fontFamily: "PoppinsBold"},
    highlightService: {color: "#00796B", fontFamily: "PoppinsSemiBold"},
    appointmentBox: {backgroundColor: "#f2f2f2", borderRadius: 20, padding: 15},
    statusTag: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8, alignSelf: "flex-start"},
    statusText: {color: "#fff", fontSize: 12, fontFamily: "PoppinsSemiBold"},
    clientName: {fontSize: 16, color: "#333", fontFamily: "PoppinsSemiBold"},
    serviceType: {fontSize: 14, color: "#555", marginTop: 4, fontFamily: "PoppinsRegular"},
    datetime: {fontSize: 13, color: "#00796B", marginLeft: 6, fontFamily: "PoppinsRegular"},
    row: {flexDirection: "row", alignItems: "center", marginTop: 10},
    chatButton: {
        backgroundColor: "#fff",
        padding: 8,
        borderRadius: 20,
        marginLeft: "auto",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 4,
        elevation: 3,
    },
    badge: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: "#FF5252",
        borderRadius: 8,
        paddingHorizontal: 4,
        paddingVertical: 1
    },
    badgeText: {color: "#fff", fontSize: 10, fontFamily: "PoppinsBold"},
    modalBackground: {flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center"},
    modalCard: {backgroundColor: "#EDEDED", borderRadius: 16, padding: 16, width: "90%", maxHeight: "85%"},
    closeBtn: {alignSelf: "flex-end", marginBottom: 10},
});
