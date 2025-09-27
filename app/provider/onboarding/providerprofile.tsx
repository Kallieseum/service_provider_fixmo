import React, {useRef, useState} from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    Pressable,
    Animated,
    Easing,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {useUserContext} from "@/context/UserContext";
import ApprovedScreenWrapper from "@/navigation/ApprovedScreenWrapper";

type MenuItem = {
    label: string;
    icon: string;
    route?: string;
};

const alwaysAvailable: MenuItem[] = [
    {label: "Edit Profile", icon: "create", route: "/provider/onboarding/editprofile"},
    {label: "Certificates", icon: "document-text", route: "/provider/onboarding/mycertificate"},
    {label: "Services", icon: "list", route: "/provider/onboarding/services"},
    {label: "Privacy Policy", icon: "shield", route: "/provider/integration/privacypolicy"},
    {label: "Log Out", icon: "log-out"}, // triggers logout modal

];

const restrictedItems: MenuItem[] = [
    {label: "Ratings", icon: "star-outline", route: "/provider/integration/ratingscreen"},
];

export default function ProviderProfile() {
    const scrollRef = useRef<ScrollView>(null);
    const router = useRouter();
    const {user, logout} = useUserContext();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const isApproved = user?.status === "approved";

    // Animated bottom sheet
    const slideAnim = useState(new Animated.Value(300))[0];

    const openLogout = () => {
        setShowLogoutModal(true);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };

    const closeLogout = () => {
        Animated.timing(slideAnim, {
            toValue: 300,
            duration: 200,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
        }).start(() => setShowLogoutModal(false));
    };

    const handleLogout = () => {
        logout();
        closeLogout();
        router.replace("/");
    };

    const renderMenuItem = (item: MenuItem, restricted = false) => {
        const isBlocked = restricted && !isApproved;

        return (
            <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                onPress={() => {
                    if (item.label === "Log Out") return openLogout();
                    if (isBlocked) return alert("Your account is pending approval.");
                    if (item.route) return router.push(item.route);
                    alert("This feature is not yet available.");
                }}
                disabled={isBlocked}
            >
                <View style={styles.menuLeft}>
                    <Ionicons
                        name={item.icon as any}
                        size={25}
                        color={isBlocked ? "#999" : "#008080"}
                    />
                    <Text
                        style={[
                            styles.menuLabel,
                            item.label === "Log Out" && {
                                color: "#008080",
                                fontFamily: "PoppinsSemiBold",
                            },
                            isBlocked && {color: "#999"},
                        ]}
                    >
                        {item.label}
                    </Text>
                </View>
                {!isBlocked && item.label !== "Log Out" && (
                    <Ionicons name="chevron-forward-outline" size={20} color="#008080"/>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ApprovedScreenWrapper activeTab="profile" isApproved={isApproved}>
            {/* Profile Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Profile</Text>
            </View>

            <ScrollView ref={scrollRef} contentContainerStyle={{paddingBottom: 120}}>
                {/* Header */}
                <View style={styles.header}>
                    {user?.profileImage ? (
                        <Image source={{uri: user.profileImage}} style={styles.profileImage}/>
                    ) : (
                        <Ionicons name="person-circle" size={80} color="#008080"/>
                    )}
                    <Text style={styles.name}>{user?.name || "Juan Dela Cruz"}</Text>
                    <Text style={styles.phone}>{user?.phone || "+63 000 000 0000"}</Text>
                    <Text style={styles.phone}>{user?.email || "No Email Provided"}</Text>
                </View>

                {/* Menu Items */}
                <View style={styles.menuList}>
                    {restrictedItems.map((item) => renderMenuItem(item, true /* restricted */))}
                    {alwaysAvailable.map((item) => renderMenuItem(item))}
                </View>
            </ScrollView>

            {/* Logout Modal */}
            <Modal transparent visible={showLogoutModal} animationType="none" onRequestClose={closeLogout}>
                <View style={styles.modalOverlay}>
                    <Animated.View style={[styles.modalContainer, {transform: [{translateY: slideAnim}]}]}>
                        <Text style={styles.modalTitle}>Logout</Text>
                        <Text style={styles.modalMessage}>Are you sure you want to Log Out?</Text>
                        <View style={styles.modalButtons}>
                            <Pressable style={[styles.button, styles.cancelButton]} onPress={closeLogout}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </Pressable>
                            <Pressable style={[styles.button, styles.confirmButton]} onPress={handleLogout}>
                                <Text style={styles.confirmText}>Yes</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </ApprovedScreenWrapper>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        paddingTop: 50,
        paddingBottom: 10,
        alignItems: "center",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 18,
        color: "#333",
        fontFamily: "PoppinsSemiBold",
    },
    header: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 30,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    name: {
        fontSize: 16,
        color: "#333",
        fontFamily: "PoppinsSemiBold",
    },
    phone: {
        fontSize: 14,
        color: "#666",
        fontFamily: "PoppinsRegular",
    },
    menuList: {
        paddingHorizontal: 20,
    },
    menuItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
    },
    menuLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuLabel: {
        marginLeft: 12,
        fontSize: 16,
        color: "#333",
        fontFamily: "PoppinsRegular",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        color: "#008080",
        textAlign: "center",
        marginBottom: 10,
        fontFamily: "PoppinsSemiBold",
    },
    modalMessage: {
        fontSize: 15,
        color: "#333",
        textAlign: "center",
        marginBottom: 20,
        fontFamily: "PoppinsRegular",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#E0F2F1",
    },
    confirmButton: {
        backgroundColor: "#008080",
    },
    cancelText: {
        color: "#008080",
        fontFamily: "PoppinsSemiBold",
    },
    confirmText: {
        color: "#fff",
        fontFamily: "PoppinsSemiBold",
    },
});
