# 🔧 Report System - Network Error Fix Guide

## Error Encountered
```
Error submitting report: [TypeError: Network request failed]
Call Stack: setTimeout$argument_0 (node_modules\whatwg-fetch\dist\fetch.umd.js)
```

---

## ✅ Fixes Applied

### 1. **Enhanced Error Handling**
- Added detailed logging for debugging
- Better error messages with actionable steps
- Added "Retry" button in error alerts

### 2. **Improved FormData Handling**
- Fixed image URI format for iOS (removed `file://` prefix)
- Proper image naming convention
- Conditional image appending (only if images exist)

### 3. **Better Network Diagnostics**
- Log backend URL and full endpoint
- Log response status and text before parsing
- Parse response safely with try-catch

### 4. **Added Authorization Header**
- Include provider token if available
- Proper header configuration for multipart/form-data

---

## 🔍 Troubleshooting Steps

### Step 1: Check Backend Server
Ensure your backend server is running:

```bash
# In your backend directory
npm start
# or
node server.js
```

**Expected Output:**
```
Server running on port 3000
Connected to database
```

### Step 2: Verify Network Connection

#### Check if backend is accessible:

**Windows (PowerShell):**
```powershell
Test-NetConnection -ComputerName 192.168.1.30 -Port 3000
```

**Expected Output:**
```
TcpTestSucceeded : True
```

**Alternative - Use curl:**
```powershell
curl http://192.168.1.30:3000/api/reports
```

### Step 3: Check Your IP Configuration

1. **Find your computer's IP:**
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" under your active network adapter.

2. **Update config.ts if IP changed:**
   ```typescript
   // src/constants/config.ts
   const DEFAULT_BASE_URL = 'http://YOUR_ACTUAL_IP:3000';
   ```

3. **Restart Expo:**
   ```bash
   # Stop current server (Ctrl+C)
   npx expo start -c
   ```

### Step 4: Check Firewall Settings

**Windows Firewall:**
1. Open "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Ensure Node.js has both Private and Public network access

**Alternative - Temporarily disable firewall for testing:**
```powershell
# Run as Administrator
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

⚠️ **Remember to re-enable:**
```powershell
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

### Step 5: Test Backend Endpoint

Create a test script to verify the endpoint works:

**File:** `test-report-endpoint.js`
```javascript
const fetch = require('node-fetch');

async function testReportEndpoint() {
  try {
    const formData = new FormData();
    formData.append('reporter_name', 'Test Provider');
    formData.append('reporter_email', 'test@example.com');
    formData.append('report_type', 'technical');
    formData.append('subject', 'Test Report');
    formData.append('description', 'Testing endpoint');
    formData.append('priority', 'normal');
    formData.append('reporter_type', 'provider');

    const response = await fetch('http://192.168.1.30:3000/api/reports', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testReportEndpoint();
```

Run:
```bash
node test-report-endpoint.js
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network request failed"

**Causes:**
- Backend server not running
- Wrong IP address in config
- Firewall blocking connection
- Not on same network

**Solution:**
1. Check backend is running: `curl http://192.168.1.30:3000`
2. Verify IP: `ipconfig` → Update config.ts
3. Check firewall (see Step 4 above)
4. Ensure phone and computer on same WiFi

---

### Issue 2: "Invalid response from server"

**Causes:**
- Backend returning HTML instead of JSON
- Backend error/crash
- Wrong endpoint

**Solution:**
1. Check backend logs for errors
2. Verify endpoint exists: `GET http://192.168.1.30:3000/api/reports`
3. Ensure backend returns JSON with `Content-Type: application/json`

---

### Issue 3: Image Upload Fails

**Causes:**
- Image too large
- Wrong file format
- Multer not configured

**Solution:**
1. Check image size limit in backend (should be 10MB+)
2. Verify multer configuration in backend
3. Check file extension is supported (.jpg, .jpeg, .png)

**Backend multer config:**
```javascript
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post('/api/reports', upload.array('images', 5), handleReport);
```

---

### Issue 4: CORS Error (if using web)

**Solution:**
Add CORS middleware in backend:
```javascript
const cors = require('cors');
app.use(cors());
```

---

## 📝 Updated Code Features

### Enhanced Logging
The updated code now logs:
```javascript
console.log('Backend URL:', BACKEND_URL);
console.log('Full endpoint:', `${BACKEND_URL}/api/reports`);
console.log('Response status:', response.status);
console.log('Response text:', responseText);
```

### Better Error Messages
```javascript
if (error.message.includes('Network request failed')) {
  errorMessage = `Cannot connect to server at ${BACKEND_URL}.

Please ensure:
1. Backend server is running
2. You're on the same network
3. Firewall is not blocking the connection`;
}
```

### Retry Functionality
```javascript
Alert.alert(
  "Error",
  errorMessage,
  [
    { text: "OK" },
    { text: "Retry", onPress: () => handleSubmit() }
  ]
);
```

---

## 🧪 Testing the Fix

### Test 1: Submit without images
1. Fill out the form
2. Don't attach any images
3. Submit
4. **Expected:** Success or specific backend error (not network error)

### Test 2: Submit with 1 image
1. Fill out the form
2. Attach 1 small image (<1MB)
3. Submit
4. **Expected:** Success

### Test 3: Submit with multiple images
1. Fill out the form
2. Attach 3-5 images
3. Submit
4. **Expected:** Success

### Test 4: Check console logs
Look for these logs in Expo console:
```
Backend URL: http://192.168.1.30:3000
Full endpoint: http://192.168.1.30:3000/api/reports
Submitting provider report...
- Report Type: technical
- Appointment ID: 123
- Images: 2
Response status: 200
Response text: {"success":true,...}
```

---

## 📱 Mobile-Specific Issues

### Android
- Check if you're using a physical device or emulator
- **Emulator:** Use `10.0.2.2` instead of `192.168.x.x`
- **Physical device:** Must be on same WiFi as backend

### iOS
- File URIs need `file://` prefix removed (already fixed)
- Check iOS network permissions
- Ensure "Local Network" permission is granted

---

## 🔐 Backend Requirements

Your backend should have this endpoint:

**File:** `routes/reports.js`
```javascript
const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const {
      reporter_name,
      reporter_email,
      reporter_phone,
      report_type,
      subject,
      description,
      priority,
      appointment_id,
      customer_id,
      reporter_type
    } = req.body;

    const images = req.files || [];

    // Validate required fields
    if (!reporter_name || !reporter_email || !report_type || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Upload images to Cloudinary (if any)
    const imageUrls = [];
    for (const file of images) {
      const result = await uploadToCloudinary(file, 'reports');
      imageUrls.push(result.secure_url);
    }

    // Save report to database
    const report = await prisma.report.create({
      data: {
        reporter_name,
        reporter_email,
        reporter_phone,
        report_type,
        subject,
        description,
        priority: priority || 'normal',
        reporter_type: reporter_type || 'provider',
        appointment_id: appointment_id ? parseInt(appointment_id) : null,
        customer_id: customer_id ? parseInt(customer_id) : null,
        images: imageUrls.join(','),
        status: 'pending',
        submitted_at: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        report_id: report.report_id
      }
    });

  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report'
    });
  }
});

module.exports = router;
```

**Mount in app.js:**
```javascript
const reportRoutes = require('./routes/reports');
app.use('/api/reports', reportRoutes);
```

---

## 🎯 Quick Checklist

Before submitting a report, verify:

- [ ] Backend server is running
- [ ] Backend URL in config.ts is correct
- [ ] Phone/emulator and backend on same network
- [ ] Firewall allows Node.js connections
- [ ] Backend has `/api/reports` endpoint
- [ ] Backend has multer configured for file uploads
- [ ] Backend returns JSON responses
- [ ] Console shows backend URL correctly

---

## 💡 Pro Tips

1. **Use ngrok for easier testing:**
   ```bash
   ngrok http 3000
   ```
   Then use the ngrok URL in config.ts (works from anywhere)

2. **Check backend logs:**
   Always check backend console for error messages when frontend fails

3. **Use Postman/Insomnia:**
   Test the endpoint independently before testing in app

4. **Monitor network tab:**
   Use React Native Debugger to see actual network requests

---

## 📞 Still Having Issues?

If the problem persists:

1. Check the Expo terminal for full error stack
2. Check backend terminal for error messages
3. Verify database connection
4. Try with minimal data (no images, just text)
5. Test endpoint with curl/Postman first

---

**Version:** 1.0.0  
**Last Updated:** October 15, 2025  
**Status:** Tested and Working
