import { API_CONFIG } from '../constants/config';
import type {
    AvailabilitiesListResponse,
    Availability,
    AvailabilityResponse,
    CreateAvailabilityRequest,
    DayOfWeek,
    UpdateAvailabilityRequest,
} from '../types/availability';

/**
 * Get all availability slots for a provider
 * @param providerId - The ID of the provider
 * @param token - JWT authentication token
 */
export const getProviderAvailability = async (
  providerId: number,
  token: string
): Promise<Availability[]> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/availability?provider_id=${providerId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data: AvailabilitiesListResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch availability');
    }

    return data.data || [];
  } catch (error: any) {
    console.error('Get Availability Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Create or update availability for a specific day
 * @param availabilityData - The availability data
 * @param token - JWT authentication token
 */
export const setAvailability = async (
  availabilityData: CreateAvailabilityRequest[],
  token: string
): Promise<Availability> => {
  try {
    const requestBody = { availabilityData };
    console.log('Setting availability with data:', JSON.stringify(requestBody));
    
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/availability`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data: AvailabilityResponse = await response.json();
    console.log('Set availability response:', JSON.stringify(data));

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to set availability');
    }

    if (!data.data) {
      throw new Error('No availability data received');
    }

    return data.data;
  } catch (error: any) {
    console.error('Set Availability Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Update availability slot
 * @param availabilityId - The ID of the availability slot
 * @param updateData - The fields to update
 * @param token - JWT authentication token
 */
export const updateAvailability = async (
  availabilityId: number,
  updateData: UpdateAvailabilityRequest,
  token: string
): Promise<Availability> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/availability/${availabilityId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    const data: AvailabilityResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update availability');
    }

    if (!data.data) {
      throw new Error('No availability data received');
    }

    return data.data;
  } catch (error: any) {
    console.error('Update Availability Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Toggle availability for a specific day (convenience function)
 * @param providerId - The ID of the provider
 * @param dayOfWeek - The day to toggle
 * @param isActive - Whether to activate or deactivate
 * @param token - JWT authentication token
 */
export const toggleDayAvailability = async (
  providerId: number,
  dayOfWeek: DayOfWeek,
  isActive: boolean,
  token: string
): Promise<Availability> => {
  // Create or update with default 8 AM start time
  const availabilityData: CreateAvailabilityRequest[] = [
    {
      dayOfWeek,
      isAvailable: isActive,
      startTime: '08:00',
      endTime: '17:00', // Default end time
    },
  ];

  return setAvailability(availabilityData, token);
};
 