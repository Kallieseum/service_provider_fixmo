import React, {useState} from "react";
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import ApprovedScreenWrapper from "../../../src/navigation/ApprovedScreenWrapper";

export default function ChatList() {
    const router = useRouter();
    const isApproved = true; // centralized approved check

    // ✅ Sample chat list with history
    const [chats] = useState([
        {
            id: "1",
            name: "Maria de la Cruz",
            serviceType: "Electrical Repair",
            lastMessage: "I’m on my way.",
            time: "Now",
            messages: [
                {id: "m1", text: "Hello, are you coming?", sender: "me", date: "Today"},
                {id: "m2", text: "I’m on my way.", sender: "them", date: "Today"},
            ],
        },
        {
            id: "2",
            name: "Juan Santos",
            serviceType: "Plumbing",
            lastMessage: "Please come tomorrow.",
            time: "5m ago",
            messages: [
                {id: "m1", text: "Can you reschedule?", sender: "them", date: "Today"},
                {id: "m2", text: "Please come tomorrow.", sender: "them", date: "Today"},
            ],
        },
        {
            id: "3",
            name: "Ana Reyes",
            serviceType: "Aircon Cleaning",
            lastMessage: "Thanks a lot!",
            time: "1h ago",
            messages: [
                {id: "m1", text: "All done?", sender: "me", date: "Today"},
                {id: "m2", text: "Yes, thank you! Thanks a lot!", sender: "them", date: "Today"},
            ],
        },
    ]);

    return (
        <ApprovedScreenWrapper activeTab="chat">
            {isApproved ? (
                <View style={styles.container}>
                    <Text style={styles.header}>Messages</Text>

                    <FlatList
                        data={chats}
                        keyExtractor={(item) => item.id}
                        renderItem={({item}) => (
                            <TouchableOpacity
                                style={styles.chatCard}
                                onPress={() =>
                                    router.push({
                                        pathname: "/provider/integration/messagescreen",
                                        params: {
                                            id: item.id,
                                            name: item.name,
                                            serviceType: item.serviceType,
                                            messages: JSON.stringify(item.messages),
                                        },
                                    })
                                }
                            >
                                <View style={{flexDirection: "row", alignItems: "center"}}>
                                    <Ionicons
                                        name="person-circle-outline"
                                        size={48}
                                        color="#008080"
                                        style={{marginRight: 10}}
                                    />
                                    <View>
                                        <Text style={styles.name}>{item.name}</Text>
                                        <Text style={styles.lastMessage} numberOfLines={1}>
                                            {item.lastMessage}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.time}>{item.time}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            ) : (
                <View style={styles.pendingBox}>
                    <Text style={styles.pendingText}>
                        Your account is currently under review. Once <Text style={styles.highlight}>approved</Text>,
                        you'll be able to access messages.
                    </Text>
                </View>
            )}
        </ApprovedScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 16},
    header: {
        fontSize: 18,
        fontFamily: "PoppinsBold",
        marginBottom: 20,
        textAlign: "center",
        color: "#1C1C1C",
        marginTop: 30,
    },
    chatCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
    },
    name: {fontSize: 16, fontFamily: "PoppinsRegular", color: "#111827"},
    lastMessage: {fontSize: 14, fontFamily: "PoppinsRegular", color: "#6b7280", marginTop: 2, maxWidth: 200},
    time: {fontSize: 12, fontFamily: "PoppinsRegular", color: "#6b7280"},
    pendingBox: {flex: 1, justifyContent: "center", alignItems: "center", padding: 20},
    pendingText: {fontFamily: "PoppinsRegular", textAlign: "center", fontSize: 14, color: "#555"},
    highlight: {color: "#009688", fontFamily: "PoppinsBold"},
});
