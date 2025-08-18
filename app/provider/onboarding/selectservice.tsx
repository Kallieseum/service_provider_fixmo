import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import {useState} from 'react';
import {useRouter} from 'expo-router';
import DropdownSelector from '@/components/form/dropdownselector';

const serviceCategories = {
    'PLUMBING NCII': [
        'Pipe Fitting',
        'Troubleshooting of Leaks',
        'Sink Installation',
        'Toilet Installation',
        'Shower Installation',
        'Water Heater Installation',
    ],
    'ELECTRICAL INSTALLATION AND MAINTENANCE (EIM) NCII': [
        'Circuit Wiring',
        'Outlet and Switch Installation',
        'Cable Management',
        'Electrical Troubleshooting',
    ],
    'Refrigeration and Air-Conditioning (RAC) Servicing NC II (Domestic)': [
        'AC Cleaning',
        'AC Repair',
        'Refrigerator Maintenance',
    ],
    'Consumer Electronics Servicing (CES) NC II': [
        'TV Repair',
        'Audio Systems Repair',
        'Washing Machine Circuit Repair',
        'Refrigerator Circuit Diagnosis',
    ],
    'Computer System Servicing (CSS) NC II': [
        'PC Troubleshooting',
        'Network Setup (Wi-Fi, printer sharing)',
        'Virus Removal',
        'Data Backup',
    ],
    'CARPENTRY NCII': [
        'Woodworking',
        'Furniture Assembly',
        'Furniture Repair',
        'Framing',
        'Finishing Works',
    ],
    'MASONRY NCII': [
        'Block/Brick Layering',
        'Plastering',
        'Basic Structural Works',
    ],
    'TILE SETTING NCII': [
        'Surface Preparation',
        'Cutting Tiles',
        'Laying Tiles',
        'Grouting',
    ],
    'CONSTRUCTION PAINTING NCII': [
        'Surface Sanding',
        'Surface Priming',
        'Wall Painting',
    ],
    'Shielded Metal Arc Welding (SMAW) NC II / Gas Metal Arc Welding (GMAW) NC II': [
        'Gate Repair',
        'Welding Operation',
        'Metal Furniture Repair',
    ],
};

type ServiceCategory = keyof typeof serviceCategories;

export default function SelectService() {
    const router = useRouter();
    const [uliNumber, setUliNumber] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | ''>('');
    const [selectedService, setSelectedService] = useState('');

    const handleSubmit = () => {
        if (!uliNumber.trim() || !selectedCategory || !selectedService) {
            Alert.alert('Missing Information', 'Please complete all required fields.');
            return;
        }

        router.push('/provider/onboarding/applicationreview');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Select Services</Text>

            {/* ULI Number */}
            <View style={styles.section}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>ULI Number</Text>
                    <Text style={styles.required}>*</Text>
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Enter ULI Number"
                    value={uliNumber}
                    onChangeText={(text) => setUliNumber(text.toUpperCase())}
                />
            </View>

            {/* Service Category Dropdown */}
            <DropdownSelector
                label="Service Category"
                selectedValue={selectedCategory}
                options={Object.keys(serviceCategories)}
                onValueChange={(value) => {
                    setSelectedCategory(value as ServiceCategory);
                    setSelectedService('');
                }}
                required
            />

            {/* Specific Service Dropdown */}
            {selectedCategory && (
                <DropdownSelector
                    label="Service"
                    selectedValue={selectedService}
                    options={serviceCategories[selectedCategory as ServiceCategory]}
                    onValueChange={setSelectedService}
                    required
                />
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitText}>Submit</Text>
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
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
    required: {
        color: 'red',
        marginLeft: 4,
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f9f9f9',
    },
    submitButton: {
        backgroundColor: '#008080',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 10,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});