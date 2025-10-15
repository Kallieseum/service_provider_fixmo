# 🚀 Provider Report System - Quick Reference

## ✅ Implementation Complete!

Both **Customer** and **Provider** report systems are now fully implemented.

---

## 📦 What Was Delivered

### Provider Report System:
1. **Report Screen** (`app/provider/integration/report.tsx`)
   - Complete form with all fields
   - Image upload (up to 5 images)
   - Appointment selection with customer auto-fill
   - FormData submission
   - ~600 lines of production code

2. **Profile Menu** (`app/provider/onboarding/providerprofile.tsx`)
   - Added "Report an Issue" menu item
   - Accessible to all providers

3. **Documentation**
   - Complete implementation guide
   - Backend API specifications
   - Testing checklist

---

## 🔑 Key Differences: Customer vs Provider

| Feature | Customer | Provider |
|---------|----------|----------|
| **Reporter Type** | `'customer'` | `'provider'` |
| **Menu Location** | User profile | Provider profile |
| **Route** | `/user/app/report` | `/provider/integration/report` |
| **Bookings API** | `/api/appointments/customer/:userId` | `/api/appointments/provider/:providerId` |
| **Associates With** | `provider_id` (who served them) | `customer_id` (who they served) |
| **Booking Display** | Shows provider name | Shows customer name |
| **Report Types** | Service Provider Issue | Customer Issue, Payment Issue |
| **Token** | `token` | `providerToken` |
| **Profile API** | `/auth/customer-profile` | `/auth/provider/profile-detailed` |

---

## 🎯 Both Systems Ready For:

### Frontend ✅
- [x] Customer report screen
- [x] Provider report screen
- [x] Image upload (both)
- [x] Appointment selection (both)
- [x] Auto-population (both)
- [x] Validation (both)
- [x] Error handling (both)

### Backend ⏳
- [ ] POST /api/reports (supports both customer & provider)
- [ ] GET /api/appointments/customer/:userId
- [ ] GET /api/appointments/provider/:providerId
- [ ] Image upload to Cloudinary
- [ ] Email template (distinguishes customer vs provider)
- [ ] Database schema updated

---

## 📋 Backend Task List

### Priority 1: Report Submission
```javascript
// POST /api/reports endpoint needs to:
1. Accept reporter_type: 'customer' OR 'provider'
2. Handle both provider_id and customer_id fields
3. Upload images to Cloudinary (fixmo/reports/{reporter_type})
4. Save to database with all fields
5. Send email to admin with reporter_type in template
```

### Priority 2: Appointment APIs
```javascript
// GET /api/appointments/customer/:userId
// Returns customer's bookings with provider info

// GET /api/appointments/provider/:providerId
// Returns provider's bookings with customer info
```

### Priority 3: Email Template
```javascript
// Update to show:
- Reporter Type badge (CUSTOMER or SERVICE PROVIDER)
- If customer → Show provider info
- If provider → Show customer info
- Related booking details
- Attached images
```

---

## 🗂️ File Structure

```
service_provider_fixmo/
├── app/
│   ├── user/
│   │   └── app/
│   │       └── report.tsx              ✅ Customer Report (existing)
│   └── provider/
│       ├── integration/
│       │   └── report.tsx              ✅ Provider Report (NEW)
│       └── onboarding/
│           └── providerprofile.tsx     ✅ Updated with menu item
│
├── REPORT_SYSTEM_IMPLEMENTATION_COMPLETE.md      ✅ Customer docs
├── PROVIDER_REPORT_SYSTEM_COMPLETE.md            ✅ Provider docs
└── PROVIDER_REPORT_QUICK_REFERENCE.md (this)     ✅ Quick ref
```

---

## 🧪 Quick Test

### Test Customer Report:
1. Login as customer
2. Go to Profile → Report an Issue
3. Select "Service Provider Issue"
4. See appointment dropdown
5. Select appointment → provider auto-fills
6. Add images (up to 5)
7. Submit → Check console for `reporter_type: 'customer'`

### Test Provider Report:
1. Login as provider
2. Go to Profile → Report an Issue
3. Select "Customer Issue"
4. See appointment dropdown
5. Select appointment → customer auto-fills
6. Add images (up to 5)
7. Submit → Check console for `reporter_type: 'provider'`

---

## 📊 Database Schema (Simplified)

```sql
CREATE TABLE reports (
  report_id SERIAL PRIMARY KEY,
  reporter_name VARCHAR(255) NOT NULL,
  reporter_email VARCHAR(255) NOT NULL,
  reporter_type VARCHAR(20) CHECK (reporter_type IN ('customer', 'provider')),
  report_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20),
  
  -- Associations (all optional)
  appointment_id INTEGER,
  provider_id INTEGER,  -- Set by customers
  customer_id INTEGER,  -- Set by providers
  
  -- Attachments
  attachment_urls JSONB DEFAULT '[]',
  has_attachments BOOLEAN DEFAULT false,
  
  -- Metadata
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 Backend Code Snippets

### Accept Both Customer & Provider
```javascript
router.post('/api/reports', upload.array('images', 5), async (req, res) => {
  const { reporter_type, provider_id, customer_id, ...otherFields } = req.body;
  
  // Validate reporter_type
  if (!['customer', 'provider'].includes(reporter_type)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid reporter_type' 
    });
  }
  
  // Save report
  await pool.query(`
    INSERT INTO reports (
      reporter_type, provider_id, customer_id, ...
    ) VALUES ($1, $2, $3, ...)
  `, [reporter_type, provider_id || null, customer_id || null, ...]);
});
```

### Provider Appointments API
```javascript
router.get('/api/appointments/provider/:providerId', async (req, res) => {
  const { providerId } = req.params;
  
  const result = await pool.query(`
    SELECT 
      a.appointment_id,
      a.scheduled_date,
      s.service_title,
      u.first_name as customer_first_name,
      u.last_name as customer_last_name,
      u.user_id as customer_id
    FROM appointments a
    JOIN services s ON a.service_id = s.service_id
    JOIN users u ON a.customer_id = u.user_id
    WHERE a.provider_id = $1
    ORDER BY a.scheduled_date DESC
    LIMIT 50
  `, [providerId]);
  
  res.json({ success: true, data: result.rows });
});
```

---

## ✅ Verification Checklist

### Frontend (Both Complete):
- [x] Customer report screen works
- [x] Provider report screen works
- [x] Both use FormData for images
- [x] Both set reporter_type correctly
- [x] Both have appointment selection
- [x] Both auto-fill associated user
- [x] Both validate forms
- [x] Both handle errors

### Backend (To Implement):
- [ ] POST /api/reports accepts both types
- [ ] GET /api/appointments/customer/:userId
- [ ] GET /api/appointments/provider/:providerId
- [ ] Cloudinary uploads work
- [ ] Email template updated
- [ ] Database schema complete

---

## 📧 Admin Email Format

```
Subject: New [CUSTOMER/PROVIDER] Report #123

Reporter Type: [CUSTOMER] or [SERVICE PROVIDER] (badge)
Report Type: Customer Issue / Service Provider Issue / etc
Priority: Low / Normal / High / Urgent

Reporter Info:
- Name: John Doe
- Email: john@example.com
- Phone: +63 9XX XXX XXXX

[If appointment selected]
Related Booking: #456
- Service: Plumbing Repair
- Date: 10/15/2025
- Customer: Jane Smith (if provider report)
- Provider: John Doe (if customer report)

Subject: Brief summary...

Description:
Detailed description of the issue...

[If images attached]
Attachments: 3 images
[Image thumbnails with links]
```

---

## 🎓 Important Concepts

### 1. Reporter Type
```javascript
// ALWAYS set based on who is reporting
reporter_type: 'customer'  // Customer reporting
reporter_type: 'provider'  // Provider reporting
```

### 2. Association Logic
```javascript
// Customer reports → provider_id populated
{
  reporter_type: 'customer',
  provider_id: 123,      // Who served them
  customer_id: null
}

// Provider reports → customer_id populated
{
  reporter_type: 'provider',
  provider_id: null,
  customer_id: 456       // Who they served
}
```

### 3. Image Storage
```javascript
// Separate Cloudinary folders
Customer images → fixmo/reports/customer/
Provider images → fixmo/reports/provider/
```

---

## 🚀 Next Steps

1. **Backend Developer:**
   - Implement 3 endpoints (POST /api/reports + 2 GET appointments)
   - Update email template
   - Test with Postman

2. **Tester:**
   - Test customer report flow
   - Test provider report flow
   - Verify emails sent correctly
   - Check Cloudinary uploads

3. **Deploy:**
   - Push backend changes
   - Monitor first reports
   - Verify email delivery

---

## 📞 Support

**Admin Email:** ipafixmo@gmail.com  
**Cloudinary Folders:**
- Customer: `fixmo/reports/customer`
- Provider: `fixmo/reports/provider`

**Documentation:**
- Customer: `REPORT_SYSTEM_IMPLEMENTATION_COMPLETE.md`
- Provider: `PROVIDER_REPORT_SYSTEM_COMPLETE.md`
- Backend: Check both docs for API specs

---

**Status:** ✅ Frontend Complete for Both  
**Date:** October 15, 2025  
**Ready For:** Backend Integration & Testing
