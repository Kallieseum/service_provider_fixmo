# Ratings Screen - Debugging Guide

## Issue: Screen Just Keeps Loading

### Added Debug Logs

The following console logs will now appear to help identify the issue:

#### 1. **Provider ID Retrieval**
```
🔍 Fetching provider_id from AsyncStorage...
📱 Provider ID found: 4
```
**OR**
```
⚠️ No provider_id found in AsyncStorage
```

#### 2. **Starting to Load Ratings**
```
🎯 Provider ID set, loading ratings for provider: 4
📊 Loading ratings for provider 4, page 1...
```

#### 3. **API Request**
```
📊 Fetching provider ratings: { providerId: 4, page: 1, limit: 10 }
🌐 API URL: http://192.168.1.30:3000/api/ratings/provider/4?page=1&limit=10
```

#### 4. **API Response**
```
📡 Response status: 200 OK
```
**OR**
```
📡 Response status: 404 Not Found
❌ Failed to fetch provider ratings. Status: 404
❌ Error data: { message: "..." }
```

#### 5. **Data Processing**
```
📦 API Response: {
  success: true,
  ratingsCount: 5,
  totalRatings: 76,
  avgRating: 4.65
}
✅ Ratings loaded successfully
🏁 Loading complete, hiding spinner
```

---

## Troubleshooting Steps

### Step 1: Check Metro Console
Look for the console logs when you tap "Ratings":

**Expected Flow:**
```
🔍 Fetching provider_id from AsyncStorage...
📱 Provider ID found: 4
🎯 Provider ID set, loading ratings for provider: 4
📊 Loading ratings for provider 4, page 1...
📊 Fetching provider ratings: { providerId: 4, page: 1, limit: 10 }
🌐 API URL: http://192.168.1.30:3000/api/ratings/provider/4?page=1&limit=10
📡 Response status: 200 OK
📦 API Response: { ... }
✅ Ratings loaded successfully
🏁 Loading complete, hiding spinner
```

### Step 2: Identify the Problem

#### Problem A: No Provider ID
**Console shows:**
```
⚠️ No provider_id found in AsyncStorage
```

**Solution:**
1. Log in again
2. Check if login sets `provider_id` in AsyncStorage
3. Verify with:
   ```typescript
   const id = await AsyncStorage.getItem('provider_id');
   console.log('Provider ID:', id);
   ```

#### Problem B: API Not Responding
**Console shows:**
```
🌐 API URL: http://192.168.1.30:3000/api/ratings/provider/4?page=1&limit=10
(then nothing...)
```

**Solution:**
1. Check if backend server is running on port 3000
2. Verify the URL is correct
3. Test the endpoint directly:
   ```bash
   curl http://192.168.1.30:3000/api/ratings/provider/4?page=1&limit=10
   ```

#### Problem C: API Returns Error
**Console shows:**
```
📡 Response status: 404 Not Found
❌ Failed to fetch provider ratings. Status: 404
```

**Solution:**
1. Check if the backend endpoint `/api/ratings/provider/:providerId` exists
2. Verify the provider ID exists in the database
3. Check backend logs for errors

#### Problem D: Network Timeout
**Console shows:**
```
💥 Error loading ratings: [TypeError: Network request failed]
```

**Solution:**
1. Check WiFi/network connection
2. Verify device can reach `192.168.1.30:3000`
3. Check firewall settings
4. Try with a different IP or `localhost` if using emulator

---

## New Error Handling

### No Provider ID Screen
If provider ID is not found, you'll now see:
```
🚫 Provider ID Not Found
Please log in again to view ratings
[Go Back] button
```

### Empty Ratings
If API succeeds but returns no ratings:
```
⭐ (empty star icon)
No ratings yet
Complete jobs to receive customer ratings
```

### Loading State
While fetching data:
```
⏳ (spinner)
Loading ratings...
```

---

## Quick Test Commands

### Test 1: Check Provider ID
Open React Native Debugger or Metro console and look for:
```
📱 Provider ID found: X
```

### Test 2: Test API Directly
```bash
# PowerShell
Invoke-WebRequest -Uri "http://192.168.1.30:3000/api/ratings/provider/4?page=1&limit=10" -Method GET
```

### Test 3: Check AsyncStorage
Add this temporarily to your code:
```typescript
const keys = await AsyncStorage.getAllKeys();
console.log('All AsyncStorage keys:', keys);
const providerId = await AsyncStorage.getItem('provider_id');
console.log('provider_id value:', providerId);
```

---

## Expected Behavior

### Scenario 1: Provider with Ratings
1. Screen shows loading spinner
2. API fetches data successfully
3. Shows overall rating (e.g., "4.65")
4. Shows rating distribution bars
5. Lists individual rating cards
6. Shows "Load More" if more ratings exist

### Scenario 2: Provider with No Ratings
1. Screen shows loading spinner
2. API returns empty ratings array
3. Shows "No ratings yet" message
4. Shows "Complete jobs to receive customer ratings"

### Scenario 3: Not Logged In
1. Screen shows loading spinner briefly
2. No provider ID found
3. Shows error screen with "Go Back" button

---

## What to Check Now

1. **Metro Console**: Look for the emoji logs 🔍📱🎯📊
2. **Provider ID**: Is it being retrieved?
3. **API URL**: Is it correct?
4. **Response Status**: 200, 404, 500?
5. **Loading State**: Does it eventually stop?

---

## Next Steps

Once you see the console logs, tell me:
1. What's the **last log message** you see?
2. What's the **provider ID** value?
3. What's the **API response status**?
4. Does the **loading spinner** ever disappear?

This will help identify exactly where the issue is!
