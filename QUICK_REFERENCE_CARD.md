# ⚡ QUICK REFERENCE - Provider Rating System

## 🎯 Endpoint Information

### Backend POST Endpoint
```
POST /api/ratings/provider/rate-customer
```

### Request Body
```json
{
  "appointment_id": 1,
  "customer_id": 2,
  "rating_value": 5,
  "rating_comment": "Optional comment"
}
```

---

## 📱 Frontend Usage

### Import the API function
```typescript
import { submitCustomerRating } from '@/api/ratings.api';
```

### Submit a rating
```typescript
const response = await submitCustomerRating(
  authToken,      // Provider's JWT token
  appointmentId,  // Appointment ID
  customerId,     // Customer ID to rate
  ratingValue,    // 1-5 stars
  comment         // Optional comment
);

if (response.success) {
  // Rating saved!
}
```

---

## ⏱️ Timing

- **Initial Check**: 3 seconds after opening FixMoToday
- **Background Check**: Every 30 seconds
- **Skip Check When**: Modals are open

---

## 🔍 Debug Logs to Watch

```bash
# Success flow
=== CHECKING FOR UNRATED APPOINTMENTS (PROVIDER) ===
🎯 Found unrated appointment(s): 1
📝 Submitting customer rating: {...}
✅ Rating submitted successfully
```

---

## ✅ Test Checklist

1. [ ] Complete a service
2. [ ] Open FixMoToday
3. [ ] Wait 3 seconds
4. [ ] Rating screen appears
5. [ ] Select stars
6. [ ] Add comment
7. [ ] Submit
8. [ ] Success!

---

## 📂 Key Files

- `src/api/ratings.api.ts` - API functions
- `app/provider/integration/fixmoto.tsx` - Auto-check
- `app/provider/integration/rate-customer.tsx` - UI screen

---

## 🚨 Common Issues

**Rating screen not showing?**
- Check backend endpoint exists
- Verify appointment is 'completed'
- Check auth token is valid

**Rating not saving?**
- Check console for errors
- Verify backend response
- Check appointment_id exists

---

## 📖 Full Documentation

See: `FINAL_IMPLEMENTATION_SUMMARY.md`
