// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.27:3000',
  AUTH_ENDPOINTS: {
    PROVIDER_REQUEST_OTP: '/auth/provider/send-otp',
    PROVIDER_VERIFY_OTP: '/auth/provider/verify-otp',
    PROVIDER_REGISTER: '/auth/provider/register',
    PROVIDER_VERIFY_REGISTER: '/auth/provider-verify-register',
    PROVIDER_LOGIN: '/auth/provider-login',
    PROVIDER_FORGOT_PASSWORD_REQUEST: '/auth/provider-forgot-password-request-otp',
    PROVIDER_FORGOT_PASSWORD_VERIFY: '/auth/provider-forgot-password-verify-otp',
  },
  TIMEOUT: 30000, // 30 seconds
};

// OTP Configuration
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  RESEND_COOLDOWN_SECONDS: 40,
};
