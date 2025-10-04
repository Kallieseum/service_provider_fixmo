import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { getProviderAvailability, updateAvailabilityByDate } from "../../../src/api/availability.api";
import ApprovedScreenWrapper from "../../../src/navigation/ApprovedScreenWrapper";

const CalendarScreen = () => {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [disabledDates, setDisabledDates] = useState<{ [key: string]: boolean }>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().split("T")[0];
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateStr = maxDate.toISOString().split("T")[0];
    const isApproved = true; // Use centralized approved logic

    // Fetch availability from backend
    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const token = await AsyncStorage.getItem('providerToken');
                const providerIdStr = await AsyncStorage.getItem('providerId');

                if (!token || !providerIdStr) {
                    Alert.alert('Error', 'Authentication required');
                    setLoading(false);
                    return;
                }

                const providerId = parseInt(providerIdStr, 10);
                const data = await getProviderAvailability(providerId, token);

                // Build disabled dates based on day-of-week availability
                const newDisabledDates: { [key: string]: boolean } = {};
                const currentDate = new Date();
                
                // Check next 30 days
                for (let i = 0; i <= 30; i++) {
                    const date = new Date(currentDate);
                    date.setDate(date.getDate() + i);
                    const dateStr = date.toISOString().split('T')[0];
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                    
                    // Find if this day of week is available
                    const dayAvailability = data.find(av => av.dayOfWeek === dayName);
                    
                    if (dayAvailability && !dayAvailability.availability_isActive) {
                        newDisabledDates[dateStr] = true;
                    }
                }

                setDisabledDates(newDisabledDates);
            } catch (error: any) {
                console.error('Fetch availability error:', error);
                Alert.alert('Error', error.message || 'Failed to load availability');
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, []);

    const toggleBooking = async () => {
        if (selectedDate) {
            try {
                const token = await AsyncStorage.getItem('providerToken');
                
                if (!token) {
                    Alert.alert('Error', 'Authentication required');
                    return;
                }

                // Check if date is in the past
                if (selectedDate < today) {
                    Alert.alert('Invalid Date', 'Cannot modify past dates');
                    return;
                }

                // Check if date is beyond 30 days
                if (selectedDate > maxDateStr) {
                    Alert.alert('Invalid Date', 'Can only manage bookings for the next 30 days');
                    return;
                }

                // Toggle the state
                const newIsActive = !disabledDates[selectedDate]; // If currently disabled (true), enable it (true)
                
                // Call API
                const response = await updateAvailabilityByDate(selectedDate, newIsActive, token);
                
                // Update local state
                setDisabledDates(prev => ({...prev, [selectedDate]: !newIsActive}));
                setModalVisible(false);
                
                Alert.alert(
                    'Success',
                    response.message || `Bookings ${newIsActive ? 'enabled' : 'disabled'} for ${selectedDate}`
                );
            } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to update availability');
            }
        }
    };

    return (
        <ApprovedScreenWrapper activeTab="calendar">
            <View style={styles.content}>
                <Text style={styles.header}>Calendar</Text>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#399d9d" />
                        <Text style={styles.loadingText}>Loading calendar...</Text>
                    </View>
                ) : isApproved ? (
                    <>
                        {/* Calendar Box */}
                        <View style={styles.calendar}>
                            <Calendar
                                onDayPress={day => {
                                    setSelectedDate(day.dateString);
                                    setModalVisible(true);
                                }}
                                markedDates={{
                                    ...(selectedDate
                                        ? {
                                            [selectedDate]: {
                                                selected: true,
                                                selectedColor: disabledDates[selectedDate]
                                                    ? "red"
                                                    : "#399d9d",
                                                selectedTextColor: "#fff",
                                            },
                                        }
                                        : {}),
                                    [today]: {
                                        selected: true,
                                        selectedColor: "transparent",
                                        customStyles: {
                                            container: {
                                                borderWidth: 2,
                                                borderColor: "green",
                                                borderRadius: 20,
                                            },
                                            text: {
                                                color: "green",
                                                fontFamily: "PoppinsBold",
                                            },
                                        },
                                    },
                                }}
                                markingType="custom"
                                theme={{
                                    calendarBackground: "#fff",
                                    todayTextColor: "green",
                                    arrowColor: "#399d9d",
                                    textDayFontFamily: "PoppinsMedium",
                                    textDayHeaderFontFamily: "PoppinsBold",
                                    textMonthFontFamily: "PoppinsBold",
                                    textDayHeaderFontWeight: "700",
                                    textMonthFontWeight: "bold",
                                    textDayFontWeight: "600",
                                    textSectionTitleColor: "gray",
                                    monthTextColor: "#399d9d",
                                    textDayStyle: {fontFamily: "PoppinsMedium"},
                                }}
                                style={styles.calendarWrap}
                            />
                        </View>

                        {/* Selected Dates List */}
                        {Object.keys(disabledDates).length > 0 && (
                            <View style={styles.disabledList}>
                                <Text style={styles.subHeader}>Selected Date:</Text>
                                {Object.entries(disabledDates)
                                    .filter(([_, disabled]) => disabled)
                                    .map(([date]) => (
                                        <View key={date} style={styles.dateRow}>
                                            <Text style={styles.disabledText}>{date}</Text>
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>Not Accepting Booking</Text>
                                            </View>
                                        </View>
                                    ))}
                            </View>
                        )}

                        {/* Modal for toggling booking */}
                        <Modal transparent visible={modalVisible} animationType="fade">
                            <View style={styles.modalContainer}>
                                <View style={styles.modalBox}>
                                    <Text style={styles.modalDate}>{selectedDate}</Text>
                                    <TouchableOpacity style={styles.button} onPress={toggleBooking}>
                                        <Text style={styles.buttonText}>
                                            {disabledDates[selectedDate]
                                                ? "Enable Bookings"
                                                : "Disable Bookings"}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setModalVisible(false)}
                                        style={[styles.button, {backgroundColor: "gray"}]}>
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    </>
                ) : (
                    <View style={styles.pendingBox}>
                        <Text style={styles.pendingText}>
                            Your account is currently under review. Once <Text style={styles.highlight}>approved</Text>,
                            you'll be able to manage your calendar.
                        </Text>
                    </View>
                )}
            </View>
        </ApprovedScreenWrapper>
    );
};

export default CalendarScreen;

const styles = StyleSheet.create({
    content: {flex: 1, padding: 20},
    header: {fontSize: 18, fontFamily: "PoppinsSemiBold", textAlign: "center", marginBottom: 10, marginTop: 30},
    loadingContainer: {flex: 1, justifyContent: "center", alignItems: "center"},
    loadingText: {marginTop: 10, fontFamily: "PoppinsRegular", color: "#666"},
    calendar: {justifyContent: "center", alignItems: "center", flexDirection: "column", marginTop: 30},
    calendarWrap: {width: 350, height: 370, borderRadius: 20, elevation: 5},
    disabledList: {marginTop: 15},
    subHeader: {fontFamily: "PoppinsBold", marginBottom: 5},
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 5,
        width: "100%"
    },
    disabledText: {color: "black", fontFamily: "PoppinsMedium"},
    badge: {backgroundColor: "red", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 15},
    badgeText: {color: "#fff", fontSize: 12, fontFamily: "PoppinsBold"},
    modalContainer: {flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)"},
    modalBox: {backgroundColor: "#fff", padding: 20, borderRadius: 20, alignItems: "center", width: "80%"},
    modalDate: {marginBottom: 10, fontFamily: "PoppinsMedium"},
    button: {
        marginTop: 10,
        backgroundColor: "#399d9d",
        padding: 10,
        borderRadius: 20,
        width: "100%",
        alignItems: "center"
    },
    buttonText: {color: "#fff", fontFamily: "PoppinsBold"},
    pendingBox: {flex: 1, justifyContent: "center", alignItems: "center", padding: 20},
    pendingText: {fontFamily: "PoppinsRegular", textAlign: "center", fontSize: 14, color: "#555"},
    highlight: {color: "#009688", fontFamily: "PoppinsBold"},
});
