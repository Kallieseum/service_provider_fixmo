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
