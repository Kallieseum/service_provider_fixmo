# Service Toggle Availability Implementation

## Overview
The service toggle availability feature is **fully implemented** and allows service providers to activate/deactivate their service listings.

## API Endpoint
```
PUT /api/services/services/{serviceId}/toggle
```

### Parameters
- `serviceId` (path parameter): Integer - The ID of the service to toggle

### Request Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Response (200 - Success)
```json
{
  "success": true,
  "message": "Service availability updated",
  "data": {
    "service_id": 123,
    "servicelisting_isActive": false
  }
}
```

### Response (404 - Service Not Found)
```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": "UNAUTHORIZED"
}
```

## Implementation Details

### 1. API Function (`src/api/services.api.ts`)
```typescript
export const toggleServiceAvailability = async (
  serviceId: number,
  token: string
): Promise<{ service_id: number; servicelisting_isActive: boolean }> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/services/services/${serviceId}/toggle`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to toggle service availability');
    }

    return data.data;
  } catch (error: any) {
    console.error('Toggle Service Availability Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};
```

### 2. UI Implementation (`app/provider/integration/myservices.tsx`)

#### Toggle Handler
```typescript
const handleToggleActive = async (service: Service) => {
    try {
        const token = await AsyncStorage.getItem("providerToken");
        if (!token) {
            Alert.alert("Error", "Authentication required.");
            return;
        }

        const result = await toggleServiceAvailability(service.service_id, token);

        // Update local state with the new status from backend
        setServices(services.map(s => 
            s.service_id === service.service_id 
                ? { ...s, servicelisting_isActive: result.servicelisting_isActive }
                : s
        ));

        Alert.alert(
            "Success",
            `Service ${result.servicelisting_isActive ? "activated" : "deactivated"} successfully!`
        );
    } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to update service status");
    }
};
```

#### UI Component (Switch)
```tsx
<View style={styles.switchContainer}>
    <Text style={styles.switchLabel}>
        {service.servicelisting_isActive ? "Active" : "Inactive"}
    </Text>
    <Switch
        value={service.servicelisting_isActive}
        onValueChange={() => handleToggleActive(service)}
        trackColor={{ false: "#ccc", true: "#1e6355" }}
        thumbColor="#fff"
    />
</View>
```

### 3. TypeScript Types (`src/types/service.d.ts`)

```typescript
export interface Service {
  service_id: number;
  service_title: string;
  service_description: string;
  service_startingprice: number;
  category_id?: number;
  certificate_id: number;
  servicelisting_isActive: boolean;  // ✓ Toggle status
  service_photos?: string[];
  created_at?: string;
  updated_at?: string;
}
```

## Features

### ✅ Implemented Features
1. **Toggle Switch UI**: Visual switch component showing Active/Inactive status
2. **Real-time State Update**: Local state updates immediately after successful API call
3. **Authentication**: Requires valid provider token
4. **Error Handling**: Comprehensive error handling with user-friendly alerts
5. **Success Feedback**: Alert messages confirming activation/deactivation
6. **Visual Feedback**: Switch color changes (green for active, gray for inactive)
7. **Type Safety**: Fully typed with TypeScript interfaces

### User Experience
- Each service card in "My Services" screen has a toggle switch
- Switch shows current status with label: "Active" or "Inactive"
- Tapping the switch sends API request to toggle the status
- Success/error messages appear as alerts
- UI updates instantly to reflect new status

### Error Handling
- Authentication validation before API call
- Network error handling
- Backend error message display
- Graceful fallback with user notifications

## Usage

### For Service Providers
1. Navigate to "My Services" screen
2. Find the service you want to toggle
3. Tap the switch next to the service
4. See confirmation alert
5. Service status updates immediately

### State Management
- Local state maintained in `services` array
- State updates using React `useState` hook
- Optimistic UI updates after successful API response

## Testing Checklist
- ✅ Toggle service to inactive
- ✅ Toggle service to active
- ✅ Verify switch UI updates
- ✅ Verify alert messages
- ✅ Test without authentication token
- ✅ Test with invalid service ID
- ✅ Test network errors
- ✅ Verify state persistence across refreshes

## Related Files
- `app/provider/integration/myservices.tsx` - UI implementation
- `src/api/services.api.ts` - API function
- `src/types/service.d.ts` - TypeScript types
- `src/constants/config.ts` - API configuration

## Notes
- The toggle is a PUT request (not POST or PATCH)
- Backend automatically flips the `servicelisting_isActive` boolean
- No request body needed - just the serviceId in the URL
- Token authentication required via Bearer token in headers
