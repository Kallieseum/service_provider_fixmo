import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    Modal,
} from 'react-native';
import {useRouter} from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {useState} from 'react';

export default function DrugTestFile() {
    const router = useRouter();
    const [drugTestImage, setDrugTestImage] = useState<string | null>(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
            setDrugTestImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
            setDrugTestImage(result.assets[0].uri);
        }
    };

    const handleNext = () => {
        if (!drugTestImage) {
            Alert.alert('Missing Upload', 'Please upload your Drug Test Clearance.');
            return;
        }

        router.push('/provider/onboarding/applicationreview');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Drug Test Clearance</Text>
            <Text style={styles.subtitle}>You can Add Photo or Upload File.</Text>

            <View style={styles.iconRow}>
                <TouchableOpacity onPress={takePhoto} style={styles.circleButton}>
                    <Image source={require('../../../app/assets/camera.png')} style={styles.icon}/>
                    <Text style={styles.iconLabel}>Add Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={pickImage} style={styles.circleButton}>
                    <Image source={require('../../../app/assets/upload.png')} style={styles.icon}/>
                    <Text style={styles.iconLabel}>Upload File</Text>
                </TouchableOpacity>
            </View>

            {drugTestImage && (
                <Image source={{uri: drugTestImage}} style={styles.preview}/>
            )}

            <Text style={styles.note}>
                Make sure that the information on your document is clearly visible.
            </Text>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#555',
        marginBottom: 16,
    },
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    circleButton: {
        alignItems: 'center',
    },
    icon: {
        width: 60,
        height: 60,
        marginBottom: 6,
    },
    iconLabel: {
        fontSize: 12,
        color: '#333',
    },
    note: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
        marginTop: 8,
    },
    preview: {
        width: '100%',
        height: 200,
        marginTop: 10,
        borderRadius: 8,
    },
    nextButton: {
        backgroundColor: '#28a745',
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20,
    },
    nextText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});