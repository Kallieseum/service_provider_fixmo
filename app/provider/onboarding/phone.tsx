import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useState} from 'react';

export default function PhoneScreen() {
    const router = useRouter();
    const [phone, setPhone] = useState('');

    const handleNext = () => {
        if (phone.length === 10) {
            router.push('/provider/onboarding/otp');
        } else {
            alert('Please enter a valid 10-digit phone number');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.container}>
                {/* Back Arrow */}
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333"/>
                </TouchableOpacity>

                {/* Header Text */}
                <Text style={styles.title}>Join us via phone number</Text>
                <Text style={styles.subtitle}>we'll text a code to verify your phone.</Text>

                {/* Phone Input */}
                <View style={styles.phoneContainer}>
                    <Text style={styles.countryCode}>🇵🇭 +63</Text>
                    <TextInput
                        style={styles.phoneInput}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="000-000-0000"
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                </View>
            </View>

            {/* Next Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 20,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 30,
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 20,
    },
    countryCode: {
        fontSize: 16,
        marginRight: 10,
    },
    phoneInput: {
        flex: 1,
        fontSize: 16,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    nextButton: {
        backgroundColor: '#008080',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
        alignItems: 'center',
    },
    nextText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});