import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {useRouter} from 'expo-router';

export default function AgreementScreen() {
    const router = useRouter();

    const handleAgree = () => {
        router.push('/provider/onboarding/profile');
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('@/assets/images/fixmo logo.png')} //
                style={styles.logo}
                resizeMode="contain"
            />

            <Text style={styles.title}>We’ve updated FixMo' Terms and Privacy Policy.</Text>
            <Text style={styles.text}>
                To keep using our app, please review the updated <Text
                style={{color: '#008080', fontWeight: 'bold'}}> Terms of Use and Privacy Policy</Text>.
                Tap ‘I Agree’ to accept the changes and continue.
            </Text>

            <TouchableOpacity style={styles.button} onPress={handleAgree}>
                <Text style={styles.buttonText}>I Agree</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff'},
    logo: {width: 200, height: 200, alignSelf: 'center', marginBottom: 30},
    title: {fontSize: 22, fontWeight: '600', marginBottom: 10, textAlign: 'center'},
    text: {fontSize: 16, marginBottom: 40, textAlign: 'justify', color: '#555'},
    button: {
        backgroundColor: '#008080',
        paddingVertical: 14,
        borderRadius: 30,
        marginTop: 10,
    },
    buttonText: {color: '#fff', fontSize: 16, textAlign: 'center'},
});