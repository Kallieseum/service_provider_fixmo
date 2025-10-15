# 📱 Service Provider App - Report Submission Guide

## Overview
This guide explains how to submit reports (bugs, complaints, feedback) from the Service Provider app to the Fixmo backend.

---

## 📡 API Endpoint

```
POST /api/reports
```

**Base URL**: `https://your-backend-url.com`

**Authentication**: Not required (public endpoint)

**Content-Type**: `multipart/form-data`

---

## 📋 Request Fields

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `reporter_name` | string | Full name of the reporter | "Juan Dela Cruz" |
| `reporter_email` | string | Valid email address | "juan@example.com" |
| `report_type` | string | Type of report (see types below) | "bug" |
| `subject` | string | Brief subject/title | "App crashes on startup" |
| `description` | string | Detailed description | "The app crashes when I try to..." |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `reporter_phone` | string | Contact phone number | "+63 912 345 6789" |
| `reporter_type` | string | Type of reporter | "provider" |
| `provider_id` | integer | Service provider ID (if logged in) | 123 |
| `appointment_id` | integer | Related appointment ID | 456 |
| `priority` | string | Priority level (low, normal, high, urgent) | "normal" |
| `images` | file[] | Image attachments (max 5, 5MB each) | [File, File, File] |

### Report Types

| Value | Label | Use Case |
|-------|-------|----------|
| `bug` | 🐛 Bug Report | App crashes, errors, broken features |
| `complaint` | 😠 Complaint | Service issues, disputes, dissatisfaction |
| `feedback` | 💡 Feedback | Suggestions, improvements, general feedback |
| `account_issue` | 👤 Account Issue | Login problems, profile issues |
| `payment_issue` | 💳 Payment Issue | Payment failures, refund requests |
| `provider_issue` | 🔧 Provider Issue | Provider-specific problems |
| `safety_concern` | ⚠️ Safety Concern | Safety or security concerns |
| `other` | 📝 Other | Anything else |

### Priority Levels

| Value | Description |
|-------|-------------|
| `low` | Minor issues, suggestions |
| `normal` | Regular issues (default) |
| `high` | Important issues affecting functionality |
| `urgent` | Critical issues requiring immediate attention |

---

## 📸 Image Upload Specifications

- **Maximum Files**: 5 images per report
- **Maximum File Size**: 5MB per image
- **Accepted Formats**: JPG, JPEG, PNG, GIF, WebP
- **Field Name**: `images` (use this in FormData)
- **Handling**: Images upload individually; partial success is allowed

---

## 💻 React Native Implementation

### 1. Basic Report Submission (No Images)

```javascript
import axios from 'axios';

const submitReport = async (reportData) => {
  try {
    const response = await axios.post(
      'https://your-backend-url.com/api/reports',
      {
        reporter_name: reportData.name,
        reporter_email: reportData.email,
        reporter_phone: reportData.phone,
        reporter_type: 'provider', // Important: specify it's from provider
        provider_id: reportData.providerId, // If logged in
        report_type: reportData.type,
        subject: reportData.subject,
        description: reportData.description,
        priority: reportData.priority || 'normal'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Report submitted:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error submitting report:', error.response?.data || error.message);
    throw error;
  }
};
```

### 2. Report Submission with Images

```javascript
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const submitReportWithImages = async (reportData, imageUris) => {
  try {
    // Create FormData
    const formData = new FormData();
    
    // Add text fields
    formData.append('reporter_name', reportData.name);
    formData.append('reporter_email', reportData.email);
    formData.append('reporter_phone', reportData.phone || '');
    formData.append('reporter_type', 'provider');
    formData.append('provider_id', reportData.providerId?.toString() || '');
    formData.append('report_type', reportData.type);
    formData.append('subject', reportData.subject);
    formData.append('description', reportData.description);
    formData.append('priority', reportData.priority || 'normal');
    
    // Add images (max 5)
    if (imageUris && imageUris.length > 0) {
      for (let i = 0; i < Math.min(imageUris.length, 5); i++) {
        const uri = imageUris[i];
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('images', {
          uri,
          name: filename,
          type
        });
      }
    }
    
    // Submit report
    const response = await axios.post(
      'https://your-backend-url.com/api/reports',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 seconds timeout
      }
    );

    console.log('✅ Report submitted:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error submitting report:', error.response?.data || error.message);
    throw error;
  }
};
```

### 3. Image Picker Integration

```javascript
import * as ImagePicker from 'expo-image-picker';

const pickImages = async () => {
  try {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return [];
    }

    // Launch image picker (allow multiple selection)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      maxFiles: 5 // Limit to 5 images
    });

    if (!result.canceled) {
      return result.assets.map(asset => asset.uri);
    }
    
    return [];
  } catch (error) {
    console.error('Error picking images:', error);
    return [];
  }
};

// Usage
const selectedImages = await pickImages();
```

### 4. Complete Component Example

```javascript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const ReportSubmissionScreen = ({ navigation, route }) => {
  const { providerId, providerName, providerEmail } = route.params;
  
  const [formData, setFormData] = useState({
    name: providerName || '',
    email: providerEmail || '',
    phone: '',
    type: 'bug',
    subject: '',
    description: '',
    priority: 'normal'
  });
  
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'bug', label: '🐛 Bug Report' },
    { value: 'complaint', label: '😠 Complaint' },
    { value: 'feedback', label: '💡 Feedback' },
    { value: 'account_issue', label: '👤 Account Issue' },
    { value: 'payment_issue', label: '💳 Payment Issue' },
    { value: 'provider_issue', label: '🔧 Provider Issue' },
    { value: 'safety_concern', label: '⚠️ Safety Concern' },
    { value: 'other', label: '📝 Other' }
  ];

  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can only attach up to 5 images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      maxFiles: 5 - images.length
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.description) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('reporter_name', formData.name);
      formDataToSend.append('reporter_email', formData.email);
      formDataToSend.append('reporter_phone', formData.phone);
      formDataToSend.append('reporter_type', 'provider');
      formDataToSend.append('provider_id', providerId?.toString() || '');
      formDataToSend.append('report_type', formData.type);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('priority', formData.priority);
      
      // Add images
      images.forEach((uri, index) => {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formDataToSend.append('images', {
          uri,
          name: filename || `image_${index}.jpg`,
          type
        });
      });
      
      const response = await axios.post(
        'https://your-backend-url.com/api/reports',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000
        }
      );

      Alert.alert(
        'Success',
        'Your report has been submitted. We will review it and respond via email.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit report. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Submit a Report
      </Text>

      {/* Name */}
      <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Name *</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginTop: 8
        }}
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        placeholder="Your full name"
      />

      {/* Email */}
      <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Email *</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginTop: 8
        }}
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        placeholder="your@email.com"
        keyboardType="email-address"
      />

      {/* Phone */}
      <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Phone (Optional)</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginTop: 8
        }}
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
        placeholder="+63 912 345 6789"
        keyboardType="phone-pad"
      />

      {/* Report Type */}
      <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Report Type *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
        {reportTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            onPress={() => setFormData({ ...formData, type: type.value })}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: formData.type === type.value ? '#007AFF' : '#f0f0f0',
              marginRight: 8
            }}
          >
            <Text style={{ color: formData.type === type.value ? '#fff' : '#333' }}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Subject */}
      <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Subject *</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginTop: 8
        }}
        value={formData.subject}
        onChangeText={(text) => setFormData({ ...formData, subject: text })}
        placeholder="Brief description of the issue"
      />

      {/* Description */}
      <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Description *</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginTop: 8,
          minHeight: 120,
          textAlignVertical: 'top'
        }}
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        placeholder="Please provide detailed information about the issue..."
        multiline
        numberOfLines={5}
      />

      {/* Images */}
      <Text style={{ fontWeight: 'bold', marginTop: 12 }}>
        Attachments (Optional) - {images.length}/5
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
        {images.map((uri, index) => (
          <View key={index} style={{ marginRight: 8, position: 'relative' }}>
            <Image
              source={{ uri }}
              style={{ width: 80, height: 80, borderRadius: 8 }}
            />
            <TouchableOpacity
              onPress={() => removeImage(index)}
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: 'red',
                borderRadius: 12,
                width: 24,
                height: 24,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        {images.length < 5 && (
          <TouchableOpacity
            onPress={pickImages}
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: '#ddd',
              borderStyle: 'dashed',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 32, color: '#999' }}>+</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#007AFF',
          padding: 16,
          borderRadius: 8,
          marginTop: 24,
          marginBottom: 40,
          alignItems: 'center'
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            Submit Report
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ReportSubmissionScreen;
```

---

## 📤 API Response

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Report submitted successfully. Admin will review and respond via email.",
  "data": {
    "report_id": 123,
    "reporter_email": "juan@example.com",
    "provider_id": 456,
    "appointment_id": null,
    "report_type": "bug",
    "subject": "App crashes on startup",
    "priority": "normal",
    "status": "pending",
    "has_attachments": true,
    "created_at": "2025-10-15T10:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Fields
```json
{
  "success": false,
  "message": "Missing required fields: reporter_name, reporter_email, report_type, subject, description"
}
```

#### 400 Bad Request - Invalid Email
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

#### 400 Bad Request - Invalid Report Type
```json
{
  "success": false,
  "message": "Invalid report_type. Must be one of: bug, complaint, feedback, account_issue, payment_issue, provider_issue, safety_concern, other"
}
```

#### 400 Bad Request - File Too Large
```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB per file."
}
```

#### 400 Bad Request - Too Many Files
```json
{
  "success": false,
  "message": "Too many files. Maximum is 5 files."
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error submitting report",
  "error": "Detailed error message"
}
```

---

## 🔍 Testing

### Using cURL

```bash
# Without images
curl -X POST https://your-backend-url.com/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "reporter_name": "Juan Dela Cruz",
    "reporter_email": "juan@example.com",
    "reporter_type": "provider",
    "provider_id": 123,
    "report_type": "bug",
    "subject": "Test Report",
    "description": "This is a test report",
    "priority": "normal"
  }'

# With images
curl -X POST https://your-backend-url.com/api/reports \
  -F "reporter_name=Juan Dela Cruz" \
  -F "reporter_email=juan@example.com" \
  -F "reporter_type=provider" \
  -F "provider_id=123" \
  -F "report_type=bug" \
  -F "subject=Test Report" \
  -F "description=This is a test report" \
  -F "priority=normal" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

### Using Postman

1. Create a new POST request to `/api/reports`
2. Select `Body` → `form-data`
3. Add text fields:
   - `reporter_name`: Text
   - `reporter_email`: Text
   - `report_type`: Text
   - `subject`: Text
   - `description`: Text
4. Add image files:
   - `images`: File (select multiple files)
5. Click Send

---

## ✅ Best Practices

### 1. **Input Validation**
- Validate email format on frontend before submission
- Limit description to reasonable length (e.g., 5000 characters)
- Validate image file size before uploading

### 2. **User Experience**
- Show upload progress for images
- Disable submit button while uploading
- Show success/error messages clearly
- Allow users to preview images before submission

### 3. **Error Handling**
- Handle network errors gracefully
- Show specific error messages for different failure types
- Allow retry on failure
- Save draft locally if submission fails

### 4. **Performance**
- Compress images before upload
- Use optimistic UI updates
- Show upload progress indicators
- Implement timeout handling

### 5. **Privacy**
- Pre-fill user information if logged in
- Allow anonymous reports if needed
- Don't expose sensitive information in error messages

---

## 🐛 Troubleshooting

### Issue: "Network Error" when submitting with images

**Solution**: 
- Check internet connection
- Verify image file sizes (max 5MB each)
- Ensure correct `Content-Type: multipart/form-data`
- Increase timeout to 60 seconds

### Issue: "Too many files" error

**Solution**: 
- Limit selection to 5 images maximum
- Check that you're using the correct field name `images`

### Issue: Images not uploading but report submits

**Solution**: 
- This is expected behavior (graceful degradation)
- Check backend logs for Cloudinary errors
- Verify Cloudinary credentials

### Issue: "Invalid report_type" error

**Solution**: 
- Use one of the valid types: `bug`, `complaint`, `feedback`, `account_issue`, `payment_issue`, `provider_issue`, `safety_concern`, `other`

---

## 📞 Support

If you encounter issues:
1. Check the backend logs for detailed error messages
2. Verify all required fields are present
3. Test with Postman first to isolate frontend issues
4. Contact backend team with error logs

---

## 🔄 Changelog

**Version 1.0** (October 2025)
- Initial release
- Support for 8 report types
- Multiple image upload (up to 5)
- Graceful error handling
- Email notifications to admin and reporter
