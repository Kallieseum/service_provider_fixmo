import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {useRouter, useLocalSearchParams} from 'expo-router';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';

const CELL_COUNT = 6;

export default function OTPScreen() {
    const router = useRouter();
    const {phone} = useLocalSearchParams();
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({value, setValue});
    const [timer, setTimer] = useState(40); // 1:00 countdown
    const [isResendVisible, setIsResendVisible] = useState(false);

    // Format phone number: 912 345 6789
    const formatPhone = (raw?: string) => {
        if (!raw || raw.length !== 10) return raw;
        return `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`;
    };

    // Countdown logic
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        } else {
            setIsResendVisible(true);
        }
    }, [timer]);

    const formatTime = () => {
        const mins = Math.floor(timer / 60);
        const secs = timer % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVerify = () => {
        if (value.length === 6) {
            // You can validate OTP here
            router.push('/provider/onboarding/agreement');
        } else {
            alert('Please enter the full 6-digit code');
        }
    };

    const handleResend = () => {

        alert('OTP resent!');
        setTimer(66); // restart countdown
        setIsResendVisible(false);
    };

    return (
        <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Enter the 6-digit code</Text>
                <Text style={styles.subtitle}>
                    Sent to <Text style={styles.phone}>+63 {formatPhone(phone as string)}</Text>
                </Text>

                <CodeField
                    ref={ref}
                    {...props}
                    value={value}
                    onChangeText={setValue}
                    cellCount={CELL_COUNT}
                    rootStyle={styles.codeFieldRoot}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    renderCell={({index, symbol, isFocused}) => (
                        <Text
                            key={index}
                            style={[styles.cell, isFocused && styles.focusCell]}
                            onLayout={getCellOnLayoutHandler(index)}
                        >
                            {symbol || (isFocused ? <Cursor/> : null)}
                        </Text>
                    )}
                />

                <TouchableOpacity style={styles.button} onPress={handleVerify}>
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>

                {isResendVisible ? (
                    <TouchableOpacity onPress={handleResend}>
                        <Text style={styles.resendButton}>Resend Code</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.resend}>
                        Didn’t receive the code? Request again in {formatTime()}
                    </Text>
                )}
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
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
        textAlign: 'center',
        color: '#555',
    },
    phone: {
        fontWeight: 'bold',
        color: '#000',
    },
    codeFieldRoot: {
        marginBottom: 20,
        justifyContent: 'center',
    },
    cell: {
        width: 40,
        height: 50,
        lineHeight: 48,
        fontSize: 24,
        borderWidth: 2,
        borderColor: '#ccc',
        textAlign: 'center',
        marginHorizontal: 5,
        borderRadius: 8,
    },
    focusCell: {
        borderColor: '#008080',
    },
    button: {
        backgroundColor: '#008080',
        paddingVertical: 14,
        borderRadius: 30,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    resend: {
        marginTop: 20,
        textAlign: 'center',
        color: '#888',
    },
    resendButton: {
        marginTop: 20,
        textAlign: 'center',
        color: '#008080',
        fontWeight: 'bold',
        fontSize: 16,
    },
});