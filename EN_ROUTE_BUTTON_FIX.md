# En Route Button Fix

## Issue
When an appointment status was "confirmed" (On the Way), there was no button to navigate to the en route screen. Users could not access the en route screen after the status had already changed to "confirmed".

## Problem Details
- ✅ "scheduled" or "approved" status → Had "En Route to Fix" button (starts en route)
- ❌ **"confirmed" status → NO button to view/navigate to en route screen**
- ✅ "in-progress" or "ongoing" status → Had "Complete Service" button
- ✅ "completed", "finished", "in-warranty" → Showed completed info

## Solution
Added a new button for appointments with "confirmed" status that allows providers to navigate to the en route screen.

### File Modified
`app/provider/integration/fixmoto.tsx`

### Changes Made
Added a new conditional block after the "disabled button" section:

```tsx
{item.appointment_status === "confirmed" && isApproved && (
    <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: "#FF9800" }]} 
        onPress={async () => {
            // Navigate to en route screen
            try {
                const providerData = await AsyncStorage.getItem('providerProfile');
                let providerLocation = '';
                if (providerData) {
                    try {
                        const profile = JSON.parse(providerData);
                        providerLocation = profile.provider_exact_location || profile.exact_location || '';
                    } catch (e) {
                        console.error('Error parsing provider profile:', e);
                    }
                }

                router.push({
                    pathname: "/provider/integration/enroutescreen",
                    params: {
                        appointmentId: item.appointment_id.toString(),
                        customerId: item.customer_id.toString(),
                        customerName: getClientName(item),
                        serviceTitle: getServiceName(item),
                        scheduledDate: item.scheduled_date,
                        customerLocation: item.customer?.exact_location || `${item.customer?.latitude || 14.5995},${item.customer?.longitude || 120.9842}`,
                        providerLocation: item.provider?.provider_exact_location || providerLocation || '',
                    },
                });
            } catch (error) {
                console.error('Error navigating to en route screen:', error);
                Alert.alert('Error', 'Failed to navigate to en route screen');
            }
        }}
    >
        <Ionicons name="navigate" size={18} color="#FFF" style={{ marginRight: 8 }} />
        <Text style={styles.actionButtonText}>View En Route</Text>
    </TouchableOpacity>
)}
```

## Key Features

### 1. **Visual Design**
- Orange background color (#FF9800) matching the "confirmed" status color
- Navigation icon (Ionicons "navigate") to indicate route/directions
- Button text: "View En Route" (distinct from "En Route to Fix")

### 2. **Functionality**
- Retrieves provider location from AsyncStorage
- Passes all necessary appointment data to the en route screen:
  - Appointment ID
  - Customer ID
  - Customer name (using existing `getClientName()` helper)
  - Service title (using existing `getServiceName()` helper)
  - Scheduled date
  - Customer location (exact_location or lat/lng)
  - Provider location
- Navigates to `/provider/integration/enroutescreen`
- Error handling with try/catch and Alert

### 3. **Positioning**
Inserted between:
- "Not available yet" disabled button (for future appointments)
- "Complete Service" button (for in-progress/ongoing)

## Current Button Flow
Now appointments have proper buttons for all statuses:

1. **scheduled/approved** (before date reached) → Disabled "Available on [date]" message
2. **scheduled/approved** (date reached) → "En Route to Fix" button (changes status to confirmed)
3. **✅ confirmed (On the Way)** → **"View En Route" button** (navigates to en route screen)
4. **in-progress/ongoing** → "Complete Service" button
5. **completed/finished/in-warranty** → Completed info display

## Testing Checklist
- [ ] Verify "View En Route" button appears when status is "confirmed"
- [ ] Verify button is orange (#FF9800)
- [ ] Verify navigation icon appears
- [ ] Click button and verify navigation to en route screen
- [ ] Verify all appointment data is passed correctly
- [ ] Verify map loads with correct locations
- [ ] Verify button only shows for approved providers
- [ ] Test error handling if navigation fails

## Status
✅ **FIXED** - No compile errors, ready for testing

## Next Steps
After testing this fix, continue with the remaining 5 backjob todos:
1. Create Reschedule Backjob Screen
2. Update Appointments List (FixMo.to) with backjob badges
3. Create Appointment Details with Backjob
4. Integrate with availability API
5. Add push notification handling
