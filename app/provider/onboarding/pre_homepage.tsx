import {useState, useRef} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Pressable,
    ScrollView,
    ImageSourcePropType,
    Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {useUserContext} from '@/context/UserContext';   // ✅ now includes notifications
import {Link, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';

type TabKey = 'home' | 'task' | 'calendar' | 'chat' | 'profile';

const tabIcons: Record<TabKey, ImageSourcePropType> = {
    home: require('../../assets/images/home icon.png'),
    task: require('../../assets/images/task icon.png'),
    calendar: require('../../assets/images/calendar icon.png'),
    chat: require('../../assets/images/chat icon.png'),
    profile: require('../../assets/images/profile icon.png'),
};

export default function Pre_homepage() {
    const {user, notificationCount} = useUserContext(); // ✅ get user + notifications
    const [activeTab, setActiveTab] = useState<TabKey>('home');
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const scrollRef = useRef<ScrollView>(null);

    const formattedName = user?.name
        ? user.name
            .split(' ')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
        : 'Guest';

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning,';
        if (hour < 18) return 'Good Afternoon,';
        return 'Good Evening,';
    };

    const greetingText = getGreeting();

    const tabs: { key: TabKey; label: string }[] = [
        {key: 'home', label: 'Home'},
        {key: 'task', label: 'Tasks'},
        {key: 'calendar', label: 'Calendar'},
        {key: 'chat', label: 'Chat'},
        {key: 'profile', label: 'Profile'},
    ];

    const handleTabPress = (tabKey: TabKey) => {
        setActiveTab(tabKey);

        switch (tabKey) {
            case 'home':
                scrollRef.current?.scrollTo({y: 0, animated: true});
                break;

            case 'task':
                if (user?.status === 'approved') {
                    router.push('/provider/onboarding/fixmo_to');
                } else {
                    Alert.alert(
                        'Not available yet',
                        'Your account is pending approval. Please wait until it is approved to access this feature.',
                        [{text: 'Okay', onPress: () => router.push('/provider/onboarding/pre_homepage')}]
                    );
                }
                break;

            case 'calendar':
                if (user?.status === 'approved') {
                    router.push('/provider/onboarding/calendarscreen');
                } else {
                    Alert.alert(
                        'Not available yet',
                        'Your account is pending. Please wait until it is approved to access this feature.',
                        [{text: 'Okay', onPress: () => router.push('/provider/onboarding/pre_homepage')}]
                    );
                }
                break;

            case 'chat':
                if (user?.status === 'approved') {
                    router.push('/provider/onboarding/chatlist');
                } else {
                    Alert.alert(
                        'Not available yet',
                        'Your account is pending. Please wait until it is approved to access this feature.',
                        [{text: 'Okay', onPress: () => router.push('/provider/onboarding/pre_homepage')}]
                    );
                }
                break;

            case 'profile':
                router.push('/provider/onboarding/providerprofile');
                break;
        }
    };

    return (
        <View style={styles.screen}>
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={[styles.scrollContent, {paddingTop: insets.top + 20}]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.greetingRow}>
                        <Image
                            source={require('../../assets/images/userprofile icon.png')}
                            style={styles.avatar}
                        />
                        <View style={styles.greetingBlock}>
                            <Text style={styles.greeting}>{greetingText}</Text>
                            <Text style={styles.name}>{formattedName}</Text>
                        </View>
                    </View>

                    <Link href="/notification" asChild>
                        <Pressable>
                            <View style={styles.bellWrapper}>
                                <Ionicons name="notifications" size={25} color={'#008080'}/>
                                {notificationCount > 0 && ( // ✅ use real notif count
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{notificationCount}</Text>
                                    </View>
                                )}
                            </View>
                        </Pressable>
                    </Link>
                </View>

                {/* FixMo Today */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>FixMo Today</Text>
                    <View style={styles.pendingBox}>
                        <Image
                            source={require('../../assets/images/fixmo-logo.png')}
                            style={styles.fixmoLogo}
                        />
                        <Text style={styles.pendingText}>
                            Your account is currently under review. Once{' '}
                            <Text style={styles.highlight}>approved</Text>, you'll start receiving bookings here.
                        </Text>
                    </View>
                </View>

                {/* Availability */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Availability</Text>
                    <View style={styles.pendingBox}>
                        <Text style={styles.pendingText}>
                            Availability will be enabled once your account is approved.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Blob Background */}
            <View style={styles.blobWrapper}>
                <Svg width="100%" height={80} viewBox="0 0 400 80">
                    <Path d="M0,40 C100,80 300,0 400,40 L400,80 L0,80 Z" fill="#B2EBF2"/>
                </Svg>
            </View>

            {/* Bottom Navigation */}
            <View style={styles.navBar}>
                {tabs.map((tab) => (
                    <Pressable
                        key={tab.key}
                        onPress={() => handleTabPress(tab.key)}
                        style={({pressed}) => [
                            styles.navIconWrapper,
                            activeTab === tab.key && styles.activeCircle,
                            activeTab === tab.key && {transform: [{translateY: -35}]},
                            pressed && {opacity: 0.7},
                        ]}
                    >
                        <Image
                            source={tabIcons[tab.key]}
                            style={[styles.navIcon, activeTab === tab.key && styles.activeIcon]}
                        />
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1, backgroundColor: '#fff'},
    scrollContent: {paddingBottom: 100},
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    greetingRow: {flexDirection: 'row', alignItems: 'center'},
    avatar: {width: 45, height: 45, borderRadius: 25, marginRight: 10},
    greetingBlock: {flexDirection: 'column'},
    greeting: {fontSize: 14, color: '#333'},
    name: {fontSize: 17, fontWeight: 'bold', color: '#008080'},
    bellWrapper: {position: 'relative'},
    badge: {
        position: 'absolute',
        right: -5,
        top: -5,
        backgroundColor: 'red',
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 1,
    },
    badgeText: {color: 'white', fontSize: 10, fontWeight: 'bold'},
    section: {marginHorizontal: 20, marginBottom: 20},
    sectionTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
    pendingBox: {
        backgroundColor: '#f2f2f2',
        borderRadius: 30,
        padding: 15,
        alignItems: 'center',
    },
    fixmoLogo: {width: 40, height: 40, marginBottom: 10},
    pendingText: {fontSize: 14, color: '#555', textAlign: 'center'},
    highlight: {fontWeight: 'bold', color: '#009688'},
    blobWrapper: {position: 'absolute', bottom: 0, width: '100%', height: 80, zIndex: -1},
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
        shadowColor: '#fff',
    },
    activeCircle: {backgroundColor: '#fff', elevation: 8},
    navIcon: {width: 40, height: 40, tintColor: '#008080'},
    activeIcon: {tintColor: '#008080'},
});
