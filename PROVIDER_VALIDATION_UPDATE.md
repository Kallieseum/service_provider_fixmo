# Provider Username & Phone Validation - Database Check

## Overview
Updated validation to check against the **Service Provider table** specifically, with proper field names and username format requirements.

## ✅ Changes Implemented

### 1. Database Table Target
**Service Provider Table Fields:**
- `provider_userName` - Username field in provider table
- `provider_phone_number` - Phone number field in provider table

**Previous:** Checked generic tables
**Now:** Checks specifically against Service Provider table only

---

### 2. Username Format Validation

**Required Format:**
- ✅ **MUST start with a LETTER** (a-z, A-Z)
- ✅ Followed by **letters or numbers** (alphanumeric)
- ❌ Cannot start with a number
- ❌ No special characters allowed
- ❌ No spaces allowed

**Valid Examples:**
```
john123       ✓
JohnDoe       ✓
j1234         ✓
Jane2024      ✓
technician99  ✓
```

**Invalid Examples:**
```
123john       ✗ (starts with number)
_john         ✗ (starts with special char)
john_doe      ✗ (contains underscore)
john doe      ✗ (contains space)
john@123      ✗ (contains special char)
```

**Regex Pattern:**
```javascript
/^[a-zA-Z][a-zA-Z0-9]*$/

// Breakdown:
// ^         - Start of string
// [a-zA-Z]  - Must start with a letter (uppercase or lowercase)
// [a-zA-Z0-9]* - Followed by zero or more letters or numbers
// $         - End of string
```

---

### 3. Real-Time Validation Flow

#### Username Validation:
```
User types username
    ↓
Check length (min 3 chars)
    ↓
Check format (letter first, then alphanumeric)
    ↓
    ├─ Invalid format → Show error message (Red)
    └─ Valid format → Check database availability
           ↓
           ├─ Available → Show green checkmark ✓
           └─ Taken → Show red X ✗
```

#### Phone Validation:
```
User types phone number
    ↓
Filter to numeric only (remove non-digits)
    ↓
Limit to 10 digits max
    ↓
Check if 10 digits complete
    ↓
    ├─ Not 10 digits → Show format error
    └─ Exactly 10 digits → Check database availability
           ↓
           ├─ Available → Show green checkmark ✓
           └─ Taken → Show red X ✗
```

---

## Updated API Endpoints

### 1. Check Username Availability
**Endpoint:** `POST /auth/provider/check-username`

**Request:**
```json
{
  "provider_userName": "john123"
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

**Backend Implementation:**
```javascript
// Check ONLY in service provider table
app.post('/auth/provider/check-username', async (req, res) => {
  try {
    const { provider_userName } = req.body;

    // Query the ServiceProvider table
    const existingProvider = await ServiceProvider.findOne({
      where: { provider_userName }
    });

    if (existingProvider) {
      return res.json({
        available: false,
        message: 'Username is already taken'
      });
    }

    return res.json({
      available: true,
      message: 'Username is available'
    });
  } catch (error) {
    console.error('Username check error:', error);
    return res.status(500).json({
      available: false,
      message: 'Error checking username'
    });
  }
});
```

---

### 2. Check Phone Availability
**Endpoint:** `POST /auth/provider/check-phone`

**Request:**
```json
{
  "provider_phone_number": "9123456789"
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

**Backend Implementation:**
```javascript
// Check ONLY in service provider table
app.post('/auth/provider/check-phone', async (req, res) => {
  try {
    const { provider_phone_number } = req.body;

    // Query the ServiceProvider table
    const existingProvider = await ServiceProvider.findOne({
      where: { provider_phone_number }
    });

    if (existingProvider) {
      return res.json({
        available: false,
        message: 'Phone number is already registered'
      });
    }

    return res.json({
      available: true,
      message: 'Phone number is available'
    });
  } catch (error) {
    console.error('Phone check error:', error);
    return res.status(500).json({
      available: false,
      message: 'Error checking phone number'
    });
  }
});
```

---

## Frontend Changes

### 1. API Functions (`src/api/auth.api.ts`)

**Updated Functions:**

```typescript
/**
 * Check if provider username is available
 * Checks against provider_userName in service provider table
 */
export const checkUsernameAvailability = async (
  username: string
): Promise<{ available: boolean; message: string }> => {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/auth/provider/check-username`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider_userName: username }),
    }
  );
  return await response.json();
};

/**
 * Check if provider phone number is available
 * Checks against provider_phone_number in service provider table
 */
export const checkPhoneAvailability = async (
  phoneNumber: string
): Promise<{ available: boolean; message: string }> => {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/auth/provider/check-phone`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider_phone_number: phoneNumber }),
    }
  );
  return await response.json();
};
```

---

### 2. Username Validation (`app/provider/onboarding/basicinfo.tsx`)

**Added Format Validation:**

```typescript
// In useEffect for username
const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]*$/;
if (!usernameRegex.test(username)) {
    setUsernameStatus('none');
    setUsernameMessage('Username must start with a letter, followed by letters or numbers');
    return;
}
```

**Updated Validation in Submit:**

```typescript
// Validate username format before submission
const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]*$/;
if (!usernameRegex.test(username)) {
    Alert.alert(
        'Invalid Username Format', 
        'Username must start with a letter, followed by letters or numbers only.'
    );
    return false;
}

// Ensure username is verified as available
if (usernameStatus !== 'available') {
    Alert.alert('Username Not Verified', 'Please wait for username availability check.');
    return false;
}
```

---

## User Experience

### Username Input:

**Scenario 1: User types "123john"**
```
Input: "123john"
Status: none (not checking)
Message: "Username must start with a letter, followed by letters or numbers"
Border: Red
Icon: None
Can Submit: No
```

**Scenario 2: User types "john_123"**
```
Input: "john_123"
Status: none (not checking)
Message: "Username must start with a letter, followed by letters or numbers"
Border: Red
Icon: None
Can Submit: No
```

**Scenario 3: User types "john123" (available)**
```
Input: "john123"
Status: checking → available
Message: "Checking availability..." → "Username is available"
Border: Green
Icon: Green checkmark ✓
Can Submit: Yes
```

**Scenario 4: User types "john123" (taken)**
```
Input: "john123"
Status: checking → taken
Message: "Checking availability..." → "Username is already taken"
Border: Red
Icon: Red X ✗
Can Submit: No
```

---

### Phone Number Input:

**Scenario 1: User types "91234" (incomplete)**
```
Input: "91234"
Status: none
Message: "Phone must be 10 digits"
Border: Default
Icon: None
Can Submit: No
```

**Scenario 2: User types "9123456789" (available)**
```
Input: "9123456789"
Status: checking → available
Message: "Checking availability..." → "Phone number is available"
Border: Green
Icon: Green checkmark ✓
Can Submit: Yes
```

**Scenario 3: User types "9123456789" (taken)**
```
Input: "9123456789"
Status: checking → taken
Message: "Checking availability..." → "Phone number is already registered"
Border: Red
Icon: Red X ✗
Can Submit: No
```

---

## Validation Summary

### Username Requirements:
✅ Minimum 3 characters
✅ Must start with a letter (a-z, A-Z)
✅ Can contain letters and numbers after first character
✅ Must be available in provider_userName field
❌ Cannot start with number
❌ No special characters
❌ No spaces

### Phone Requirements:
✅ Exactly 10 digits
✅ Only numeric characters
✅ Must be available in provider_phone_number field
❌ Cannot be less or more than 10 digits
❌ Cannot contain letters or special characters

---

## Testing Checklist

### Username Format Validation:
- [ ] "john123" → ✓ Valid format → Check database
- [ ] "JohnDoe" → ✓ Valid format → Check database
- [ ] "j" → ✓ Valid format but too short (min 3)
- [ ] "123john" → ✗ Invalid (starts with number)
- [ ] "john_doe" → ✗ Invalid (contains underscore)
- [ ] "john doe" → ✗ Invalid (contains space)
- [ ] "john@123" → ✗ Invalid (contains @)
- [ ] "_john" → ✗ Invalid (starts with underscore)

### Database Checks:
- [ ] Available username shows green checkmark
- [ ] Taken username shows red X
- [ ] Available phone shows green checkmark
- [ ] Taken phone shows red X
- [ ] Checks are against ServiceProvider table only
- [ ] Field names are provider_userName and provider_phone_number

### Submit Validation:
- [ ] Cannot submit with invalid username format
- [ ] Cannot submit with taken username
- [ ] Cannot submit while checking
- [ ] Cannot submit with taken phone
- [ ] Can submit when both are available

---

## Database Schema Reference

```sql
-- Service Provider Table
CREATE TABLE ServiceProvider (
  id INT PRIMARY KEY AUTO_INCREMENT,
  provider_userName VARCHAR(255) UNIQUE NOT NULL,
  provider_phone_number VARCHAR(10) UNIQUE NOT NULL,
  provider_email VARCHAR(255) UNIQUE NOT NULL,
  provider_first_name VARCHAR(255) NOT NULL,
  provider_last_name VARCHAR(255) NOT NULL,
  -- other fields...
);

-- Indexes for faster lookups
CREATE INDEX idx_provider_username ON ServiceProvider(provider_userName);
CREATE INDEX idx_provider_phone ON ServiceProvider(provider_phone_number);
```

---

**Last Updated:** October 3, 2025
**Status:** ✅ Complete - Checks Service Provider Table Only
**Field Names:** `provider_userName`, `provider_phone_number`
**Format:** Username must start with letter, then alphanumeric only
