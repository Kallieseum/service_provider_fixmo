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
import {Ionicons} from '@expo/vector-icons';

export default function DrugTestUpload() {
    const router = useRouter();
    const [drugTestImage, setDrugTestImage] = useState<string | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);

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
        const result = await ImagePicker.launchCameraAsync({quality: 1});
        if (!result.canceled && result.assets.length > 0) {
            setDrugTestImage(result.assets[0].uri);
        }
    };

    const handleNext = () => {
        if (!drugTestImage) {
            Alert.alert('Missing Information', 'Please upload your Drug Test Clearance.');
            return;
        }
        router.push('/provider/onboarding/applicationreview');
    };

    return (
        <View style={{flex: 1}}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.contentWrapper}>
                    <View style={styles.section}>
                        <Ionicons name="arrow-back" size={30} color="#008080" style={{marginTop: 25}}/>
                        <Text style={styles.title}>Drug Test Clearance</Text>
                        <Text style={styles.subtitle}>
                            You can <Text style={{color: '#008080', fontWeight: 'bold'}}>Add Photo</Text> or{' '}
                            <Text style={{color: '#008080', fontWeight: 'bold'}}>Upload File</Text>
                        </Text>

                        <View style={styles.verticalIconGroup}>
                            <View style={styles.iconWrapper}>
                                <TouchableOpacity onPress={takePhoto} style={styles.circleButton}>
                                    <Ionicons name="camera" size={40} color="#008080"/>
                                </TouchableOpacity>
                                <Text style={styles.iconLabel}>Add Photo</Text>
                            </View>

                            <View style={styles.iconWrapper}>
                                <TouchableOpacity onPress={pickImage} style={styles.circleButton}>
                                    <Ionicons name="cloud-upload-outline" size={40} color="#008080"/>
                                </TouchableOpacity>
                                <Text style={styles.iconLabel}>Upload File</Text>
                            </View>
                        </View>

                        {drugTestImage && <Image source={{uri: drugTestImage}} style={styles.preview}/>}

                        <Text style={styles.note}>
                            Make sure that the information on your document is clearly visible.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Next Button */}
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>
            </View>

            {/* Tooltip Modal */}
            <Modal visible={showTooltip} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowTooltip(false)}>
                    <View style={styles.tooltipBox}>
                        <Text style={styles.tooltipText}>
                            This document confirms that you’ve passed a drug test required for onboarding.
                        </Text>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
        paddingBottom: 140,
    },
    contentWrapper: {
        flex: 1,
    },
    section: {
        marginBottom: 40,
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
    verticalIconGroup: {
        alignItems: 'center',
        gap: 30,
        marginBottom: 16,
    },
    iconWrapper: {
        alignItems: 'center',
        gap: 8,
    },
    circleButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
       
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
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#fff',
    },
    nextButton: {
        backgroundColor: '#008080',
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
    },
    nextText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    tooltipBox: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        maxWidth: 300,
    },
    tooltipText: {
        fontSize: 14,
        color: '#333',
    },
});