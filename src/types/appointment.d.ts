// Appointment Types

export type AppointmentStatus = 
  | 'pending'
  | 'approved'
  | 'confirmed'  // On the way
  | 'in-progress'  // Ongoing/Working
  | 'finished' 
  | 'completed'
  | 'cancelled'
  | 'no-show'
  // Legacy support
  | 'scheduled'  // Maps to approved
  | 'ongoing';  // Maps to in-progress

export interface Appointment {
  appointment_id: number;
  customer_id: number;
  provider_id: number;
  appointment_status: AppointmentStatus;
  scheduled_date: string;
  repairDescription: string;
  created_at: string;
  starting_price: number;
  final_price: number;
  availability_id: number;
  service_id: number;
  cancellation_reason?: string | null;
  warranty_days?: number | null;
  finished_at?: string | null;
  completed_at?: string | null;
  warranty_expires_at?: string | null;
  // Related data (populated by backend)
  customer?: {
    customer_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    exact_location?: string; // Format: "lat,lng"
    latitude?: number;
    longitude?: number;
  };
  provider?: {
    provider_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    provider_exact_location?: string; // Format: "lat,lng"
  };
  service?: {
    service_id: number;
    service_title: string;
    service_description?: string;
    service_startingprice?: number;
  };
}

export interface AppointmentResponse {
  success: boolean;
  data?: Appointment;
  message?: string;
}

export interface AppointmentsListResponse {
  success: boolean;
  data?: Appointment[];
  message?: string;
}

export interface UpdateAppointmentRequest {
  scheduled_date?: string;
  appointment_status?: AppointmentStatus;
  final_price?: number;
  repairDescription?: string;
}

export interface UpdateAppointmentResponse {
  success: boolean;
  message?: string;
  data?: Appointment;
}
