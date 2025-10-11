# 🔧 Getting Your Expo Project ID for Push Notifications

## Why Do I Need This?

The Expo Project ID is required for push notifications to work in standalone/production builds. For development with Expo Go, it's optional but recommended.

---

## Method 1: Get from Expo Dashboard (Recommended)

### Step 1: Login to Expo
1. Go to https://expo.dev
2. Sign in with your Expo account
3. If you don't have an account, create one for free

### Step 2: Find Your Project
1. Go to your account projects page
2. Find your project (or create a new one)
3. Click on your project

### Step 3: Get Project ID
1. Click on "Settings" in the left sidebar
2. Find the "Project ID" section
3. Copy the UUID (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Step 4: Add to `.env` File
```env
EXPO_PUBLIC_PROJECT_ID=your-copied-uuid-here
```

---

## Method 2: Get from `app.json`

If you've already initialized an Expo project:

1. Open your `app.json` file
2. Look for the `extra` section:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      }
    }
  }
}
```
3. Copy the `projectId` value
4. Add to `.env` file

---

## Method 3: Initialize with EAS

If you haven't set up an Expo project yet:

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Initialize your project
eas init

# This will create/update your app.json with a projectId
```

Then copy the project ID from `app.json` to your `.env` file.

---

## Method 4: Create a New Project

If you need to create a new Expo project:

1. Go to https://expo.dev
2. Login to your account
3. Click "Create a Project"
4. Enter project name (e.g., "FixMo Service Provider")
5. Click "Create"
6. Go to Settings → Copy Project ID
7. Add to `.env` file

---

## After Adding Project ID

### Step 1: Update Your `.env` File
```env
EXPO_PUBLIC_PROJECT_ID=12345678-1234-1234-1234-123456789abc
```

### Step 2: Restart Metro Bundler
```bash
# Stop the current Metro bundler (Ctrl+C)
# Then restart with cache cleared
npx expo start --clear
```

### Step 3: Verify It Works
1. Login to the app
2. Check console logs for:
   - `📱 Push token obtained: ExponentPushToken[...]`
   - `✅ Push token registered with backend`
3. No errors about "Invalid uuid" should appear

---

## Testing Without Project ID (Development Only)

For quick development/testing with Expo Go:

1. Leave `EXPO_PUBLIC_PROJECT_ID` empty in `.env`
2. The app will show a warning but won't crash
3. Push notifications will still work in Expo Go
4. You'll see this log: `⚠️ EXPO_PUBLIC_PROJECT_ID not set`

**Note:** This only works with Expo Go. Production builds REQUIRE a valid project ID.

---

## Common Issues

### ❌ Error: "Invalid uuid"
**Solution:** 
- Make sure the project ID is a valid UUID format
- Check for extra spaces or quotes in `.env`
- Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### ❌ Error: "Project not found"
**Solution:**
- Verify you're logged into the correct Expo account
- Make sure the project ID matches your Expo account
- Re-run `eas login` to verify credentials

### ❌ Push notifications not working
**Solution:**
1. Verify project ID is set correctly
2. Restart Metro bundler with `--clear` flag
3. Check you're testing on a physical device (not emulator)
4. Verify notification permissions are granted

---

## Production Checklist

Before deploying to production:

- ✅ Set valid `EXPO_PUBLIC_PROJECT_ID` in `.env`
- ✅ Add project ID to `app.json` under `extra.eas.projectId`
- ✅ Test push notifications on physical device
- ✅ Build with EAS: `eas build --platform android`
- ✅ Verify push notifications work in production build

---

## Quick Reference

```bash
# Login to Expo
eas login

# Check current project config
eas config

# View project details
eas project:info

# Build for production
eas build --platform android
eas build --platform ios
```

---

## Need Help?

- Expo Documentation: https://docs.expo.dev/push-notifications/overview/
- EAS Setup Guide: https://docs.expo.dev/build/setup/
- Expo Discord: https://chat.expo.dev

---

**Last Updated:** January 10, 2025  
**Status:** Required for Production
