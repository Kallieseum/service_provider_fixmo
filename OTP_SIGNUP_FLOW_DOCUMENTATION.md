# Provider OTP Sign-Up Flow Implementation

## Overview
Complete implementation of the OTP-based sign-up flow for service providers in the FixMo app, following the authentication documentation.

## Flow Diagram
```
email.tsx (Enter Email)
    ↓
OTP API Request → Backend sends 6-digit OTP
    ↓
otp.tsx (Verify OTP)
    ↓
agreement.tsx (Accept Terms)
    ↓
basicinfo.tsx (Personal Info + Profile Photo)
    ↓
LocationScreen.tsx (Cascading Location + GPS Coordinates)
    ↓
id-verification.tsx (Valid ID Upload)
    ↓
Selfie.tsx (Selfie with ID)
    ↓
ncupload.tsx (TESDA Certificates + Password)
    ↓
applicationreview.tsx (Auto-Submit Registration)
    ↓
Registration Complete → Pending Admin Verification
```

## Implementation Details

### 1. Email Entry (`email.tsx`)
**Features:**
- Email validation with regex
- Calls `requestProviderOTP()` API
- Loading states and error handling
- Navigates to OTP screen on success

**API Integration:**
```typescript
await requestProviderOTP(email);
```

### 2. OTP Verification (`otp.tsx`)
**Features:**
- 6-digit OTP input field with visual feedback
- Real-time OTP verification via API
- **Red squares with error message** when OTP is incorrect
- **Green squares** when OTP is correct (500ms delay before navigation)
- Countdown timer (40 seconds before resend available)
- Resend OTP functionality
- **Prevents back navigation** to email screen
- Auto-verification when 6 digits entered
- Disables input during verification
- Passes email and OTP to next screens

**Visual Feedback States:**
- **Normal State**: White cells with gray border
- **Focus State**: Teal border on active cell
- **Valid State** (correct OTP):
  - Green border (#4CAF50)
  - Light green background (#E8F5E9)
  - Dark green text (#2E7D32)
- **Invalid State** (incorrect OTP):
  - Red border (#F44336)
  - Light red background (#FFEBEE)
  - Dark red text (#C62828)
  - Error message displayed below: "Invalid OTP. Please try again."
  - Auto-clears after 1.5 seconds

**API Integration:**
```typescript
// Verifies OTP without completing registration
await verifyProviderOTP(email, otp);

// API Endpoint: POST /auth/provider/verify-otp
// Body: { provider_email, otp }
// Response: { message, verified: true }
```

**Flow:**
1. User enters 6-digit code
2. Automatically calls `verifyProviderOTP()` API
3. If valid: Shows green cells → navigates to agreement (router.replace to prevent back)
4. If invalid: Shows red cells + error message → clears after 1.5s → allows retry
5. Resend available after 40-second cooldown

**Navigation:**
- Uses `router.replace()` instead of `router.push()` to prevent back navigation
- User cannot return to email screen once on OTP screen
- This ensures the OTP verification flow is secure and linear

### 3. Terms Agreement (`agreement.tsx`)
**Features:**
- Displays terms and privacy policy
- Passes email + OTP to basicinfo screen

### 4. Basic Information (`basicinfo.tsx`)
**Features:**
- First Name, Middle Name, Last Name
- Date of Birth picker
- Email (pre-filled from params, editable)
- Phone Number
- Username
- Profile Photo upload (camera)

**Data Passed Forward:**
```typescript
{
  email, otp, photo, firstName, middleName, lastName, 
  dob, phone, username
}
```

### 5. Location Selection (`LocationScreen.tsx`)
**Features:**
- Cascading dropdowns: District → City → Barangay
- GPS pin location on map
- Auto-fill from GPS coordinates
- Combines data into:
  - `provider_location`: "Barangay, City, District"
  - `provider_exact_location`: "latitude,longitude"

**Data Passed Forward:**
All previous params + location data

### 6. ID Verification (`id-verification.tsx`)
**Features:**
- ID type selection (PhilSys, Passport, Driver's License, etc.)
- ID number input
- Front and back photo upload
- Camera or gallery selection

**Data Passed Forward:**
```typescript
{
  ...previousParams,
  idType, idNumber, idPhotoFront, idPhotoBack
}
```

### 7. Selfie with ID (`Selfie.tsx`)
**Features:**
- Camera-only selfie capture
- Preview before proceeding
- Validation before continuing

**Data Passed Forward:**
```typescript
{
  ...previousParams,
  selfiePhoto
}
```

### 8. TESDA Certificates & Password (`ncupload.tsx`)
**Features:**
- ULI Number (12-digit, optional)
- Password creation with validation:
  - Min 8 characters
  - Uppercase, lowercase, number, special character
- Confirm password
- Multiple TESDA certificates:
  - Certificate type (dropdown from services)
  - Certificate number
  - Expiry date picker
  - Certificate image upload
- Add/remove certificates dynamically

**Data Passed Forward:**
```typescript
{
  ...previousParams,
  password, uliNumber,
  certificates: JSON.stringify([
    {type, number, expiry, file}
  ])
}
```

### 9. Application Review & Submission (`applicationreview.tsx`)
**Features:**
- Auto-submits registration on mount
- Compiles all data into FormData
- Calls `verifyAndRegisterProvider()` API
- Shows loading state during submission
- Success message on completion
- Error handling with retry option

**Final Registration Payload:**
```typescript
FormData {
  // OTP Verification
  otp: string,
  provider_email: string,
  
  // Basic Info
  provider_password: string,
  provider_first_name: string,
  provider_last_name: string,
  provider_userName: string,
  provider_phone_number: string,
  provider_birthday: string, // YYYY-MM-DD
  
  // Location
  provider_location: string, // "Barangay, City, District"
  provider_exact_location: string, // "lat,lng"
  
  // Optional
  provider_uli: string, // 17 alphanumeric
  
  // File Uploads
  provider_profile_photo: File,
  provider_valid_id: File,
  certificate_images: File[],
  
  // Certificates (JSON strings)
  certificateNames: string, // JSON array
  certificateNumbers: string, // JSON array
  expiryDates: string, // JSON array (YYYY-MM-DD)
  
  // Professions (TODO: needs dedicated screen)
  professions: string, // JSON array of IDs
  experiences: string, // JSON array of years
}
```

## API Functions (`src/api/auth.api.ts`)

### Request OTP
```typescript
requestProviderOTP(email: string)
```
- Endpoint: `POST /auth/provider/send-otp`
- Body: `{ provider_email: string }`
- Sends 6-digit OTP to email
- OTP valid for 5 minutes (according to OTP_VERIFICATION_SYSTEM_DOCUMENTATION)
- Sets `verified: false` in database

### Verify OTP
```typescript
verifyProviderOTP(email: string, otp: string)
```
- Endpoint: `POST /auth/provider/verify-otp`
- Body: `{ provider_email: string, otp: string }`
- Validates OTP against database
- Checks expiration
- Marks `verified: true` in database
- Returns: `{ message: string, verified: boolean }`
- **Note:** Does NOT delete OTP record (kept for registration step)

### Complete Registration
```typescript
verifyAndRegisterProvider(formData: FormData)
```
- Endpoint: `POST /auth/provider/register`
- Verifies that OTP was previously validated (`verified: true`)
- Creates provider account with all details
- Uploads files to Cloudinary
- Deletes used OTP record
- Returns provider details and JWT token

## Configuration (`src/constants/config.ts`)

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.27:3000',
  AUTH_ENDPOINTS: {
    PROVIDER_REQUEST_OTP: '/auth/provider/send-otp',
    PROVIDER_VERIFY_OTP: '/auth/provider/verify-otp',
    PROVIDER_REGISTER: '/auth/provider/register',
    PROVIDER_VERIFY_REGISTER: '/auth/provider-verify-register', // Legacy endpoint
    PROVIDER_LOGIN: '/auth/provider-login',
    PROVIDER_FORGOT_PASSWORD_REQUEST: '/auth/provider-forgot-password-request-otp',
    PROVIDER_FORGOT_PASSWORD_VERIFY: '/auth/provider-forgot-password-verify-otp',
  },
  TIMEOUT: 30000, // 30 seconds
};

export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  RESEND_COOLDOWN_SECONDS: 40,
};
```

## Data Flow Through Screens

### Params Passed Through Navigation
```typescript
// email.tsx → otp.tsx
{ email }

// otp.tsx → agreement.tsx
{ email, otp }

// agreement.tsx → basicinfo.tsx
{ email, otp }

// basicinfo.tsx → LocationScreen.tsx
{ email, otp, photo, firstName, middleName, lastName, dob, phone, username }

// LocationScreen.tsx → id-verification.tsx
{ ...previous, provider_location, provider_exact_location }

// id-verification.tsx → Selfie.tsx
{ ...previous, idType, idNumber, idPhotoFront, idPhotoBack }

// Selfie.tsx → ncupload.tsx
{ ...previous, selfiePhoto }

// ncupload.tsx → applicationreview.tsx
{ ...previous, password, uliNumber, certificates }

// applicationreview.tsx → Backend API
FormData with all collected data
```

## Error Handling

### Email Screen
- Invalid email format validation
- Network errors
- "Provider already exists" error

### OTP Screen
- Invalid OTP (6 digits required)
- OTP expiration handling
- Resend cooldown timer

### Application Review
- Form validation errors
- Network timeouts
- OTP verification failures
- File upload errors
- Duplicate username/phone errors

## Security Features

1. **OTP Verification**: Email must be verified before proceeding
2. **Password Validation**: Strong password requirements enforced
3. **Secure Token Storage**: JWT tokens for authenticated requests
4. **File Validation**: Image format and size validation
5. **Input Sanitization**: All user inputs validated before submission

## Testing Checklist

- [ ] Email validation works correctly
- [ ] OTP is sent and received
- [ ] OTP countdown timer works
- [ ] Resend OTP functionality
- [ ] All form fields validate correctly
- [ ] Image uploads work (camera & gallery)
- [ ] GPS location pinning works
- [ ] Cascading dropdowns populate correctly
- [ ] Password validation enforces rules
- [ ] Certificate upload supports multiple files
- [ ] Final submission sends all data correctly
- [ ] Success/error messages display properly
- [ ] Navigation flow works smoothly
- [ ] Back button preserves data

## Known Limitations & TODOs

1. **Profession Selection**: Currently uses placeholder profession ID (1)
   - TODO: Add profession selection screen with experience input
   - Should be added between agreement and basicinfo OR as separate modal

2. **Middle Name**: Collected but not sent to API
   - API documentation doesn't include middle name field
   - Currently stored but not submitted

3. **Selfie Photo**: Collected but not sent as `provider_profile_photo`
   - Using profile photo from basicinfo instead
   - May need clarification on which photo should be profile

4. **ID Back Photo**: Collected but not sent
   - API accepts single valid_id file
   - Currently sending front photo only

## Backend Requirements

The backend must be running and accessible at `http://localhost:3000` with the following endpoints:

1. `POST /auth/provider-request-otp` - Send OTP
2. `POST /auth/provider-verify-register` - Complete registration
3. Email service configured for OTP delivery
4. Cloudinary or file storage for image uploads
5. Database tables for providers, certificates, professions

## Environment Setup

**Required Packages:**
- `expo-router` - Navigation
- `expo-image-picker` - Image selection
- `expo-document-picker` - File selection
- `expo-location` - GPS functionality
- `@react-native-community/datetimepicker` - Date selection
- `@react-native-picker/picker` - Dropdown selection
- `react-native-confirmation-code-field` - OTP input
- `react-native-maps` - Map view

## Next Steps

1. Test complete flow end-to-end
2. Add profession selection screen
3. Implement proper error retry mechanisms
4. Add progress indicator across screens
5. Implement data persistence (AsyncStorage) for draft saving
6. Add image compression before upload
7. Implement biometric authentication option
8. Add social login integration (Google, Facebook)

---

**Last Updated:** October 3, 2025
**Status:** ✅ Complete and Ready for Testing
