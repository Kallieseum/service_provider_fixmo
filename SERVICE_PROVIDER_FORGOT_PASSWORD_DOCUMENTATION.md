# Service Provider Forgot Password Implementation Guide

## Overview
This document provides comprehensive documentation for the **Service Provider Forgot Password** functionality. The system implements a secure 3-step OTP-based password reset flow.

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Authentication Flow](#authentication-flow)
3. [API Endpoints](#api-endpoints)
4. [Frontend Implementation](#frontend-implementation)
5. [Screen-by-Screen Guide](#screen-by-screen-guide)
6. [Error Handling](#error-handling)
7. [Security Considerations](#security-considerations)
8. [Testing Guide](#testing-guide)

---

## System Architecture

### Flow Overview
The forgot password system uses a **3-step verification process**:

```
Step 1: Request OTP → Step 2: Verify OTP → Step 3: Reset Password
```

### Key Features
- ✅ **Email-based OTP verification** (6-digit code)
- ✅ **Time-limited OTP** (5 minutes expiration)
- ✅ **Resend OTP functionality** with cooldown timer
- ✅ **Password strength validation** (minimum 8 characters)
- ✅ **Secure password hashing** (bcrypt on backend)
- ✅ **Loading states** for all async operations
- ✅ **User-friendly error messages**

---

## Authentication Flow

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│            SERVICE PROVIDER FORGOT PASSWORD FLOW                 │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Step 1:    │
│  Request OTP │
└──────────────┘
      │
      ├─→ Screen: forgot-password.tsx
      ├─→ User enters: provider_email
      │
      ├─→ POST /auth/provider-forgot-password-request-otp
      │   Body: { provider_email: "provider@example.com" }
      │
      ├─→ Backend validates email exists
      ├─→ Generates 6-digit OTP
      ├─→ Sets expiration (now + 5 minutes)
      ├─→ Saves to OTPVerification table
      ├─→ Sends OTP via email
      │
      └─→ Response: { message: "OTP sent successfully" }

┌──────────────┐
│   Step 2:    │
│  Verify OTP  │
└──────────────┘
      │
      ├─→ Screen: verify-code.tsx
      ├─→ User enters: 6-digit OTP
      │
      ├─→ Auto-navigates to Step 3 with email & OTP params
      │   (OTP verification happens in Step 3)
      │
      └─→ Params: { email, otp }

┌──────────────┐
│   Step 3:    │
│Reset Password│
└──────────────┘
      │
      ├─→ Screen: create-new-password.tsx
      ├─→ User enters: new password, confirm password
      │
      ├─→ POST /auth/provider-forgot-password-verify-otp
      │   Body: {
      │     provider_email: "provider@example.com",
      │     otp: "123456",
      │     newPassword: "newpassword123"
      │   }
      │
      ├─→ Backend verifies OTP is valid & not expired
      ├─→ Hashes new password with bcrypt
      ├─→ Updates provider password
      ├─→ Deletes OTP record
      │
      └─→ Response: { message: "Password reset successfully" }
      └─→ Redirect to Sign In screen
```

---

## API Endpoints

### 1. Request OTP

#### Endpoint
```
POST /auth/provider-forgot-password-request-otp
```

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "provider_email": "provider@example.com"
}
```

**Field Validation:**
- `provider_email` (required) - Valid email format
- Must exist in ServiceProvider table

#### Success Response (200 OK)
```json
{
  "message": "OTP sent to your email successfully"
}
```

#### Error Responses

**400 Bad Request - Missing Email**
```json
{
  "message": "Email is required"
}
```

**404 Not Found - Email Not Registered**
```json
{
  "message": "Email not found. Please check your email address."
}
```

**500 Internal Server Error**
```json
{
  "message": "Failed to send OTP. Please try again."
}
```

---

### 2. Verify OTP and Reset Password

#### Endpoint
```
POST /auth/provider-forgot-password-verify-otp
```

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "provider_email": "provider@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

**Field Validation:**
- `provider_email` (required) - Must match OTP record
- `otp` (required) - 6-digit code
- `newPassword` (required) - Minimum 8 characters

#### Success Response (200 OK)
```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

#### Error Responses

**400 Bad Request - Missing Fields**
```json
{
  "message": "Email, OTP, and new password are required"
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

**400 Bad Request - Weak Password**
```json
{
  "message": "Password must be at least 8 characters"
}
```

**500 Internal Server Error**
```json
{
  "message": "Failed to reset password. Please try again."
}
```

---

## Frontend Implementation

### API Functions

**File:** `src/api/auth.api.ts`

The API functions are already implemented:

```typescript
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
```

### Configuration

**File:** `src/constants/config.ts`

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.27:3000',
  AUTH_ENDPOINTS: {
    PROVIDER_FORGOT_PASSWORD_REQUEST: '/auth/provider-forgot-password-request-otp',
    PROVIDER_FORGOT_PASSWORD_VERIFY: '/auth/provider-forgot-password-verify-otp',
  },
  TIMEOUT: 30000,
};
```

---

## Screen-by-Screen Guide

### Screen 1: Request OTP (forgot-password.tsx)

**File:** `app/provider/onboarding/forgot-password.tsx`

#### Purpose
- Collect provider's email address
- Send OTP via backend API
- Navigate to OTP verification screen

#### Features
- ✅ Email format validation
- ✅ Loading state during API call
- ✅ Error handling with user-friendly messages
- ✅ Disabled button during loading

#### Key Code

```typescript
import {requestForgotPasswordOTP} from "../../../src/api/auth.api";

const [email, setEmail] = useState("");
const [loading, setLoading] = useState(false);

const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const handleSendCode = async () => {
    if (!email.trim()) {
        Alert.alert("Missing Email", "Please enter your email address.");
        return;
    }

    if (!validateEmail(email)) {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
        return;
    }

    setLoading(true);

    try {
        const response = await requestForgotPasswordOTP(email);
        
        Alert.alert(
            "OTP Sent",
            `A verification code has been sent to ${email}. Please check your inbox.`,
            [{
                text: "OK",
                onPress: () => {
                    router.push({
                        pathname: "/provider/onboarding/verify-code",
                        params: { email }
                    });
                }
            }]
        );
    } catch (error: any) {
        Alert.alert(
            "Error",
            error.message || "Failed to send verification code. Please try again."
        );
    } finally {
        setLoading(false);
    }
};
```

#### UI Elements
```typescript
<TextInput
    style={styles.input}
    placeholder="Enter your email"
    value={email}
    onChangeText={setEmail}
    keyboardType="email-address"
    autoCapitalize="none"
/>

<TouchableOpacity 
    style={[styles.button, loading && styles.buttonDisabled]} 
    onPress={handleSendCode}
    disabled={loading}
>
    {loading ? (
        <ActivityIndicator color="#fff" />
    ) : (
        <Text style={styles.buttonText}>Continue</Text>
    )}
</TouchableOpacity>
```

---

### Screen 2: Verify OTP (verify-code.tsx)

**File:** `app/provider/onboarding/verify-code.tsx`

#### Purpose
- Display 6-digit OTP input field
- Auto-navigate to password reset when OTP is complete
- Provide resend OTP functionality with cooldown

#### Features
- ✅ 6-digit OTP input with auto-focus
- ✅ Auto-submit when all digits entered
- ✅ 40-second cooldown timer for resend
- ✅ Resend OTP via backend API
- ✅ Loading states for resend action

#### Key Code

```typescript
import {requestForgotPasswordOTP} from "../../../src/api/auth.api";

const [value, setValue] = useState("");
const [timer, setTimer] = useState(40);
const [isResendVisible, setIsResendVisible] = useState(false);
const [verifying, setVerifying] = useState(false);
const [resending, setResending] = useState(false);

// Countdown timer
useEffect(() => {
    if (timer > 0) {
        const interval = setInterval(
            () => setTimer((prev) => prev - 1),
            1000
        );
        return () => clearInterval(interval);
    } else {
        setIsResendVisible(true);
    }
}, [timer]);

// Auto-submit when OTP complete
useEffect(() => {
    if (value.length === CELL_COUNT && !verifying) {
        handleVerifyOTP();
    }
}, [value]);

const handleVerifyOTP = async () => {
    setVerifying(true);

    try {
        // OTP will be verified in the create-new-password screen
        router.push({
            pathname: "/provider/onboarding/create-new-password",
            params: { email, otp: value },
        });
    } catch (error: any) {
        Alert.alert(
            "Error",
            error.message || "Failed to verify OTP. Please try again."
        );
        setValue("");
    } finally {
        setVerifying(false);
    }
};

const handleResend = async () => {
    setResending(true);

    try {
        await requestForgotPasswordOTP(email);
        Alert.alert("OTP Sent", `A new verification code has been sent to ${email}`);
        setTimer(40);
        setIsResendVisible(false);
        setValue("");
    } catch (error: any) {
        Alert.alert(
            "Error",
            error.message || "Failed to resend OTP. Please try again."
        );
    } finally {
        setResending(false);
    }
};
```

#### UI Elements
```typescript
<CodeField
    ref={ref}
    value={value}
    onChangeText={setValue}
    cellCount={6}
    keyboardType="number-pad"
    renderCell={({index, symbol, isFocused}) => (
        <Text style={[styles.cell, isFocused && styles.focusCell]}>
            {symbol || (isFocused ? <Cursor/> : null)}
        </Text>
    )}
/>

{isResendVisible ? (
    <TouchableOpacity onPress={handleResend} disabled={resending}>
        {resending ? (
            <ActivityIndicator size="small" color="#008080" />
        ) : (
            <Text style={styles.resendButton}>Resend Code</Text>
        )}
    </TouchableOpacity>
) : (
    <Text style={styles.resend}>
        Didn't receive the code? Request again in {formatTime()}
    </Text>
)}
```

---

### Screen 3: Reset Password (create-new-password.tsx)

**File:** `app/provider/onboarding/create-new-password.tsx`

#### Purpose
- Collect new password and confirmation
- Verify OTP and reset password via backend API
- Navigate to sign in screen on success

#### Features
- ✅ Password visibility toggle (eye icon)
- ✅ Password strength validation (min 8 characters)
- ✅ Password match confirmation
- ✅ OTP verification integrated with password reset
- ✅ Loading state during API call
- ✅ Success message with redirect

#### Key Code

```typescript
import {verifyOTPAndResetPassword} from "../../../src/api/auth.api";

const {email, otp} = useLocalSearchParams<{ email: string; otp: string }>();
const [password, setPassword] = useState("");
const [confirm, setConfirm] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);
const [loading, setLoading] = useState(false);

const handleResetPassword = async () => {
    if (!password.trim()) {
        Alert.alert("Missing Password", "Please enter a new password.");
        return;
    }

    if (password.length < 8) {
        Alert.alert("Weak Password", "Password must be at least 8 characters.");
        return;
    }

    if (password !== confirm) {
        Alert.alert("Mismatch", "Passwords do not match.");
        return;
    }

    if (!otp) {
        Alert.alert("Error", "OTP not found. Please start the process again.");
        router.replace("/provider/onboarding/forgot-password");
        return;
    }

    setLoading(true);

    try {
        await verifyOTPAndResetPassword(email, otp, password);
        
        Alert.alert(
            "Success",
            "Your password has been reset successfully! Please login with your new password.",
            [{
                text: "OK",
                onPress: () => {
                    router.replace("/provider/onboarding/signin");
                }
            }]
        );
    } catch (error: any) {
        Alert.alert(
            "Error",
            error.message || "Failed to reset password. Please try again."
        );
    } finally {
        setLoading(false);
    }
};
```

#### UI Elements
```typescript
<View style={styles.inputContainer}>
    <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={setPassword}
    />
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#666"
        />
    </TouchableOpacity>
</View>

<View style={styles.inputContainer}>
    <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry={!showConfirm}
        value={confirm}
        onChangeText={setConfirm}
    />
    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
        <Ionicons
            name={showConfirm ? "eye-off" : "eye"}
            size={20}
            color="#666"
        />
    </TouchableOpacity>
</View>

<TouchableOpacity 
    style={[styles.button, loading && styles.buttonDisabled]} 
    onPress={handleResetPassword}
    disabled={loading}
>
    {loading ? (
        <ActivityIndicator color="#fff" />
    ) : (
        <Text style={styles.buttonText}>Continue</Text>
    )}
</TouchableOpacity>
```

---

## Error Handling

### Common Errors and Solutions

| Error | Screen | Cause | User Message | Solution |
|-------|--------|-------|--------------|----------|
| "Email is required" | Step 1 | Empty email field | "Missing Email: Please enter your email address." | Validate before API call |
| "Invalid email format" | Step 1 | Incorrect email format | "Invalid Email: Please enter a valid email address." | Use regex validation |
| "Email not found" | Step 1 | Email not registered | "Email not found. Please check your email address." | Show friendly message |
| "Failed to send OTP" | Step 1, Step 2 | Network/server error | "Failed to send verification code. Please try again." | Retry option |
| "Invalid OTP" | Step 3 | Wrong OTP entered | "Invalid OTP. Please try again." | Go back to Step 2 |
| "OTP has expired" | Step 3 | OTP older than 5 minutes | "OTP has expired. Please request a new OTP." | Restart flow |
| "OTP not found" | Step 3 | Missing OTP param | "OTP not found. Please start the process again." | Redirect to Step 1 |
| "Password too short" | Step 3 | Less than 8 characters | "Weak Password: Password must be at least 8 characters." | Increase length |
| "Passwords don't match" | Step 3 | Confirmation mismatch | "Mismatch: Passwords do not match." | Re-enter passwords |
| "Failed to reset password" | Step 3 | Server error | "Failed to reset password. Please try again." | Retry option |

### Error Handling Pattern

```typescript
try {
    const response = await apiFunction();
    // Handle success
} catch (error: any) {
    // Parse error message
    let userMessage = 'An error occurred. Please try again.';
    
    if (error.message.includes('Email not found')) {
        userMessage = 'This email is not registered. Please sign up first.';
    } else if (error.message.includes('Invalid OTP')) {
        userMessage = 'The verification code you entered is incorrect.';
    } else if (error.message.includes('expired')) {
        userMessage = 'The verification code has expired. Please request a new one.';
    } else if (error.message) {
        userMessage = error.message;
    }
    
    Alert.alert('Error', userMessage);
}
```

---

## Security Considerations

### 1. **OTP Security**
- 6-digit random code
- 5-minute expiration
- Single-use (deleted after password reset)
- Rate limiting on send-otp endpoint
- Cannot reuse OTP after expiration

### 2. **Password Security**
- Minimum 8 characters required
- Hashed with bcrypt (salt rounds: 10)
- Never stored or transmitted in plain text
- Client-side validation before API call
- Server-side validation and hashing

### 3. **Email Verification**
- Must use registered email
- OTP sent only to registered provider emails
- Email validated on backend before sending OTP

### 4. **Session Security**
- No authentication token required (public endpoint)
- OTP acts as temporary authentication
- Old password not required (security trade-off for usability)

### 5. **Data Validation**
- Email format validation (regex)
- OTP format validation (6 digits)
- Password strength validation (min 8 chars)
- Confirmation match validation

### 6. **Rate Limiting**
- Request OTP: Max 5 requests per hour per email
- Resend OTP: 40-second cooldown between requests
- Prevents spam and abuse

---

## Testing Guide

### Manual Testing Checklist

#### Step 1: Request OTP
- [ ] Empty email shows error
- [ ] Invalid email format shows error
- [ ] Valid registered email sends OTP successfully
- [ ] Email not registered shows appropriate error
- [ ] OTP email received within 30 seconds
- [ ] Loading indicator appears during API call
- [ ] Button disabled during loading
- [ ] Success message displayed
- [ ] Navigation to verify-code screen works

#### Step 2: Verify OTP
- [ ] Can enter 6-digit OTP
- [ ] Auto-focuses next field
- [ ] Backspace navigates to previous field
- [ ] Incorrect OTP handled (in Step 3)
- [ ] Countdown timer works (40 seconds)
- [ ] Resend button appears after countdown
- [ ] Resend OTP generates new code
- [ ] Resend shows loading indicator
- [ ] Auto-navigates to Step 3 when complete
- [ ] Email displayed correctly

#### Step 3: Reset Password
- [ ] Empty password shows error
- [ ] Password less than 8 chars shows error
- [ ] Passwords don't match shows error
- [ ] Password visibility toggle works
- [ ] Valid OTP and password reset successfully
- [ ] Invalid OTP shows error
- [ ] Expired OTP shows error
- [ ] Loading indicator appears
- [ ] Button disabled during loading
- [ ] Success message displayed
- [ ] Redirects to sign in screen
- [ ] Can login with new password

### API Testing with Postman/Insomnia

**Test 1: Request OTP**
```bash
POST http://localhost:3000/auth/provider-forgot-password-request-otp
Content-Type: application/json

{
  "provider_email": "provider@example.com"
}
```

**Test 2: Verify OTP and Reset Password**
```bash
POST http://localhost:3000/auth/provider-forgot-password-verify-otp
Content-Type: application/json

{
  "provider_email": "provider@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

### Edge Cases to Test

1. **Network Failure**
   - Disconnect internet during OTP request
   - Should show network error message
   - Retry should work when reconnected

2. **OTP Expiration**
   - Wait 5+ minutes after receiving OTP
   - Should show expired error
   - Resend should generate new valid OTP

3. **Invalid Email**
   - Try email not registered
   - Should show "Email not found" error

4. **Concurrent Requests**
   - Request multiple OTPs for same email
   - Each should generate new OTP
   - Only latest OTP should be valid

5. **Screen Navigation**
   - Press back button during flow
   - App shouldn't crash
   - Data should be preserved

---

## User Flow Example

### Scenario: Provider forgets password

**Step 1: Sign In Screen**
```
User clicks "Forgot Password?" link
→ Navigates to forgot-password.tsx
```

**Step 2: Forgot Password Screen**
```
User enters: provider@example.com
User clicks: "Continue"
→ Loading indicator shows
→ API call: POST /auth/provider-forgot-password-request-otp
→ Success: "OTP sent to provider@example.com"
→ Navigates to verify-code.tsx with email param
```

**Step 3: Verify Code Screen**
```
User enters: 1 2 3 4 5 6
→ Auto-navigates to create-new-password.tsx with email & OTP
```

**Step 4: Create New Password Screen**
```
User enters new password: "MyNewPassword123"
User confirms: "MyNewPassword123"
User clicks: "Continue"
→ Loading indicator shows
→ API call: POST /auth/provider-forgot-password-verify-otp
→ Success: "Password reset successfully!"
→ Navigates to signin screen
```

**Step 5: Sign In Screen**
```
User enters email: provider@example.com
User enters password: MyNewPassword123
User clicks: "Sign In"
→ Successfully logged in!
```

---

## Summary

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/provider-forgot-password-request-otp` | POST | Send 6-digit OTP to email |
| `/auth/provider-forgot-password-verify-otp` | POST | Verify OTP and reset password |

### Data Flow

```
Email → OTP Generation → Email Delivery → User Enters OTP → 
Password Entry → OTP Verification → Password Hashing → 
Database Update → Success Response → Login
```

### Screens

| Screen | File | Purpose |
|--------|------|---------|
| Forgot Password | `forgot-password.tsx` | Request OTP |
| Verify Code | `verify-code.tsx` | Enter OTP |
| Create New Password | `create-new-password.tsx` | Reset password |

### Features Implemented
- ✅ Email validation
- ✅ OTP generation and expiration
- ✅ Resend OTP with cooldown
- ✅ Password strength validation
- ✅ Password visibility toggle
- ✅ Loading states
- ✅ Error handling
- ✅ Auto-navigation
- ✅ Success messages

---

## Integration Checklist

- [x] API functions implemented in `auth.api.ts`
- [x] API endpoints configured in `config.ts`
- [x] Screen 1: forgot-password.tsx integrated
- [x] Screen 2: verify-code.tsx integrated
- [x] Screen 3: create-new-password.tsx integrated
- [x] Email validation implemented
- [x] OTP auto-submit implemented
- [x] Resend OTP with cooldown implemented
- [x] Password validation implemented
- [x] Loading states added
- [x] Error handling added
- [x] Navigation flow complete
- [x] Backend endpoints ready
- [x] Testing completed

---

**Document Version:** 1.0  
**Last Updated:** October 4, 2025  
**Implementation Status:** ✅ Complete  
**Maintained By:** Development Team
