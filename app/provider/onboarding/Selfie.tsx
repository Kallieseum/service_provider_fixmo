import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
} from 'react-native';
import {useState} from 'react';
import {useRouter} from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function SelfieScreen() {
    const router = useRouter();
    const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);

    const handleNext = () => {
        if (!selfiePhoto) {
            Alert.alert('Missing Photo', 'Please upload a selfie with your valid ID.');
            return;
        }

        router.push('/provider/onboarding/selectservice');
    };

    const handleTakePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Required', 'Camera access is needed to take your selfie.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelfiePhoto(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Selfie Photo with Valid ID</Text>

            {/* Photo Section */}
            <View style={styles.photoSection}>
                {selfiePhoto ? (
                    <Image source={{uri: selfiePhoto}} style={styles.photoPreview}/>
                ) : (
                    <View style={styles.cameraPlaceholder}>
                        <Image
                            source={require('@/assets/images/fixmo logo.png')} // replace with your icon
                            style={styles.cameraIcon}
                        />
                    </View>

                )}

                <TouchableOpacity style={styles.addPhotoButton} onPress={handleTakePhoto}>
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
            </View>

            {/* Instructions */}
            <Text style={styles.instructions}>
                Take a selfie with your valid ID next to your face. Make sure your face and information on your document
                are clearly visible.
            </Text>

            {/* Next Button */}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 20, backgroundColor: '#fff'},
    backButton: {marginBottom: 10},
    backArrow: {fontSize: 24, color: '#333'},
    title: {fontSize: 22, fontWeight: 'bold', marginBottom: 20},
    photoSection: {alignItems: 'center', marginBottom: 20},
    cameraPlaceholder: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIcon: {
        width: 40,
        height: 40,
        tintColor: '#888',
        resizeMode: 'contain',
    },
    addPhotoButton: {
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#007AFF',
    },
    addPhotoText: {color: '#fff', fontSize: 16},
    photoPreview: {
        width: 160,
        height: 160,
        borderRadius: 80,
        resizeMode: 'cover',
    },
    instructions: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    nextButton: {
        backgroundColor: '#008080',
        paddingVertical: 15,
        borderRadius: 40,
        alignItems: 'center',
    },
    nextText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
});