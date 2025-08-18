import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    Modal,
    Pressable,
} from 'react-native';
import {useState} from 'react';
import {useRouter} from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function IDVerificationScreen() {
    const router = useRouter();

    const [idType, setIdType] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [idPhoto, setIdPhoto] = useState<string | null>(null);
    const [showSourceModal, setShowSourceModal] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);

    const idTypes = [
        'PhilSys (National ID)',
        'Passport',
        'Driver’s License',
        'UMID',
        'SSS',
        'GSIS',
        'NBI',
        'Postal',
        'PRC',
        'Philhealth',
    ];

    const handleNext = () => {
        if (!idType || !idNumber.trim() || !idPhoto) {
            Alert.alert('Missing Information', 'Please complete all fields before continuing.');
            return;
        }

        router.push('/provider/onboarding/Selfie');
    };

    const handlePhotoSource = async (source: 'camera' | 'gallery') => {
        setShowSourceModal(false);

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Required', 'Media access is needed to upload your ID.');
            return;
        }

        const result =
            source === 'camera'
                ? await ImagePicker.launchCameraAsync({allowsEditing: true, quality: 0.8})
                : await ImagePicker.launchImageLibraryAsync({allowsEditing: true, quality: 0.8});

        if (!result.canceled) {
            setIdPhoto(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Valid Government ID</Text>
            <Text style={styles.subtitle}>
                Your full name will help us verify your identity and display it to customers.
            </Text>

            {/* Type of ID */}
            <View style={styles.section}>
                <Text style={styles.label}>Type of ID</Text>
                <TouchableOpacity style={styles.dropdown} onPress={() => setShowTypeModal(true)}>
                    <Text style={{color: idType ? '#000' : '#999'}}>
                        {idType || 'Select ID type'}
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
            </View>

            {/* Photo Upload */}
            <View style={styles.section}>
                <Text style={styles.label}>Valid Government ID</Text>
                <TouchableOpacity style={styles.photoUpload} onPress={() => setShowSourceModal(true)}>
                    {idPhoto ? (
                        <Image source={{uri: idPhoto}} style={styles.photoPreview}/>
                    ) : (
                        <Text style={styles.uploadText}>Add Photo</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* ID Number */}
            <View style={styles.section}>
                <Text style={styles.label}>Valid Government ID number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your ID number"
                    value={idNumber}
                    onChangeText={(text) => setIdNumber(text.toUpperCase())}
                />
            </View>

            {/* Next Button */}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>

            {/* Photo Source Modal */}
            <Modal visible={showSourceModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Source</Text>

                        <Pressable onPress={() => handlePhotoSource('camera')} style={styles.modalOption}>
                            <Text style={styles.modalText}>Take Picture</Text>
                        </Pressable>

                        <Pressable onPress={() => handlePhotoSource('gallery')} style={styles.modalOption}>
                            <Text style={styles.modalText}>Choose from Gallery</Text>
                        </Pressable>

                        <Pressable onPress={() => setShowSourceModal(false)} style={styles.modalCancel}>
                            <Text style={{color: 'red'}}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* ID Type Modal */}
            <Modal visible={showTypeModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select ID Type</Text>
                        {idTypes.map((type) => (
                            <Pressable
                                key={type}
                                onPress={() => {
                                    setIdType(type);
                                    setShowTypeModal(false);
                                }}
                                style={styles.modalOption}
                            >
                                <Text style={styles.modalText}>{type}</Text>
                            </Pressable>
                        ))}
                        <Pressable onPress={() => setShowTypeModal(false)} style={styles.modalCancel}>
                            <Text style={{color: 'red'}}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 20, backgroundColor: '#fff'},
    title: {fontSize: 22, fontWeight: 'bold', marginBottom: 8},
    subtitle: {fontSize: 14, color: '#666', marginBottom: 20},
    section: {marginBottom: 20},
    label: {fontSize: 16, marginBottom: 6, fontWeight: '500'},
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f9f9f9',
    },
    dropdownArrow: {fontSize: 18, color: '#888'},
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f9f9f9',
    },
    photoUpload: {
        height: 120,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    uploadText: {color: '#007AFF', fontSize: 16},
    photoPreview: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        resizeMode: 'cover',
    },
    nextButton: {
        backgroundColor: '#008080',
        paddingVertical: 15,
        borderRadius: 40,
        alignItems: 'center',
    },
    nextText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
    modalOverlay: {
        flex: 1,
        backgroundColor: '#00000055',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    modalOption: {
        paddingVertical: 12,
        width: '100%',
        alignItems: 'center',
    },
    modalCancel: {
        paddingVertical: 12,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    modalText: {
        fontSize: 16,
    },
    modalRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
        resizeMode: 'contain',
    },
});