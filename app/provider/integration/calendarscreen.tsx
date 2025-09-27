import React, {useState, useEffect} from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import {Calendar} from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApprovedScreenWrapper from "../../../src/navigation/ApprovedScreenWrapper";

const CalendarScreen = () => {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [disabledDates, setDisabledDates] = useState<{ [key: string]: boolean }>({});
    const [modalVisible, setModalVisible] = useState(false);

    const today = new Date().toISOString().split("T")[0];
    const isApproved = true; // Use centralized approved logic

    // Load saved disabled dates
    useEffect(() => {
        const loadDisabledDates = async () => {
            try {
                const saved = await AsyncStorage.getItem("disabledDates");
                if (saved) setDisabledDates(JSON.parse(saved));
            } catch (error) {
                console.error("Error loading disabled dates:", error);
            }
        };
        loadDisabledDates();
    }, []);

    // Save whenever disabledDates changes
    useEffect(() => {
        const saveDisabledDates = async () => {
            try {
                await AsyncStorage.setItem("disabledDates", JSON.stringify(disabledDates));
            } catch (error) {
                console.error("Error saving disabled dates:", error);
            }
        };
        saveDisabledDates();
    }, [disabledDates]);

    const toggleBooking = () => {
        if (selectedDate) {
            setDisabledDates(prev => ({...prev, [selectedDate]: !prev[selectedDate]}));
            setModalVisible(false);
        }
    };

    return (
        <ApprovedScreenWrapper activeTab="calendar">
            <View style={styles.content}>
                <Text style={styles.header}>Calendar</Text>

                {isApproved ? (
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
