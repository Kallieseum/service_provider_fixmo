# Provider Profile Data Fetch Implementation

## Overview
Implemented automatic profile data fetching when the service provider clicks on the profile icon in the bottom navigation bar.

## Implementation Date
October 4, 2025

## API Endpoint Used
```
GET /auth/provider/profile-detailed
```
**Authentication**: JWT Bearer Token (from AsyncStorage: 'providerToken')

## Features Implemented

### 1. Automatic Data Fetching
- Profile data fetches automatically when component mounts (useEffect)
- Uses JWT token from AsyncStorage for authentication
- Displays loading spinner while fetching
- Error handling with retry functionality

### 2. Profile Information Displayed
The following data is fetched and displayed:

#### Basic Information:
- **Profile Photo** (`profile_photo`) - Displayed as circular avatar
- **Full Name** (`full_name` or `first_name + last_name`)
- **Phone Number** (`phone_number`)
- **Email Address** (`email`)

#### Verification Status:
- **is_verified** (boolean) - Shows if provider is verified
- **verification_status** (string) - Can be: 'pending', 'approved', 'rejected'

### 3. Verification Badge Display

#### ✅ Verified (Green Badge)
- Shown when: `is_verified === true`
- Color: Green (#4CAF50)
- Icon: Checkmark circle
- Text: "Verified"

#### ⏳ Verification Pending (Orange Badge)
- Shown when: `verification_status === 'pending'`
- Color: Orange (#FF9800)
- Icon: Time outline
- Text: "Verification Pending"

#### ❌ Verification Rejected (Red Badge)
- Shown when: `verification_status === 'rejected'`
- Color: Red (#E53935)
- Icon: Close circle
- Text: "Verification Rejected"

## Code Structure

### File Modified
`app/provider/onboarding/providerprofile.tsx`

### Key Changes

#### 1. Imports Added
```typescript
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  getDetailedProviderProfile, 
  ProviderProfile as ProviderProfileType 
} from "../../../src/api/auth.api";
```

#### 2. State Management
```typescript
const [providerProfile, setProviderProfile] = useState<ProviderProfileType | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

#### 3. Data Fetching (useEffect)
```typescript
useEffect(() => {
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('providerToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const profileData = await getDetailedProviderProfile(token);
      setProviderProfile(profileData);
    } catch (err: any) {
      console.error('Failed to fetch provider profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, []);
```

#### 4. Loading State UI
```typescript
{loading ? (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#008080" />
    <Text style={styles.loadingText}>Loading profile...</Text>
  </View>
) : error ? (
  // Error state with retry button
) : (
  // Profile content
)}
```

#### 5. Verification Badge Component
```typescript
{providerProfile?.is_verified && (
  <View style={styles.verificationBadge}>
    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
    <Text style={styles.verifiedText}>Verified</Text>
  </View>
)}

{providerProfile?.verification_status === 'pending' && (
  <View style={[styles.verificationBadge, styles.pendingBadge]}>
    <Ionicons name="time-outline" size={20} color="#FF9800" />
    <Text style={[styles.verifiedText, styles.pendingText]}>
      Verification Pending
    </Text>
  </View>
)}

{providerProfile?.verification_status === 'rejected' && (
  <View style={[styles.verificationBadge, styles.rejectedBadge]}>
    <Ionicons name="close-circle" size={20} color="#E53935" />
    <Text style={[styles.verifiedText, styles.rejectedText]}>
      Verification Rejected
    </Text>
  </View>
)}
```

### Styles Added
```typescript
loadingContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingTop: 100,
},
loadingText: {
  fontSize: 14,
  color: "#666",
  fontFamily: "PoppinsRegular",
  marginTop: 12,
},
errorContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingTop: 100,
  paddingHorizontal: 40,
},
errorText: {
  fontSize: 14,
  color: "#E53935",
  fontFamily: "PoppinsRegular",
  textAlign: "center",
  marginTop: 12,
  marginBottom: 20,
},
retryButton: {
  backgroundColor: "#008080",
  paddingHorizontal: 24,
  paddingVertical: 10,
  borderRadius: 8,
},
retryText: {
  color: "#fff",
  fontSize: 14,
  fontFamily: "PoppinsSemiBold",
},
profileImage: {
  width: 100,
  height: 100,
  borderRadius: 50,
  marginBottom: 12,
},
verificationBadge: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#E8F5E9",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#4CAF50",
},
pendingBadge: {
  backgroundColor: "#FFF3E0",
  borderColor: "#FF9800",
},
rejectedBadge: {
  backgroundColor: "#FFEBEE",
  borderColor: "#E53935",
},
verifiedText: {
  fontSize: 13,
  color: "#4CAF50",
  fontFamily: "PoppinsSemiBold",
  marginLeft: 6,
},
pendingText: {
  color: "#FF9800",
},
rejectedText: {
  color: "#E53935",
},
```

## API Integration

### Existing API Function Used
Located in: `src/api/auth.api.ts`

```typescript
export const getDetailedProviderProfile = async (
  token: string
): Promise<ProviderProfile> => {
  const endpoints = [
    API_CONFIG.AUTH_ENDPOINTS.PROVIDER_PROFILE,
    '/auth/profile',
    '/auth/provider/profile-detailed',
  ];

  // Tries multiple endpoints for compatibility
  // Returns full provider profile data
};
```

### Response Data Structure
```typescript
interface ProviderProfile {
  provider_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  userName: string;
  email: string;
  phone_number: string;
  profile_photo: string | null;
  valid_id: string | null;
  location: string | null;
  exact_location: string | null;
  uli: string | null;
  birthday: string | null;
  is_verified: boolean;
  verification_status: string; // 'pending' | 'approved' | 'rejected'
  rejection_reason?: string | null;
  rating?: number;
  ratings_count?: number;
  is_activated: boolean;
  created_at: string;
  professions: ProviderProfession[];
  certificates: ProviderCertificate[];
  recent_services: ProviderRecentService[];
}
```

## User Flow

1. **User taps Profile icon** in bottom navigation
2. **Component mounts** → useEffect triggers
3. **Token retrieved** from AsyncStorage
4. **API call made** to `/auth/provider/profile-detailed`
5. **Loading spinner displays** while waiting
6. **Data received** → State updated with profile data
7. **UI renders** with:
   - Profile photo (or default icon)
   - Verification badge (if applicable)
   - Full name
   - Phone number
   - Email address
   - Menu items

## Error Handling

### No Token Found
- Error message: "No authentication token found"
- User sees error screen with message

### API Request Failed
- Error message from API or "Failed to load profile"
- User sees error screen with:
  - Error icon
  - Error message
  - "Retry" button to attempt fetch again

### Network Error
- Error message: "Network error. Please try again."
- Same error screen with retry option

## Testing Checklist

- [x] Profile data fetches on component mount
- [x] Loading spinner displays during fetch
- [x] Profile photo displays correctly (or default icon)
- [x] Name, phone, and email display correctly
- [x] Verified badge shows for verified providers
- [x] Pending badge shows for pending verification
- [x] Rejected badge shows for rejected verification
- [x] Error handling works for missing token
- [x] Error handling works for API failures
- [x] Retry button re-fetches data after error
- [ ] Profile updates when user edits profile (requires navigation back)

## Benefits

1. **Real-time Data**: Always shows latest profile information from database
2. **Verification Status**: Provider knows their verification state immediately
3. **Professional UI**: Loading states and error handling provide smooth UX
4. **Security**: Uses JWT authentication for secure data access
5. **Reliability**: Multiple endpoint fallbacks ensure compatibility

## Future Enhancements

1. **Pull-to-Refresh**: Add swipe-down refresh gesture
2. **Cache Management**: Store profile data locally to reduce API calls
3. **Profile Update Hook**: Auto-refresh when returning from edit profile screen
4. **Skeleton Loading**: Replace spinner with skeleton screen for better UX
5. **Offline Support**: Show cached data when offline with indicator

## Notes

- Profile data is fetched fresh every time the profile screen is accessed
- Token must exist in AsyncStorage with key 'providerToken'
- API supports multiple endpoint paths for backward compatibility
- Type renamed from `ProviderProfile` to `ProviderProfileType` to avoid naming conflict with component name

## Related Files

- `src/api/auth.api.ts` - API function implementation
- `src/constants/config.ts` - API base URL configuration
- `src/navigation/BottomTabs.tsx` - Navigation to profile screen
- `app/provider/onboarding/providerprofile.tsx` - Main profile screen component
