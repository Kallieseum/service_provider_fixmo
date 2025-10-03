# 🧪 Quick Testing Reference Card

## Backend Endpoints Required

### ✅ Username Check
```
POST /auth/provider/check-username
Body: { "provider_userName": "john123" }

✓ Available:
Status: 200 OK
Response: { "available": true, "message": "Username is available" }

✗ Taken:
Status: 400 Bad Request
Response: { "available": false, "message": "Username already exists" }
```

### ✅ Phone Check
```
POST /auth/provider/check-phone
Body: { "provider_phone_number": "9123456789" }

✓ Available:
Status: 200 OK
Response: { "available": true, "message": "Phone number is available" }

✗ Taken:
Status: 400 Bad Request
Response: { "available": false, "message": "Phone number already exists" }
```

---

## Test Scenarios

### Username Testing

| Input | Expected Result | Reason |
|-------|----------------|--------|
| `jo` | No check | Too short (min 3) |
| `123john` | ✗ Format error | Must start with letter |
| `john_doe` | ✗ Format error | No special chars |
| `john doe` | ✗ Format error | No spaces |
| `john123` | ✓ or ✗ | Check database |
| `JohnDoe` | ✓ or ✗ | Check database |

### Phone Number Testing

| Input | Expected Result | Reason |
|-------|----------------|--------|
| `912` | No check | Too short (need 10) |
| `91234567890` | Auto-limited | Max 10 digits |
| `912abc5678` | Filtered | Only numbers allowed |
| `9123456789` | ✓ or ✗ | Check database |

---

## Visual States

### ✓ Available (Green)
```
Input: john123
Icon: ✓ Green checkmark
Border: Green (#4CAF50)
Background: Light green (#E8F5E9)
Message: "Username is available" (green text)
```

### ✗ Taken (Red)
```
Input: existinguser
Icon: ✗ Red X
Border: Red (#F44336)
Background: Light red (#FFEBEE)
Message: "Username already exists" (red text)
```

### ⏳ Checking
```
Input: john123
Icon: Spinner
Border: Default
Background: Default
Message: "Checking availability..." (default text)
```

### ❌ Invalid Format
```
Input: 123john
Icon: None
Border: Red (#F44336)
Background: Light red (#FFEBEE)
Message: "Username must start with a letter..." (red text)
```

---

## cURL Test Commands

### Test Available Username
```bash
curl -X POST http://192.168.1.27:3000/auth/provider/check-username \
  -H "Content-Type: application/json" \
  -d '{"provider_userName":"newuser123"}'
```

### Test Taken Username
```bash
curl -X POST http://192.168.1.27:3000/auth/provider/check-username \
  -H "Content-Type: application/json" \
  -d '{"provider_userName":"existinguser"}'
```

### Test Available Phone
```bash
curl -X POST http://192.168.1.27:3000/auth/provider/check-phone \
  -H "Content-Type: application/json" \
  -d '{"provider_phone_number":"9999999999"}'
```

### Test Taken Phone
```bash
curl -X POST http://192.168.1.27:3000/auth/provider/check-phone \
  -H "Content-Type: application/json" \
  -d '{"provider_phone_number":"9123456789"}'
```

---

## Validation Flow

```
User types → Wait 500ms → Check format → Valid? → API call → Show result
                                        ↓
                                     Invalid → Show error
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| No feedback | Check console, verify state updates |
| Always "taken" | Test with cURL, check database |
| Network error | Verify BASE_URL, server running |
| Too slow | Reduce debounce, check backend speed |

---

## Configuration

**File:** `src/constants/config.ts`
```typescript
BASE_URL: 'http://192.168.1.27:3000'
```

**Change this to your backend URL!**

---

## Swagger UI

Test endpoints visually:
```
http://192.168.1.27:3000/api-docs
```

Look for:
- Service Provider Authentication section
- Check Username endpoint
- Check Phone endpoint

---

## Quick Checklist

Before testing:
- [ ] Backend server is running
- [ ] Endpoints are deployed
- [ ] Database has test data
- [ ] BASE_URL is correct in config.ts
- [ ] App is running on device/emulator

During testing:
- [ ] Username format validation works
- [ ] Phone format validation works
- [ ] 500ms debounce works
- [ ] Visual feedback appears
- [ ] Can't submit invalid data
- [ ] Can submit when valid

---

**Quick Test:** Type "john123" in username field. Wait 1 second. Should see green ✓ or red ✗.

**Emergency Debug:** Check Network tab in React Native Debugger to see API calls.
