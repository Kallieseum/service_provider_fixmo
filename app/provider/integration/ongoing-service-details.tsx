import React from "react";
import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import MapView, {Marker} from "react-native-maps";
import {Ionicons, MaterialIcons} from "@expo/vector-icons";

export default function OngoingServiceDetails() {
    return (
        <View style={styles.appointmentBox}>
            {/* Status Tag */}
            <View style={[styles.statusTag, {backgroundColor: "#F44336"}]}>
                <Text style={styles.statusText}>Ongoing</Text>
            </View>

            {/* Client */}
            <Text style={styles.clientName}>Maria de la Cruz</Text>

            {/* Service */}
            <Text style={styles.serviceType}>
                Service Type:{" "}
                <Text style={styles.serviceHighlight}>Electrical Repair</Text>
            </Text>

            {/* Date + Chat */}
            <View style={styles.row}>
                <View style={styles.row}>
                    <Ionicons name="calendar" size={16} color="#00796B"/>
                    <Text style={styles.datetime}>June 23, 2025 | 2:00PM</Text>
                </View>
                <TouchableOpacity style={styles.chatButton}>
                    <Ionicons name="chatbubble-ellipses" size={20} color="#00796B"/>
                </TouchableOpacity>
            </View>

            {/* Location */}
            <View style={styles.locationRow}>
                <MaterialIcons name="location-pin" size={16} color="#00796B"/>
                <Text style={styles.location}>999 Pureza, Sta. Mesa</Text>
            </View>

            {/* Map */}
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 14.5995,
                    longitude: 120.9842,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <Marker coordinate={{latitude: 14.5995, longitude: 120.9842}}/>
            </MapView>

            {/* Complete Button */}
            <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>COMPLETE SERVICE</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    appointmentBox: {
        backgroundColor: "#f2f2f2",
        borderRadius: 20,
        padding: 15,
        margin: 16,
    },
    statusTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
        alignSelf: "flex-start",
    },
    statusText: {
        color: "#fff",
        fontFamily: "PoppinsBold",
        fontSize: 12,
    },
    clientName: {
        fontSize: 16,
        fontFamily: "PoppinsSemiBold",
        color: "#333",
    },
    serviceType: {
        fontSize: 14,
        fontFamily: "PoppinsRegular",
        color: "#555",
        marginTop: 4,
    },
    serviceHighlight: {
        color: "#00796B",
        fontFamily: "PoppinsSemiBold",
    },
    row: {flexDirection: "row", alignItems: "center", marginTop: 10},
    datetime: {
        fontSize: 13,
        fontFamily: "PoppinsRegular",
        color: "#00796B",
        marginLeft: 6,
    },
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
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        marginBottom: 6,
    },
    location: {
        fontSize: 13,
        fontFamily: "PoppinsRegular",
        color: "#333",
        marginLeft: 4,
    },
    map: {
        width: "100%",
        height: 150,
        borderRadius: 12,
        marginBottom: 10,
    },
    actionButton: {
        backgroundColor: "#00796B",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    actionButtonText: {
        color: "#fff",
        fontFamily: "PoppinsSemiBold",
        fontSize: 14,
    },
});
