import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { 
    getMyPushTokens, 
    sendTestNotification, 
    getNotificationStats,
    registerPushToken 
} from '@/api/notifications.api';
import { registerForPushNotificationsAsync } from '@/utils/notificationhelper';

export default function NotificationDebugScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [tokens, setTokens] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [currentToken, setCurrentToken] = useState<string | null>(null);
    const [providerId, setProviderId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = await AsyncStorage.getItem('providerToken');
            const id = await AsyncStorage.getItem('provider_id');
            setProviderId(id);

            if (!token) {
                Alert.alert('Error', 'Not logged in');
                return;
            }

            // Get current expo push token
            const expoPushToken = await AsyncStorage.getItem('pushToken');
            setCurrentToken(expoPushToken);

            // Get registered tokens from backend
            const registeredTokens = await getMyPushTokens(token, 'provider');
            setTokens(registeredTokens);

            // Get notification stats
            const notifStats = await getNotificationStats(token, 'provider');
            setStats(notifStats);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const handleRegisterToken = async () => {
        setLoading(true);
        try {
            const authToken = await AsyncStorage.getItem('providerToken');
            const id = await AsyncStorage.getItem('provider_id');

            if (!authToken || !id) {
                Alert.alert('Error', 'Not logged in');
                return;
            }

            // Get fresh push token
            const pushToken = await registerForPushNotificationsAsync();
            
            if (!pushToken) {
                Alert.alert('Error', 'Could not get push token. Check permissions.');
                return;
            }

            console.log('📱 Got push token:', pushToken);

            // Register with backend
            const result = await registerPushToken(
                pushToken,
                parseInt(id),
                'provider',
                'android', // or detect platform
                authToken
            );

            if (result.success) {
                Alert.alert('Success', 'Push token registered successfully!');
                await loadData(); // Reload data
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error: any) {
            console.error('Register token error:', error);
            Alert.alert('Error', error.message || 'Failed to register token');
        } finally {
            setLoading(false);
        }
    };

    const handleSendTest = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('providerToken');
            
            if (!token) {
                Alert.alert('Error', 'Not logged in');
                return;
            }

            const result = await sendTestNotification(
                token,
                'provider',
                'Test Notification 🔔',
                'This is a test notification from FixMo!'
            );

            if (result.success) {
                Alert.alert('Success', 'Test notification sent! Check your device.');
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error: any) {
            console.error('Send test error:', error);
            Alert.alert('Error', error.message || 'Failed to send test');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckPermissions = async () => {
        const { status } = await Notifications.getPermissionsAsync();
        Alert.alert(
            'Notification Permissions',
            `Current status: ${status}\n\n${
                status === 'granted' 
                    ? '✅ Permissions are granted' 
                    : '❌ Permissions not granted. Please enable in settings.'
            }`
        );
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Push Notifications Debug</Text>
                <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={24} color="#00796B" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Provider Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Provider Info</Text>
                    <View style={styles.infoBox}>
                        <Text style={styles.label}>Provider ID:</Text>
                        <Text style={styles.value}>{providerId || 'Not set'}</Text>
                    </View>
                </View>

                {/* Current Token */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current Push Token</Text>
                    <View style={styles.infoBox}>
                        <Text style={styles.tokenText} numberOfLines={3}>
                            {currentToken || 'No token stored locally'}
                        </Text>
                    </View>
                </View>

                {/* Registered Tokens */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Registered Tokens ({tokens.length})
                    </Text>
                    {tokens.length === 0 ? (
                        <View style={styles.infoBox}>
                            <Text style={styles.emptyText}>
                                ❌ No tokens registered with backend
                            </Text>
                            <Text style={styles.hintText}>
                                Press "Register Token" below to fix this
                            </Text>
                        </View>
                    ) : (
                        tokens.map((token, index) => (
                            <View key={index} style={styles.tokenCard}>
                                <Text style={styles.tokenLabel}>
                                    Token {index + 1}
                                </Text>
                                <Text style={styles.tokenValue} numberOfLines={2}>
                                    {token.expoPushToken || token.expo_push_token}
                                </Text>
                                <Text style={styles.tokenMeta}>
                                    Platform: {token.deviceInfo?.platform || 'Unknown'}
                                </Text>
                                <Text style={styles.tokenMeta}>
                                    Registered: {new Date(token.createdAt || token.created_at).toLocaleDateString()}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Statistics */}
                {stats && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Statistics</Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>
                                    {stats.totalTokens || 0}
                                </Text>
                                <Text style={styles.statLabel}>Total Tokens</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>
                                    {stats.activeTokens || 0}
                                </Text>
                                <Text style={styles.statLabel}>Active</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={handleRegisterToken}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="add-circle" size={20} color="#FFF" />
                                <Text style={styles.buttonText}>Register Token</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={handleSendTest}
                        disabled={loading || tokens.length === 0}
                    >
                        <Ionicons name="paper-plane" size={20} color="#00796B" />
                        <Text style={styles.secondaryButtonText}>Send Test Notification</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={handleCheckPermissions}
                    >
                        <Ionicons name="shield-checkmark" size={20} color="#00796B" />
                        <Text style={styles.secondaryButtonText}>Check Permissions</Text>
                    </TouchableOpacity>
                </View>

                {/* Help Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Troubleshooting</Text>
                    <View style={styles.helpBox}>
                        <Text style={styles.helpText}>
                            ✅ If you see "No tokens registered":
                        </Text>
                        <Text style={styles.helpStep}>
                            1. Press "Register Token" button
                        </Text>
                        <Text style={styles.helpStep}>
                            2. Wait for success message
                        </Text>
                        <Text style={styles.helpStep}>
                            3. Press "Send Test Notification"
                        </Text>
                        <Text style={styles.helpStep}>
                            4. Check if notification appears
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
    },
    refreshButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    content: {
        flex: 1,
    },
    section: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    infoBox: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    tokenText: {
        fontSize: 12,
        color: '#333',
        fontFamily: 'monospace',
    },
    tokenCard: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    tokenLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    tokenValue: {
        fontSize: 11,
        color: '#666',
        fontFamily: 'monospace',
        marginBottom: 8,
    },
    tokenMeta: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    emptyText: {
        fontSize: 14,
        color: '#F44336',
        textAlign: 'center',
        marginBottom: 8,
    },
    hintText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#00796B',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        gap: 8,
    },
    primaryButton: {
        backgroundColor: '#00796B',
    },
    secondaryButton: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#00796B',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#00796B',
    },
    helpBox: {
        backgroundColor: '#E8F5E9',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    helpText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E7D32',
        marginBottom: 12,
    },
    helpStep: {
        fontSize: 13,
        color: '#2E7D32',
        marginLeft: 8,
        marginBottom: 4,
    },
});
