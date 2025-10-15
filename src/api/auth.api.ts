import { API_CONFIG } from '../constants/config';

// Types
export interface ProviderRequestOTPRequest {
  provider_email: string;
}

export interface ProviderRequestOTPResponse {
  message: string;
}

export interface ProviderVerifyRegisterRequest {
  otp: string;
  provider_email: string;
  provider_password: string;
  provider_first_name: string;
  provider_last_name: string;
  provider_userName: string;
  provider_phone_number: string;
  provider_location: string;
  provider_exact_location?: string;
  provider_birthday: string;
  provider_uli?: string;
  professions: number[];
  experiences: number[];
  certificateNames: string[];
  certificateNumbers: string[];
  expiryDates: string[];
  provider_profile_photo: any; // File object
  provider_valid_id: any; // File object
  certificate_images: any[]; // Array of file objects
}

export interface ProviderLoginRequest {
  provider_email: string;
  provider_password: string;
}

export interface ProviderLoginResponse {
  success: boolean;
  message: string;
  token: string;
  providerId: number;
  providerUserName: string;
  userType: string;
  provider: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
  };
}

export interface ForgotPasswordRequest {
  provider_email: string;
}

export interface ForgotPasswordVerifyRequest {
  provider_email: string;
  otp: string;
  newPassword: string;
}

export interface ProviderProfileTotals {
  professions: number;
  certificates: number;
  recent_services: number;
}

export interface ProviderProfession {
  id: number;
  profession: string;
  experience: string;
  created_at?: string;
}

export interface ProviderCertificate {
  certificate_id: number;
  certificate_name: string;
  certificate_number: string;
  certificate_file_path: string;
  expiry_date: string;
  status?: string;
  created_at?: string;
}

export interface ProviderRecentService {
  service_id: number;
  service_title: string;
  service_description: string;
  service_startingprice: number;
  is_active: boolean;
  created_at: string;
}

export interface ProviderProfile {
  provider_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  userName: string;
  email: string;
  phone_number: string;
  profile_photo: string | null;
  valid_id: string | null;
  location: string | null;
  exact_location: string | null;
  uli: string | null;
  birthday: string | null;
  is_verified: boolean;
  verification_status: string;
  rejection_reason?: string | null;
  verification_submitted_at?: string | null;
  verification_reviewed_at?: string | null;
  rating?: number;
  ratings_count?: number;
  is_activated: boolean;
  created_at: string;
  professions: ProviderProfession[];
  certificates: ProviderCertificate[];
  recent_services: ProviderRecentService[];
  totals?: ProviderProfileTotals;
}

export interface ProviderProfileResponse {
  success: boolean;
  message: string;
  data?: ProviderProfile;
  provider?: ProviderProfile; // legacy support
}

// API Functions

/**
 * Verify OTP for provider (without registration)
 */
export const verifyProviderOTP = async (
  email: string,
  otp: string
): Promise<{ valid: boolean; message: string }> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/auth/provider/verify-otp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider_email: email,
          otp: otp,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Invalid OTP');
    }

    return { valid: true, message: data.message || 'OTP verified successfully' };
  } catch (error: any) {
    throw new Error(error.message || 'OTP verification failed');
  }
};

/**
 * Request OTP for provider registration
 */
export const requestProviderOTP = async (
  email: string
): Promise<ProviderRequestOTPResponse> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINTS.PROVIDER_REQUEST_OTP}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider_email: email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }

    return data;
  } catch (error: any) {
    console.error('Request OTP Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Verify OTP and complete provider registration
 */
export const verifyAndRegisterProvider = async (
  formData: FormData
): Promise<any> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINTS.PROVIDER_VERIFY_REGISTER}`,
      {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let the browser set it with boundary
        },
      }
    );

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      // Extract detailed error message from backend
      const errorMessage = data.message || data.error || 'Registration failed';
      
      // Check for specific error types
      if (errorMessage.includes('certificate_number')) {
        throw new Error('Certificate number already exists. Please check your certificate numbers and try again.');
      }
      if (errorMessage.includes('Unique constraint failed')) {
        throw new Error('Duplicate data detected. This may be a duplicate registration or certificate number.');
      }
      
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    console.error('Registration Error:', error);
    
    // If it's already a properly formatted error, throw it as-is
    if (error.message) {
      throw error;
    }
    
    // Otherwise, throw a generic network error
    throw new Error('Network error. Please check your connection and try again.');
  }
};

/**
 * Provider login
 */
export const loginProvider = async (
  email: string,
  password: string
): Promise<ProviderLoginResponse> => {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINTS.PROVIDER_LOGIN}`;
    console.log('Login attempt to:', url);
    console.log('Login email:', email);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        provider_email: email,
        provider_password: password,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('Login response status:', response.status);
    console.log('Login response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

    let data;
    try {
      const textResponse = await response.text();
      console.log('Raw response:', textResponse);
      data = JSON.parse(textResponse);
      console.log('Parsed login data:', data);
    } catch (parseError) {
      console.error('Failed to parse login response:', parseError);
      throw new Error('Invalid response from server. The server may be down or misconfigured.');
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Server returned ${response.status}`;
      console.error('Login failed - Status:', response.status, 'Error:', errorMessage);
      console.error('Full error response:', data);
      
      if (response.status === 401) {
        throw new Error('Invalid email or password');
      } else if (response.status === 404) {
        throw new Error('Login endpoint not found. Please contact support.');
      } else if (response.status === 500) {
        // Backend error - provide helpful message
        console.error('BACKEND ERROR: Server returned 500. This is a backend issue.');
        throw new Error('Server error. The backend has an issue. Please contact support or try again later.');
      }
      
      throw new Error(errorMessage);
    }

    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    if (!data.token) {
      throw new Error('No authentication token received');
    }

    console.log('Login successful');
    return data;
  } catch (error: any) {
    console.error('Login Error Details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your connection and try again.');
    }
    
    if (error.message === 'Network request failed' || error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please check your internet connection.');
    }
    
    if (error.message.includes('Invalid response')) {
      throw error;
    }
    
    // Re-throw the error with its original message if it's already formatted
    if (error.message && !error.message.includes('undefined')) {
      throw error;
    }
    
    throw new Error('Server error during login. Please try again.');
  }
};

/**
 * Request OTP for password reset
 */
export const requestForgotPasswordOTP = async (
  email: string
): Promise<{ message: string }> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINTS.PROVIDER_FORGOT_PASSWORD_REQUEST}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider_email: email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }

    return data;
  } catch (error: any) {
    console.error('Forgot Password Request Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Verify OTP and reset password
 */
export const verifyOTPAndResetPassword = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<{ message: string }> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINTS.PROVIDER_FORGOT_PASSWORD_VERIFY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider_email: email,
          otp: otp,
          newPassword: newPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return data;
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Get detailed provider profile using JWT token
 * Endpoint: GET /auth/provider-profile (legacy: /auth/profile, /auth/provider/profile-detailed)
 */
export const getDetailedProviderProfile = async (
  token: string
): Promise<ProviderProfile> => {
  const endpoints = [
    API_CONFIG.AUTH_ENDPOINTS.PROVIDER_PROFILE,
    '/auth/profile',
    '/auth/provider/profile-detailed',
  ];

  let lastError: Error | null = null;

  for (const path of endpoints) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${path}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data: ProviderProfileResponse = await response.json();

      if (!response.ok || data.success === false) {
        lastError = new Error(data?.message || `Failed to fetch provider profile (${path})`);
        continue;
      }

      const profile = data.data || data.provider;

      if (!profile) {
        lastError = new Error(`Invalid provider profile payload received from ${path}`);
        continue;
      }

      return profile;
    } catch (error: any) {
      lastError = new Error(error?.message || `Network error calling ${path}`);
    }
  }

  console.error('Get Provider Profile Error:', lastError);
  throw lastError || new Error('Unable to fetch provider profile');
};

/**
 * Check if provider username is available
 * Checks against provider_userName in service provider table
 */
export const checkUsernameAvailability = async (
  username: string
): Promise<{ available: boolean; message: string }> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/auth/provider/check-username`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider_userName: username }),
      }
    );

    const data = await response.json();

    // Handle both 200 (available) and 400 (taken) responses
    if (response.ok) {
      // 200 OK - Username is available
      return { 
        available: data.available !== false, 
        message: data.message || 'Username is available' 
      };
    } else {
      // 400 Bad Request - Username already exists or validation error
      return { 
        available: false, 
        message: data.message || 'Username already exists' 
      };
    }
  } catch (error: any) {
    console.error('Username Check Error:', error);
    return { 
      available: false, 
      message: 'Network error. Please check your connection.' 
    };
  }
};

/**
 * Check if provider phone number is available
 * Checks against provider_phone_number in service provider table
 */
export const checkPhoneAvailability = async (
  phoneNumber: string
): Promise<{ available: boolean; message: string }> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/auth/provider/check-phone`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider_phone_number: phoneNumber }),
      }
    );

    const data = await response.json();

    // Handle both 200 (available) and 400 (taken) responses
    if (response.ok) {
      // 200 OK - Phone number is available
      return { 
        available: data.available !== false, 
        message: data.message || 'Phone number is available' 
      };
    } else {
      // 400 Bad Request - Phone already exists or validation error
      return { 
        available: false, 
        message: data.message || 'Phone number already exists' 
      };
    }
  } catch (error: any) {
    console.error('Phone Check Error:', error);
    return { 
      available: false, 
      message: 'Network error. Please check your connection.' 
    };
  }
};
