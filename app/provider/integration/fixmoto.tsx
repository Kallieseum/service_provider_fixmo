import React, {useState} from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    LayoutAnimation,
    Platform,
    UIManager,
} from "react-native";
import MapView, {Marker} from "react-native-maps";
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import ApprovedScreenWrapper from "../../../src/navigation/ApprovedScreenWrapper";

if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const jobs = [
    {
        id: "1",
        client: "Maria de la Cruz",
        service: "Electrical Repair",
        datetime: "June 23, 2025 | 2:00PM",
        location: "999 Pureza, Sta. Mesa",
        coords: {latitude: 14.5995, longitude: 120.9842},
        status: "scheduled",
    },
    {
        id: "2",
        client: "Juan Santos",
        service: "Plumbing",
        datetime: "June 25, 2025 | 11:00AM",
        location: "123 Legarda St., Manila",
        coords: {latitude: 14.6035, longitude: 120.9875},
        status: "scheduled",
    },
    {
        id: "3",
        client: "Ana Lopez",
        service: "Aircon Cleaning",
        datetime: "June 20, 2025 | 9:00AM",
        location: "56 España Blvd., Manila",
        coords: {latitude: 14.609, longitude: 120.991},
        status: "finished",
    },
    {
        id: "4",
        client: "Pedro Cruz",
        service: "Carpentry",
        datetime: "June 18, 2025 | 1:30PM",
        location: "45 Aurora Blvd., Quezon City",
        coords: {latitude: 14.62, longitude: 121.003},
        status: "finished",
    },
    {
        id: "5",
        client: "Liza Dela Peña",
        service: "Electrical Repair",
        datetime: "June 19, 2025 | 3:00PM",
        location: "78 Katipunan Ave., Quezon City",
        coords: {latitude: 14.639, longitude: 121.074},
        status: "cancelled",
    },
];

const statusColors: Record<string, string> = {
    scheduled: "#4CAF50",
    ongoing: "#F44336",
    finished: "#9E9E9E",
    cancelled: "#E53935",
};

export default function FixMoToday() {
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"scheduled" | "finished" | "cancelled">("scheduled");
    const router = useRouter();
    const isApproved = true; // Use the same approved logic

    const toggleCard = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedCard(expandedCard === id ? null : id);
    };

    const handleEnRoute = () => {
        router.push("/provider/integration/enroutescreen");
    };

    const handleChat = (clientId: string, clientName: string) => {
        router.push({
            pathname: "/provider/integration/messagescreen",
            params: {clientId, clientName},
        });
    };

    return (
        <ApprovedScreenWrapper activeTab="task">
            <View style={styles.container}>
                <Text style={styles.title}>FixMo Today</Text>

                {/* Tabs */}
                <View style={styles.tabsRow}>
                    {["scheduled", "finished", "cancelled"].map((tab) => (
                        <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabButton}>
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                            {activeTab === tab && <View style={styles.tabIndicator}/>}
                        </TouchableOpacity>
                    ))}
                </View>

                <FlatList
                    data={jobs.filter((job) => job.status === activeTab)}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{paddingBottom: 100}}
                    renderItem={({item}) => {
                        const isExpanded = expandedCard === item.id;
                        return (
                            <View style={styles.appointmentBox}>
                                <View style={[styles.statusTag, {backgroundColor: statusColors[item.status]}]}>
                                    <Text style={styles.statusText}>
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </Text>
                                </View>

                                <Text style={styles.clientName}>{item.client}</Text>
                                <Text style={styles.serviceType}>
                                    Service Type: <Text
                                    style={{color: "#00796B", fontFamily: "Poppins-SemiBold"}}>{item.service}</Text>
                                </Text>

                                <View style={styles.row}>
                                    <View style={styles.row}>
                                        <Ionicons name="calendar" size={16} color="#00796B"/>
                                        <Text style={styles.datetime}>{item.datetime}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.chatButton}
                                        onPress={() => handleChat(item.id, item.client)}
                                    >
                                        <Ionicons name="chatbubble-ellipses" size={20} color="#00796B"/>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.expandButton} onPress={() => toggleCard(item.id)}>
                                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20}
                                              color="#00796B"/>
                                </TouchableOpacity>

                                {isExpanded && (
                                    <View style={styles.expandedContent}>
                                        <View style={styles.locationRow}>
                                            <MaterialIcons name="location-pin" size={16} color="#00796B"/>
                                            <Text style={styles.location}>{item.location}</Text>
                                        </View>

                                        <MapView
                                            style={styles.map}
                                            initialRegion={{
                                                latitude: item.coords.latitude,
                                                longitude: item.coords.longitude,
                                                latitudeDelta: 0.01,
                                                longitudeDelta: 0.01,
                                            }}
                                        >
                                            <Marker coordinate={item.coords} title={item.client}
                                                    description={item.service}/>
                                        </MapView>

                                        {item.status === "scheduled" && isApproved && (
                                            <TouchableOpacity style={styles.actionButton} onPress={handleEnRoute}>
                                                <Text style={styles.actionButtonText}>En Route to Fix</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </View>
                        );
                    }}
                />
            </View>
        </ApprovedScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, paddingHorizontal: 16, paddingTop: 20},
    title: {
        fontSize: 18,
        fontFamily: "PoppinsSemiBold",
        textAlign: "center",
        marginBottom: 10,
        marginTop: 30,
        color: "#333"
    },
    tabsRow: {flexDirection: "row", justifyContent: "space-around", marginBottom: 16},
    tabButton: {alignItems: "center"},
    tabText: {fontSize: 14, fontFamily: "PoppinsMedium", color: "#999"},
    tabTextActive: {color: "#00796B", fontFamily: "PoppinsSemiBold"},
    tabIndicator: {marginTop: 4, height: 2, width: "100%", backgroundColor: "#00796B", borderRadius: 2},
    appointmentBox: {backgroundColor: "#f2f2f2", borderRadius: 20, padding: 15, marginBottom: 16},
    statusTag: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8, alignSelf: "flex-start"},
    statusText: {color: "#fff", fontFamily: "PoppinsBold", fontSize: 12},
    clientName: {fontSize: 16, fontFamily: "PoppinsSemiBold", color: "#333"},
    serviceType: {fontSize: 14, fontFamily: "PoppinsRegular", color: "#555", marginTop: 4},
    row: {flexDirection: "row", alignItems: "center", marginTop: 10},
    datetime: {fontSize: 13, fontFamily: "PoppinsRegular", color: "#00796B", marginLeft: 6},
    chatButton: {
        backgroundColor: "#fff",
        padding: 8,
        borderRadius: 20,
        marginLeft: "auto",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 4,
        elevation: 3
    },
    expandButton: {alignItems: "center", marginTop: 8},
    expandedContent: {marginTop: 12},
    locationRow: {flexDirection: "row", alignItems: "center", marginBottom: 6},
    location: {fontSize: 13, fontFamily: "PoppinsRegular", color: "#333", marginLeft: 4},
    map: {width: "100%", height: 150, borderRadius: 12, marginBottom: 10},
    actionButton: {backgroundColor: "#00796B", paddingVertical: 12, borderRadius: 8, alignItems: "center"},
    actionButtonText: {color: "#fff", fontFamily: "PoppinsSemiBold", fontSize: 14},
});
