# Basic Information Screen Enhancements

## Overview
Enhanced the basic information screen (`basicinfo.tsx`) with advanced validation, photo selection options, age restrictions, and real-time availability checks for username and phone number.

## ✅ Implemented Features

### 1. Photo Upload Options
Users can now choose how to add their profile photo:

**Options:**
- 📷 **Take Photo**: Open camera to capture a new photo
- 🖼️ **Choose from Gallery**: Select an existing photo from device gallery

**Implementation:**
```typescript
const selectPhotoOption = () => {
    if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(...);
    } else {
        Alert.alert('Select Photo', 'Choose an option', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Take Photo', onPress: openCamera },
            { text: 'Choose from Gallery', onPress: openGallery },
        ]);
    }
};
```

**Permissions:**
- Camera permission for taking photos
- Media library permission for selecting from gallery
- Both use `expo-image-picker` with aspect ratio 1:1 and quality 0.8

---

### 2. Age Validation (18-100 years)

**Minimum Age: 18 years**
- Users must be at least 18 years old to register
- DatePicker `maximumDate` set to 18 years ago from today

**Maximum Age: 100 years**
- Prevents unrealistic birth dates
- DatePicker `minimumDate` set to 100 years ago from today

**Implementation:**
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

const getMaxDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
};

const getMinDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 100);
    return date;
};
```

**Validation Messages:**
- "You must be at least 18 years old to register."
- "Please enter a valid date of birth."
- "Age must be between 18 and 100 years."

---

### 3. Email Field Disabled

**Why Disabled?**
- Email is already verified via OTP in the previous screen
- Prevents users from changing email after verification
- Ensures data consistency throughout the flow

**Visual Indication:**
- Gray background (#e0e0e0)
- Grayed out text (#666)
- `editable={false}` prop

**Implementation:**
```typescript
<TextInput
    style={[styles.input, styles.disabledInput]}
    value={email}
    editable={false}
    keyboardType="email-address"
/>
```

---

### 4. Real-Time Username Availability Check

**Features:**
- ⏱️ **500ms Debounce**: Prevents API spam while typing
- ✅ **Available**: Green checkmark + green border
- ❌ **Taken**: Red X + red border
- 🔄 **Checking**: Loading spinner
- Minimum 3 characters required

**Visual States:**

| State | Icon | Input Style | Message |
|-------|------|-------------|---------|
| None | - | Default | - |
| Checking | Spinner | Default | "Checking availability..." |
| Available | ✓ Green | Green border + background | "Username is available" |
| Taken | ✗ Red | Red border + background | "Username is already taken" |

**API Integration:**
```typescript
// Endpoint: POST /auth/check-username
// Body: { username: string }
// Response: { available: boolean, message: string }

useEffect(() => {
    if (username.length < 3) {
        setUsernameStatus('none');
        return;
    }

    setUsernameStatus('checking');
    
    const timeout = setTimeout(async () => {
        const result = await checkUsernameAvailability(username);
        setUsernameStatus(result.available ? 'available' : 'taken');
        setUsernameMessage(result.message);
    }, 500);

    return () => clearTimeout(timeout);
}, [username]);
```

**Validation:**
- Prevents submission if username is taken
- Prevents submission while checking
- Must be at least 3 characters

---

### 5. Real-Time Phone Number Availability Check

**Features:**
- ⏱️ **500ms Debounce**: Prevents API spam while typing
- 📱 **10-Digit Limit**: Enforced via `maxLength={10}`
- ✅ **Available**: Green checkmark + green border
- ❌ **Taken**: Red X + red border
- 🔄 **Checking**: Loading spinner
- Only numeric input allowed

**Visual States:**

| State | Icon | Input Style | Message |
|-------|------|-------------|---------|
| None | - | Default | - |
| Checking | Spinner | Default | "Checking availability..." |
| Available | ✓ Green | Green border + background | "Phone number is available" |
| Taken | ✗ Red | Red border + background | "Phone number is already registered" |
| Invalid | - | Default | "Phone must be 10 digits" |

**Input Filtering:**
```typescript
onChangeText={(text) => {
    // Remove non-numeric characters
    const numericText = text.replace(/[^0-9]/g, '');
    // Limit to 10 digits
    if (numericText.length <= 10) {
        setPhone(numericText);
    }
}}
```

**API Integration:**
```typescript
// Endpoint: POST /auth/check-phone
// Body: { phone_number: string }
// Response: { available: boolean, message: string }

useEffect(() => {
    if (phone.length !== 10) {
        setPhoneStatus('none');
        return;
    }

    setPhoneStatus('checking');
    
    const timeout = setTimeout(async () => {
        const result = await checkPhoneAvailability(phone);
        setPhoneStatus(result.available ? 'available' : 'taken');
        setPhoneMessage(result.message);
    }, 500);

    return () => clearTimeout(timeout);
}, [phone]);
```

**Validation:**
- Prevents submission if phone is taken
- Prevents submission while checking
- Must be exactly 10 digits

---

## Updated Files

### 1. `src/api/auth.api.ts`
**Added Functions:**

```typescript
/**
 * Check if username is available
 */
export const checkUsernameAvailability = async (
  username: string
): Promise<{ available: boolean; message: string }> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/auth/check-username`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  
  const data = await response.json();
  return data;
};

/**
 * Check if phone number is available
 */
export const checkPhoneAvailability = async (
  phoneNumber: string
): Promise<{ available: boolean; message: string }> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/auth/check-phone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: phoneNumber }),
  });
  
  const data = await response.json();
  return data;
};
```

### 2. `app/provider/onboarding/basicinfo.tsx`
**Key Changes:**

**Imports:**
```typescript
import React, {useState, useEffect, useRef} from "react";
import {ActionSheetIOS, ActivityIndicator} from "react-native";
import {checkUsernameAvailability, checkPhoneAvailability} from "../../../src/api/auth.api";
```

**New State Variables:**
```typescript
const [usernameStatus, setUsernameStatus] = useState<'none' | 'checking' | 'available' | 'taken'>('none');
const [phoneStatus, setPhoneStatus] = useState<'none' | 'checking' | 'available' | 'taken'>('none');
const [usernameMessage, setUsernameMessage] = useState('');
const [phoneMessage, setPhoneMessage] = useState('');

const usernameTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const phoneTimeoutRef = useRef<NodeJS.Timeout | null>(null);
```

**New Styles:**
```typescript
disabledInput: {
    backgroundColor: "#e0e0e0",
    color: "#666",
},
inputValid: {
    borderWidth: 2,
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
},
inputInvalid: {
    borderWidth: 2,
    borderColor: "#F44336",
    backgroundColor: "#FFEBEE",
},
validationMessage: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    paddingHorizontal: 20,
},
validMessage: {
    color: "#4CAF50",
},
invalidMessage: {
    color: "#F44336",
},
```

---

## Backend API Requirements

### 1. Check Username Endpoint
**Endpoint:** `POST /auth/check-username`

**Request:**
```json
{
  "username": "johndoe123"
}
```

**Response (Available):**
```json
{
  "available": true,
  "message": "Username is available"
}
```

**Response (Taken):**
```json
{
  "available": false,
  "message": "Username is already taken"
}
```

**Backend Logic:**
```javascript
// Check in both users and providers tables
const existingUser = await User.findOne({ where: { userName: username } });
const existingProvider = await Provider.findOne({ where: { userName: username } });

if (existingUser || existingProvider) {
  return res.json({ available: false, message: "Username is already taken" });
}

return res.json({ available: true, message: "Username is available" });
```

---

### 2. Check Phone Endpoint
**Endpoint:** `POST /auth/check-phone`

**Request:**
```json
{
  "phone_number": "9123456789"
}
```

**Response (Available):**
```json
{
  "available": true,
  "message": "Phone number is available"
}
```

**Response (Taken):**
```json
{
  "available": false,
  "message": "Phone number is already registered"
}
```

**Backend Logic:**
```javascript
// Check in both users and providers tables
const existingUser = await User.findOne({ where: { phone_number } });
const existingProvider = await Provider.findOne({ where: { phone_number } });

if (existingUser || existingProvider) {
  return res.json({ available: false, message: "Phone number is already registered" });
}

return res.json({ available: true, message: "Phone number is available" });
```

---

## User Experience Flow

### Happy Path:
1. User taps "Add Photo" → Selects camera or gallery
2. User takes/selects photo → Photo preview shows
3. User fills in First Name, Middle Name (optional), Last Name
4. User selects Date of Birth → Restricted to 18-100 years
5. Email is pre-filled and disabled (already verified)
6. User types username → Real-time check → ✓ Available
7. User types 10-digit phone → Real-time check → ✓ Available
8. User taps "Next" → Proceeds to LocationScreen

### Error Scenarios:

**Scenario 1: Username Taken**
- User types "john123"
- System checks → Red X appears
- Message: "Username is already taken"
- User cannot proceed until different username entered

**Scenario 2: Phone Already Registered**
- User types "9123456789"
- System checks → Red X appears
- Message: "Phone number is already registered"
- User cannot proceed until different number entered

**Scenario 3: Under 18 Years Old**
- User selects birth date from 2010
- System calculates age → 14 years old
- Alert: "You must be at least 18 years old to register."
- Date not saved, picker remains

**Scenario 4: Missing Required Field**
- User leaves First Name empty
- User taps "Next"
- Alert: "Please enter your First Name."

**Scenario 5: Still Checking Availability**
- User types username/phone quickly
- User taps "Next" while status is "checking"
- Alert: "Still checking username availability..."

---

## Testing Checklist

### Photo Upload:
- [ ] Can take photo with camera
- [ ] Can select photo from gallery
- [ ] Photo preview displays correctly
- [ ] Camera permission request works
- [ ] Gallery permission request works

### Age Validation:
- [ ] Cannot select date less than 18 years ago
- [ ] Cannot select date more than 100 years ago
- [ ] Age calculation is accurate
- [ ] Alert shows for under-18
- [ ] Alert shows for over-100

### Email Field:
- [ ] Email is pre-filled from previous screen
- [ ] Email field is disabled (gray)
- [ ] Cannot edit email field

### Username Validation:
- [ ] Typing shows "Checking..." with spinner
- [ ] Available username shows green checkmark
- [ ] Taken username shows red X
- [ ] Must be at least 3 characters
- [ ] 500ms debounce works (no spam)
- [ ] Cannot submit if taken
- [ ] Cannot submit if checking
- [ ] Can submit if available

### Phone Number Validation:
- [ ] Only accepts numeric input
- [ ] Limited to 10 digits max
- [ ] Shows "Checking..." with spinner
- [ ] Available phone shows green checkmark
- [ ] Taken phone shows red X
- [ ] Must be exactly 10 digits
- [ ] 500ms debounce works (no spam)
- [ ] Cannot submit if taken
- [ ] Cannot submit if checking
- [ ] Can submit if available

### Form Submission:
- [ ] All validations pass before proceeding
- [ ] All data passed to next screen
- [ ] Navigation works correctly

---

## Benefits

### User Experience:
- ✅ **Immediate Feedback**: No waiting until form submission
- ✅ **Clear Visual Cues**: Green/red colors + icons are intuitive
- ✅ **Prevents Errors**: Catch duplicates before submission
- ✅ **Flexible Photo Options**: Camera or gallery choice
- ✅ **Age Compliance**: Enforces legal age requirements

### Data Quality:
- ✅ **Unique Usernames**: Guaranteed at input level
- ✅ **Unique Phone Numbers**: No duplicates in system
- ✅ **Valid Ages**: Only 18-100 year olds
- ✅ **Verified Emails**: Cannot change verified email
- ✅ **Proper Format**: 10-digit phone numbers only

### Performance:
- ✅ **Debounced Requests**: Reduces server load
- ✅ **Client-Side Filtering**: Numeric-only phone input
- ✅ **Optimized Checks**: Only queries when necessary
- ✅ **Cleanup on Unmount**: Prevents memory leaks

---

## Future Enhancements

1. **Profile Photo Compression**: Add image compression before upload
2. **Username Suggestions**: Suggest available usernames if taken
3. **Password Strength Meter**: Visual indicator (if password added here)
4. **Offline Support**: Cache validation results
5. **Internationalization**: Support for country codes in phone
6. **Social Media Integration**: Import profile photo from social accounts
7. **Accessibility**: Screen reader support for validation states
8. **Analytics**: Track validation failure rates

---

**Last Updated:** October 3, 2025
**Status:** ✅ Complete and Ready for Testing
**Dependencies:** Backend API endpoints for username/phone validation required
