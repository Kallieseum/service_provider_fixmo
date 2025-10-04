import { MessageService } from '../utils/messageAPI';
import type {
    Conversation,
    Message,
    MessagesResponse,
    SearchMessagesResponse,
    SendMessageResponse,
    ApiErrorResponse,
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
    // Ensure MessageService is initialized
    let messageAPI = MessageService.getInstance();
    if (!messageAPI) {
      messageAPI = MessageService.initialize(token);
    }

    const result = await messageAPI.getConversations('provider', page, limit, includeCompleted);

    if (!result.success) {
      throw new Error((result as ApiErrorResponse).message || 'Failed to fetch conversations');
    }

    return result.conversations || [];
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
    let messageAPI = MessageService.getInstance();
    if (!messageAPI) {
      messageAPI = MessageService.initialize(token);
    }

    const result = await messageAPI.getConversationDetails(conversationId, 'provider');

    if (!result.success) {
      throw new Error((result as ApiErrorResponse).message || 'Failed to fetch conversation details');
    }

    if (!result.data) {
      throw new Error('No conversation data received');
    }

    return result.data;
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
    let messageAPI = MessageService.getInstance();
    if (!messageAPI) {
      messageAPI = MessageService.initialize(token);
    }

    const result = await messageAPI.getMessages(conversationId, page, limit);

    if (!result.success) {
      throw new Error('Failed to fetch messages');
    }

    return result as MessagesResponse;
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
    let messageAPI = MessageService.getInstance();
    if (!messageAPI) {
      messageAPI = MessageService.initialize(token);
    }

    const attachmentData = attachment ? {
      uri: attachment.uri,
      name: attachment.name,
      type: attachment.type,
    } : undefined;

    const result = await messageAPI.sendMessage(
      conversationId,
      content,
      messageType,
      replyToId,
      attachmentData,
      'provider'
    );

    if (!result.success) {
      throw new Error((result as ApiErrorResponse).message || 'Failed to send message');
    }

    return result as SendMessageResponse;
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
    let messageAPI = MessageService.getInstance();
    if (!messageAPI) {
      messageAPI = MessageService.initialize(token);
    }

    const result = await messageAPI.markAsRead(conversationId, messageIds);

    if (!result.success) {
      throw new Error((result as ApiErrorResponse).message || 'Failed to mark messages as read');
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
    let messageAPI = MessageService.getInstance();
    if (!messageAPI) {
      messageAPI = MessageService.initialize(token);
    }

    const result = await messageAPI.searchMessages(
      query,
      conversationId,
      page,
      limit,
      'provider'
    );

    if (!result.success) {
      throw new Error('Failed to search messages');
    }

    return result as SearchMessagesResponse;
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
    let messageAPI = MessageService.getInstance();
    if (!messageAPI) {
      messageAPI = MessageService.initialize(token);
    }

    const result = await messageAPI.createConversation(customerId, providerId, 'provider');

    if (!result.success) {
      throw new Error((result as ApiErrorResponse).message || 'Failed to create conversation');
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
    let messageAPI = MessageService.getInstance();
    if (!messageAPI) {
      messageAPI = MessageService.initialize(token);
    }

    const result = await messageAPI.archiveConversation(conversationId);

    if (!result.success) {
      throw new Error((result as ApiErrorResponse).message || 'Failed to archive conversation');
    }
  } catch (error: any) {
    console.error('Archive Conversation Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

