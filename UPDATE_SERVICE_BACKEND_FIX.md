# Update Service Backend Fix Required

## Issue
The backend API endpoint for updating services (`PUT /api/services/services/{serviceId}`) is incorrectly validating that ALL fields must be present, even though only description and price should be editable.

## Current Error
```
ERROR: All fields are required (service_title, service_description, service_startingprice).
```

## Frontend Implementation (Already Correct)
The frontend is correctly sending ONLY the editable fields:

```typescript
const updateData = {
    service_description: editDescription.trim(),
    service_startingprice: priceNum,
};

await updateService(selectedService.service_id, updateData, token);
```

### Request Body Example
```json
{
  "service_description": "Updated description of the service",
  "service_startingprice": 500
}
```

## Backend Fix Required

### Current Backend Validation (INCORRECT)
```javascript
// ❌ This validation is wrong
if (!service_title || !service_description || !service_startingprice) {
    return res.status(400).json({
        success: false,
        message: "All fields are required (service_title, service_description, service_startingprice)."
    });
}
```

### Correct Backend Validation
```javascript
// ✅ Service title should NOT be editable
// ✅ Only validate fields that are actually being updated

// Check if at least one field is provided
if (!service_description && !service_startingprice) {
    return res.status(400).json({
        success: false,
        message: "At least one field is required (service_description or service_startingprice)."
    });
}

// Validate individual fields if provided
if (service_description !== undefined && service_description.trim() === "") {
    return res.status(400).json({
        success: false,
        message: "Service description cannot be empty."
    });
}

if (service_startingprice !== undefined && (isNaN(service_startingprice) || service_startingprice <= 0)) {
    return res.status(400).json({
        success: false,
        message: "Service starting price must be a positive number."
    });
}

// Service title should not be allowed to change
if (service_title !== undefined) {
    return res.status(400).json({
        success: false,
        message: "Service title cannot be modified."
    });
}
```

## Backend Update Logic

### Current (Likely Incorrect)
```javascript
// ❌ This replaces all fields
const updatedService = await db.query(
    'UPDATE services SET service_title = ?, service_description = ?, service_startingprice = ? WHERE service_id = ?',
    [service_title, service_description, service_startingprice, serviceId]
);
```

### Correct Implementation (Option 1 - Dynamic Update)
```javascript
// ✅ Only update fields that are provided
const updates = [];
const values = [];

if (service_description !== undefined) {
    updates.push('service_description = ?');
    values.push(service_description);
}

if (service_startingprice !== undefined) {
    updates.push('service_startingprice = ?');
    values.push(service_startingprice);
}

if (updates.length === 0) {
    return res.status(400).json({
        success: false,
        message: "No fields to update."
    });
}

// Add updated_at timestamp
updates.push('updated_at = NOW()');

// Add WHERE clause value
values.push(serviceId);

const query = `UPDATE services SET ${updates.join(', ')} WHERE service_id = ?`;
const result = await db.query(query, values);
```

### Correct Implementation (Option 2 - Explicit Fields)
```javascript
// ✅ Only update specific fields
const updatedService = await db.query(
    'UPDATE services SET service_description = ?, service_startingprice = ?, updated_at = NOW() WHERE service_id = ?',
    [service_description, service_startingprice, serviceId]
);
```

## API Endpoint Specification

### Endpoint
```
PUT /api/services/services/{serviceId}
```

### Request Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body
```json
{
  "service_description": "string",
  "service_startingprice": number
}
```

**Note:** 
- `service_title` should NOT be included or allowed
- Both fields are optional, but at least one must be provided
- If `service_title` is sent, return an error

### Response (200 - Success)
```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "service_id": 123,
    "service_title": "Original Title (Unchanged)",
    "service_description": "Updated description",
    "service_startingprice": 500,
    "servicelisting_isActive": true,
    "certificate_id": 1,
    "service_photos": [],
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-02T00:00:00.000Z"
  }
}
```

### Response (400 - Validation Error)
```json
{
  "success": false,
  "message": "Service description cannot be empty."
}
```

### Response (404 - Service Not Found)
```json
{
  "success": false,
  "message": "Service not found."
}
```

### Response (403 - Unauthorized)
```json
{
  "success": false,
  "message": "You are not authorized to update this service."
}
```

## Backend Controller Example (Node.js/Express)

```javascript
exports.updateService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { service_description, service_startingprice, service_title } = req.body;
        const providerId = req.user.provider_id; // From auth middleware

        // Prevent title changes
        if (service_title !== undefined) {
            return res.status(400).json({
                success: false,
                message: "Service title cannot be modified."
            });
        }

        // Validate at least one field is provided
        if (service_description === undefined && service_startingprice === undefined) {
            return res.status(400).json({
                success: false,
                message: "At least one field (service_description or service_startingprice) is required."
            });
        }

        // Check service exists and belongs to provider
        const [service] = await db.query(
            'SELECT * FROM services WHERE service_id = ? AND provider_id = ?',
            [serviceId, providerId]
        );

        if (!service || service.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found or you don't have permission to update it."
            });
        }

        // Build dynamic update query
        const updates = [];
        const values = [];

        if (service_description !== undefined) {
            if (service_description.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Service description cannot be empty."
                });
            }
            updates.push('service_description = ?');
            values.push(service_description.trim());
        }

        if (service_startingprice !== undefined) {
            if (isNaN(service_startingprice) || service_startingprice <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Service starting price must be a positive number."
                });
            }
            updates.push('service_startingprice = ?');
            values.push(service_startingprice);
        }

        updates.push('updated_at = NOW()');
        values.push(serviceId, providerId);

        // Execute update
        await db.query(
            `UPDATE services SET ${updates.join(', ')} WHERE service_id = ? AND provider_id = ?`,
            values
        );

        // Fetch updated service
        const [updatedService] = await db.query(
            'SELECT * FROM services WHERE service_id = ?',
            [serviceId]
        );

        res.status(200).json({
            success: true,
            message: "Service updated successfully",
            data: updatedService[0]
        });

    } catch (error) {
        console.error('Update Service Error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
```

## Frontend Code (Already Correct - No Changes Needed)

The frontend implementation is already correct and follows best practices:

```typescript
// ✅ Only sends editable fields
const updateData = {
    service_description: editDescription.trim(),
    service_startingprice: priceNum,
};

await updateService(selectedService.service_id, updateData, token);
```

## Summary

### Backend Changes Required:
1. ✅ Remove validation that requires `service_title`
2. ✅ Accept partial updates (only description and/or price)
3. ✅ Reject any attempts to update `service_title`
4. ✅ Use dynamic SQL update to only update provided fields
5. ✅ Validate each field individually if provided

### Frontend Status:
✅ Already implemented correctly - no changes needed

## Testing After Backend Fix

Once backend is fixed, test these scenarios:

1. **Update only description**
```json
{ "service_description": "New description" }
```

2. **Update only price**
```json
{ "service_startingprice": 750 }
```

3. **Update both fields**
```json
{
  "service_description": "New description",
  "service_startingprice": 750
}
```

4. **Attempt to update title (should fail)**
```json
{ "service_title": "New Title" }
```

5. **Empty body (should fail)**
```json
{}
```
