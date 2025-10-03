import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';
import { getProviderAvailability, setAvailability } from '../../src/api/availability.api';
import ApprovedScreenWrapper from '../../src/navigation/ApprovedScreenWrapper';
import type { Availability, DayOfWeek } from '../../src/types/availability';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DAY_ICONS: Record<DayOfWeek, string> = {
  Monday: 'calendar',
  Tuesday: 'calendar',
  Wednesday: 'calendar',
  Thursday: 'calendar',
  Friday: 'calendar',
  Saturday: 'calendar-outline',
  Sunday: 'calendar-outline',
};

export default function AvailabilityScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [toggleStates, setToggleStates] = useState<Record<DayOfWeek, boolean>>({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });

  const [fontsLoaded] = useFonts({
    PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
    PoppinsSemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
    PoppinsMedium: require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  const fetchAvailability = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('providerToken');
      const providerIdStr = await AsyncStorage.getItem('providerId');

      if (!token || !providerIdStr) {
        Alert.alert('Error', 'Authentication required. Please log in again.');
        return;
      }

      const providerId = parseInt(providerIdStr, 10);
      const data = await getProviderAvailability(providerId, token);
      
      console.log('Fetched availability data:', JSON.stringify(data));
      
      setAvailabilities(data);

      // Create a map of all days starting with false
      const newToggleStates: Record<DayOfWeek, boolean> = {
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false,
      };

      // Update with backend data - backend knows the truth
      if (data && data.length > 0) {
        data.forEach((availability) => {
          newToggleStates[availability.dayOfWeek] = availability.availability_isActive;
        });
      }

      console.log('Setting toggle states:', JSON.stringify(newToggleStates));
      setToggleStates(newToggleStates);
    } catch (error: any) {
      console.error('Fetch availability error:', error);
      Alert.alert('Error', error.message || 'Failed to load availability');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []); // Remove availabilities.length dependency to prevent refetch loops

  useEffect(() => {
    if (fontsLoaded) {
      fetchAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsLoaded]); // Only fetch on initial load when fonts are ready

  const onRefresh = () => {
    setRefreshing(true);
    fetchAvailability();
  };

  const handleToggleDay = async (day: DayOfWeek, newValue: boolean) => {
    try {
      const token = await AsyncStorage.getItem('providerToken');
      const providerIdStr = await AsyncStorage.getItem('providerId');

      if (!token || !providerIdStr) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const providerId = parseInt(providerIdStr, 10);

      // Optimistically update UI
      const newToggleStates = { ...toggleStates, [day]: newValue };
      setToggleStates(newToggleStates);

      // Build availability data for ALL days (not just the one being toggled)
      const allDaysAvailability = DAYS_OF_WEEK.map((dayName) => ({
        dayOfWeek: dayName,
        isAvailable: newToggleStates[dayName], // Use updated state
        startTime: '08:00',
        endTime: '17:00',
      }));

      console.log('Sending all days availability:', JSON.stringify(allDaysAvailability));

      // Send all days to backend
      await setAvailability(allDaysAvailability, token);

      // Don't refresh - trust the optimistic update worked
    } catch (error: any) {
      // Revert on error
      setToggleStates((prev) => ({ ...prev, [day]: !newValue }));
      Alert.alert('Error', error.message || 'Failed to update availability');
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <ApprovedScreenWrapper activeTab="calendar">
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#00796B" />
          <Text style={styles.loadingText}>Loading availability...</Text>
        </View>
      </ApprovedScreenWrapper>
    );
  }

  return (
    <ApprovedScreenWrapper activeTab="calendar">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00796B']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Weekly Availability</Text>
          <Text style={styles.subtitle}>
            Set which days you're available to accept bookings
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#00796B" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Date-Based Availability</Text>
            <Text style={styles.infoText}>
              Toggle days when you're available. All active days start at 8:00 AM.
            </Text>
          </View>
        </View>

        {/* Days List */}
        <View style={styles.daysContainer}>
          {DAYS_OF_WEEK.map((day) => (
            <View key={day} style={styles.dayCard}>
              <View style={styles.dayInfo}>
                <View style={styles.dayIconContainer}>
                  <Ionicons
                    name={DAY_ICONS[day] as any}
                    size={24}
                    color={toggleStates[day] ? '#00796B' : '#999'}
                  />
                </View>
                <View style={styles.dayTextContainer}>
                  <Text style={[styles.dayName, toggleStates[day] && styles.dayNameActive]}>
                    {day}
                  </Text>
                  <Text style={styles.dayStatus}>
                    {toggleStates[day] ? 'Available from 8:00 AM' : 'Not available'}
                  </Text>
                </View>
              </View>
              <Switch
                value={toggleStates[day]}
                onValueChange={(value) => handleToggleDay(day, value)}
                trackColor={{ false: '#E0E0E0', true: '#80CBC4' }}
                thumbColor={toggleStates[day] ? '#00796B' : '#f4f3f4'}
                ios_backgroundColor="#E0E0E0"
              />
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Active Days</Text>
          <Text style={styles.summaryCount}>
            {Object.values(toggleStates).filter(Boolean).length} of 7 days
          </Text>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#666',
    marginTop: 12,
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
  daysContainer: {
    marginBottom: 24,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    color: '#666',
    marginBottom: 2,
  },
  dayNameActive: {
    color: '#00796B',
  },
  dayStatus: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#999',
  },
  summaryCard: {
    backgroundColor: '#00796B',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: 'PoppinsMedium',
    color: '#fff',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 28,
    fontFamily: 'PoppinsBold',
    color: '#fff',
  },
});

