import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useUserContext} from "@/context/UserContext";

type ServiceRating = {
    service: string;
    average: number;
    ratings: number[];
    comments?: string[];
};

export default function RatingScreen() {
    const {user} = useUserContext();
    const [ratingsData, setRatingsData] = useState<ServiceRating[]>([]);

    useEffect(() => {
        const mock: ServiceRating[] = [
            {
                service: "Plumbing",
                average: 4.5,
                ratings: [5, 4, 5],
                comments: ["Great job!", "Fast and clean!", "Professional work."],
            },
            {
                service: "Cleaning",
                average: 3.7,
                ratings: [4, 3, 4, 3],
                comments: ["Could be better.", "Okay experience.", "Good overall."],
            },
            {
                service: "Electrical",
                average: 4.8,
                ratings: [5, 5, 5, 4],
                comments: ["Fixed it quickly!", "Reliable and skilled."],
            },
        ];
        setRatingsData(mock);
    }, []);

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating - fullStars >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Ionicons key={`full-${i}`} name="star" size={22} color="#FFD700"/>
            );
        }

        if (hasHalfStar) {
            stars.push(
                <Ionicons key="half" name="star-half" size={22} color="#FFD700"/>
            );
        }

        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <Ionicons key={`empty-${i}`} name="star-outline" size={22} color="#FFD700"/>
            );
        }

        return <View style={styles.starRow}>{stars}</View>;
    };

    const calculateOverall = () => {
        const allRatings = ratingsData.flatMap((r) => r.ratings);
        const sum = allRatings.reduce((acc, val) => acc + val, 0);
        return (sum / allRatings.length).toFixed(1);
    };

    return (
        <View style={styles.container}>
            {/* Fixed Header */}
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Ratings</Text>
                <Text style={styles.overallLabel}>Overall Rating</Text>
                <Text style={styles.overallScore}>{calculateOverall()}</Text>
                {renderStars(Number(calculateOverall()))}
                <Text style={styles.totalReviews}>
                    {ratingsData.reduce((acc, r) => acc + r.ratings.length, 0)} total reviews
                </Text>

                <Text style={styles.sectionTitle}>Rate By Service</Text>
            </View>

            {/* Scrollable Content */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {ratingsData.map((item) => (
                    <View key={item.service} style={styles.serviceCard}>
                        <Text style={styles.serviceName}>{item.service}</Text>
                        <Text style={styles.avgText}>
                            Avg: {item.average.toFixed(1)} from {item.ratings.length} reviews
                        </Text>

                        {renderStars(item.average)}

                        {item.comments && item.comments.length > 0 && (
                            <View style={styles.commentList}>
                                {item.comments.map((c, i) => (
                                    <Text key={i} style={styles.commentText}>
                                        • {c}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 10,
        backgroundColor: "#fff",
        zIndex: 1,
        elevation: 2, // Android
        shadowColor: "#000", // iOS
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        fontSize: 22,
        fontFamily: "PoppinsSemiBold",
        color: "#008080",
        textAlign: "center",
        marginBottom: 10,
    },
    overallLabel: {
        fontSize: 14,
        color: "#666",
        fontFamily: "PoppinsRegular",
        marginBottom: 4,
        textAlign: "center",
    },
    overallScore: {
        fontSize: 48,
        color: "#FFA500",
        fontFamily: "PoppinsBold",
        textAlign: "center",
    },
    totalReviews: {
        marginTop: 5,
        color: "#666",
        fontSize: 14,
        fontFamily: "PoppinsRegular",
        textAlign: "center",
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: "PoppinsSemiBold",
        marginTop: 20,
        color: "#333",
    },
    serviceCard: {
        padding: 16,
        borderRadius: 10,
        backgroundColor: "#F4F8F7",
        marginBottom: 20,
    },
    serviceName: {
        fontSize: 16,
        fontFamily: "PoppinsMedium",
        color: "#008080",
        marginBottom: 4,
    },
    avgText: {
        fontSize: 14,
        color: "#555",
        marginBottom: 4,
        fontFamily: "PoppinsRegular",
    },
    starRow: {
        flexDirection: "row",
        marginBottom: 6,
    },
    commentList: {
        marginTop: 10,
    },
    commentText: {
        fontSize: 13,
        color: "#444",
        fontFamily: "PoppinsRegular",
        marginLeft: 8,
    },
});
