# 🔍 Rating Authorization Error - Troubleshooting Guide

**Date**: October 13, 2025  
**Error**: "Appointment not found, or not finished, or you are not authorized to rate this appointment"

---

## 🐛 Error Description

When trying to submit a customer rating, the backend returns:
```
Appointment not found, or not finished, or you are not authorized to rate this appointment
```

This error has **three possible causes**:

---

## ✅ Possible Causes & Solutions

### 1. 🔍 Appointment Not Found

**Cause**: The `appointment_id` doesn't exist in the database.

**Check**:
- Look at console logs for the appointment ID being sent
- Verify the appointment exists in your database

**Console Log to Check**:
```
📝 Submitting rating with data: {
  appointmentId: 123,    ← Check this ID
  customerId: 1,
  rating: 5
}
```

**SQL Query to Verify**:
```sql
SELECT * FROM appointments WHERE appointment_id = 123;
```

---

### 2. ❌ Appointment Not Finished

**Cause**: The appointment status is not `'completed'` or equivalent.

**Check**:
- Verify the appointment has `appointment_status = 'completed'`
- Check if backend requires specific status for rating

**Possible Status Values**:
- `'pending'` ❌ Cannot rate
- `'confirmed'` ❌ Cannot rate
- `'in_progress'` ❌ Cannot rate
- `'completed'` ✅ Can rate
- `'cancelled'` ❌ Cannot rate

**SQL Query to Verify**:
```sql
SELECT appointment_id, appointment_status, completed_at 
FROM appointments 
WHERE appointment_id = 123;
```

---

### 3. 🔐 Not Authorized to Rate

**Cause**: The logged-in provider is not the one assigned to this appointment.

**Check**:
- Verify `providerToken` contains correct provider ID
- Ensure appointment's `provider_id` matches logged-in provider

**Console Log to Check**:
```
📤 Request body: {
  appointment_id: 123,
  customer_id: 1,
  rating_value: 5
}
```

**Backend Should Verify**:
```javascript
// Backend pseudo-code
const appointment = await getAppointment(appointment_id);
const providerId = getProviderIdFromToken(authToken);

if (appointment.provider_id !== providerId) {
    return error("Not authorized");
}
```

---

## 🔧 Enhanced Logging

I've added comprehensive logging to help debug this issue:

### Frontend Logs to Check

1. **Before Submission**:
```
📝 Submitting rating with data: {
  appointmentId: 123,
  customerId: 1,
  rating: 5,
  hasComment: true
}
```

2. **API Request**:
```
📤 Request URL: https://api.example.com/api/ratings/provider/rate-customer
📤 Request body: {
  "appointment_id": 123,
  "customer_id": 1,
  "rating_value": 5,
  "rating_comment": "Great customer!"
}
```

3. **API Response**:
```
📡 Response status: 400 Bad Request
📡 Response data: {
  "success": false,
  "message": "Appointment not found, or not finished..."
}
```

4. **Error Details**:
```
❌ Submit rating error: Error: Appointment not found...
❌ Error details: {
  message: "Appointment not found...",
  appointmentId: 123,
  customerId: 1,
  rating: 5
}
```

---

## 🧪 Debugging Steps

### Step 1: Check Console Logs
Look for these log messages in your console:
- `📝 Submitting rating with data:` - Shows what's being sent
- `📤 Request body:` - Shows exact API request
- `📡 Response data:` - Shows backend error details

### Step 2: Verify Appointment in Database
```sql
-- Check if appointment exists and its details
SELECT 
  a.appointment_id,
  a.appointment_status,
  a.completed_at,
  a.provider_id,
  a.customer_id,
  sp.business_name as provider_name,
  c.first_name as customer_name
FROM appointments a
LEFT JOIN service_providers sp ON a.provider_id = sp.provider_id
LEFT JOIN customers c ON a.customer_id = c.user_id
WHERE a.appointment_id = 123;
```

### Step 3: Verify Provider Token
```javascript
// Check what provider ID is in the token
const token = await AsyncStorage.getItem('providerToken');
console.log('Provider token:', token);

// Decode the token (if it's a JWT)
const decoded = jwtDecode(token);
console.log('Provider ID from token:', decoded.provider_id);
```

### Step 4: Check Appointment Status
```sql
-- Verify appointment is completed
SELECT appointment_id, appointment_status, completed_at
FROM appointments
WHERE appointment_id = 123;

-- Expected result:
-- appointment_status = 'completed'
-- completed_at = (some date)
```

---

## 🎯 Backend Requirements

Your backend endpoint should validate:

### 1. Appointment Exists
```javascript
const appointment = await db.appointments.findOne({
  where: { appointment_id: req.body.appointment_id }
});

if (!appointment) {
  return res.status(404).json({
    success: false,
    message: "Appointment not found"
  });
}
```

### 2. Appointment is Completed
```javascript
if (appointment.appointment_status !== 'completed') {
  return res.status(400).json({
    success: false,
    message: "Appointment is not finished yet"
  });
}
```

### 3. Provider is Authorized
```javascript
const providerId = req.user.provider_id; // From auth token

if (appointment.provider_id !== providerId) {
  return res.status(403).json({
    success: false,
    message: "You are not authorized to rate this appointment"
  });
}
```

### 4. Not Already Rated
```javascript
const existingRating = await db.ratings.findOne({
  where: { 
    appointment_id: req.body.appointment_id,
    rater_type: 'provider'
  }
});

if (existingRating) {
  return res.status(400).json({
    success: false,
    message: "You have already rated this customer"
  });
}
```

---

## 💡 Common Issues

### Issue 1: Wrong Customer ID Field
**Problem**: Backend expects `user_id` but we send `customer_id`

**Solution**: Check if backend needs the field name changed:
```javascript
// Try this if customer_id doesn't work
body: JSON.stringify({
  appointment_id: appointmentId,
  user_id: customerId,           // ← Changed from customer_id
  rating_value: ratingValue,
  rating_comment: ratingComment
})
```

### Issue 2: Appointment Status Mismatch
**Problem**: Backend requires different status value

**Possible Status Names**:
- `'completed'`
- `'finished'`
- `'done'`
- `'closed'`

Check your database schema!

### Issue 3: Provider ID Mismatch
**Problem**: Token contains wrong provider ID

**Solution**: Verify login response:
```javascript
// When provider logs in
const response = await loginProvider(email, password);
console.log('Provider ID:', response.provider.provider_id);
console.log('Token:', response.token);

// Store correct token
await AsyncStorage.setItem('providerToken', response.token);
```

---

## 🔐 Token Verification

### Check Token Contents
```javascript
// Add this to your rate-customer.tsx for debugging
const token = await AsyncStorage.getItem('providerToken');
console.log('🔑 Provider Token:', token ? 'Present' : 'Missing');

// If JWT token, decode it (you may need jwt-decode package)
try {
  const parts = token.split('.');
  const payload = JSON.parse(atob(parts[1]));
  console.log('🔑 Token payload:', payload);
} catch (e) {
  console.log('🔑 Token is not a JWT or cannot be decoded');
}
```

---

## 📋 Checklist Before Rating

Before a provider can rate a customer, verify:

- [ ] Appointment exists in database
- [ ] Appointment status is `'completed'`
- [ ] Appointment has `completed_at` timestamp
- [ ] Provider is logged in (token exists)
- [ ] Provider ID matches appointment's provider_id
- [ ] Customer ID exists and matches appointment
- [ ] Appointment hasn't been rated yet by this provider
- [ ] Backend endpoint `/api/ratings/provider/rate-customer` is implemented

---

## 🚀 Testing Commands

### Test 1: Check Appointment Status
```bash
# Replace 123 with your appointment ID
curl -X GET "http://your-api.com/api/appointments/123" \
  -H "Authorization: Bearer YOUR_PROVIDER_TOKEN"
```

### Test 2: Test Rating Endpoint Directly
```bash
curl -X POST "http://your-api.com/api/ratings/provider/rate-customer" \
  -H "Authorization: Bearer YOUR_PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": 123,
    "customer_id": 1,
    "rating_value": 5,
    "rating_comment": "Test rating"
  }'
```

---

## 📝 Summary

### Most Likely Causes (in order):
1. 🥇 **Appointment not completed** - Status not set to 'completed'
2. 🥈 **Wrong provider** - Token doesn't match appointment's provider
3. 🥉 **Already rated** - Provider already submitted rating for this appointment

### Quick Fix:
1. Check console logs for the exact error
2. Verify appointment status in database
3. Ensure you're using the correct provider account
4. Make sure backend endpoint is properly implemented

---

**Next Steps**: 
1. Try to submit a rating and check console logs
2. Share the console output (especially the `📡 Response data:` log)
3. I can help identify the specific issue based on the logs
