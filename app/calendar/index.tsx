import { Ionicons } from '@expo/vector-icons';
import { addDays, format, isBefore, startOfDay } from 'date-fns';
import { useFonts } from 'expo-font';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import ApprovedScreenWrapper from '../../src/navigation/ApprovedScreenWrapper';

export default function CalendarScreen() {
  const [disabledDates, setDisabledDates] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
    PoppinsSemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
    PoppinsMedium: require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  // Get today and max date (30 days from now)
  const today = startOfDay(new Date());
  const maxDate = format(addDays(today, 30), 'yyyy-MM-dd');
  const todayStr = format(today, 'yyyy-MM-dd');

  // Generate disabled dates for past dates
  const generatePastDatesMarking = () => {
    const marks: Record<string, any> = {};
    
    // Mark past dates as disabled (last 365 days as example)
    for (let i = 1; i <= 365; i++) {
      const pastDate = addDays(today, -i);
      const dateStr = format(pastDate, 'yyyy-MM-dd');
      marks[dateStr] = {
        disabled: true,
        disableTouchEvent: true,
        textColor: '#d9d9d9',
      };
    }

    // Merge with manually disabled dates
    return { ...marks, ...disabledDates };
  };

  const handleDayPress = (day: DateData) => {
    const dateStr = day.dateString;
    
    // Check if date is in the past
    if (isBefore(new Date(dateStr), today)) {
      Alert.alert('Invalid Date', 'Cannot select past dates.');
      return;
    }

    // Check if date is beyond 30 days
    if (isBefore(new Date(maxDate), new Date(dateStr))) {
      Alert.alert('Invalid Date', 'Can only manage bookings for the next 30 days.');
      return;
    }

    setSelectedDate(dateStr);
  };

  const handleToggleDate = () => {
    if (!selectedDate) {
      Alert.alert('No Date Selected', 'Please select a date first.');
      return;
    }

    const isCurrentlyDisabled = disabledDates[selectedDate]?.disabled;

    Alert.alert(
      isCurrentlyDisabled ? 'Enable Bookings' : 'Disable Bookings',
      `Are you sure you want to ${isCurrentlyDisabled ? 'enable' : 'disable'} bookings for ${format(new Date(selectedDate), 'MMMM dd, yyyy')}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            const newDisabledDates = { ...disabledDates };
            
            if (isCurrentlyDisabled) {
              // Remove from disabled dates
              delete newDisabledDates[selectedDate];
            } else {
              // Add to disabled dates
              newDisabledDates[selectedDate] = {
                disabled: true,
                disableTouchEvent: false, // Allow selection to re-enable
                marked: true,
                dotColor: '#E53935',
                textColor: '#E53935',
              };
            }

            setDisabledDates(newDisabledDates);
            setSelectedDate(null);
            
            // TODO: Save to backend/AsyncStorage
            Alert.alert(
              'Success',
              `Bookings ${isCurrentlyDisabled ? 'enabled' : 'disabled'} for ${format(new Date(selectedDate), 'MMMM dd, yyyy')}`
            );
          },
        },
      ]
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  const markedDates = generatePastDatesMarking();
  
  // Add selected date marking
  if (selectedDate && !markedDates[selectedDate]?.disabled) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: '#00796B',
    };
  }

  return (
    <ApprovedScreenWrapper activeTab="calendar">
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Manage Bookings</Text>
          <Text style={styles.subtitle}>
            Disable specific dates for the next 30 days
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#00796B" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              • Past dates are automatically disabled{'\n'}
              • Select a date to enable/disable bookings{'\n'}
              • Red marked dates are disabled for bookings{'\n'}
              • Can only manage next 30 days
            </Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={todayStr}
            minDate={todayStr}
            maxDate={maxDate}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              todayTextColor: '#00796B',
              selectedDayBackgroundColor: '#00796B',
              selectedDayTextColor: '#ffffff',
              arrowColor: '#00796B',
              monthTextColor: '#333',
              textDayFontFamily: 'PoppinsRegular',
              textMonthFontFamily: 'PoppinsSemiBold',
              textDayHeaderFontFamily: 'PoppinsMedium',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
            }}
          />
        </View>

        {/* Selected Date Action */}
        {selectedDate && !markedDates[selectedDate]?.disabled && (
          <View style={styles.actionCard}>
            <Text style={styles.selectedDateText}>
              Selected: {format(new Date(selectedDate), 'MMMM dd, yyyy')}
            </Text>
            <TouchableOpacity
              style={[
                styles.actionButton,
                disabledDates[selectedDate]?.disabled && styles.actionButtonEnable,
              ]}
              onPress={handleToggleDate}
            >
              <Ionicons
                name={disabledDates[selectedDate]?.disabled ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color="#fff"
              />
              <Text style={styles.actionButtonText}>
                {disabledDates[selectedDate]?.disabled ? 'Enable Bookings' : 'Disable Bookings'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#00796B' }]} />
            <Text style={styles.legendText}>Available for bookings</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#E53935' }]} />
            <Text style={styles.legendText}>Disabled for bookings</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#d9d9d9' }]} />
            <Text style={styles.legendText}>Past dates (auto-disabled)</Text>
          </View>
        </View>
      </ScrollView>
    </ApprovedScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#666',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E0F2F1',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#00796B',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#00796B',
    lineHeight: 18,
  },
  calendarContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDateText: {
    fontSize: 14,
    fontFamily: 'PoppinsMedium',
    color: '#333',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#E53935',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonEnable: {
    backgroundColor: '#00796B',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    marginLeft: 8,
  },
  legendCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  legendTitle: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#333',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#666',
  },
});

