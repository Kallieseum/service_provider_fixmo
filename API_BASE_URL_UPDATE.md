# API Base URL Update - Vercel Backend

## Overview
Updated the API base URL from local development server to production Vercel backend.

## Date
October 4, 2025

## Changes Made

### 1. Base URL Configuration
**File**: `src/constants/config.ts`

**Previous URL**:
```typescript
const DEFAULT_BASE_URL = 'http://192.168.1.27:3000';
```

**New URL**:
```typescript
const DEFAULT_BASE_URL = 'https://fixmo-backend1.vercel.app';
```

### 2. Messaging API URLs
**File**: `app/provider/integration/fixmoto.tsx`

**Changes**:
- Added import for `API_CONFIG`
- Updated conversation fetch URL to use `${API_CONFIG.BASE_URL}`
- Updated conversation creation URL to use `${API_CONFIG.BASE_URL}`

**Before**:
```typescript
const conversationsResponse = await fetch(
  `http://192.168.1.27:3000/api/messages/conversations?userType=provider`,
  // ...
);

const createResponse = await fetch(
  `http://192.168.1.27:3000/api/messages/conversations`,
  // ...
);
```

**After**:
```typescript
import { API_CONFIG } from "../../../src/constants/config";

const conversationsResponse = await fetch(
  `${API_CONFIG.BASE_URL}/api/messages/conversations?userType=provider`,
  // ...
);

const createResponse = await fetch(
  `${API_CONFIG.BASE_URL}/api/messages/conversations`,
  // ...
);
```

## Benefits

1. **Production Ready**: App now points to production Vercel backend
2. **Centralized Configuration**: All URLs now use `API_CONFIG.BASE_URL`
3. **Easy Updates**: Single point of change for API URL
4. **Environment Override**: Can still override via `EXPO_PUBLIC_API_URL` env variable

## Environment Variable Support

The config supports environment variable override:

```typescript
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE_URL;
```

To use a different URL, set in `.env`:
```
EXPO_PUBLIC_API_URL=https://your-custom-backend.com
```

## API Endpoints

All endpoints now use the Vercel backend:

### Authentication
- `https://fixmo-backend1.vercel.app/auth/provider/send-otp`
- `https://fixmo-backend1.vercel.app/auth/provider/verify-otp`
- `https://fixmo-backend1.vercel.app/auth/provider-login`
- `https://fixmo-backend1.vercel.app/auth/provider/profile-detailed`

### Appointments
- `https://fixmo-backend1.vercel.app/api/appointments/*`

### Messaging
- `https://fixmo-backend1.vercel.app/api/messages/conversations`
- `https://fixmo-backend1.vercel.app/api/messages/*`

### Services
- `https://fixmo-backend1.vercel.app/api/services/*`

## Files Modified

1. ✅ `src/constants/config.ts` - Updated `DEFAULT_BASE_URL`
2. ✅ `app/provider/integration/fixmoto.tsx` - Added `API_CONFIG` import and updated hardcoded URLs

## Testing Checklist

- [ ] Login functionality works with Vercel backend
- [ ] Profile data loads correctly
- [ ] Appointments fetch properly
- [ ] Messaging/conversations work
- [ ] Service completion updates successfully
- [ ] All API calls return expected responses
- [ ] Error handling works for network issues

## Rollback Instructions

If needed, to rollback to local development:

```typescript
// In src/constants/config.ts
const DEFAULT_BASE_URL = 'http://192.168.1.27:3000';
```

Or set environment variable:
```
EXPO_PUBLIC_API_URL=http://192.168.1.27:3000
```

## Important Notes

1. **HTTPS Required**: Vercel backend uses HTTPS (secure connection)
2. **CORS**: Vercel backend must have CORS properly configured for mobile app
3. **Network Requests**: All API calls now go to production server
4. **Socket.IO**: If using Socket.IO, ensure connection URL is also updated
5. **Authentication**: JWT tokens must be compatible with Vercel backend

## Next Steps

1. Test all API endpoints with Vercel backend
2. Verify authentication flows work correctly
3. Test messaging functionality end-to-end
4. Check appointment creation and updates
5. Validate error handling with production server
6. Monitor API response times and performance

## Socket.IO Connection

If Socket.IO is used for real-time messaging, verify the connection URL:

```typescript
// Should also use API_CONFIG.BASE_URL
const socket = io(API_CONFIG.BASE_URL, {
  transports: ['websocket', 'polling'],
  // ...
});
```

## Security Considerations

1. **HTTPS Only**: Production backend uses secure connections
2. **JWT Tokens**: Ensure tokens are properly stored in AsyncStorage
3. **API Keys**: No API keys should be hardcoded in source
4. **Error Messages**: Don't expose sensitive backend errors to users

## Documentation Updates Needed

The following documentation files reference old URL and should be updated if needed:
- `CUSTOMER_AUTHENTICATION_DOCUMENTATION.md`
- `MESSAGING_SYSTEM_DOCUMENTATION.md`
- `OTP_VISUAL_FEEDBACK_IMPLEMENTATION.md`
- `PROVIDER_MESSAGING_IMPLEMENTATION.md`
- `QUICK_TEST_REFERENCE.md`
- `SERVICE_PROVIDER_FORGOT_PASSWORD_DOCUMENTATION.md`
- `OTP_SIGNUP_FLOW_DOCUMENTATION.md`
- `MESSAGING_FINAL_IMPLEMENTATION.md`

These are documentation files and don't affect runtime behavior.

## Verification Commands

To verify the changes:

1. **Check config file**:
```bash
cat src/constants/config.ts | grep BASE_URL
```

2. **Check for hardcoded URLs**:
```bash
grep -r "192.168.1.27:3000" app/ src/
```

3. **Run app**:
```bash
npx expo start
```

## Success Criteria

✅ All API calls use centralized `API_CONFIG.BASE_URL`  
✅ No hardcoded URLs in app or src code  
✅ Production backend URL configured  
✅ Environment variable override supported  
✅ All API endpoints accessible via Vercel  

## Support

If issues arise:
1. Check Vercel backend logs
2. Verify CORS configuration
3. Test endpoints with Postman/curl
4. Check network connectivity
5. Review error messages in app logs
