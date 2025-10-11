import { API_CONFIG } from '@/constants/config';

// Types
export type BackjobStatus = 
  | 'pending'
  | 'approved'
  | 'disputed'
  | 'rescheduled'
  | 'cancelled-by-admin'
  | 'cancelled-by-customer'
  | 'cancelled-by-user';

export interface Backjob {
  backjob_id: number;
  appointment_id: number;
  customer_id: number;
  provider_id: number;
  reason: string;
  status: BackjobStatus;
  evidence?: {
    description?: string;
    files?: string[];
    notes?: string;
  };
  provider_dispute_reason?: string;
  provider_dispute_evidence?: {
    description?: string;
    files?: string[];
    notes?: string;
  };
  admin_notes?: string;
  customer_cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface DisputeBackjobRequest {
  dispute_reason: string;
  dispute_evidence?: {
    description?: string;
    files?: string[];
    notes?: string;
  };
}

export interface RescheduleBackjobRequest {
  new_scheduled_date: string; // ISO 8601 format
  availability_id: number;
}

export interface UploadEvidenceResponse {
  success: boolean;
  message: string;
  data: {
    files: Array<{
      url: string;
      originalName: string;
      mimetype: string;
      size: number;
    }>;
    total_files: number;
  };
}

/**
 * Dispute a backjob application with reason and evidence
 * 
 * @param backjobId - ID of the backjob to dispute
 * @param disputeData - Dispute reason and evidence
 * @param authToken - JWT token for authentication
 * @returns Disputed backjob data
 */
export const disputeBackjob = async (
  backjobId: number,
  disputeData: DisputeBackjobRequest,
  authToken: string
): Promise<{ success: boolean; message: string; data?: Backjob }> => {
  try {
    const url = `${API_CONFIG.BASE_URL}/api/appointments/backjobs/${backjobId}/dispute`;
    
    console.log('⚠️ Disputing backjob:', backjobId);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(disputeData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to dispute backjob:', data.message);
      return {
        success: false,
        message: data.message || 'Failed to dispute backjob',
      };
    }

    console.log('✅ Backjob disputed successfully');
    return data;
  } catch (error: any) {
    console.error('💥 Error disputing backjob:', error);
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

/**
 * Reschedule a backjob appointment to a new date
 * 
 * @param appointmentId - ID of the appointment with approved backjob
 * @param rescheduleData - New scheduled date and availability ID
 * @param authToken - JWT token for authentication
 * @returns Updated appointment data
 */
export const rescheduleBackjob = async (
  appointmentId: number,
  rescheduleData: RescheduleBackjobRequest,
  authToken: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const url = `${API_CONFIG.BASE_URL}/api/appointments/${appointmentId}/reschedule-backjob`;
    
    console.log('📅 Rescheduling backjob appointment:', appointmentId);
    console.log('New date:', rescheduleData.new_scheduled_date);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rescheduleData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to reschedule backjob:', data.message);
      return {
        success: false,
        message: data.message || 'Failed to reschedule backjob',
      };
    }

    console.log('✅ Backjob rescheduled successfully');
    return data;
  } catch (error: any) {
    console.error('💥 Error rescheduling backjob:', error);
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

/**
 * Upload evidence files for a backjob (photos/videos)
 * 
 * @param appointmentId - ID of the appointment
 * @param files - Array of file objects with uri, type, and name
 * @param authToken - JWT token for authentication
 * @returns Uploaded file URLs
 */
export const uploadBackjobEvidence = async (
  appointmentId: number,
  files: Array<{ uri: string; type: string; name: string }>,
  authToken: string
): Promise<UploadEvidenceResponse> => {
  try {
    const url = `${API_CONFIG.BASE_URL}/api/appointments/${appointmentId}/backjob-evidence`;
    
    console.log(`📎 Uploading ${files.length} evidence file(s) for appointment ${appointmentId}`);
    
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('evidence_files', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to upload evidence:', data.message);
      return {
        success: false,
        message: data.message || 'Failed to upload evidence',
        data: { files: [], total_files: 0 },
      };
    }

    console.log(`✅ ${data.data.total_files} file(s) uploaded successfully`);
    return data;
  } catch (error: any) {
    console.error('💥 Error uploading evidence:', error);
    return {
      success: false,
      message: error.message || 'Network error',
      data: { files: [], total_files: 0 },
    };
  }
};

/**
 * Get all provider appointments (includes backjob information)
 * 
 * @param providerId - Provider ID
 * @param authToken - JWT token for authentication
 * @param filters - Optional filters (status, page, limit, sort_order)
 * @returns Paginated appointments with backjob data
 */
export const getProviderAppointments = async (
  providerId: number,
  authToken: string,
  filters?: {
    status?: string;
    page?: number;
    limit?: number;
    sort_order?: 'asc' | 'desc';
  }
): Promise<{ success: boolean; message?: string; data?: any[]; pagination?: any }> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort_order) params.append('sort_order', filters.sort_order);

    const url = `${API_CONFIG.BASE_URL}/api/appointments/provider/${providerId}?${params.toString()}`;
    
    console.log('📋 Fetching provider appointments:', { providerId, filters });
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to fetch appointments:', data.message);
      return {
        success: false,
        message: data.message || 'Failed to fetch appointments',
      };
    }

    console.log(`✅ Fetched ${data.data?.length || 0} appointments`);
    return data;
  } catch (error: any) {
    console.error('💥 Error fetching appointments:', error);
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};

/**
 * Get appointments with active backjobs (convenience function)
 * 
 * @param providerId - Provider ID
 * @param authToken - JWT token for authentication
 * @returns Appointments with backjob status
 */
export const getBackjobAppointments = async (
  providerId: number,
  authToken: string
): Promise<{ success: boolean; message?: string; data?: any[] }> => {
  return getProviderAppointments(providerId, authToken, { status: 'backjob' });
};
