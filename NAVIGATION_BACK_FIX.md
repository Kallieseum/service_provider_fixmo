# Navigation Back Gesture Fix

## Issue
When using Android back gesture (swipe from edge), the app would navigate to the OTP screen even when the user was on the homepage and hadn't gone through OTP in the current session. This was happening because old onboarding screens (email → otp → agreement → etc.) remained in the navigation stack.

## Root Cause
The navigation stack from the signup/login flow was persisting even after successful authentication. When users swiped back from the homepage, it would go through the entire onboarding history.

## Solution Implemented

### 1. Prevent Back Navigation on Homepage
**File**: `app/provider/onboarding/pre_homepage.tsx`

Added `BackHandler` to prevent hardware back button/gesture from working on the homepage:

```typescript
import { useFocusEffect } from "expo-router";
import { BackHandler } from "react-native";

// Inside component:
useFocusEffect(
    useCallback(() => {
        const onBackPress = () => {
            // Return true to prevent default back action
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
    }, [])
);
```

**Why**: The homepage (`pre_homepage.tsx`) is the root screen after login. Users should not be able to navigate back to signin/signup screens from here.

### 2. Use `router.replace()` in Onboarding Flow
**Files Modified**:
- `app/provider/onboarding/email.tsx` - Email to OTP transition
- `app/provider/onboarding/agreement.tsx` - Agreement to BasicInfo transition

Changed from `router.push()` to `router.replace()` to prevent keeping previous onboarding screens in the navigation stack.

**Before**:
```typescript
router.push({
    pathname: '/provider/onboarding/otp',
    params: {email}
});
```

**After**:
```typescript
router.replace({
    pathname: '/provider/onboarding/otp',
    params: {email}
});
```

### 3. Back Button in Messaging Screen
**File**: `app/messaging/index.tsx`

Changed the back button to use `router.replace()` instead of `router.push()`:

```typescript
onPress={() => router.replace('/provider/onboarding/pre_homepage')}
```

## Result
✅ Swiping back from homepage does nothing (expected behavior for root screen)  
✅ Onboarding screens don't persist in navigation stack  
✅ Users cannot accidentally navigate back to OTP/signup screens  
✅ Normal navigation between app screens still works correctly  

## Navigation Patterns Used

### When to use `router.push()`:
- Detail views (appointment details, service details)
- Drill-down navigation where back makes sense
- Modal-like screens that should allow back

### When to use `router.replace()`:
- One-way flows (signup steps, onboarding)
- After authentication (login → homepage)
- Navigating between top-level screens

### When to use `BackHandler`:
- Root screens where back navigation should be completely disabled
- Confirmation prompts before exit
- Custom back behavior needed

## Testing
1. ✅ Login and arrive at homepage
2. ✅ Swipe back from homepage - should not navigate anywhere
3. ✅ Navigate to other tabs (Tasks, Services, Messages, Profile)
4. ✅ Navigate into details, swipe back - should go to previous screen
5. ✅ Never see OTP screen unless explicitly going through signup flow

## Notes
- The `BackHandler` only affects hardware back button and gestures
- It doesn't prevent navigation via Bottom Tabs or explicit navigation calls
- `useFocusEffect` ensures the handler is only active when the screen is focused
