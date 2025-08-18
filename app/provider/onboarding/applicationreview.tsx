import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {useRouter} from 'expo-router';

export default function ApplicationReview() {
    const router = useRouter();

    const handleContinue = () => {
        router.push('/provider/onboarding/locationpermission');
    };

    return (
        <View style={styles.container}>


            {/* Logo */}
            <Image
                source={require('@/assets/images/fixmo logo.png')} // update path as needed
                style={styles.logo}
                resizeMode="contain"
            />

            {/* Message */}
            <Text style={styles.title}>Application Submitted!</Text>
            <Text style={styles.message}>
                Thanks for applying to join FixMo. Our team is reviewing your details.
                You'll be notified once your application is approved.
            </Text>

            {/* Continue Button */}
            <TouchableOpacity style={styles.button} onPress={handleContinue}>
                <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    header: {
        color: '#888',
        fontSize: 16,
        marginBottom: 20,
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#444',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: '#008080',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});