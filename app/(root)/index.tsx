import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {useRouter} from 'expo-router';

export default function SplashScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Image source={require('@/assets/images/fixmo logo.png')} style={styles.logo}/>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/provider/onboarding/dashboard')}
            >
                <Text style={styles.buttonText}>I'm a FixMo Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/provider/onboarding/phone')}
            >
                <Text style={styles.buttonText}>I'm a FixMo Provider</Text>
            </TouchableOpacity>

            <Text style={styles.bottomText}>
                Ipa-<Text style={{color: '#008080', fontWeight: 'bold'}}>FixMo</Text> na 'yan!
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 40,
        resizeMode: 'contain',
    },
    button: {
        backgroundColor: '#008080',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 40,
        marginVertical: 10,
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    bottomText: {
        position: 'absolute',
        bottom: 20,
        fontSize: 14,
        color: '#555',
    },
});