# Customer Authentication System Documentation

## Overview
This document provides comprehensive documentation for the customer authentication system, covering **send-otp**, **verify-otp**, and **register** endpoints. The system implements a secure 3-step OTP-based email verification flow for customer registration.

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [Authentication Flow](#authentication-flow)
4. [API Endpoints](#api-endpoints)
5. [Frontend Integration](#frontend-integration)
6. [Complete Implementation Example](#complete-implementation-example)
7. [Error Handling](#error-handling)
8. [Security Considerations](#security-considerations)
9. [Testing Guide](#testing-guide)

---

## System Architecture

### Overview
The customer authentication system uses a **3-step verification process**:

```
Step 1: Send OTP → Step 2: Verify OTP → Step 3: Register Customer
```

### Key Features
- ✅ **Email-based OTP verification** (6-digit code)
- ✅ **Time-limited OTP** (5 minutes expiration)
- ✅ **Rate limiting protection** (prevents spam)
- ✅ **Real-time validation** (username, phone, email uniqueness)
- ✅ **Secure password hashing** (bcrypt)
- ✅ **JWT token generation** (immediate login after registration)
- ✅ **Image upload to Cloudinary** (profile photo, valid ID)
- ✅ **Email notifications** (OTP delivery, registration confirmation)

---

## Database Schema

### OTPVerification Table
Stores temporary OTP codes for email verification.

```prisma
model OTPVerification {
  id         Int      @id @default(autoincrement())
  email      String
  otp        String
  expires_at DateTime
  created_at DateTime @default(now())
  verified   Boolean  @default(false)
}
```

**Fields:**
- `id` - Auto-incrementing primary key
- `email` - Email address for verification
- `otp` - 6-digit verification code
- `expires_at` - Expiration timestamp (created_at + 5 minutes)
- `created_at` - Record creation timestamp
- `verified` - Boolean flag (false until OTP is verified)

### Customer Table
Stores registered customer information.

```prisma
model Customer {
  id                Int       @id @default(autoincrement())
  firstName         String    @map("first_name")
  lastName          String    @map("last_name")
  userName          String    @unique @map("userName")
  email             String    @unique
  password          String
  phoneNumber       String    @unique @map("phone_number")
  birthday          DateTime?
  userLocation      String?   @map("user_location")
  exactLocation     String?   @map("exact_location")
  profilePhoto      String?   @map("profile_photo")
  validId           String?   @map("valid_id")
  isVerified        Boolean   @default(false) @map("is_verified")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  
  @@map("customers")
}
```

**Key Fields:**
- `userName` - Unique username (UNIQUE constraint)
- `email` - Unique email address (UNIQUE constraint)
- `phoneNumber` - Unique phone number (UNIQUE constraint)
- `password` - Hashed password (bcrypt)
- `birthday` - Date of birth 
- `userLocation` - City/municipality level location 
- `exactLocation` - Coordinates "latitude,longitude" 
- `profilePhoto` - Cloudinary URL 
- `validId` - Cloudinary URL for ID verification 
- `isVerified` - Email verification status
- `createdAt` / `updatedAt` - Timestamps

---

## Authentication Flow

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER REGISTRATION FLOW                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Step 1:    │
│  Send OTP    │
└──────────────┘
      │
      ├─→ POST /auth/send-otp
      │   Body: { email: "customer@example.com" }
      │
      ├─→ Backend validates email format
      ├─→ Checks if email already registered
      ├─→ Generates 6-digit OTP
      ├─→ Sets expiration (now + 5 minutes)
      ├─→ Saves to OTPVerification table (verified: false)
      ├─→ Sends OTP via email
      │
      └─→ Response: { message: "OTP sent to email successfully" }

┌──────────────┐
│   Step 2:    │
│  Verify OTP  │
└──────────────┘
      │
      ├─→ POST /auth/verify-otp
      │   Body: { email: "customer@example.com", otp: "123456" }
      │
      ├─→ Backend finds OTP record by email
      ├─→ Validates OTP matches
      ├─→ Checks if expired (expires_at < now)
      ├─→ Updates verified = true
      ├─→ Keeps record for Step 3 validation
      │
      └─→ Response: { message: "Email verified successfully", verified: true }

┌──────────────┐
│   Step 3:    │
│   Register   │
└──────────────┘
      │
      ├─→ POST /auth/register
      │   Content-Type: multipart/form-data
      │   Body: {
      │     first_name, last_name, userName, email, password,
      │     phone_number, birthday, user_location, exact_location,
      │     profile_photo (file), valid_id (file)
      │   }
      │
      ├─→ Backend checks OTPVerification.verified = true
      ├─→ Validates all required fields
      ├─→ Checks uniqueness (email, userName, phoneNumber)
      ├─→ Hashes password with bcrypt
      ├─→ Uploads images to Cloudinary
      ├─→ Creates Customer record
      ├─→ Generates JWT token
      ├─→ Deletes OTPVerification record
      ├─→ Sends registration success email
      │
      └─→ Response: {
            message: "User registered successfully",
            token: "jwt_token_here",
            userId: 123,
            userName: "johndoe",
            profile_photo: "cloudinary_url",
            valid_id: "cloudinary_url"
          }
```

---

## API Endpoints

### 1. Send OTP

#### Endpoint
```
POST /auth/send-otp
```

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "customer@example.com"
}
```

**Field Validation:**
- `email` (required) - Valid email format
- Must not already be registered

#### Success Response (200 OK)
```json
{
  "message": "OTP sent to email successfully"
}
```

#### Error Responses

**400 Bad Request - Missing Email**
```json
{
  "message": "Email is required"
}
```

**400 Bad Request - Already Registered**
```json
{
  "message": "Email already registered. Please login."
}
```

**429 Too Many Requests - Rate Limited**
```json
{
  "message": "Too many requests. Please try again later."
}
```

**500 Internal Server Error**
```json
{
  "message": "Failed to send OTP. Please try again."
}
```

#### Backend Logic
```javascript
async function sendOTP(email) {
  // 1. Validate email format
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }
  
  // 2. Check if already registered
  const existingCustomer = await prisma.customer.findUnique({
    where: { email }
  });
  if (existingCustomer) {
    throw new Error('Email already registered');
  }
  
  // 3. Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 4. Set expiration (5 minutes)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  
  // 5. Upsert OTPVerification record
  await prisma.oTPVerification.upsert({
    where: { email },
    update: { otp, expires_at: expiresAt, verified: false },
    create: { email, otp, expires_at: expiresAt, verified: false }
  });
  
  // 6. Send OTP via email
  await sendEmail({
    to: email,
    subject: 'Your OTP Verification Code',
    html: `<p>Your OTP code is: <strong>${otp}</strong></p>
           <p>This code expires in 5 minutes.</p>`
  });
  
  return { message: 'OTP sent to email successfully' };
}
```

---

### 2. Verify OTP

#### Endpoint
```
POST /auth/verify-otp
```

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "customer@example.com",
  "otp": "123456"
}
```

**Field Validation:**
- `email` (required) - Must match the email from Step 1
- `otp` (required) - 6-digit code

#### Success Response (200 OK)
```json
{
  "message": "Email verified successfully. You can now proceed to registration.",
  "verified": true
}
```

#### Error Responses

**400 Bad Request - Missing Fields**
```json
{
  "message": "Email and OTP are required"
}
```

**400 Bad Request - Invalid OTP**
```json
{
  "message": "Invalid OTP. Please try again."
}
```

**400 Bad Request - Expired OTP**
```json
{
  "message": "OTP has expired. Please request a new OTP."
}
```

**200 OK - Already Verified**
```json
{
  "message": "Email already verified. You can proceed to registration.",
  "verified": true
}
```

#### Backend Logic
```javascript
async function verifyOTP(email, otp) {
  // 1. Find OTP record
  const otpRecord = await prisma.oTPVerification.findFirst({
    where: { email }
  });
  
  if (!otpRecord) {
    throw new Error('No OTP found for this email');
  }
  
  // 2. Check if already verified
  if (otpRecord.verified) {
    return { 
      message: 'Email already verified. You can proceed to registration.',
      verified: true 
    };
  }
  
  // 3. Validate OTP matches
  if (otpRecord.otp !== otp) {
    throw new Error('Invalid OTP. Please try again.');
  }
  
  // 4. Check if expired
  if (new Date() > otpRecord.expires_at) {
    throw new Error('OTP has expired. Please request a new OTP.');
  }
  
  // 5. Mark as verified
  await prisma.oTPVerification.update({
    where: { id: otpRecord.id },
    data: { verified: true }
  });
  
  return { 
    message: 'Email verified successfully. You can now proceed to registration.',
    verified: true 
  };
}
```

---

### 3. Register Customer

#### Endpoint
```
POST /auth/register
```

#### Request Headers
```
Content-Type: multipart/form-data
```

#### Request Body (FormData)

**Required Fields:**
```
first_name: string          // Customer's first name
last_name: string           // Customer's last name
userName: string            // Unique username (min 3 chars)
email: string               // Verified email from Steps 1 & 2
password: string            // Min 8 characters
phone_number: string        // Unique phone number (11 digits for PH)
birthday: string            // ISO date format (YYYY-MM-DD)
user_location: string       // City/municipality (e.g., "Quezon City, NCR")
exact_location: string      // Coordinates (e.g., "14.6760,121.0437")
profile_photo: File         // Image file (JPG, PNG)
valid_id: File              // Image file (JPG, PNG)
```

**Optional Fields:**
- All fields above are technically optional in the schema, but for a complete registration, most should be provided

#### Success Response (201 Created)
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 123,
  "userName": "johndoe",
  "profile_photo": "https://res.cloudinary.com/xxx/image/upload/v123456/profile.jpg",
  "valid_id": "https://res.cloudinary.com/xxx/image/upload/v123456/id.jpg"
}
```

**Response Fields:**
- `message` - Success message
- `token` - JWT token for immediate authentication
- `userId` - Customer ID in database
- `userName` - Username for display
- `profile_photo` - Cloudinary URL of uploaded profile photo
- `valid_id` - Cloudinary URL of uploaded ID

#### Error Responses

**400 Bad Request - Email Not Verified**
```json
{
  "message": "Email not verified. Please verify your email before registering."
}
```

**400 Bad Request - Missing Required Field**
```json
{
  "message": "first_name is required"
}
```

**409 Conflict - Duplicate Email**
```json
{
  "message": "Email already registered"
}
```

**409 Conflict - Duplicate Username**
```json
{
  "message": "Username already taken"
}
```

**409 Conflict - Duplicate Phone**
```json
{
  "message": "Phone number already registered"
}
```

**500 Internal Server Error**
```json
{
  "message": "Registration failed. Please try again."
}
```

#### Backend Logic
```javascript
async function registerCustomer(formData) {
  const {
    first_name, last_name, userName, email, password,
    phone_number, birthday, user_location, exact_location,
    profile_photo, valid_id
  } = formData;
  
  // 1. Check if email is verified
  const otpRecord = await prisma.oTPVerification.findFirst({
    where: { email }
  });
  
  if (!otpRecord || !otpRecord.verified) {
    throw new Error('Email not verified. Please verify your email before registering.');
  }
  
  // 2. Validate required fields
  if (!first_name || !last_name || !userName || !email || !password) {
    throw new Error('Required fields missing');
  }
  
  // 3. Check for duplicates
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      OR: [
        { email },
        { userName },
        { phoneNumber: phone_number }
      ]
    }
  });
  
  if (existingCustomer) {
    if (existingCustomer.email === email) {
      throw new Error('Email already registered');
    }
    if (existingCustomer.userName === userName) {
      throw new Error('Username already taken');
    }
    if (existingCustomer.phoneNumber === phone_number) {
      throw new Error('Phone number already registered');
    }
  }
  
  // 4. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // 5. Upload images to Cloudinary
  let profilePhotoUrl = null;
  let validIdUrl = null;
  
  if (profile_photo) {
    const result = await cloudinary.uploader.upload(profile_photo.path, {
      folder: 'customers/profiles',
      transformation: [{ width: 500, height: 500, crop: 'fill' }]
    });
    profilePhotoUrl = result.secure_url;
  }
  
  if (valid_id) {
    const result = await cloudinary.uploader.upload(valid_id.path, {
      folder: 'customers/ids'
    });
    validIdUrl = result.secure_url;
  }
  
  // 6. Create customer record
  const customer = await prisma.customer.create({
    data: {
      firstName: first_name,
      lastName: last_name,
      userName,
      email,
      password: hashedPassword,
      phoneNumber: phone_number,
      birthday: birthday ? new Date(birthday) : null,
      userLocation: user_location,
      exactLocation: exact_location,
      profilePhoto: profilePhotoUrl,
      validId: validIdUrl,
      isVerified: true
    }
  });
  
  // 7. Generate JWT token
  const token = jwt.sign(
    { userId: customer.id, email: customer.email, userType: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  // 8. Delete OTP record
  await prisma.oTPVerification.delete({
    where: { id: otpRecord.id }
  });
  
  // 9. Send registration success email
  await sendEmail({
    to: email,
    subject: 'Welcome to FixMo!',
    html: `<h1>Welcome ${first_name}!</h1>
           <p>Your account has been successfully created.</p>`
  });
  
  return {
    message: 'User registered successfully',
    token,
    userId: customer.id,
    userName: customer.userName,
    profile_photo: profilePhotoUrl,
    valid_id: validIdUrl
  };
}
```

---

## Frontend Integration

### API Client Setup

**File:** `src/api/auth.api.ts`

```typescript
import { API_CONFIG } from '../constants/config';

// ============================================
// CUSTOMER AUTHENTICATION TYPES
// ============================================

export interface CustomerSendOTPRequest {
  email: string;
}

export interface CustomerSendOTPResponse {
  message: string;
}

export interface CustomerVerifyOTPRequest {
  email: string;
  otp: string;
}

export interface CustomerVerifyOTPResponse {
  message: string;
  verified: boolean;
}

export interface CustomerRegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  password: string;
  phoneNumber: string;
  birthday?: string;
  userLocation?: string;
  exactLocation?: string;
  profilePhoto?: any; // File object
  validId?: any; // File object
}

export interface CustomerRegisterResponse {
  message: string;
  token: string;
  userId: number;
  userName: string;
  profile_photo?: string;
  valid_id?: string;
}

// ============================================
// CUSTOMER AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Step 1: Send OTP to customer email
 */
export const sendCustomerOTP = async (
  email: string
): Promise<CustomerSendOTPResponse> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/auth/send-otp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }

    return data;
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Step 2: Verify OTP for customer email
 */
export const verifyCustomerOTP = async (
  email: string,
  otp: string
): Promise<CustomerVerifyOTPResponse> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/auth/verify-otp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Invalid OTP');
    }

    return data;
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    throw new Error(error.message || 'OTP verification failed');
  }
};

/**
 * Step 3: Register customer with verified email
 */
export const registerCustomer = async (
  formData: FormData
): Promise<CustomerRegisterResponse> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/auth/register`,
      {
        method: 'POST',
        body: formData,
        // Don't set Content-Type for FormData, browser sets it with boundary
      }
    );

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || 'Registration failed';
      
      // Parse specific errors
      if (errorMessage.includes('Email not verified')) {
        throw new Error('Please verify your email before registering.');
      }
      if (errorMessage.includes('Username already taken')) {
        throw new Error('This username is already taken. Please choose another.');
      }
      if (errorMessage.includes('Email already registered')) {
        throw new Error('This email is already registered. Please login.');
      }
      if (errorMessage.includes('Phone number already registered')) {
        throw new Error('This phone number is already registered.');
      }
      
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    console.error('Registration Error:', error);
    
    if (error.message) {
      throw error;
    }
    
    throw new Error('Network error. Please check your connection and try again.');
  }
};

/**
 * Check username availability
 */
export const checkCustomerUsernameAvailability = async (
  userName: string
): Promise<{ available: boolean }> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/auth/check-username`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName }),
      }
    );

    const data = await response.json();
    return { available: data.available || false };
  } catch (error) {
    console.error('Username check error:', error);
    return { available: false };
  }
};

/**
 * Check phone availability
 */
export const checkCustomerPhoneAvailability = async (
  phoneNumber: string
): Promise<{ available: boolean }> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/auth/check-phone`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      }
    );

    const data = await response.json();
    return { available: data.available || false };
  } catch (error) {
    console.error('Phone check error:', error);
    return { available: false };
  }
};
```

### Configuration

**File:** `src/constants/config.ts`

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.27:3000',
  AUTH_ENDPOINTS: {
    // Customer endpoints
    CUSTOMER_SEND_OTP: '/auth/send-otp',
    CUSTOMER_VERIFY_OTP: '/auth/verify-otp',
    CUSTOMER_REGISTER: '/auth/register',
    CUSTOMER_LOGIN: '/auth/login',
    CUSTOMER_CHECK_USERNAME: '/auth/check-username',
    CUSTOMER_CHECK_PHONE: '/auth/check-phone',
    
    // Provider endpoints (for reference)
    PROVIDER_REQUEST_OTP: '/auth/provider/send-otp',
    PROVIDER_VERIFY_OTP: '/auth/provider/verify-otp',
    PROVIDER_REGISTER: '/auth/provider/register',
    PROVIDER_LOGIN: '/auth/provider-login',
  },
  TIMEOUT: 30000, // 30 seconds
};

export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  RESEND_COOLDOWN_SECONDS: 60,
};
```

---

## Complete Implementation Example

### Screen 1: Email Input

**File:** `app/customer/auth/EmailScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { sendCustomerOTP } from '../../../src/api/auth.api';

export default function EmailScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await sendCustomerOTP(email);
      
      Alert.alert(
        'Success',
        'OTP has been sent to your email. Please check your inbox.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.push({
                pathname: '/customer/auth/OTPScreen',
                params: { email }
              });
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FixMo</Text>
      <Text style={styles.subtitle}>Enter your email to get started</Text>

      <TextInput
        style={styles.input}
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSendOTP}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#008080',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

### Screen 2: OTP Verification

**File:** `app/customer/auth/OTPScreen.tsx`

```typescript
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { verifyCustomerOTP, sendCustomerOTP } from '../../../src/api/auth.api';

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOTPChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every(digit => digit) && index === 5) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await verifyCustomerOTP(params.email, code);
      
      Alert.alert(
        'Success',
        'Email verified successfully!',
        [
          {
            text: 'Continue',
            onPress: () => {
              router.push({
                pathname: '/customer/auth/RegisterScreen',
                params: { email: params.email }
              });
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendCustomerOTP(params.email);
      setResendCooldown(60);
      Alert.alert('Success', 'A new OTP has been sent to your email');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>
        We've sent a 6-digit code to{'\n'}
        <Text style={styles.email}>{params.email}</Text>
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputRefs.current[index] = ref)}
            style={styles.otpInput}
            value={digit}
            onChangeText={text => handleOTPChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            editable={!loading}
          />
        ))}
      </View>

      {loading && (
        <ActivityIndicator size="large" color="#008080" style={{ marginTop: 20 }} />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleVerifyOTP()}
        disabled={loading || otp.some(d => !d)}
      >
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleResendOTP}
        disabled={resendCooldown > 0}
        style={{ marginTop: 20 }}
      >
        <Text style={[styles.resendText, resendCooldown > 0 && styles.resendDisabled]}>
          {resendCooldown > 0
            ? `Resend OTP in ${resendCooldown}s`
            : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  email: {
    fontWeight: 'bold',
    color: '#008080',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#008080',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendText: {
    color: '#008080',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  resendDisabled: {
    color: '#ccc',
  },
});
```

### Screen 3: Registration Form

**File:** `app/customer/auth/RegisterScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { registerCustomer } from '../../../src/api/auth.api';

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    password: '',
    phoneNumber: '',
    birthday: '',
    userLocation: '',
    exactLocation: '',
  });
  
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [validId, setValidId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async (type: 'profile' | 'id') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      if (type === 'profile') {
        setProfilePhoto(result.assets[0].uri);
      } else {
        setValidId(result.assets[0].uri);
      }
    }
  };

  const validateForm = (): boolean => {
    const required = [
      { field: 'firstName', label: 'First Name' },
      { field: 'lastName', label: 'Last Name' },
      { field: 'userName', label: 'Username' },
      { field: 'password', label: 'Password' },
      { field: 'phoneNumber', label: 'Phone Number' },
    ];

    for (const { field, label } of required) {
      if (!formData[field as keyof typeof formData].trim()) {
        Alert.alert('Missing Field', `Please enter your ${label}`);
        return false;
      }
    }

    if (formData.password.length < 8) {
      Alert.alert('Invalid Password', 'Password must be at least 8 characters');
      return false;
    }

    if (formData.phoneNumber.length !== 11) {
      Alert.alert('Invalid Phone', 'Phone number must be 11 digits');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const form = new FormData();
      
      // Add text fields
      form.append('email', params.email);
      form.append('first_name', formData.firstName);
      form.append('last_name', formData.lastName);
      form.append('userName', formData.userName);
      form.append('password', formData.password);
      form.append('phone_number', formData.phoneNumber);
      
      if (formData.birthday) form.append('birthday', formData.birthday);
      if (formData.userLocation) form.append('user_location', formData.userLocation);
      if (formData.exactLocation) form.append('exact_location', formData.exactLocation);

      // Add images
      if (profilePhoto) {
        form.append('profile_photo', {
          uri: profilePhoto,
          type: 'image/jpeg',
          name: 'profile.jpg',
        } as any);
      }

      if (validId) {
        form.append('valid_id', {
          uri: validId,
          type: 'image/jpeg',
          name: 'id.jpg',
        } as any);
      }

      const response = await registerCustomer(form);

      // Save token for authentication
      // await AsyncStorage.setItem('authToken', response.token);
      // await AsyncStorage.setItem('userId', response.userId.toString());

      Alert.alert(
        'Success',
        'Account created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/customer/home');
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Complete your profile</Text>

      {/* Profile Photo */}
      <TouchableOpacity onPress={() => pickImage('profile')} style={styles.photoButton}>
        {profilePhoto ? (
          <Image source={{ uri: profilePhoto }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Form Fields */}
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={formData.firstName}
        onChangeText={text => updateField('firstName', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={formData.lastName}
        onChangeText={text => updateField('lastName', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={formData.userName}
        onChangeText={text => updateField('userName', text)}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password (min 8 characters)"
        value={formData.password}
        onChangeText={text => updateField('password', text)}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number (11 digits)"
        value={formData.phoneNumber}
        onChangeText={text => updateField('phoneNumber', text.replace(/[^0-9]/g, ''))}
        keyboardType="phone-pad"
        maxLength={11}
      />

      <TextInput
        style={styles.input}
        placeholder="Birthday (YYYY-MM-DD)"
        value={formData.birthday}
        onChangeText={text => updateField('birthday', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Location (City, District)"
        value={formData.userLocation}
        onChangeText={text => updateField('userLocation', text)}
      />

      {/* Valid ID */}
      <TouchableOpacity onPress={() => pickImage('id')} style={styles.idButton}>
        <Text style={styles.idButtonText}>
          {validId ? '✓ ID Uploaded' : 'Upload Valid ID'}
        </Text>
      </TouchableOpacity>

      {/* Register Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  photoButton: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    color: '#666',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  idButton: {
    borderWidth: 1,
    borderColor: '#008080',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  idButtonText: {
    color: '#008080',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#008080',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

---

## Error Handling

### Common Errors and Solutions

| Error Code | Error Message | Cause | Solution |
|------------|---------------|-------|----------|
| 400 | "Email is required" | Missing email in request | Validate form before submission |
| 400 | "Email already registered" | Duplicate email | Show login option instead |
| 400 | "Invalid OTP" | Wrong OTP entered | Allow user to re-enter |
| 400 | "OTP has expired" | OTP older than 5 minutes | Resend new OTP |
| 400 | "Email not verified" | Attempting to register without verifying OTP | Redirect to OTP screen |
| 409 | "Username already taken" | Duplicate username | Use real-time validation |
| 409 | "Phone number already registered" | Duplicate phone | Use real-time validation |
| 429 | "Too many requests" | Rate limit exceeded | Show cooldown message |
| 500 | "Registration failed" | Server error | Show retry button |

### Error Handling Best Practices

```typescript
try {
  const response = await registerCustomer(formData);
  // Handle success
} catch (error: any) {
  // Parse error message
  let userMessage = 'An error occurred. Please try again.';
  
  if (error.message.includes('Email not verified')) {
    userMessage = 'Please verify your email first';
    // Redirect to OTP screen
  } else if (error.message.includes('Username already taken')) {
    userMessage = 'This username is not available';
    // Highlight username field
  } else if (error.message.includes('already registered')) {
    userMessage = 'An account with these details already exists';
    // Show login option
  } else if (error.message) {
    userMessage = error.message;
  }
  
  Alert.alert('Error', userMessage);
}
```

---

## Security Considerations

### 1. **Password Security**
- Minimum 8 characters required
- Hashed with bcrypt (salt rounds: 10)
- Never stored or transmitted in plain text
- Consider adding password strength requirements

### 2. **OTP Security**
- 6-digit random code
- 5-minute expiration
- Single-use (deleted after registration)
- Rate limiting on send-otp endpoint
- Verified flag prevents reuse

### 3. **Data Validation**
- Email format validation
- Phone number format validation (11 digits for PH)
- Username uniqueness check
- Age validation (if birthday required)
- Input sanitization to prevent injection

### 4. **JWT Token**
- Signed with secret key
- 30-day expiration
- Includes userId, email, userType
- Store securely on client (AsyncStorage/SecureStore)

### 5. **File Upload Security**
- File type validation (images only)
- File size limits
- Cloudinary transformation (resize, optimize)
- Secure URL generation

### 6. **Rate Limiting**
- Send OTP: Max 5 requests per hour per email
- Register: Max 10 requests per hour per IP
- Prevents spam and abuse

---

## Testing Guide

### Manual Testing Checklist

#### Step 1: Send OTP
- [ ] Valid email sends OTP successfully
- [ ] Invalid email format shows error
- [ ] Already registered email shows error
- [ ] OTP email received within 30 seconds
- [ ] Rate limiting works (after 5 attempts)

#### Step 2: Verify OTP
- [ ] Correct OTP verifies successfully
- [ ] Incorrect OTP shows error
- [ ] Expired OTP (after 5 minutes) shows error
- [ ] Already verified OTP allows proceed
- [ ] Resend OTP generates new code

#### Step 3: Register
- [ ] Complete form submits successfully
- [ ] Missing required fields show errors
- [ ] Duplicate username shows error
- [ ] Duplicate email shows error
- [ ] Duplicate phone shows error
- [ ] Password less than 8 chars shows error
- [ ] Images upload successfully
- [ ] JWT token returned
- [ ] OTP record deleted after registration
- [ ] Welcome email sent

### API Testing with Postman/Insomnia

**Test 1: Send OTP**
```bash
POST http://localhost:3000/auth/send-otp
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Test 2: Verify OTP**
```bash
POST http://localhost:3000/auth/verify-otp
Content-Type: application/json

{
  "email": "test@example.com",
  "otp": "123456"
}
```

**Test 3: Register**
```bash
POST http://localhost:3000/auth/register
Content-Type: multipart/form-data

first_name: John
last_name: Doe
userName: johndoe
email: test@example.com
password: password123
phone_number: 09123456789
birthday: 1990-01-01
user_location: Quezon City, NCR
exact_location: 14.6760,121.0437
profile_photo: [FILE]
valid_id: [FILE]
```

---

## Summary

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/send-otp` | POST | Send 6-digit OTP to email |
| `/auth/verify-otp` | POST | Verify OTP and mark as verified |
| `/auth/register` | POST | Register customer with verified email |
| `/auth/check-username` | POST | Check username availability |
| `/auth/check-phone` | POST | Check phone availability |

### Data Flow

```
Email → OTP Generation → Email Delivery → User Enters OTP → 
Verification → Registration Form → Form Validation → 
Uniqueness Checks → Password Hashing → Image Upload → 
Database Creation → JWT Generation → Success Response
```

### Security Features
- ✅ Email verification required
- ✅ OTP expiration (5 minutes)
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Uniqueness validation
- ✅ Rate limiting
- ✅ Secure file uploads

### Best Practices
- ✅ Validate inputs on frontend
- ✅ Check uniqueness in real-time
- ✅ Show clear error messages
- ✅ Provide retry options
- ✅ Store tokens securely
- ✅ Handle network errors gracefully

---

**Document Version:** 1.0  
**Last Updated:** October 4, 2025  
**Based on:** Prisma Schema & OTP Verification System  
**Maintained By:** Development Team
