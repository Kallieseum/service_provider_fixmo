import React, {useRef, useState} from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    Image,
    ImageSourcePropType,
    Alert,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {useUserContext} from '@/context/UserContext'; //

type TabKey = 'home' | 'task' | 'calendar' | 'chat' | 'profile';

const tabIcons: Record<TabKey, ImageSourcePropType> = {
    home: require('../../assets/images/home icon.png'),
    task: require('../../assets/images/task icon.png'),
    calendar: require('../../assets/images/calendar icon.png'),
    chat: require('../../assets/images/chat icon.png'),
    profile: require('../../assets/images/profile icon.png'),
};

const tabs: { key: TabKey }[] = [
    {key: 'home'},
    {key: 'task'},
    {key: 'calendar'},
    {key: 'chat'},
    {key: 'profile'},
];

const menuItems = [
    {label: 'Edit Profile', icon: 'create-outline'},
    {label: 'Notification', icon: 'notifications-outline'},
    {label: 'Update Certificate', icon: 'document-text-outline'},
    {label: 'Privacy Policy', icon: 'shield-outline'},
    {label: 'Ratings', icon: 'star-outline'},
    {label: 'Log Out', icon: 'log-out-outline'},
];

export default function ProviderProfile() {
    const scrollRef = useRef<ScrollView>(null);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabKey>('profile');
    const {user} = useUserContext(); //

    const handleTabPress = (tabKey: TabKey) => {
        setActiveTab(tabKey);

        const fallback = () =>
            Alert.alert(
                'Not available yet',
                'Your account is pending approval. Please wait until it is approved to access this feature.',
                [{text: 'Okay', onPress: () => router.push('/provider/onboarding/pre_homepage')}]
            );

        switch (tabKey) {
            case 'home':
                router.replace('/provider/onboarding/pre_homepage');
                break;
            case 'task':
                user.status === 'approved'
                    ? router.push('/provider/onboarding/fixmo_to')
                    : fallback();
                break;
            case 'calendar':
                user.status === 'approved'
                    ? router.push('/provider/onboarding/calendarscreen')
                    : fallback();
                break;
            case 'chat':
                user.status === 'approved'
                    ? router.push('/provider/onboarding/chatlist')
                    : fallback();
                break;
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView ref={scrollRef} contentContainerStyle={{paddingBottom: 120}}>
                {/* Header */}
                <View style={styles.header}>
                    <Ionicons name="person-circle-outline" size={80} color="#008080"/>
                    <Text style={styles.name}>{user?.name || 'Unnamed User'}</Text>
                    <Text style={styles.phone}>{user?.phone || 'No phone available'}</Text>
                </View>

                {/* Menu Items */}
                <View style={styles.menuList}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.menuItem}>
                            <View style={styles.menuLeft}>
                                <Ionicons name={item.icon} size={25} color="#555"/>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </View>
                            <Ionicons name="chevron-forward-outline" size={20} color="#aaa"/>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.navBar}>
                {tabs.map(tab => (
                    <Pressable
                        key={tab.key}
                        onPress={() => handleTabPress(tab.key)}
                        style={({pressed}) => [
                            styles.navIconWrapper,
                            activeTab === tab.key && styles.activeCircle,
                            activeTab === tab.key && {transform: [{translateY: -20}]},
                            pressed && {opacity: 0.7},
                        ]}
                    >
                        <Image
                            source={tabIcons[tab.key]}
                            style={[
                                styles.navIcon,
                                activeTab === tab.key && styles.activeIcon,
                            ]}
                        />
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff'},
    header: {alignItems: 'center', marginTop: 40, marginBottom: 30},
    name: {fontSize: 20, fontWeight: '600', color: '#333'},
    phone: {fontSize: 14, color: '#666'},
    menuList: {borderTopWidth: 1, borderColor: '#eee', paddingHorizontal: 20},
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,

    },
    menuLeft: {flexDirection: 'row', alignItems: 'center'},
    menuLabel: {marginLeft: 12, fontSize: 16, color: '#333'},
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        paddingVertical: 12,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        elevation: 4,
    },
    navIconWrapper: {
        width: 70,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 0,
        shadowColor: '#fff',
    },
    activeCircle: {
        backgroundColor: '#fff',
        elevation: 8,
    },
    navIcon: {
        width: 40,
        height: 40,
        tintColor: '#008080',
    },
    activeIcon: {
        tintColor: '#008080',
    },
});