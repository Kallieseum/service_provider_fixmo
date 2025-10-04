# Service Provider Registration Endpoint Integration Guide

## Overview
This document provides a comprehensive guide for integrating the service provider registration endpoint into your application. This can be used for both **service provider registration** and adapted for **customer registration**.

---

## Table of Contents
1. [Endpoint Information](#endpoint-information)
2. [Registration Flow Architecture](#registration-flow-architecture)
3. [Data Collection Screens](#data-collection-screens)
4. [API Integration](#api-integration)
5. [AsyncStorage Management](#asyncstorage-management)
6. [Error Handling](#error-handling)
7. [Adapting for Customer Registration](#adapting-for-customer-registration)
8. [Complete Code Examples](#complete-code-examples)

---

## Endpoint Information

### Base Endpoint
```
POST /api/auth/register/provider
```

### Content Type
```
multipart/form-data
```

### Authentication
No authentication required (public endpoint for registration)

---

## Registration Flow Architecture

### 1. **Multi-Step Onboarding Flow**

The registration is broken into manageable screens that collect data progressively:

```
Email → OTP Verification → Agreement → Basic Info → Location → ID Verification → Certificates/Credentials → Application Review
```

### 2. **State Management Strategy**

**Two-Layer Persistence:**
1. **URL Params** - Pass data between screens via `useLocalSearchParams()`
2. **AsyncStorage** - Backup storage for specific screens (location, ID verification)

**Why Both?**
- URL Params: Primary method, works seamlessly with `expo-router`
- AsyncStorage: Backup for screens where users might close the app mid-flow

---

## Data Collection Screens

### Screen 1: Email Input
**File:** `app/provider/onboarding/email.tsx`

**Collects:**
- Email address

**Passes to next screen:**
```typescript
router.push({
    pathname: '/provider/onboarding/otp',
    params: { email }
});
```

---

### Screen 2: OTP Verification
**File:** `app/provider/onboarding/otp.tsx`

**Collects:**
- 6-digit OTP code

**Validation:**
- Backend sends OTP to email
- User enters 6-digit code
- Backend verifies before proceeding

**Passes to next screen:**
```typescript
router.push({
    pathname: '/provider/onboarding/agreement',
    params: { email, otp }
});
```

---

### Screen 3: Agreement/Terms
**File:** `app/provider/onboarding/agreement.tsx`

**Purpose:**
- User accepts terms and conditions
- No data collection

**Passes to next screen:**
```typescript
router.push({
    pathname: '/provider/onboarding/basicinfo',
    params: { email, otp }
});
```

---

### Screen 4: Basic Information
**File:** `app/provider/onboarding/basicinfo.tsx`

**Collects:**
- `photo` - Profile photo (local URI)
- `firstName` - First name (UPPERCASE)
- `middleName` - Middle name (UPPERCASE, optional)
- `lastName` - Last name (UPPERCASE)
- `dob` - Date of birth (yyyy-mm-dd format)
- `phone` - Phone number (11 digits)
- `username` - Unique username (min 6 chars, starts with letter)

**Real-time Validations:**
```typescript
// Username validation
const result = await checkUsernameAvailability(username);
// Returns: { available: boolean }

// Phone validation
const result = await checkPhoneAvailability(phone);
// Returns: { available: boolean }
```

**Age Validation:**
```typescript
const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};
// Must be 18-100 years old
```

**Passes to next screen:**
```typescript
router.push({
    pathname: '/provider/onboarding/LocationScreen',
    params: {
        email, otp, photo, firstName, middleName, lastName, dob, phone, username
    }
});
```

---

### Screen 5: Location Details
**File:** `app/provider/onboarding/LocationScreen.tsx`

**Collects:**
- `district` - NCR District
- `city` - City/Municipality
- `barangay` - Barangay
- `location` - Coordinates { latitude, longitude }

**Features:**
- **Cascading Dropdowns**: District → City → Barangay
- **Auto-Geocoding**: Automatically gets coordinates when all three are selected
- **Interactive Map**: User can pin exact location (disabled until all 3 fields selected)
- **AsyncStorage Backup**: Saves data locally

**AsyncStorage Keys:**
```typescript
await AsyncStorage.setItem('location_district', district);
await AsyncStorage.setItem('location_city', city);
await AsyncStorage.setItem('location_barangay', barangay);
await AsyncStorage.setItem('location_coordinates', JSON.stringify(location));
```

**Geocoding Implementation:**
```typescript
const geocodeLocation = async () => {
    const addressQuery = `${barangay}, ${city}, Philippines`;
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=1`,
        {
            headers: {
                'User-Agent': 'FixmoServiceProviderApp/1.0',
            },
        }
    );
    const data = await response.json();
    if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setLocation({
            latitude: parseFloat(lat),
            longitude: parseFloat(lon)
        });
    }
};
```

**Data Format for API:**
```typescript
const provider_location = `${barangay}, ${city}, ${district}`;
const provider_exact_location = `${location.latitude},${location.longitude}`;
```

**Passes to next screen:**
```typescript
router.push({
    pathname: '/provider/onboarding/id-verification',
    params: {
        ...previousParams,
        provider_location,
        provider_exact_location,
        savedDistrict: district,
        savedCity: city,
        savedBarangay: barangay,
        savedLocation: JSON.stringify(location)
    }
});
```

---

### Screen 6: ID Verification
**File:** `app/provider/onboarding/id-verification.tsx`

**Collects:**
- `idType` - Type of ID (National ID, Driver's License, Passport, etc.)
- `idPhotoFront` - Photo of ID front (local URI)

**AsyncStorage Backup:**
```typescript
await AsyncStorage.setItem('idVerification_idType', idType);
await AsyncStorage.setItem('idVerification_idPhotoFront', idPhotoFront);
```

**Supported ID Types:**
```typescript
const idTypes = [
    "National ID",
    "Driver's License",
    "Passport",
    "Voter's ID",
    "PRC ID",
    "Postal ID",
    "SSS ID",
    "GSIS ID",
    "PhilHealth ID",
    "TIN ID"
];
```

**Passes to next screen:**
```typescript
router.push({
    pathname: '/provider/onboarding/ncupload',
    params: {
        ...previousParams,
        idType,
        idPhotoFront
    }
});
```

---

### Screen 7: Certificates & Credentials
**File:** `app/provider/onboarding/ncupload.tsx`

**Collects:**
- `uliNumber` - Unified Licensing ID (12 digits)
- `professions` - Array of professions (comma-separated string)
- `certificateNames` - Array of certificate names (comma-separated string)
- `certificateNumbers` - Array of certificate numbers (14 digits each, comma-separated string)
- `certificateImages` - Array of certificate images (local URIs, comma-separated string)
- `experiences` - Array of work experiences (comma-separated string)
- `password` - User password (min 8 chars)

**Validation Rules:**
```typescript
// ULI Number: Exactly 12 digits
if (uliNumber.length !== 12) {
    Alert.alert("Invalid ULI", "ULI must be exactly 12 digits.");
    return;
}

// Certificate Numbers: Exactly 14 digits each
certificates.forEach(cert => {
    if (cert.number.length !== 14) {
        Alert.alert("Invalid Certificate Number", "Certificate number must be exactly 14 digits.");
        return;
    }
});

// Password: Minimum 8 characters
if (password.length < 8) {
    Alert.alert("Invalid Password", "Password must be at least 8 characters.");
    return;
}
```

**Data Format:**
```typescript
// Arrays are converted to comma-separated strings
const professionsString = professions.join(',');  // "Electrician,Plumber,Carpenter"
const certificateNamesString = certificateNames.join(',');  // "License1,License2,License3"
const certificateNumbersString = certificateNumbers.join(',');  // "12345678901234,98765432109876"
const certificateImagesString = certificateImages.join(',');  // "file:///path1.jpg,file:///path2.jpg"
const experiencesString = experiences.join(',');  // "5 years at Company A,3 years at Company B"
```

**Passes to next screen:**
```typescript
router.push({
    pathname: '/provider/onboarding/applicationreview',
    params: {
        ...previousParams,
        uliNumber,
        professions: professionsString,
        certificateNames: certificateNamesString,
        certificateNumbers: certificateNumbersString,
        certificateImages: certificateImagesString,
        experiences: experiencesString,
        password
    }
});
```

---

### Screen 8: Application Review & Submission
**File:** `app/provider/onboarding/applicationreview.tsx`

**Purpose:**
- Auto-submits registration on mount
- Handles success/error states
- Clears AsyncStorage on success

**Implementation:**
```typescript
useEffect(() => {
    handleSubmitRegistration();
}, []);

const handleSubmitRegistration = async () => {
    setIsSubmitting(true);
    
    try {
        // Create FormData
        const formData = new FormData();
        
        // Add all fields
        formData.append('otp', params.otp);
        formData.append('provider_email', params.email);
        formData.append('provider_photo', {
            uri: params.photo,
            type: 'image/jpeg',
            name: 'profile.jpg'
        });
        // ... (see complete example below)
        
        // Submit
        const response = await verifyAndRegisterProvider(formData);
        
        if (response && response.success !== false) {
            setIsSubmitted(true);
            // Clear AsyncStorage on success
            await clearOnboardingData();
        } else {
            throw new Error(response?.message || 'Registration failed');
        }
        
    } catch (error) {
        setError(error.message);
        // Show retry options
    }
};
```

---

## API Integration

### API Client Setup
**File:** `src/api/auth.api.ts`

```typescript
import { apiClient } from '../utils/apiClient';

export const verifyAndRegisterProvider = async (formData: FormData) => {
    try {
        const response = await apiClient.post('/auth/register/provider', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        // Parse error messages
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }
};
```

### API Client Configuration
**File:** `src/utils/apiClient.ts`

```typescript
import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds for file uploads
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for auth tokens (if needed)
apiClient.interceptors.request.use(
    (config) => {
        // Add auth token if available
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized
        }
        return Promise.reject(error);
    }
);
```

---

## Complete FormData Structure

### Building the Request

```typescript
const formData = new FormData();

// 1. OTP & Email
formData.append('otp', params.otp as string);
formData.append('provider_email', params.email as string);

// 2. Profile Photo
formData.append('provider_photo', {
    uri: params.photo as string,
    type: 'image/jpeg',
    name: 'profile.jpg',
} as any);

// 3. Personal Information
formData.append('firstName', params.firstName as string);
formData.append('middleName', params.middleName as string || '');
formData.append('lastName', params.lastName as string);
formData.append('provider_dob', params.dob as string); // yyyy-mm-dd

// 4. Contact Information
formData.append('provider_phone', params.phone as string);
formData.append('provider_username', params.username as string);

// 5. Location Information
formData.append('provider_location', params.provider_location as string);
formData.append('provider_exact_location', params.provider_exact_location as string);

// 6. ID Verification
formData.append('provider_id_type', params.idType as string);
formData.append('provider_id_front', {
    uri: params.idPhotoFront as string,
    type: 'image/jpeg',
    name: 'id_front.jpg',
} as any);

// 7. Credentials
formData.append('uliNumber', params.uliNumber as string);
formData.append('password', params.password as string);

// 8. Parse and add arrays from comma-separated strings
const professions = (params.professions as string).split(',').filter(p => p.trim());
const experiences = (params.experiences as string).split(',').filter(e => e.trim());
const certificateNames = (params.certificateNames as string).split(',').filter(n => n.trim());
const certificateNumbers = (params.certificateNumbers as string).split(',').filter(n => n.trim());
const certificateImages = (params.certificateImages as string).split(',').filter(i => i.trim());

formData.append('professions', JSON.stringify(professions));
formData.append('experiences', JSON.stringify(experiences));

// 9. Add certificates
certificateNames.forEach((name, index) => {
    formData.append('certificateNames[]', name);
    formData.append('certificateNumbers[]', certificateNumbers[index]);
    formData.append('certificateImages[]', {
        uri: certificateImages[index],
        type: 'image/jpeg',
        name: `certificate_${index}.jpg`,
    } as any);
});
```

---

## AsyncStorage Management

### Storage Keys Used

```typescript
// Location Screen
'location_district'
'location_city'
'location_barangay'
'location_coordinates'

// ID Verification Screen
'idVerification_idType'
'idVerification_idPhotoFront'
```

### Cleanup After Successful Registration

**File:** `app/provider/onboarding/applicationreview.tsx`

```typescript
const clearOnboardingData = async () => {
    try {
        const keys = [
            'location_district',
            'location_city',
            'location_barangay',
            'location_coordinates',
            'idVerification_idType',
            'idVerification_idPhotoFront'
        ];
        await AsyncStorage.multiRemove(keys);
        console.log('Onboarding data cleared from AsyncStorage');
    } catch (error) {
        console.error('Error clearing onboarding data:', error);
    }
};

// Call after successful registration
if (response && response.success !== false) {
    setIsSubmitted(true);
    setError(null);
    await clearOnboardingData(); // ✅ Clean up
}
```

**Why Clean Up?**
- Prevents data from persisting across registrations
- Removes sensitive data (ID photos, location)
- Ensures fresh start for new registrations

**When NOT to Clean Up:**
- On registration error (preserve data for retry)
- When user navigates back (preserve for editing)

---

## Error Handling

### Backend Error Parsing

```typescript
try {
    const response = await verifyAndRegisterProvider(formData);
    // Handle success
} catch (error: any) {
    console.error('Registration submission error:', error);
    
    let errorMessage = 'An error occurred during registration';
    
    // Parse Prisma errors
    if (error.message.includes('certificate_number')) {
        errorMessage = 'One of your certificate numbers is already registered. Please verify your certificates.';
    } else if (error.message.includes('provider_username')) {
        errorMessage = 'This username is already taken.';
    } else if (error.message.includes('provider_email')) {
        errorMessage = 'This email is already registered.';
    } else if (error.message) {
        errorMessage = error.message;
    }
    
    setError(errorMessage);
}
```

### User-Friendly Error Screen

```typescript
if (error && !isSubmitted) {
    return (
        <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={80} color="#F44336" />
            <Text style={styles.errorTitle}>Registration Failed</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            
            <TouchableOpacity 
                style={styles.retryButton} 
                onPress={() => {
                    setError(null);
                    handleSubmitRegistration();
                }}
            >
                <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => router.back()}
            >
                <Text style={styles.backButtonText}>Go Back to Edit</Text>
            </TouchableOpacity>
        </View>
    );
}
```

### Success Screen

```typescript
if (isSubmitted && !error) {
    return (
        <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
            <Text style={styles.successTitle}>Application Submitted!</Text>
            <Text style={styles.successMessage}>
                Your application is under review. You'll be notified once approved.
            </Text>
            <TouchableOpacity 
                style={styles.continueButton} 
                onPress={handleContinue}
            >
                <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}
```

---

## Adapting for Customer Registration

### Key Differences

| Field | Service Provider | Customer |
|-------|-----------------|----------|
| **Profile** | Required with strict rules | May be optional |
| **Location** | Exact location with map | City-level may suffice |
| **ID Verification** | Required (both sides) | May be optional |
| **Credentials** | ULI, Certificates, Experience | Not needed |
| **Profession** | Multiple allowed | Not applicable |

### Simplified Customer Flow

```
Email → OTP → Agreement → Basic Info → Location (optional) → Submit
```

### Modified Screens

**1. Remove These Screens:**
- `id-verification.tsx` (or make optional)
- `ncupload.tsx` (credentials not needed)

**2. Simplify Location Screen:**
```typescript
// Customer: City-level is enough
const location = `${city}, ${district}`;

// No need for exact coordinates or map picker
```

**3. Adjust API Endpoint:**
```typescript
// Change endpoint
export const registerCustomer = async (formData: FormData) => {
    return await apiClient.post('/auth/register/customer', formData);
};
```

**4. Simplified FormData:**
```typescript
const formData = new FormData();

// Basic fields only
formData.append('email', params.email);
formData.append('otp', params.otp);
formData.append('firstName', params.firstName);
formData.append('lastName', params.lastName);
formData.append('phone', params.phone);
formData.append('username', params.username);
formData.append('password', params.password);

// Optional fields
if (params.photo) {
    formData.append('photo', {
        uri: params.photo,
        type: 'image/jpeg',
        name: 'profile.jpg',
    });
}

if (params.location) {
    formData.append('location', params.location);
}
```

---

## Best Practices

### 1. **Data Validation**
- ✅ Validate on client before submission
- ✅ Show real-time feedback (username, phone availability)
- ✅ Use proper input types (numeric keyboard for phone/digits)
- ✅ Set maxLength constraints

### 2. **User Experience**
- ✅ Save progress with AsyncStorage for critical screens
- ✅ Allow back navigation without data loss
- ✅ Show loading states during async operations
- ✅ Provide clear error messages with retry options

### 3. **Security**
- ✅ Use HTTPS for all API calls
- ✅ Validate OTP before proceeding
- ✅ Hash passwords on backend (never store plain text)
- ✅ Implement rate limiting on backend

### 4. **Performance**
- ✅ Debounce real-time validations (500ms)
- ✅ Compress images before upload
- ✅ Use appropriate timeout (30s for file uploads)
- ✅ Show upload progress for large files

### 5. **Error Handling**
- ✅ Parse backend errors for user-friendly messages
- ✅ Provide retry functionality
- ✅ Log errors for debugging
- ✅ Handle network failures gracefully

---

## Testing Checklist

### Registration Flow
- [ ] Email validation works
- [ ] OTP verification succeeds
- [ ] All form fields validate correctly
- [ ] Real-time username/phone checks work
- [ ] Image uploads succeed
- [ ] Location geocoding works
- [ ] Map picker functions correctly (only when all 3 fields filled)
- [ ] AsyncStorage saves/loads correctly
- [ ] Back navigation preserves data
- [ ] Registration submits successfully
- [ ] AsyncStorage clears after success
- [ ] Error screen shows on failure
- [ ] Retry functionality works

### Edge Cases
- [ ] Duplicate username/phone handled
- [ ] Duplicate certificate number handled
- [ ] Invalid OTP rejected
- [ ] Network failure handled
- [ ] Timeout handled
- [ ] Large image upload works
- [ ] Special characters in text fields

---

## Troubleshooting

### Common Issues

**Issue: "Certificate number already exists"**
- **Cause:** Partial registration created user but failed on certificates
- **Solution:** Backend should use database transactions to rollback on failure

**Issue: AsyncStorage data persists after registration**
- **Cause:** Cleanup not called or failed
- **Solution:** Ensure `clearOnboardingData()` is called only after successful response

**Issue: Map picker button stays disabled**
- **Cause:** One or more combo boxes (district/city/barangay) is empty
- **Solution:** Select all three location fields before using map picker

**Issue: Real-time validation not working**
- **Cause:** Debounce timer not set correctly or API endpoint issue
- **Solution:** Check debounce timeout (500ms) and verify API endpoints

**Issue: Image upload fails**
- **Cause:** File size too large or incorrect format
- **Solution:** Compress images, use quality: 0.8, check backend file size limits

---

## Summary

This registration system provides:
- ✅ **Progressive Data Collection** - Break complex forms into manageable steps
- ✅ **State Persistence** - URL params + AsyncStorage for seamless experience
- ✅ **Real-time Validation** - Instant feedback on username/phone availability
- ✅ **Interactive Features** - Map picker with drag-to-pin functionality
- ✅ **Error Handling** - User-friendly messages with retry options
- ✅ **Data Cleanup** - Automatic cleanup after successful registration
- ✅ **Adaptability** - Easy to modify for customer registration

By following this documentation, you can implement a robust registration system for any type of user (service provider, customer, admin, etc.) with minimal modifications.

---

## Additional Resources

- **Expo Router Docs:** https://docs.expo.dev/router/introduction/
- **React Native AsyncStorage:** https://react-native-async-storage.github.io/async-storage/
- **OpenStreetMap Nominatim API:** https://nominatim.org/release-docs/develop/api/Search/
- **FormData API:** https://developer.mozilla.org/en-US/docs/Web/API/FormData

---

**Document Version:** 1.0  
**Last Updated:** October 4, 2025  
**Maintained By:** Development Team
