import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, parseISO } from "date-fns";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getConversations } from "../../src/api/messages.api";
import type { Conversation } from "../../src/types/message";

export default function MessagesListScreen() {
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        // Filter conversations based on search query
        if (searchQuery.trim() === "") {
            setFilteredConversations(conversations);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = conversations.filter((conv) => {
                const customerName = conv.customer
                    ? `${conv.customer.first_name} ${conv.customer.last_name}`.toLowerCase()
                    : "";
                const lastMessageContent = conv.last_message?.content?.toLowerCase() || "";
                return customerName.includes(query) || lastMessageContent.includes(query);
            });
            setFilteredConversations(filtered);
        }
    }, [searchQuery, conversations]);

    const fetchConversations = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem("providerToken");
            if (!token) {
                Alert.alert("Error", "Authentication required. Please log in again.");
                return;
            }

            const data = await getConversations(token, 1, 50, true);
            
            // Sort by last_message_at or updated_at, most recent first
            const sorted = data.sort((a, b) => {
                const dateA = a.last_message_at || a.updated_at;
                const dateB = b.last_message_at || b.updated_at;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });
            
            setConversations(sorted);
            setFilteredConversations(sorted);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to load conversations");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations();
    };

    const openConversation = (conversation: Conversation) => {
        router.push({
            pathname: "/messaging/chat",
            params: {
                conversationId: conversation.conversation_id.toString(),
                customerId: conversation.customer_id.toString(),
                customerName: conversation.customer
                    ? `${conversation.customer.first_name} ${conversation.customer.last_name}`
                    : "Customer",
                customerPhone: conversation.customer?.phone_number || "",
                customerPhoto: conversation.customer?.profile_photo || "",
            },
        });
    };

    const formatTimestamp = (dateString?: string) => {
        if (!dateString) return "";
        try {
            const date = parseISO(dateString);
            const now = new Date();
            const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

            if (diffInHours < 24) {
                return format(date, "h:mm a");
            } else if (diffInHours < 48) {
                return "Yesterday";
            } else if (diffInHours < 168) {
                return format(date, "EEE");
            } else {
                return format(date, "MMM d");
            }
        } catch {
            return "";
        }
    };

    const renderConversationItem = ({ item }: { item: Conversation }) => {
        const customerName = item.customer
            ? `${item.customer.first_name} ${item.customer.last_name}`
            : "Customer";
        const lastMessage = item.last_message?.content || "No messages yet";
        const unreadCount = item.unread_count || 0;
        const timestamp = formatTimestamp(item.last_message_at || item.updated_at);
        const isUnread = unreadCount > 0;

        return (
            <TouchableOpacity
                style={[styles.conversationItem, isUnread && styles.unreadItem]}
                onPress={() => openConversation(item)}
                activeOpacity={0.7}
            >
                <View style={styles.avatarContainer}>
                    {item.customer?.profile_photo ? (
                        <Image
                            source={{ uri: item.customer.profile_photo }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarText}>
                                {customerName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                    {isUnread && <View style={styles.onlineIndicator} />}
                </View>

                <View style={styles.conversationContent}>
                    <View style={styles.headerRow}>
                        <Text
                            style={[
                                styles.customerName,
                                isUnread && styles.unreadText,
                            ]}
                            numberOfLines={1}
                        >
                            {customerName}
                        </Text>
                        <Text style={styles.timestamp}>{timestamp}</Text>
                    </View>

                    <View style={styles.messageRow}>
                        {item.last_message?.message_type === "image" && (
                            <Ionicons
                                name="image-outline"
                                size={14}
                                color="#666"
                                style={styles.messageTypeIcon}
                            />
                        )}
                        {item.last_message?.message_type === "document" && (
                            <Ionicons
                                name="document-outline"
                                size={14}
                                color="#666"
                                style={styles.messageTypeIcon}
                            />
                        )}
                        <Text
                            style={[
                                styles.lastMessage,
                                isUnread && styles.unreadText,
                            ]}
                            numberOfLines={1}
                        >
                            {item.last_message?.sender_type === "provider" && "You: "}
                            {lastMessage}
                        </Text>
                    </View>
                </View>

                {isUnread && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadCount}>
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1e6355" />
                    <Text style={styles.loadingText}>Loading conversations...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Messages</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search conversations..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Conversations List */}
            {filteredConversations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyText}>
                        {searchQuery ? "No conversations found" : "No messages yet"}
                    </Text>
                    <Text style={styles.emptySubtext}>
                        {searchQuery
                            ? "Try a different search term"
                            : "Your conversations with customers will appear here"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredConversations}
                    renderItem={renderConversationItem}
                    keyExtractor={(item) => item.conversation_id.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#1e6355"]}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#666",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#000",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
        color: "#000",
    },
    listContainer: {
        paddingBottom: 16,
    },
    conversationItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    unreadItem: {
        backgroundColor: "#f8fffe",
    },
    avatarContainer: {
        position: "relative",
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarPlaceholder: {
        backgroundColor: "#1e6355",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "600",
    },
    onlineIndicator: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: "#4CAF50",
        borderWidth: 2,
        borderColor: "#fff",
    },
    conversationContent: {
        flex: 1,
        justifyContent: "center",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    customerName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#000",
        flex: 1,
    },
    timestamp: {
        fontSize: 12,
        color: "#999",
        marginLeft: 8,
    },
    messageRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    messageTypeIcon: {
        marginRight: 4,
    },
    lastMessage: {
        fontSize: 14,
        color: "#666",
        flex: 1,
    },
    unreadText: {
        fontWeight: "600",
        color: "#000",
    },
    unreadBadge: {
        backgroundColor: "#1e6355",
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 6,
        marginLeft: 8,
    },
    unreadCount: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#666",
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        marginTop: 8,
    },
});
