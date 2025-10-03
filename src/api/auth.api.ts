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
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINTS.PROVIDER_LOGIN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider_email: email,
          provider_password: password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error: any) {
    console.error('Login Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
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
