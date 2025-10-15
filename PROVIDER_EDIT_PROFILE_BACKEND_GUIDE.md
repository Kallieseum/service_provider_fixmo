# 🔧 Backend API Implementation Guide
## Provider Edit Profile & Verification Resubmission System

---

## 📋 Required Backend Endpoints

### 1. **Request OTP for Profile Edit**
**Endpoint:** `POST /provider/profile/request-otp`  
**Auth:** Required (Bearer token)  
**Purpose:** Send OTP to provider's email for profile editing verification

#### Request:
```json
Headers: {
  "Authorization": "Bearer <providerToken>",
  "Content-Type": "application/json"
}

Body: (none - uses token to identify provider)
```

#### Response (Success - 200):
```json
{
  "success": true,
  "message": "OTP sent to your email address: jo***@example.com",
  "data": {
    "maskedEmail": "jo***@example.com",
    "expiresIn": "10 minutes"
  }
}
```

#### Implementation Notes:
- Generate 6-digit OTP
- Store in database with 10-minute expiration
- Mask email address in response (show first 2 chars, then ***)
- Send email with OTP

---

### 2. **Edit Provider Profile (with OTP)**
**Endpoint:** `PUT /provider/profile?otp=123456`  
**Auth:** Required (Bearer token)  
**Purpose:** Update provider profile after OTP verification

#### Request:
```json
Headers: {
  "Authorization": "Bearer <providerToken>",
  "Content-Type": "application/json"
}

Query Params: {
  "otp": "123456"  // Required
}

Body: {
  "phone_number": "9123456789",
  "provider_location": "Barangay Example, Municipality, Province",
  "exact_location": "14.5995,120.9842",  // Optional: "latitude,longitude"
  "provider_email": "newemail@example.com"  // Optional: requires additional verification
}
```

#### Response (Success - 200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "provider_id": 123,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone_number": "9123456789",
    "location": "Barangay Example, Municipality, Province"
  }
}
```

#### Response (Email Change - Requires New Email Verification):
```json
{
  "success": true,
  "message": "Verification code sent to new email address",
  "requiresNewEmailVerification": true,
  "newEmail": "newemail@example.com"
}
```

#### Response (Invalid OTP - 400):
```json
{
  "success": false,
  "message": "Invalid verification code"
}
```

#### Response (Expired OTP - 400):
```json
{
  "success": false,
  "message": "Verification code has expired"
}
```

#### Implementation Notes:
- Verify OTP from database
- Check OTP expiration (10 minutes)
- Validate phone number uniqueness across both User and ServiceProvider tables
- If email changed, send new OTP to new email (don't update email yet)
- Delete OTP after successful verification
- Only allow editing for providers with `verification_status = 'approved'`

---

### 3. **Resubmit Provider Verification**
**Endpoint:** `POST /api/verification/provider/resubmit`  
**Auth:** Required (Bearer token)  
**Purpose:** Resubmit verification documents for rejected/pending providers

#### Request:
```
Headers: {
  "Authorization": "Bearer <providerToken>"
}

Content-Type: multipart/form-data

FormData Fields:
- provider_first_name: string (required)
- provider_last_name: string (required)
- birthday: string (YYYY-MM-DD format, required)
- provider_location: string (required)
- exact_location: string (optional, "lat,lng" format)
- provider_profile_photo: file (optional if profile_photo_url provided)
- profile_photo_url: string (optional, existing Cloudinary URL)
- provider_valid_id: file (optional if valid_id_url provided)
- valid_id_url: string (optional, existing Cloudinary URL)
```

#### Response (Success - 200):
```json
{
  "success": true,
  "message": "Verification documents resubmitted successfully",
  "data": {
    "verification_status": "pending",
    "verification_submitted_at": "2025-10-15T10:30:00.000Z"
  }
}
```

#### Response (Error - 400):
```json
{
  "success": false,
  "message": "Missing required fields: provider_first_name, birthday"
}
```

#### Implementation Notes:
- Reset `verification_status` to 'pending'
- Clear `rejection_reason` field
- Update `verification_submitted_at` timestamp
- Handle both new file uploads AND existing Cloudinary URLs
- Upload new files to Cloudinary if provided
- Only update fields that are provided
- Send notification to admins about resubmission

---

## 🗄️ Database Schema Updates

### OTPVerification Table
```sql
CREATE TABLE IF NOT EXISTS "OTPVerification" (
  email TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ServiceProvider Table (Add if missing)
```sql
ALTER TABLE "ServiceProvider" 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

ALTER TABLE "ServiceProvider" 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE "ServiceProvider" 
ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMP;

ALTER TABLE "ServiceProvider" 
ADD COLUMN IF NOT EXISTS verification_reviewed_at TIMESTAMP;

ALTER TABLE "ServiceProvider" 
ADD COLUMN IF NOT EXISTS exact_location TEXT;
```

---

## 📧 Email Templates

### OTP Email Template
```html
<h2>Profile Update Verification</h2>
<p>Hello {{provider_first_name}},</p>
<p>Your verification code for profile update is:</p>
<h1 style="color: #008080;">{{otp}}</h1>
<p>This code expires in 10 minutes.</p>
<p>If you didn't request this, please ignore this email.</p>
```

### New Email Verification Template
```html
<h2>Verify Your New Email Address</h2>
<p>Hello {{provider_first_name}},</p>
<p>You requested to change your email address. Your verification code is:</p>
<h1 style="color: #008080;">{{otp}}</h1>
<p>Enter this code in the app to confirm your new email address.</p>
<p>This code expires in 10 minutes.</p>
```

---

## 🔒 Security Considerations

### 1. **OTP Security**
- Generate cryptographically secure random 6-digit codes
- Store hashed OTPs (optional, but recommended)
- Implement rate limiting (max 3 OTP requests per hour)
- Auto-delete expired OTPs

### 2. **File Upload Security**
- Validate file types (only images)
- Limit file size (10MB max)
- Scan for malware (if possible)
- Use secure Cloudinary upload

### 3. **Data Validation**
- Validate email format
- Validate phone number format (10 digits)
- Sanitize all text inputs
- Prevent SQL injection

### 4. **Authorization**
- Verify JWT token on all endpoints
- Ensure provider can only edit their own profile
- Check verification_status before allowing certain operations

---

## 🚀 Implementation Checklist

### Controller: `authServiceProviderController.js` or similar

#### Function: `requestProfileUpdateOtp`
- [ ] Extract provider ID from JWT token
- [ ] Fetch provider email from database
- [ ] Generate 6-digit OTP
- [ ] Set expiration to 10 minutes from now
- [ ] Store OTP in OTPVerification table (upsert)
- [ ] Send OTP via email using template
- [ ] Return masked email address
- [ ] Implement error handling

#### Function: `editProviderProfile`
- [ ] Extract provider ID from JWT token
- [ ] Get OTP from query parameter
- [ ] Verify OTP exists and matches
- [ ] Check OTP expiration
- [ ] Validate phone number uniqueness
- [ ] Handle email change (send new OTP, don't update yet)
- [ ] Update profile fields
- [ ] Delete used OTP
- [ ] Return updated provider data
- [ ] Implement error handling

### Controller: `verificationController.js`

#### Function: `resubmitProviderVerification`
- [ ] Extract provider ID from JWT token
- [ ] Validate required fields
- [ ] Handle file uploads (profile_photo, valid_id)
- [ ] Upload new files to Cloudinary (if provided)
- [ ] Use existing URLs (if no new files)
- [ ] Update provider record:
  - [ ] Set verification_status to 'pending'
  - [ ] Clear rejection_reason
  - [ ] Update verification_submitted_at
  - [ ] Update personal information fields
  - [ ] Update photo URLs
- [ ] Send notification to admins
- [ ] Return success response
- [ ] Implement error handling

### Routes Configuration

#### File: `serviceProvider.js` or similar
```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const authProviderController = require('../controller/authServiceProviderController');

// Profile edit routes
router.post(
  '/profile/request-otp',
  authenticateToken,
  authProviderController.requestProfileUpdateOtp
);

router.put(
  '/profile',
  authenticateToken,
  authProviderController.editProviderProfile
);

module.exports = router;
```

#### File: `verification.js`
```javascript
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../middleware/authMiddleware');
const verificationController = require('../controller/verificationController');

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Resubmission route
router.post(
  '/provider/resubmit',
  authenticateToken,
  upload.fields([
    { name: 'provider_profile_photo', maxCount: 1 },
    { name: 'provider_valid_id', maxCount: 1 }
  ]),
  verificationController.resubmitProviderVerification
);

module.exports = router;
```

### App.js Updates
```javascript
const providerRoutes = require('./routes/serviceProvider');
const verificationRoutes = require('./routes/verification');

app.use('/provider', providerRoutes);
app.use('/api/verification', verificationRoutes);
```

---

## 🧪 Testing Checklist

### OTP Flow Testing
- [ ] Request OTP successfully
- [ ] Verify masked email format
- [ ] Try to use OTP before requesting (should fail)
- [ ] Try expired OTP (should fail)
- [ ] Try invalid OTP (should fail)
- [ ] Use valid OTP (should succeed)
- [ ] Try to reuse OTP (should fail - deleted after use)

### Profile Edit Testing
- [ ] Edit phone number with valid OTP
- [ ] Edit location with valid OTP
- [ ] Try duplicate phone number (should fail)
- [ ] Change email (should trigger new OTP flow)
- [ ] Edit without requesting OTP first (should fail)

### Resubmission Testing
- [ ] Resubmit with new photos
- [ ] Resubmit with existing Cloudinary URLs
- [ ] Verify status changes to 'pending'
- [ ] Verify rejection_reason is cleared
- [ ] Try resubmission as approved provider (should handle gracefully)

---

## 📝 Frontend-Backend Field Mapping

| Frontend Field | Backend Field (ServiceProvider) | Notes |
|----------------|----------------------------------|-------|
| `email` | `provider_email` | Unique, requires verification |
| `phone` | `provider_phone_number` | 10 digits, starts with 9 |
| `firstName` | `provider_first_name` | String |
| `lastName` | `provider_last_name` | String |
| `homeAddress` | `provider_location` | Full address string |
| `locationCoordinates` | `exact_location` | "lat,lng" format |
| `birthday` | `birthday` | YYYY-MM-DD format |
| `profileUri` | `provider_profile_photo` | Cloudinary URL |
| `validIdUri` | `provider_valid_id` | Cloudinary URL |

---

## 🐛 Common Issues & Solutions

### Issue 1: "OTP not found"
**Cause:** OTP expired or never created  
**Solution:** Check OTP table, verify expiration logic, ensure email sending works

### Issue 2: "Phone already in use"
**Cause:** Another user has this phone  
**Solution:** Query both User and ServiceProvider tables for uniqueness

### Issue 3: "File upload failed"
**Cause:** Cloudinary config or file size  
**Solution:** Verify Cloudinary credentials, check file size limits

### Issue 4: "Email verification loop"
**Cause:** Frontend not handling email change flow  
**Solution:** Check `requiresNewEmailVerification` flag in response

---

## ✅ Implementation Complete When:

- [ ] All 3 endpoints implemented and tested
- [ ] OTP generation and validation working
- [ ] Email sending functional
- [ ] File uploads to Cloudinary working
- [ ] Database schema updated
- [ ] Uniqueness validation across tables
- [ ] Error handling comprehensive
- [ ] Security measures in place
- [ ] All test cases passing

---

**Created:** October 15, 2025  
**Version:** 1.0.0  
**For:** Provider Edit Profile & Verification Resubmission
