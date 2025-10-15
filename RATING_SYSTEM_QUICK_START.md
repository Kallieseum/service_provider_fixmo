# 🚀 Quick Start: Provider Automatic Rating System

## How It Works

When a provider opens the FixMoToday screen, the system:
1. Waits 3 seconds
2. Checks for completed appointments without ratings
3. Automatically navigates to rating screen if found
4. Continues checking every 30 seconds in the background

---

## Files Changed

### 1. `src/api/ratings.api.ts`
Added function to fetch unrated appointments:
```typescript
export const getUnratedAppointments = async (authToken: string, limit: number = 10)
```

### 2. `app/provider/integration/fixmoto.tsx`
Added automatic checking system:
- Initial check after 3 seconds
- Background check every 30 seconds
- Prevents duplicate popups

### 3. `app/provider/integration/rate-customer.tsx` (NEW)
Complete rating screen with:
- 5-star rating system
- Optional comment/review
- Customer information display
- Submit and skip options

---

## Backend Requirements

### Endpoint 1: Get Unrated Appointments
```
GET /api/appointments/can-rate?userType=provider&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "appointment_id": 123,
      "customer_id": 45,
      "customer": {
        "first_name": "Juan",
        "last_name": "Dela Cruz"
      },
      "service": {
        "service_title": "Plumbing Repair"
      },
      "scheduled_date": "2025-10-01T08:00:00.000Z"
    }
  ]
}
```

### Endpoint 2: Submit Rating
```
POST /api/ratings
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "appointment_id": 123,
  "provider_id": 10,
  "customer_id": 45,
  "rating_value": 5,
  "rating_comment": "Great customer!",
  "rated_by": "provider"
}
```

---

## Testing Steps

1. **Complete a service** (set appointment status to 'completed')
2. **Don't rate the customer yet**
3. **Open FixMoToday screen**
4. **Wait 3 seconds**
5. **Should auto-navigate to rating screen**
6. **Rate the customer or skip**
7. **Return to FixMoToday**

---

## Console Logs to Watch

```
=== CHECKING FOR UNRATED APPOINTMENTS (PROVIDER) ===
🔍 Checking for unrated appointments...
🌐 API URL: http://your-backend/api/appointments/can-rate?userType=provider&limit=10
📡 Response status: 200 OK
✅ Unrated appointments fetched: { count: 1, appointments: [...] }
🎯 Found unrated appointment(s): 1
```

---

## Configuration

### Timing (in fixmoto.tsx)
```typescript
// Initial check: 3 seconds after screen opens
setTimeout(() => { ... }, 3000);

// Background check: Every 30 seconds
setInterval(() => { ... }, 30000);
```

### API Limits
```typescript
// Fetch max 10 unrated appointments
const response = await getUnratedAppointments(token, 10);
```

---

## Troubleshooting

### Rating screen not appearing?

1. ✅ Check if backend endpoint exists
2. ✅ Verify appointment status is 'completed'
3. ✅ Ensure no existing rating for that appointment
4. ✅ Check console logs for errors
5. ✅ Verify auth token is valid

### Multiple popups appearing?

- The system prevents this with `isRatingPopupShown` state
- Should only show once per session

### Rating not saving?

1. ✅ Check backend POST /api/ratings endpoint
2. ✅ Verify request body format
3. ✅ Check provider_id and customer_id are valid
4. ✅ Look for error messages in console

---

## Success Indicators ✅

- [ ] Rating screen appears automatically
- [ ] Can select star rating
- [ ] Can type comment
- [ ] Submit saves rating
- [ ] Returns to FixMoToday
- [ ] Doesn't show same appointment again
- [ ] Background checks work every 30 seconds

---

## Next Steps

1. Implement backend endpoints (see `BACKEND_RATING_ENDPOINT.js`)
2. Test with real completed appointments
3. Verify ratings save correctly
4. Test background checks

---

**Status**: ✅ Ready for Testing  
**Documentation**: See `PROVIDER_AUTOMATIC_RATING_IMPLEMENTATION.md`
