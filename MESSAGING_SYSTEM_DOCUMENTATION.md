# FixMo Messaging System - Complete Implementation Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Endpoints](#api-endpoints)
4. [TypeScript Types & Interfaces](#typescript-types--interfaces)
5. [MessageAPI Service Class](#messageapi-service-class)
6. [Socket.IO Real-time Implementation](#socketio-real-time-implementation)
7. [UI Implementation (React Native)](#ui-implementation-react-native)
8. [Authentication & Authorization](#authentication--authorization)
9. [Error Handling](#error-handling)
10. [Service Provider Implementation Guide](#service-provider-implementation-guide)

---

## 🎯 Overview

The FixMo Messaging System is a comprehensive real-time messaging platform that enables communication between **Customers** and **Service Providers**. It features:

- Real-time bidirectional communication using Socket.IO
- Message persistence and retrieval
- Read receipts and typing indicators
- Image and document attachments
- Message search functionality
- Conversation warranty tracking
- Read-only mode for completed jobs

**Backend URL**: `http://192.168.1.27:3000`
**API Base Path**: `/api/messages`
**Socket.IO Path**: Same as backend URL (no `/ws` path needed)

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  React Native   │◄───────►│   Express API    │◄───────►│   PostgreSQL    │
│  (Customer App) │  HTTP   │  + Socket.IO     │   ORM   │   Database      │
└─────────────────┘         └──────────────────┘         └─────────────────┘
         │                           │
         │      Socket.IO            │
         └───────────────────────────┘
              Real-time Events
```

### Key Components:

1. **MessageAPI Class** - HTTP API wrapper for REST endpoints
2. **Socket.IO Client** - Real-time bidirectional communication
3. **MessageService Singleton** - Centralized token and instance management
4. **Type Definitions** - TypeScript interfaces for type safety

---

## 🌐 API Endpoints

### Base Configuration
```typescript
const BACKEND_URL = 'http://192.168.1.27:3000';
const API_BASE = `${BACKEND_URL}/api/messages`;
```

### 1. Get Conversations List

**Endpoint**: `GET /api/messages/conversations`

**Query Parameters**:
- `userType`: `'customer' | 'provider'` (required)
- `page`: `number` (default: 1)
- `limit`: `number` (default: 20)
- `includeCompleted`: `boolean` (default: true)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Response**:
```typescript
{
  success: boolean;
  conversations: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

**Example Request**:
```typescript
GET /api/messages/conversations?userType=customer&page=1&limit=20&includeCompleted=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response**:
```json
{
  "success": true,
  "conversations": [
    {
      "conversation_id": 123,
      "customer_id": 456,
      "provider_id": 789,
      "status": "active",
      "warranty_expires": "2025-12-31T23:59:59.000Z",
      "created_at": "2025-10-01T10:00:00.000Z",
      "updated_at": "2025-10-04T15:30:00.000Z",
      "last_message_at": "2025-10-04T15:30:00.000Z",
      "unread_count": 3,
      "is_warranty_active": true,
      "appointment_status": "completed",
      "customer": {
        "user_id": 456,
        "first_name": "John",
        "last_name": "Doe",
        "profile_photo": "https://...",
        "phone_number": "+639123456789"
      },
      "provider": {
        "provider_id": 789,
        "provider_first_name": "Maria",
        "provider_last_name": "Santos",
        "provider_profile_photo": "https://...",
        "provider_phone_number": "+639987654321",
        "provider_rating": 4.8
      },
      "last_message": {
        "message_id": 1001,
        "conversation_id": 123,
        "sender_id": 789,
        "sender_type": "provider",
        "content": "I'll be there at 2 PM",
        "message_type": "text",
        "is_read": false,
        "created_at": "2025-10-04T15:30:00.000Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

---

### 2. Create New Conversation

**Endpoint**: `POST /api/messages/conversations`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```typescript
{
  customerId: number;
  providerId: number;
  userType: 'customer' | 'provider';
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
  data: Conversation;
}
```

**Example Request**:
```json
POST /api/messages/conversations
{
  "customerId": 456,
  "providerId": 789,
  "userType": "customer"
}
```

---

### 3. Get Conversation Details

**Endpoint**: `GET /api/messages/conversations/:conversationId`

**Query Parameters**:
- `userType`: `'customer' | 'provider'` (optional)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
```typescript
{
  success: boolean;
  data: Conversation; // Includes all messages and participant details
}
```

---

### 4. Get Messages in Conversation

**Endpoint**: `GET /api/messages/conversations/:conversationId/messages`

**Query Parameters**:
- `page`: `number` (default: 1)
- `limit`: `number` (default: 50)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
```typescript
{
  success: boolean;
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    has_more: boolean;
  };
}
```

**Example Response**:
```json
{
  "success": true,
  "messages": [
    {
      "message_id": 1001,
      "conversation_id": 123,
      "sender_id": 456,
      "sender_type": "customer",
      "content": "Hello, when can you fix my aircon?",
      "message_type": "text",
      "attachment_url": null,
      "is_read": true,
      "replied_to_id": null,
      "created_at": "2025-10-04T14:00:00.000Z",
      "updated_at": "2025-10-04T14:00:00.000Z"
    },
    {
      "message_id": 1002,
      "conversation_id": 123,
      "sender_id": 789,
      "sender_type": "provider",
      "content": "I'll be there at 2 PM",
      "message_type": "text",
      "attachment_url": null,
      "is_read": false,
      "replied_to_id": 1001,
      "created_at": "2025-10-04T15:30:00.000Z",
      "updated_at": "2025-10-04T15:30:00.000Z",
      "replied_to": {
        "message_id": 1001,
        "content": "Hello, when can you fix my aircon?",
        "sender_type": "customer",
        "created_at": "2025-10-04T14:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "has_more": false
  }
}
```

---

### 5. Send Message

**Endpoint**: `POST /api/messages/conversations/:conversationId/messages`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Form Data**:
- `content`: `string` (required) - Message text
- `messageType`: `'text' | 'image' | 'document'` (required)
- `userType`: `'customer' | 'provider'` (required)
- `replyToId`: `number` (optional) - ID of message being replied to
- `attachment`: `File` (optional) - Image or document file

**Response**:
```typescript
{
  success: boolean;
  message: string;
  data: Message; // The created message
}
```

**Example Request (Text Message)**:
```typescript
const formData = new FormData();
formData.append('content', 'Hello, I need help!');
formData.append('messageType', 'text');
formData.append('userType', 'customer');

POST /api/messages/conversations/123/messages
Body: FormData
```

**Example Request (Image Message)**:
```typescript
const formData = new FormData();
formData.append('content', 'Here is the broken part');
formData.append('messageType', 'image');
formData.append('userType', 'customer');
formData.append('attachment', imageFile);

POST /api/messages/conversations/123/messages
Body: FormData
```

---

### 6. Mark Messages as Read

**Endpoint**: `PUT /api/messages/conversations/:conversationId/messages/read`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```typescript
{
  messageIds: number[]; // Array of message IDs to mark as read
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

**Example Request**:
```json
PUT /api/messages/conversations/123/messages/read
{
  "messageIds": [1001, 1002, 1003]
}
```

---

### 7. Search Messages

**Endpoint**: `GET /api/messages/search`

**Query Parameters**:
- `query`: `string` (required) - Search term
- `conversationId`: `number` (optional) - Limit to specific conversation
- `userType`: `'customer' | 'provider'` (optional)
- `page`: `number` (default: 1)
- `limit`: `number` (default: 20)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
```typescript
{
  success: boolean;
  messages: Array<Message & { conversation: Conversation }>;
  pagination: {
    page: number;
    limit: number;
    has_more: boolean;
  };
}
```

**Example Request**:
```
GET /api/messages/search?query=aircon&userType=customer&page=1&limit=20
```

---

### 8. Archive Conversation

**Endpoint**: `PUT /api/messages/conversations/:conversationId/archive`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

### 9. Upload File

**Endpoint**: `POST /api/messages/upload`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Form Data**:
- `conversationId`: `number` (required)
- `file`: `File` (required)
- `senderType`: `'customer' | 'provider'` (required)

**Response**:
```typescript
{
  success: boolean;
  message: string;
  data: Message;
}
```

---

## 📦 TypeScript Types & Interfaces

### Core Types

```typescript
// User Profiles
export interface CustomerProfile {
  user_id: number;
  first_name: string;
  last_name: string;
  profile_photo?: string;
  phone_number?: string;
}

export interface ProviderProfile {
  provider_id: number;
  provider_first_name: string;
  provider_last_name: string;
  provider_profile_photo?: string;
  provider_phone_number?: string;
  provider_rating?: number;
}

// Message
export interface Message {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  sender_type: 'customer' | 'provider';
  content: string;
  message_type: 'text' | 'image' | 'document';
  attachment_url?: string;
  is_read: boolean;
  replied_to_id?: number;
  created_at: string; // ISO 8601 date string
  updated_at: string;
  replied_to?: {
    message_id: number;
    content: string;
    sender_type: 'customer' | 'provider';
    created_at: string;
  };
}

// Conversation
export interface Conversation {
  conversation_id: number;
  customer_id: number;
  provider_id: number;
  status: 'active' | 'closed' | 'archived';
  warranty_expires?: string; // ISO 8601 date string
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  participant: ProviderProfile | CustomerProfile; // Depends on userType
  last_message?: Message;
  unread_count: number;
  is_warranty_active: boolean;
  appointment_status: string; // e.g., 'completed', 'cancelled', 'scheduled'
  customer?: CustomerProfile;
  provider?: ProviderProfile;
  messages?: Message[];
  _count?: {
    messages: number;
  };
}

// API Response Types
export interface ConversationResponse {
  success: boolean;
  conversations: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ConversationDetailsResponse {
  success: boolean;
  data: Conversation;
}

export interface MessagesResponse {
  success: boolean;
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    has_more: boolean;
  };
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: Message;
}

export interface CreateConversationResponse {
  success: boolean;
  message: string;
  data: Conversation;
}

export interface SearchMessagesResponse {
  success: boolean;
  messages: Array<Message & { conversation: Conversation }>;
  pagination: {
    page: number;
    limit: number;
    has_more: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

// WebSocket/Socket.IO Types
export interface WebSocketMessage {
  type: 'new_message' | 'message_read' | 'conversation_closed' | 'join_conversation';
  message?: Message;
  messageId?: number;
  conversationId?: number;
  userId?: number;
  userType?: 'customer' | 'provider';
}
```

---

## 🔧 MessageAPI Service Class

### Complete Implementation

```typescript
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = 'http://192.168.1.27:3000';

export class MessageAPI {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string = `${BACKEND_URL}/api`, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  /**
   * Make authenticated HTTP request to API
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T | ApiErrorResponse> {
    const fullUrl = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        // Handle token expiration
        return {
          success: false,
          message: 'Session expired'
        } as ApiErrorResponse;
      }

      if (!response.ok) {
        const errorData = await response.json();
        return errorData as ApiErrorResponse;
      }

      return await response.json() as T;
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred'
      } as ApiErrorResponse;
    }
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(
    userType: 'customer' | 'provider', 
    page = 1, 
    limit = 20,
    includeCompleted = true
  ): Promise<ConversationResponse | ApiErrorResponse> {
    return this.makeRequest<ConversationResponse>(
      `/messages/conversations?userType=${userType}&page=${page}&limit=${limit}&includeCompleted=${includeCompleted}`
    );
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    customerId: number, 
    providerId: number, 
    userType: 'customer' | 'provider'
  ): Promise<CreateConversationResponse | ApiErrorResponse> {
    return this.makeRequest<CreateConversationResponse>('/messages/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, providerId, userType })
    });
  }

  /**
   * Get conversation details with messages
   */
  async getConversationDetails(
    conversationId: number, 
    userType?: 'customer' | 'provider'
  ): Promise<ConversationDetailsResponse | ApiErrorResponse> {
    const query = userType ? `?userType=${userType}` : '';
    return this.makeRequest<ConversationDetailsResponse>(
      `/messages/conversations/${conversationId}${query}`
    );
  }

  /**
   * Get messages in a conversation (paginated)
   */
  async getMessages(
    conversationId: number, 
    page = 1, 
    limit = 50
  ): Promise<MessagesResponse | ApiErrorResponse> {
    return this.makeRequest<MessagesResponse>(
      `/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
  }

  /**
   * Send a message (text, image, or document)
   */
  async sendMessage(
    conversationId: number,
    content: string,
    messageType: 'text' | 'image' | 'document' = 'text',
    replyToId?: number,
    attachment?: File,
    userType?: 'customer' | 'provider'
  ): Promise<SendMessageResponse | ApiErrorResponse> {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('messageType', messageType);
    
    if (replyToId) {
      formData.append('replyToId', replyToId.toString());
    }
    
    if (attachment) {
      formData.append('attachment', attachment);
    }

    if (userType) {
      formData.append('userType', userType);
    }

    return this.makeRequest<SendMessageResponse>(
      `/messages/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: formData
      }
    );
  }

  /**
   * Mark messages as read
   */
  async markAsRead(
    conversationId: number, 
    messageIds: number[]
  ): Promise<{ success: boolean; message: string } | ApiErrorResponse> {
    return this.makeRequest<{ success: boolean; message: string }>(
      `/messages/conversations/${conversationId}/messages/read`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds })
      }
    );
  }

  /**
   * Search messages across conversations
   */
  async searchMessages(
    query: string, 
    conversationId?: number, 
    page = 1, 
    limit = 20,
    userType?: 'customer' | 'provider'
  ): Promise<SearchMessagesResponse | ApiErrorResponse> {
    let url = `/messages/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
    
    if (conversationId) {
      url += `&conversationId=${conversationId}`;
    }

    if (userType) {
      url += `&userType=${userType}`;
    }

    return this.makeRequest<SearchMessagesResponse>(url);
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(
    conversationId: number
  ): Promise<{ success: boolean; message: string } | ApiErrorResponse> {
    return this.makeRequest<{ success: boolean; message: string }>(
      `/messages/conversations/${conversationId}/archive`,
      { method: 'PUT' }
    );
  }

  /**
   * Create Socket.IO connection for real-time messaging
   */
  createSocketIOConnection(): Socket {
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      forceNew: true,
      timeout: 10000,
      auth: {
        token: this.token
      },
      extraHeaders: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
      
      // Authenticate immediately after connection
      socket.emit('authenticate', {
        token: this.token,
        userType: 'provider' // Change to 'provider' for service provider app
      });
    });
    
    socket.on('authenticated', (data) => {
      console.log('✅ Authenticated:', data);
    });

    socket.on('authentication_failed', (error) => {
      console.error('❌ Authentication failed:', error);
    });
    
    return socket;
  }

  /**
   * Join a conversation room for real-time updates
   */
  joinConversation(
    socket: Socket, 
    conversationId: number, 
    userId: number, 
    userType: 'customer' | 'provider'
  ): void {
    // Listen for authentication success first
    socket.on('authenticated', () => {
      // Now join the conversation
      socket.emit('join_conversation', {
        conversationId: parseInt(conversationId.toString())
      });
    });

    // If already authenticated, join immediately
    if (socket.connected) {
      socket.emit('join_conversation', {
        conversationId: parseInt(conversationId.toString())
      });
    }

    // Listen for join confirmation
    socket.on('joined_conversation', (data) => {
      console.log('✅ Joined conversation:', data);
    });

    socket.on('join_conversation_failed', (error) => {
      console.error('❌ Failed to join:', error);
    });
  }
}

/**
 * Singleton service for managing MessageAPI instance
 */
export class MessageService {
  private static instance: MessageAPI | null = null;

  static initialize(token: string, baseUrl?: string): MessageAPI {
    MessageService.instance = new MessageAPI(baseUrl, token);
    return MessageService.instance;
  }

  static getInstance(): MessageAPI | null {
    return MessageService.instance;
  }

  static updateToken(token: string): void {
    if (MessageService.instance) {
      // @ts-ignore - accessing private property
      MessageService.instance.token = token;
    }
  }
}
```

---

## 🔌 Socket.IO Real-time Implementation

### Socket.IO Events

#### Client → Server Events

1. **`authenticate`**
   ```typescript
   socket.emit('authenticate', {
     token: string,
     userType: 'customer' | 'provider'
   });
   ```

2. **`join_conversation`**
   ```typescript
   socket.emit('join_conversation', {
     conversationId: number
   });
   ```

3. **`send_message`** (Alternative to HTTP POST)
   ```typescript
   socket.emit('send_message', {
     conversationId: number,
     content: string,
     messageType: 'text' | 'image' | 'document'
   });
   ```

4. **`mark_read`**
   ```typescript
   socket.emit('mark_read', {
     conversationId: number,
     messageIds: number[]
   });
   ```

#### Server → Client Events

1. **`authenticated`**
   ```typescript
   socket.on('authenticated', (data: {
     userId: number,
     userType: 'customer' | 'provider',
     socketId: string,
     message: string
   }) => {
     // Authentication successful
   });
   ```

2. **`authentication_failed`**
   ```typescript
   socket.on('authentication_failed', (error: {
     message: string
   }) => {
     // Handle authentication failure
   });
   ```

3. **`joined_conversation`**
   ```typescript
   socket.on('joined_conversation', (data: {
     conversationId: number,
     roomName: string,
     message: string
   }) => {
     // Successfully joined conversation room
   });
   ```

4. **`join_conversation_failed`**
   ```typescript
   socket.on('join_conversation_failed', (error: {
     message: string
   }) => {
     // Failed to join conversation
   });
   ```

5. **`new_message`**
   ```typescript
   socket.on('new_message', (data: {
     message: Message
   }) => {
     // New message received in conversation
     // Add to message list and scroll to bottom
   });
   ```

6. **`message_read`**
   ```typescript
   socket.on('message_read', (data: {
     messageId: number,
     conversationId: number
   }) => {
     // Message marked as read
     // Update message read status in UI
   });
   ```

7. **`conversation_closed`**
   ```typescript
   socket.on('conversation_closed', (data: {
     conversationId: number
   }) => {
     // Conversation closed/archived
   });
   ```

### Complete Socket.IO Setup Example

```typescript
import { useEffect, useRef, useState } from 'react';
import { MessageService } from './utils/messageAPI';
import { Socket } from 'socket.io-client';

const useMessaging = (conversationId: number, userId: number, userType: 'customer' | 'provider') => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const messageAPI = MessageService.getInstance();
    if (!messageAPI) return;

    // Create Socket.IO connection
    socketRef.current = messageAPI.createSocketIOConnection();

    // Set up event listeners
    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO');
    });

    socketRef.current.on('authenticated', (data) => {
      console.log('Authenticated:', data);
      setIsConnected(true);
      
      // Join conversation room
      messageAPI.joinConversation(socketRef.current!, conversationId, userId, userType);
    });

    socketRef.current.on('joined_conversation', (data) => {
      console.log('Joined conversation:', data);
    });

    socketRef.current.on('new_message', (data) => {
      // Add new message to list
      setMessages(prev => [...prev, data.message]);
    });

    socketRef.current.on('message_read', (data) => {
      // Update read status
      setMessages(prev => 
        prev.map(msg => 
          msg.message_id === data.messageId 
            ? { ...msg, is_read: true }
            : msg
        )
      );
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from Socket.IO');
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [conversationId, userId, userType]);

  return { socket: socketRef.current, isConnected, messages, setMessages };
};
```

---

## 📱 UI Implementation (React Native)

### Messages List Screen

```typescript
// app/(tabs)/messages.tsx
import { useAuth } from '../../utils/authService';
import { MessageService } from '../../utils/messageAPI';
import { Conversation } from '../../types/message.types';

const MessagesScreen = () => {
  const { userType, token, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated || !token || !userType) return;

    // Initialize MessageService
    if (!MessageService.getInstance()) {
      MessageService.initialize(token);
    }

    loadConversations();
    setupSocketIO();
  }, [isAuthenticated, token, userType]);

  const loadConversations = async () => {
    const messageAPI = MessageService.getInstance();
    if (!messageAPI) return;

    const result = await messageAPI.getConversations(userType, page, 20, true);
    
    if (result.success) {
      setConversations(result.conversations);
    }
    setLoading(false);
  };

  const setupSocketIO = () => {
    const messageAPI = MessageService.getInstance();
    if (!messageAPI) return;

    const socket = messageAPI.createSocketIOConnection();

    socket.on('authenticated', () => {
      console.log('Socket authenticated');
    });

    socket.on('new_message', (data) => {
      // Update conversation list with new message
      updateConversationWithNewMessage(data.message);
    });
  };

  const updateConversationWithNewMessage = (message: Message) => {
    setConversations(prev => 
      prev.map(conv => {
        if (conv.conversation_id === message.conversation_id) {
          return {
            ...conv,
            last_message: message,
            last_message_at: message.created_at,
            unread_count: message.sender_type !== userType 
              ? conv.unread_count + 1 
              : conv.unread_count
          };
        }
        return conv;
      })
    );
  };

  return (
    <FlatList
      data={conversations}
      renderItem={({ item }) => (
        <ConversationItem 
          conversation={item}
          userType={userType}
          onPress={() => openConversation(item)}
        />
      )}
      refreshing={loading}
      onRefresh={loadConversations}
    />
  );
};
```

### Direct Message (Chat) Screen

```typescript
// app/directMessage.tsx
import { MessageService } from '../utils/messageAPI';
import { Message, MessagesResponse } from '../types/message.types';

const DirectMessageScreen = () => {
  const params = useLocalSearchParams();
  const { userType, token, userId } = useAuth();
  
  const conversationId = parseInt(params.conversationId as string);
  const isReadOnly = params.isReadOnly === 'true';

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!conversationId || !token || !userType) return;

    // Initialize MessageService
    if (!MessageService.getInstance()) {
      MessageService.initialize(token);
    }

    loadMessages();
    
    if (!isReadOnly) {
      setupSocketIO();
    }
  }, [conversationId, token, userType]);

  const loadMessages = async () => {
    const messageAPI = MessageService.getInstance();
    if (!messageAPI) return;

    const result = await messageAPI.getMessages(conversationId, 1, 50);
    
    if (result.success) {
      const sortedMessages = result.messages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      setMessages(sortedMessages);

      // Mark unread messages as read
      const unreadIds = result.messages
        .filter(msg => !msg.is_read && msg.sender_type !== userType)
        .map(msg => msg.message_id);
      
      if (unreadIds.length > 0) {
        await messageAPI.markAsRead(conversationId, unreadIds);
      }
    }
    setLoading(false);
  };

  const setupSocketIO = () => {
    const messageAPI = MessageService.getInstance();
    if (!messageAPI) return;

    socketRef.current = messageAPI.createSocketIOConnection();

    socketRef.current.on('authenticated', () => {
      // Join conversation room
      messageAPI.joinConversation(
        socketRef.current!, 
        conversationId, 
        userId, 
        userType
      );
    });

    socketRef.current.on('new_message', (data) => {
      setMessages(prev => [...prev, data.message]);
      
      // Auto-mark as read if not from current user
      if (data.message.sender_type !== userType) {
        messageAPI.markAsRead(conversationId, [data.message.message_id]);
      }
    });

    socketRef.current.on('message_read', (data) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.message_id === data.messageId 
            ? { ...msg, is_read: true }
            : msg
        )
      );
    });
  };

  const handleSend = async () => {
    if (!message.trim() || isReadOnly) return;

    const messageAPI = MessageService.getInstance();
    if (!messageAPI) return;

    const result = await messageAPI.sendMessage(
      conversationId,
      message.trim(),
      'text',
      undefined,
      undefined,
      userType
    );

    if (result.success) {
      setMessage('');
      // Message will be added via Socket.IO event
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <MessageBubble 
            message={item}
            isOwn={item.sender_type === userType}
          />
        )}
      />
      
      {!isReadOnly && (
        <View style={styles.inputContainer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
          />
          <TouchableOpacity onPress={handleSend}>
            <Ionicons name="send" size={24} />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};
```

---

## 🔐 Authentication & Authorization

### JWT Token Structure

```typescript
{
  userId: number;        // Customer user_id
  providerId?: number;   // Provider provider_id (if provider)
  userType: 'customer' | 'provider';
  email: string;
  iat: number;          // Issued at
  exp: number;          // Expiration
}
```

### Token Storage (AsyncStorage)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save token after login
await AsyncStorage.setItem('auth_token', jwtToken);
await AsyncStorage.setItem('user_type', userType);
await AsyncStorage.setItem('user_id', userId.toString());

// Retrieve token
const token = await AsyncStorage.getItem('auth_token');
const userType = await AsyncStorage.getItem('user_type');
const userId = await AsyncStorage.getItem('user_id');

// Initialize MessageService with token
MessageService.initialize(token);
```

### Authorization Checks

- All HTTP requests require `Authorization: Bearer <token>` header
- Socket.IO connections authenticate on connect
- Server validates token and extracts `userId` and `userType`
- Server ensures users can only access their own conversations

---

## ⚠️ Error Handling

### Common Error Scenarios

```typescript
// Network Error
{
  success: false,
  message: 'Network error occurred'
}

// 401 Unauthorized
{
  success: false,
  message: 'Session expired'
}

// 404 Not Found
{
  success: false,
  message: 'Conversation not found'
}

// 403 Forbidden
{
  success: false,
  message: 'You do not have permission to access this conversation'
}

// Validation Error
{
  success: false,
  message: 'Content is required'
}
```

### Error Handling Example

```typescript
const sendMessage = async () => {
  const messageAPI = MessageService.getInstance();
  if (!messageAPI) {
    Alert.alert('Error', 'Message service not initialized');
    return;
  }

  const result = await messageAPI.sendMessage(
    conversationId,
    content,
    'text'
  );

  if (!result.success) {
    // Handle error
    const error = result as ApiErrorResponse;
    
    if (error.message === 'Session expired') {
      // Redirect to login
      router.push('/login');
    } else {
      Alert.alert('Error', error.message);
    }
    return;
  }

  // Success
  const response = result as SendMessageResponse;
  console.log('Message sent:', response.data);
};
```

---

## 🚀 Service Provider Implementation Guide

### Step 1: Install Dependencies

```bash
npm install socket.io-client
npm install @react-native-async-storage/async-storage
```

### Step 2: Copy Type Definitions

Create `types/message.types.ts` and copy all interfaces from the [TypeScript Types & Interfaces](#typescript-types--interfaces) section.

### Step 3: Create MessageAPI Service

Create `utils/messageAPI.ts` and copy the complete MessageAPI class implementation from the [MessageAPI Service Class](#messageapi-service-class) section.

**Important Change**: Update `userType` to `'provider'`:

```typescript
socket.emit('authenticate', {
  token: this.token,
  userType: 'provider' // Changed from 'customer'
});
```

### Step 4: Create Auth Service (if not exists)

```typescript
// utils/authService.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  userId: number | null;
  userType: 'provider' | null;
  login: (token: string, userId: number) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const userType = 'provider'; // Always provider for this app

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUserId = await AsyncStorage.getItem('user_id');

      if (storedToken && storedUserId) {
        setToken(storedToken);
        setUserId(parseInt(storedUserId));
        setIsAuthenticated(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, newUserId: number) => {
    await AsyncStorage.setItem('auth_token', newToken);
    await AsyncStorage.setItem('user_id', newUserId.toString());
    await AsyncStorage.setItem('user_type', 'provider');

    setToken(newToken);
    setUserId(newUserId);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_id');
    await AsyncStorage.removeItem('user_type');

    setToken(null);
    setUserId(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      token,
      userId,
      userType,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Step 5: Wrap App with AuthProvider

```typescript
// app/_layout.tsx
import { AuthProvider } from '../utils/authService';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        {/* Your screens */}
      </Stack>
    </AuthProvider>
  );
}
```

### Step 6: Implement Messages List Screen

Create `app/(tabs)/messages.tsx` following the example in [UI Implementation](#ui-implementation-react-native) section.

**Key Differences for Service Provider**:
- Use `provider_id` instead of `user_id`
- Display customer names and photos
- `userType` is always `'provider'`

```typescript
// Display customer info
const participantName = `${conversation.customer.first_name} ${conversation.customer.last_name}`;
const participantPhoto = conversation.customer.profile_photo;
const participantPhone = conversation.customer.phone_number;
```

### Step 7: Implement Direct Message Screen

Create `app/directMessage.tsx` following the example in [UI Implementation](#ui-implementation-react-native) section.

### Step 8: Initialize MessageService on App Start

```typescript
// app/_layout.tsx or app/index.tsx
import { useAuth } from '../utils/authService';
import { MessageService } from '../utils/messageAPI';

export default function App() {
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      // Initialize MessageService
      MessageService.initialize(token);
    }
  }, [isAuthenticated, token]);

  return (
    // Your app components
  );
}
```

### Step 9: Test Connection

```typescript
// Test Socket.IO connection
const testConnection = async () => {
  const messageAPI = MessageService.getInstance();
  if (!messageAPI) {
    console.error('MessageService not initialized');
    return;
  }

  const socket = messageAPI.createSocketIOConnection();

  socket.on('connect', () => {
    console.log('✅ Connected!');
  });

  socket.on('authenticated', (data) => {
    console.log('✅ Authenticated:', data);
  });

  socket.on('authentication_failed', (error) => {
    console.error('❌ Auth failed:', error);
  });
};
```

---

## 📝 Summary Checklist for Service Provider App

- [ ] Install dependencies (`socket.io-client`, `@react-native-async-storage/async-storage`)
- [ ] Copy `types/message.types.ts` (all interfaces)
- [ ] Copy `utils/messageAPI.ts` (MessageAPI and MessageService classes)
- [ ] Change `userType` to `'provider'` in Socket.IO authentication
- [ ] Create `utils/authService.tsx` with provider-specific logic
- [ ] Wrap app with `<AuthProvider>`
- [ ] Create `app/(tabs)/messages.tsx` (conversations list)
- [ ] Create `app/directMessage.tsx` (chat screen)
- [ ] Initialize MessageService on app start with JWT token
- [ ] Display customer info (not provider info) in conversations
- [ ] Test Socket.IO connection and real-time messaging
- [ ] Handle token expiration (401 errors)
- [ ] Implement pull-to-refresh for conversations
- [ ] Add loading states and error handling
- [ ] Test on both iOS and Android

---

## 🎓 Additional Notes

### Network Configuration
- Ensure mobile devices are on same network as backend (192.168.1.27)
- Update `BACKEND_URL` in `messageAPI.ts` if backend IP changes
- For production, use HTTPS and secure WebSocket (wss://)

### Performance Optimization
- Messages are paginated (50 per page)
- Conversations are paginated (20 per page)
- Socket.IO automatically reconnects on network issues
- Implement message caching with AsyncStorage for offline support

### Security Best Practices
- Never log JWT tokens in production
- Validate all user inputs before sending
- Handle token expiration gracefully
- Use HTTPS in production
- Implement rate limiting on backend

### Testing Tips
- Test with multiple devices simultaneously
- Test network disconnection/reconnection
- Test token expiration scenarios
- Test with large message histories
- Test file uploads with various sizes

---

**Created**: October 4, 2025  
**Backend**: Express.js + Socket.IO + PostgreSQL  
**Frontend**: React Native + Expo Router  
**Author**: FixMo Development Team
