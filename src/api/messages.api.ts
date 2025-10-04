import { API_CONFIG } from '../constants/config';
import type {
    ApiErrorResponse,
    Conversation,
    ConversationDetailsResponse,
    ConversationResponse,
    CreateConversationResponse,
    MessagesResponse,
    SearchMessagesResponse,
    SendMessageResponse,
} from '../types/message';

/**
 * Get all conversations for a provider
 * @param token - JWT authentication token
 * @param page - Page number for pagination
 * @param limit - Number of conversations per page
 * @param includeCompleted - Include completed/closed conversations
 */
export const getConversations = async (
  token: string,
  page: number = 1,
  limit: number = 20,
  includeCompleted: boolean = true
): Promise<Conversation[]> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/messages/conversations?userType=provider&page=${page}&limit=${limit}&includeCompleted=${includeCompleted}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data: ConversationResponse | ApiErrorResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        (data as ApiErrorResponse).message || 'Failed to fetch conversations'
      );
    }

    return (data as ConversationResponse).conversations || [];
  } catch (error: any) {
    console.error('Get Conversations Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Get conversation details with messages
 * @param conversationId - The ID of the conversation
 * @param token - JWT authentication token
 */
export const getConversationDetails = async (
  conversationId: number,
  token: string
): Promise<Conversation> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/messages/conversations/${conversationId}?userType=provider`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result: ConversationDetailsResponse | ApiErrorResponse =
      await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        (result as ApiErrorResponse).message || 'Failed to fetch conversation details'
      );
    }

    if (!(result as ConversationDetailsResponse).data) {
      throw new Error('No conversation data received');
    }

    return (result as ConversationDetailsResponse).data;
  } catch (error: any) {
    console.error('Get Conversation Details Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Get messages in a conversation (paginated)
 * @param conversationId - The ID of the conversation
 * @param token - JWT authentication token
 * @param page - Page number for pagination
 * @param limit - Number of messages per page
 */
export const getMessages = async (
  conversationId: number,
  token: string,
  page: number = 1,
  limit: number = 50
): Promise<MessagesResponse> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data: MessagesResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error('Failed to fetch messages');
    }

    return data;
  } catch (error: any) {
    console.error('Get Messages Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Send a message (text, image, or document)
 * @param conversationId - The ID of the conversation
 * @param content - Message content
 * @param token - JWT authentication token
 * @param messageType - Type of message (text, image, document)
 * @param replyToId - Optional message ID to reply to
 * @param attachment - Optional file attachment
 */
export const sendMessage = async (
  conversationId: number,
  content: string,
  token: string,
  messageType: 'text' | 'image' | 'document' = 'text',
  replyToId?: number,
  attachment?: {
    uri: string;
    name: string;
    type: string;
  }
): Promise<SendMessageResponse> => {
  try {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('messageType', messageType);
    formData.append('userType', 'provider');

    if (replyToId) {
      formData.append('replyToId', replyToId.toString());
    }

    if (attachment) {
      // @ts-ignore - React Native FormData handles this differently
      formData.append('attachment', {
        uri: attachment.uri,
        name: attachment.name,
        type: attachment.type,
      });
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/messages/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData, let the browser set it with boundary
        },
        body: formData,
      }
    );

    const data: SendMessageResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to send message');
    }

    return data;
  } catch (error: any) {
    console.error('Send Message Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Mark messages as read
 * @param conversationId - The ID of the conversation
 * @param messageIds - Array of message IDs to mark as read
 * @param token - JWT authentication token
 */
export const markMessagesAsRead = async (
  conversationId: number,
  messageIds: number[],
  token: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/messages/conversations/${conversationId}/messages/read`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageIds }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to mark messages as read');
    }
  } catch (error: any) {
    console.error('Mark Messages As Read Error:', error);
    // Don't throw error for read receipts - fail silently
  }
};

/**
 * Search messages across conversations
 * @param query - Search term
 * @param token - JWT authentication token
 * @param conversationId - Optional conversation ID to limit search
 * @param page - Page number for pagination
 * @param limit - Number of results per page
 */
export const searchMessages = async (
  query: string,
  token: string,
  conversationId?: number,
  page: number = 1,
  limit: number = 20
): Promise<SearchMessagesResponse> => {
  try {
    let url = `${API_CONFIG.BASE_URL}/api/messages/search?query=${encodeURIComponent(
      query
    )}&userType=provider&page=${page}&limit=${limit}`;

    if (conversationId) {
      url += `&conversationId=${conversationId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data: SearchMessagesResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error('Failed to search messages');
    }

    return data;
  } catch (error: any) {
    console.error('Search Messages Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Create a new conversation
 * @param customerId - The ID of the customer
 * @param providerId - The ID of the provider
 * @param token - JWT authentication token
 */
export const createConversation = async (
  customerId: number,
  providerId: number,
  token: string
): Promise<Conversation> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/messages/conversations`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          providerId,
          userType: 'provider',
        }),
      }
    );

    const result: CreateConversationResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to create conversation');
    }

    return result.data;
  } catch (error: any) {
    console.error('Create Conversation Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Archive a conversation
 * @param conversationId - The ID of the conversation
 * @param token - JWT authentication token
 */
export const archiveConversation = async (
  conversationId: number,
  token: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/messages/conversations/${conversationId}/archive`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to archive conversation');
    }
  } catch (error: any) {
    console.error('Archive Conversation Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};
