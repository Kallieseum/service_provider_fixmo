import { API_CONFIG } from '../constants/config';
import type {
    Appointment,
    AppointmentResponse,
    AppointmentsListResponse,
    UpdateAppointmentRequest,
    UpdateAppointmentResponse,
} from '../types/appointment';

/**
 * Get appointment by ID
 * @param appointmentId - The ID of the appointment
 * @param token - JWT authentication token
 */
export const getAppointmentById = async (
  appointmentId: number,
  token: string
): Promise<Appointment> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/appointments/${appointmentId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data: AppointmentResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch appointment');
    }

    if (!data.data) {
      throw new Error('No appointment data received');
    }

    return data.data;
  } catch (error: any) {
    console.error('Get Appointment Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Get all appointments for a provider
 * @param providerId - The ID of the provider
 * @param token - JWT authentication token
 */
export const getAppointmentsByProviderId = async (
  providerId: number,
  token: string
): Promise<Appointment[]> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/appointments/provider/${providerId}?include=appointment_id,customer,provider,service`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data: AppointmentsListResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch appointments');
    }

    return data.data || [];
  } catch (error: any) {
    console.error('Get Appointments Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Update appointment details
 * @param appointmentId - The ID of the appointment to update
 * @param updateData - The fields to update
 * @param token - JWT authentication token
 */
export const updateAppointment = async (
  appointmentId: number,
  updateData: UpdateAppointmentRequest,
  token: string
): Promise<Appointment> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/appointments/${appointmentId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    const data: UpdateAppointmentResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update appointment');
    }

    if (!data.data) {
      throw new Error('No appointment data received after update');
    }

    return data.data;
  } catch (error: any) {
    console.error('Update Appointment Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Start en route - change appointment status to 'on the way'
 * @param appointmentId - The ID of the appointment
 * @param token - JWT authentication token
 */
export const startEnRoute = async (
  appointmentId: number,
  token: string
): Promise<Appointment> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/auth/appointments/${appointmentId}/status`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'confirmed' }),
      }
    );

    const data: UpdateAppointmentResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update appointment status');
    }

    if (!data.data) {
      throw new Error('No appointment data received after update');
    }

    return data.data;
  } catch (error: any) {
    console.error('Start En Route Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Mark as arrived - change appointment status to 'in-progress'
 * @param appointmentId - The ID of the appointment
 * @param token - JWT authentication token
 */
export const markAsArrived = async (
  appointmentId: number,
  token: string
): Promise<Appointment> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/auth/appointments/${appointmentId}/status`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'in-progress' }),
      }
    );

    const data: UpdateAppointmentResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update appointment status');
    }

    if (!data.data) {
      throw new Error('No appointment data received after update');
    }

    return data.data;
  } catch (error: any) {
    console.error('Mark As Arrived Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Mark appointment as finished with final price and description
 * @param appointmentId - The ID of the appointment
 * @param finalPrice - The final price (adjustment price)
 * @param repairDescription - Description of the repair work
 * @param token - JWT authentication token
 */
export const completeAppointment = async (
  appointmentId: number,
  finalPrice: number,
  repairDescription: string,
  token: string
): Promise<Appointment> => {
  return updateAppointment(
    appointmentId,
    {
      appointment_status: 'finished',
      final_price: finalPrice,
      repairDescription: repairDescription,
    },
    token
  );
};
