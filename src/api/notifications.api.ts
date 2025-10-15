import { API_CONFIG } from '../constants/config';

/**
 * Register or update push notification token for a provider
 * Backend endpoint: POST /api/notifications/register-token
 */
export async function registerPushToken(
  token: string,
  userId: number,
  userType: 'customer' | 'provider',
  devicePlatform: 'ios' | 'android',
  authToken: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/notifications/register-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        expoPushToken: token,
        userType: userType,
        deviceInfo: {
          platform: devicePlatform,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to register push token');
    }

    console.log('✅ Push token registered with backend:', data);
    return {
      success: true,
      message: data.message || 'Push token registered successfully',
    };
  } catch (error: any) {
    console.error('Register push token error:', error);
    return {
      success: false,
      message: error.message || 'Failed to register push token',
    };
  }
}

/**
 * Remove push token (on logout)
 * Backend endpoint: DELETE /api/notifications/remove-token
 */
export async function removePushToken(
  token: string,
  authToken: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/notifications/remove-token`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        expoPushToken: token,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove push token');
    }

    console.log('✅ Push token removed from backend');
    return { success: true };
  } catch (error: any) {
    console.error('Remove push token error:', error);
    return { success: false };
  }
}

/**
 * Get notification history for current user
 * DISABLED: This endpoint does not exist on the backend
 */
// export async function getNotifications(
//   authToken: string,
//   limit: number = 50
// ): Promise<any[]> {
//   try {
//     const response = await fetch(
//       `${API_CONFIG.BASE_URL}/api/notifications?limit=${limit}`,
//       {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${authToken}`,
//         },
//       }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || 'Failed to fetch notifications');
//     }

//     return data.notifications || [];
//   } catch (error: any) {
//     console.error('Fetch notifications error:', error);
//     return [];
//   }
// }

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: number,
  authToken: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark notification as read');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Mark notification as read error:', error);
    return { success: false };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(
  authToken: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/notifications/read-all`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark all notifications as read');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Mark all notifications as read error:', error);
    return { success: false };
  }
}

/**
 * Get unread notification count
 * Returns 0 if the endpoint doesn't exist (backend may not have implemented this yet)
 */
export async function getUnreadCount(authToken: string): Promise<number> {
  try {
    // Try the dedicated endpoint first (if it exists)
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/notifications/unread-count`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // If endpoint doesn't exist, return 0 (no fallback available)
      console.log('Unread count endpoint not available, returning 0');
      return 0;
    }

    return data.count || 0;
  } catch (error: any) {
    console.log('Unread count endpoint error, returning 0');
    return 0;
  }
}

/**
 * Get all registered push tokens for current user
 * Backend endpoint: GET /api/notifications/my-tokens
 */
export async function getMyPushTokens(
  authToken: string,
  userType: 'customer' | 'provider'
): Promise<any[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/notifications/my-tokens?userType=${userType}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch push tokens');
    }

    return data.tokens || [];
  } catch (error: any) {
    console.error('Get push tokens error:', error);
    return [];
  }
}

/**
 * Send a test notification to yourself
 * Backend endpoint: POST /api/notifications/test
 */
export async function sendTestNotification(
  authToken: string,
  userType: 'customer' | 'provider',
  title: string = 'Test Notification',
  body: string = 'This is a test notification from FixMo'
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/notifications/test`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          userType,
          title,
          body,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send test notification');
    }

    console.log('✅ Test notification sent:', data);
    return {
      success: true,
      message: data.message || 'Test notification sent successfully',
    };
  } catch (error: any) {
    console.error('Send test notification error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send test notification',
    };
  }
}

/**
 * Get notification statistics
 * Backend endpoint: GET /api/notifications/stats
 */
export async function getNotificationStats(
  authToken: string,
  userType: 'customer' | 'provider'
): Promise<any> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/notifications/stats?userType=${userType}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch notification stats');
    }

    return data.stats || {};
  } catch (error: any) {
    console.error('Get notification stats error:', error);
    return {};
  }
}
