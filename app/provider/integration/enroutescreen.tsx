// app/provider/enroutescreen.tsx
import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
} from "react-native";
import MapView, {Marker} from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import {useLocalSearchParams, useRouter} from "expo-router";

const GOOGLE_MAPS_APIKEY = "YOUR_GOOGLE_MAPS_API_KEY"; // replace with your key

export default function EnRouteScreen() {
    const {latitude, longitude, name} = useLocalSearchParams();
    const [providerLocation, setProviderLocation] = useState<any>(null);
    const [steps, setSteps] = useState<any[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [showStartPopup, setShowStartPopup] = useState(false);

    const router = useRouter();

    useEffect(() => {
        (async () => {
            let {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                alert("Permission to access location was denied");
                return;
            }

            Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 5,
                },
                (loc) => {
                    const newLoc = {
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                    };
                    setProviderLocation(newLoc);

                    if (steps.length > 0 && currentStepIndex < steps.length) {
                        const step = steps[currentStepIndex];
                        const distance = getDistance(
                            newLoc.latitude,
                            newLoc.longitude,
                            step.end_location.lat,
                            step.end_location.lng
                        );

                        if (distance < 30) {
                            setCurrentStepIndex((prev) =>
                                Math.min(prev + 1, steps.length - 1)
                            );
                        }
                    }
                }
            );
        })();
    }, [steps, currentStepIndex]);

    if (!providerLocation) {
        return (
            <View style={styles.center}>
                <Text>Fetching your location...</Text>
            </View>
        );
    }

    const destination = {
        latitude: Number(latitude) || 14.5995,
        longitude: Number(longitude) || 120.9842,
    };

    // 📌 Sample booking data
    const bookingData = {
        id: "BK-2025",
        customer: "Maria de la Cruz",
        serviceType: "Electrical Repair",
        date: "June 23, 2025",
        time: "2:00 PM",
        distance: "1.5 km",
    };

    return (
        <View style={styles.container}>
            {/* Top navigation instruction */}
            <View style={styles.topInstruction}>
                <Text style={styles.instructionText}>
                    {steps.length > 0
                        ? `${steps[
                            currentStepIndex
                            ].html_instructions.replace(/<[^>]+>/g, "")} (${
                            steps[currentStepIndex].distance.text
                        })`
                        : "Fetching route..."}
                </Text>
            </View>

            {/* Map */}
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: providerLocation.latitude,
                    longitude: providerLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                <Marker coordinate={providerLocation} title="You" pinColor="teal"/>
                <Marker coordinate={destination} title={name as string}/>

                <MapViewDirections
                    origin={providerLocation}
                    destination={destination}
                    apikey={GOOGLE_MAPS_APIKEY}
                    strokeWidth={4}
                    strokeColor="#16a34a"
                    onReady={(result) => {
                        if (result.legs.length > 0) {
                            setSteps(result.legs[0].steps);
                            setCurrentStepIndex(0);
                        }
                    }}
                />
            </MapView>

            {/* Bottom booking card */}
            <View style={styles.bottomPanel}>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.bookingId}>
                            Booking ID: {bookingData.id}
                        </Text>
                        <Text style={styles.distance}>
                            Distance {bookingData.distance}
                        </Text>
                    </View>

                    <Text style={styles.customer}>{bookingData.customer}</Text>
                    <Text style={styles.service}>
                        Service Type: {bookingData.serviceType}
                    </Text>
                    <Text style={styles.datetime}>
                        {bookingData.date} | {bookingData.time}
                    </Text>

                    {/* 🚀 Open Start Job Popup */}
                    <TouchableOpacity
                        style={styles.arrivedButton}
                        onPress={() => setShowStartPopup(true)}
                    >
                        <Text style={styles.arrivedText}>Arrived</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 📌 Start Job Popup */}
            <Modal
                visible={showStartPopup}
                transparent
                animationType="slide"
                onRequestClose={() => setShowStartPopup(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.popupCard}>
                        <View style={styles.row}>
                            <Text style={styles.bookingId}>
                                Booking ID: {bookingData.id}
                            </Text>
                            <Text style={styles.distance}>
                                Distance {bookingData.distance}
                            </Text>
                        </View>

                        <Text style={styles.customer}>{bookingData.customer}</Text>
                        <Text style={styles.service}>
                            Service Type: {bookingData.serviceType}
                        </Text>
                        <Text style={styles.datetime}>
                            {bookingData.date} | {bookingData.time}
                        </Text>

                        {/* 🚀 Start Button */}
                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={() => {
                                setShowStartPopup(false);
                                router.replace({
                                    pathname: "/provider/onboarding/pre_homepage",
                                    params: {
                                        client: bookingData.customer,
                                        service: bookingData.serviceType,
                                        datetime: `${bookingData.date} | ${bookingData.time}`,
                                        status: "ongoing",
                                    },
                                });
                            }}
                        >
                            <Text style={styles.startText}>Start Now</Text>
                        </TouchableOpacity>

                        {/* 💬 Message Button */}
                        <TouchableOpacity
                            style={styles.messageButton}
                            onPress={() => {
                                setShowStartPopup(false);
                                router.push({
                                    pathname: "/provider/chat/[id]",
                                    params: {
                                        id: bookingData.id,
                                        client: bookingData.customer,
                                    },
                                });
                            }}
                        >
                            <Text style={styles.messageText}>Message</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// Haversine formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: "#fff"},
    map: {flex: 1},
    center: {flex: 1, justifyContent: "center", alignItems: "center"},

    // Top instruction
    topInstruction: {
        position: "absolute",
        top: 40,
        left: 20,
        right: 20,
        backgroundColor: "#008080",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
        zIndex: 1,
    },
    instructionText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },

    // Bottom booking card
    bottomPanel: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    bookingId: {
        backgroundColor: "#e6f7f4",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        fontSize: 12,
        color: "#16a34a",
        fontWeight: "bold",
    },
    distance: {fontSize: 12, color: "#555"},
    customer: {fontSize: 16, fontWeight: "bold", color: "#222"},
    service: {fontSize: 14, color: "#333", marginTop: 2},
    datetime: {fontSize: 13, color: "#666", marginTop: 2, marginBottom: 10},
    arrivedButton: {
        backgroundColor: "#008080",
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: "center",
    },
    arrivedText: {color: "#fff", fontSize: 16, fontWeight: "bold"},

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    popupCard: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    startButton: {
        backgroundColor: "#008080",
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: "center",
        marginTop: 15,
    },
    startText: {color: "#fff", fontSize: 16, fontWeight: "bold"},

    // Message button
    messageButton: {
        backgroundColor: "#16a34a",
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: "center",
        marginTop: 10,
    },
    messageText: {color: "#fff", fontSize: 16, fontWeight: "bold"},
});
