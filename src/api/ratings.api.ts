import { API_CONFIG } from '@/constants/config';

// Types for ratings data
export interface RatingUser {
  user_id: number;
  first_name: string;
  last_name: string;
  profile_photo?: string;
}

export interface RatingProvider {
  provider_id: number;
  provider_first_name: string;
  provider_last_name: string;
  provider_profile_photo?: string;
}

export interface RatingAppointment {
  appointment_id: number;
  scheduled_date: string;
  service: {
    service_title: string;
  };
}

export interface Rating {
  id: number;
  rating_value: number;
  rating_comment?: string;
  rating_photo?: string;
  appointment_id: number;
  user_id: number;
  provider_id: number;
  rated_by: 'customer' | 'provider';
  created_at: string;
  updated_at: string;
  user?: RatingUser;
  serviceProvider?: RatingProvider;
  appointment?: RatingAppointment;
}

export interface RatingDistribution {
  star: number;
  count: number;
}

export interface RatingStatistics {
  average_rating: number;
  total_ratings: number;
  rating_distribution: RatingDistribution[];
}

export interface RatingsPagination {
  current_page: number;
  total_pages: number;
  total_ratings: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ProviderRatingsResponse {
  success: boolean;
  data: {
    ratings: Rating[];
    pagination: RatingsPagination;
    statistics: RatingStatistics;
  };
  message?: string;
}

/**
 * Get all ratings for a specific provider (public endpoint)
 * 
 * @param providerId - Provider ID
 * @param page - Page number for pagination (default: 1)
 * @param limit - Number of ratings per page (default: 10)
 * @returns Provider ratings with pagination and statistics
 */
export const getProviderRatings = async (
  providerId: number,
  page: number = 1,
  limit: number = 10
): Promise<ProviderRatingsResponse> => {
  try {
    const url = `${API_CONFIG.BASE_URL}/api/ratings/provider/${providerId}?page=${page}&limit=${limit}`;
    
    console.log('📊 Fetching provider ratings:', { providerId, page, limit });
    console.log('🌐 API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response status:', response.status, response.statusText);

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to fetch provider ratings. Status:', response.status);
      console.error('❌ Error data:', data);
      return {
        success: false,
        data: {
          ratings: [],
          pagination: {
            current_page: page,
            total_pages: 0,
            total_ratings: 0,
            has_next: false,
            has_prev: false,
          },
          statistics: {
            average_rating: 0,
            total_ratings: 0,
            rating_distribution: [],
          },
        },
        message: data.message || 'Failed to fetch ratings',
      };
    }

    console.log('✅ Provider ratings fetched successfully:', {
      totalRatings: data.data.pagination.total_ratings,
      averageRating: data.data.statistics.average_rating,
      currentPage: data.data.pagination.current_page,
    });

    return data;
  } catch (error: any) {
    console.error('💥 Error fetching provider ratings:', error);
    return {
      success: false,
      data: {
        ratings: [],
        pagination: {
          current_page: page,
          total_pages: 0,
          total_ratings: 0,
          has_next: false,
          has_prev: false,
        },
        statistics: {
          average_rating: 0,
          total_ratings: 0,
          rating_distribution: [],
        },
      },
      message: error.message || 'Network error',
    };
  }
};

/**
 * Get ratings statistics for a provider (useful for summary views)
 * 
 * @param providerId - Provider ID
 * @returns Rating statistics only
 */
export const getProviderRatingStats = async (
  providerId: number
): Promise<RatingStatistics | null> => {
  try {
    const response = await getProviderRatings(providerId, 1, 1);
    
    if (response.success) {
      return response.data.statistics;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching rating stats:', error);
    return null;
  }
};

/**
 * Unrated Appointment Interface
 * This matches the actual backend response structure
 */
export interface UnratedAppointment {
  appointment_id: number;
  appointment_status: string;
  scheduled_date: string;
  completed_at?: string;
  needs_rating?: boolean;
  customer: {
    user_id: number;          // Backend uses 'user_id' not 'customer_id'
    email?: string;
    first_name: string;
    last_name: string;
    profile_photo?: string;
  };
  serviceProvider?: {
    provider_id: number;
    business_name?: string;
    first_name?: string;
    last_name?: string;
  };
  service?: {
    service_id: number;
    service_title: string;
    service_startingprice?: number;
  };
  final_price?: number;
  repairDescription?: string;
}

export interface UnratedAppointmentsResponse {
  success: boolean;
  data: UnratedAppointment[];
  pagination?: {
    total_count: number;
    page: number;
    limit: number;
  };
  message?: string;
}

/**
 * Get unrated appointments for a provider
 * These are completed appointments that the provider hasn't rated yet
 * 
 * @param authToken - Provider's authentication token
 * @param limit - Maximum number of appointments to return (default: 10)
 * @returns List of unrated appointments
 */
export const getUnratedAppointments = async (
  authToken: string,
  limit: number = 10
): Promise<UnratedAppointmentsResponse> => {
  try {
    const url = `${API_CONFIG.BASE_URL}/api/appointments/can-rate?userType=provider&limit=${limit}`;
    
    console.log('🔍 Checking for unrated appointments...');
    console.log('🌐 API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    console.log('📡 Response status:', response.status, response.statusText);

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to fetch unrated appointments. Status:', response.status);
      console.error('❌ Error data:', data);
      return {
        success: false,
        data: [],
        message: data.message || 'Failed to fetch unrated appointments',
      };
    }

    console.log('✅ Unrated appointments fetched:', {
      count: data.data?.length || 0,
      appointments: data.data,
    });

    return {
      success: data.success,
      data: data.data || [],
      pagination: data.pagination,
      message: data.message,
    };
  } catch (error: any) {
    console.error('💥 Error fetching unrated appointments:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Network error',
    };
  }
};

/**
 * Submit rating for a customer (Provider rates Customer)
 * 
 * @param authToken - Provider's authentication token
 * @param appointmentId - Appointment ID
 * @param customerId - Customer ID to rate
 * @param ratingValue - Rating value (1-5)
 * @param ratingComment - Optional comment
 * @returns Success response
 */
export const submitCustomerRating = async (
  authToken: string,
  appointmentId: number,
  customerId: number,
  ratingValue: number,
  ratingComment?: string
): Promise<{ success: boolean; message?: string; data?: any }> => {
  try {
    const url = `${API_CONFIG.BASE_URL}/api/ratings/provider/rate-customer`;
    
    console.log('📝 Submitting customer rating:', {
      appointmentId,
      customerId,
      ratingValue,
      hasComment: !!ratingComment,
    });
    
    const requestBody = {
      appointment_id: appointmentId,
      customer_id: customerId,
      rating_value: ratingValue,
      rating_comment: ratingComment?.trim() || null,
    };
    
    console.log('📤 Request URL:', url);
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Response status:', response.status, response.statusText);

    const data = await response.json();
    console.log('📡 Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Failed to submit rating. Status:', response.status);
      console.error('❌ Error data:', data);
      return {
        success: false,
        message: data.message || 'Failed to submit rating',
      };
    }

    console.log('✅ Rating submitted successfully:', data);

    return {
      success: true,
      message: data.message || 'Rating submitted successfully',
      data: data.data,
    };
  } catch (error: any) {
    console.error('💥 Error submitting rating:', error);
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
};
