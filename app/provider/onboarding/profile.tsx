import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {useState} from 'react';
import {useRouter} from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {Ionicons} from '@expo/vector-icons';

// ✅ Validation helper (can be moved to utils/validation.ts)
function validateRequiredFields(fields: { label: string; value: string | null }[]): boolean {
    for (const field of fields) {
        if (!field.value || !field.value.trim()) {
            Alert.alert('Missing Information', `Please enter your ${field.label} to continue.`);
            return false;
        }
    }
    return true;
}

export default function ProfileScreen() {
    const router = useRouter();
    const [photo, setPhoto] = useState<string | null>(null);
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob] = useState('');

    const openCamera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
        }
    };

    const handleNext = () => {
        const isValid = validateRequiredFields([
            {label: 'first name', value: firstName},
            {label: 'last name', value: lastName},

        ]);

        if (!isValid) return;

        router.push('/provider/onboarding/id-verification');
    };

    return (
        <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333"/>
                    </TouchableOpacity>

                    <Text style={styles.title}>Basic Information</Text>
                    <Text style={styles.subtext}>
                        Your full name will help us verify your identity and display it to customers.
                    </Text>

                    <TouchableOpacity onPress={openCamera} style={styles.photoContainer}>
                        {photo ? (
                            <Image source={{uri: photo}} style={styles.photo}/>
                        ) : (
                            <View style={styles.iconCircle}>
                                <Image
                                    source={require('@/assets/images/fixmo logo.png')}
                                    style={styles.cameraIcon}
                                />
                            </View>
                        )}
                        <Text style={styles.addPhotoText}>Add Photo</Text>
                    </TouchableOpacity>

                    <Text style={styles.instructions}>
                        *Clearly visible face{'\n'}*Without sunglasses{'\n'}*Good lighting without filters
                    </Text>

                    <View style={styles.labelRow}>
                        <Text style={styles.labelText}>First Name</Text>
                        <Text style={styles.requiredAsterisk}>*</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter first name"
                        value={firstName}
                        onChangeText={(text => setFirstName(text.toUpperCase()))}
                    />

                    <View style={styles.labelRow}>
                        <Text style={styles.labelText}>Middle Name (optional)</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter middle name"
                        value={middleName}
                        onChangeText={(text) => setMiddleName(text.toUpperCase())}
                    />

                    <View style={styles.labelRow}>
                        <Text style={styles.labelText}>Last Name</Text>
                        <Text style={styles.requiredAsterisk}>*</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter last name"
                        value={lastName}
                        onChangeText={(text) => setLastName(text.toUpperCase())}
                    />

                    <View style={styles.labelRow}>
                        <Text style={styles.labelText}>Date of Birth</Text>
                    </View>
                    <TouchableOpacity style={styles.dateInput}>
                        <Text style={{color: dob ? '#000' : '#999'}}>
                            {dob || 'Select date'}
                        </Text>
                        <Text style={styles.dropdownArrow}>▼</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextText}>Next</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333"/>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtext: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    cameraIcon: {
        width: 50,
        height: 50,
        tintColor: '#008080',
    },
    addPhotoText: {
        fontSize: 14,
        color: '#007AFF',
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    instructions: {
        fontSize: 14,
        color: '#666',
        textAlign: 'justify',
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    labelText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    requiredAsterisk: {
        color: 'red',
        marginLeft: 2,
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 40,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#f9f9f9',
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f9f9f9',
        marginBottom: 12,
    },
    dropdownArrow: {
        fontSize: 18,
        color: '#888',
    },
    nextButton: {
        backgroundColor: '#008080',
        paddingVertical: 15,
        borderRadius: 40,
        alignItems: 'center',
    },
    nextText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
    },
});