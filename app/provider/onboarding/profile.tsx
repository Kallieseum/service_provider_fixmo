import React, {useState, useEffect} from 'react';
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
import {useRouter} from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {Ionicons} from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, {Marker} from 'react-native-maps';
import {Picker} from '@react-native-picker/picker';
import {useUserContext} from '@/context/UserContext'; // make sure path is correct

// --- Types / Data ---
type LocationEntry = {
    city: string;
    municipality: string;
};

const ncrDistricts: string[] = ['NCR District 1', 'NCR District 2', 'NCR District 3', 'NCR District 4'];

const districtCityMap: Record<string, string[]> = {
    'NCR District 1': ['Caloocan', 'Malabon', 'Navotas', 'Valenzuela'],
    'NCR District 2': ['Manila'],
    'NCR District 3': ['Quezon City', 'San Juan'],
    'NCR District 4': ['Las Piñas', 'Makati', 'Mandaluyong', 'Muntinlupa', 'Parañaque', 'Pasay', 'Pasig', 'Taguig', 'Marikina'],
};

const locationData: LocationEntry[] = [
    {city: 'Caloocan', municipality: 'Metro Manila'},
    {city: 'Malabon', municipality: 'Metro Manila'},
    {city: 'Navotas', municipality: 'Metro Manila'},
    {city: 'Valenzuela', municipality: 'Metro Manila'},
    {city: 'Manila', municipality: 'Metro Manila'},
    {city: 'Quezon City', municipality: 'Metro Manila'},
    {city: 'San Juan', municipality: 'Metro Manila'},
    {city: 'Las Piñas', municipality: 'Metro Manila'},
    {city: 'Makati', municipality: 'Metro Manila'},
    {city: 'Mandaluyong', municipality: 'Metro Manila'},
    {city: 'Muntinlupa', municipality: 'Metro Manila'},
    {city: 'Parañaque', municipality: 'Metro Manila'},
    {city: 'Pasay', municipality: 'Metro Manila'},
    {city: 'Pasig', municipality: 'Metro Manila'},
    {city: 'Taguig', municipality: 'Metro Manila'},
    {city: 'Marikina', municipality: 'Metro Manila'},
];

const barangayMap: Record<string, string[]> = {
    Caloocan: ['Barangay 176', 'Barangay 188', 'Bagong Silang'],
    Manila: ['Tondo', 'Sampaloc', 'Ermita'],
    'Quezon City': ['Commonwealth', 'Batasan Hills', 'Novaliches'],
    Pasig: ['Kapitolyo', 'San Miguel', 'Bagong Ilog'],
    Taguig: ['Ususan', 'Lower Bicutan', 'Western Bicutan'],
    Makati: ['Bel-Air', 'San Lorenzo', 'Poblacion'],
};

// Helper validation (safe)
function validateRequiredFields(fields: { label: string; value?: string }[]) {
    for (const field of fields) {
        if (!field.value || !field.value.trim()) {
            Alert.alert('Missing Information', `Please enter your ${field.label} to continue.`);
            return false;
        }
    }
    return true;
}

// --- Component ---
export default function ProfileScreen() {
    const router = useRouter();
    const userContext = useUserContext();
    const setUser = userContext?.setUser;

    // Personal Info
    const [photo, setPhoto] = useState<string | null>(null);
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState(''); // ISO yyyy-mm-dd
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Contact Info
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [username, setUsername] = useState('');

    // Location Info
    const [district, setDistrict] = useState('');
    const [municipality, setMunicipality] = useState('');
    const [city, setCity] = useState('');
    const [barangay, setBarangay] = useState('');
    const [areaDetails, setAreaDetails] = useState('');
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    // Derived Lists
    const filteredCities = district ? districtCityMap[district] || [] : [];
    const filteredMunicipalities = city ? locationData.filter((loc) => loc.city === city).map((loc) => loc.municipality) : [];
    const filteredBarangays = city ? barangayMap[city] || [] : [];

    // --- CAMERA ---
    const openCamera = async () => {
        const {status} = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        // Support both new and old result shapes
        // new: { canceled: boolean, assets: [{ uri: string }] }
        // old: { cancelled: boolean, uri: string }
        if ('canceled' in result) {
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setPhoto(result.assets[0].uri);
            }
        } else if ('cancelled' in (result as any)) {
            if (!(result as any).cancelled && (result as any).uri) {
                setPhoto((result as any).uri);
            }
        }
    };

    // --- DATE OF BIRTH ---
    const handleDateChange = (_event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const formatted = selectedDate.toISOString().split('T')[0]; // yyyy-mm-dd
            setDob(formatted);
        }
    };

    // --- LOCATION ---
    const requestLocation = async () => {
        const {status} = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Location access is required to pin your service area.');
            return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
    };

    // --- NEXT BUTTON ---
    const handleNext = () => {
        const isValid = validateRequiredFields([
            {label: 'first name', value: firstName},
            {label: 'last name', value: lastName},
            {label: 'date of birth', value: dob},
            {label: 'email', value: email},
            {label: 'username', value: username},
            {label: 'phone number', value: phone},
            {label: 'service district', value: district},
            {label: 'city/municipality', value: city},
            {label: 'barangay', value: barangay},
            {label: 'service area details', value: areaDetails},
        ]);
        if (!isValid) return;

        // Save to context if available
        if (typeof setUser === 'function') {
            setUser({
                name: `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
                phone,
                status: 'pending',
            });
        }

        router.push('/provider/onboarding/id-verification');
    };

    return (
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    {/* Back Button */}
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={30} color="#008080"/>
                    </TouchableOpacity>

                    <Text style={styles.title}>Basic Information</Text>
                    <Text style={styles.subtext}>
                        Your full name will help us verify your identity and display it to customers.
                    </Text>

                    {/* Profile Photo */}
                    <TouchableOpacity onPress={openCamera} style={styles.photoContainer}>
                        {photo ? (
                            <Image source={{uri: photo}} style={styles.photo}/>
                        ) : (
                            <View style={styles.iconCircle}>
                                <Ionicons name="camera" size={60} color="#008080"/>
                            </View>
                        )}
                        <Text style={styles.addPhotoText}>Add Photo</Text>
                    </TouchableOpacity>

                    <Text style={styles.instructions}>
                        *Clearly visible face{'\n'}*Without sunglasses{'\n'}*Good lighting without filters
                    </Text>

                    {/* Name Fields */}
                    {[
                        {
                            label: 'First Name',
                            value: firstName,
                            setter: (v: string) => setFirstName(v.toUpperCase()),
                            required: true
                        },
                        {
                            label: 'Middle Name (optional)',
                            value: middleName,
                            setter: (v: string) => setMiddleName(v.toUpperCase())
                        },
                        {
                            label: 'Last Name',
                            value: lastName,
                            setter: (v: string) => setLastName(v.toUpperCase()),
                            required: true
                        },
                    ].map(({label, value, setter, required}) => (
                        <View key={label}>
                            <View style={styles.labelRow}>
                                <Text style={styles.labelText}>{label}</Text>
                                {required && <Text style={styles.requiredAsterisk}>*</Text>}
                            </View>
                            <TextInput style={styles.input} value={value} onChangeText={setter as any}/>
                        </View>
                    ))}

                    {/* Date of Birth */}
                    <View style={styles.labelRow}>
                        <Text style={styles.labelText}>Date of Birth</Text>
                        <Text style={styles.requiredAsterisk}>*</Text>
                    </View>
                    <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
                        <Text style={{color: dob ? '#000' : '#999'}}>{dob || 'Select date'}</Text>
                        <Text style={styles.dropdownArrow}>▼</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={dob ? new Date(dob) : new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                        />
                    )}

                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    {/* Contact & Account Fields */}
                    {[
                        {label: 'Email', value: email, setter: setEmail, keyboardType: 'email-address'},
                        {label: 'Username', value: username, setter: setUsername, keyboardType: 'default'},
                        {label: 'Phone Number', value: phone, setter: setPhone, keyboardType: 'phone-pad'},
                    ].map(({label, value, setter, keyboardType}) => (
                        <View key={label}>
                            <View style={styles.labelRow}>
                                <Text style={styles.labelText}>{label}</Text>
                                <Text style={styles.requiredAsterisk}>*</Text>
                            </View>
                            <TextInput style={styles.input} value={value} onChangeText={setter}
                                       keyboardType={keyboardType as any}/>
                        </View>
                    ))}

                    <Text style={styles.sectionTitle}>Location Details</Text>

                    {/* District */}
                    <View style={styles.labelRow}>
                        <Text style={styles.labelText}>District</Text>
                        <Text style={styles.requiredAsterisk}>*</Text>
                    </View>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={district}
                            onValueChange={(val: any) => {
                                setDistrict(String(val));
                                setCity('');
                                setMunicipality('');
                                setBarangay('');
                            }}
                        >
                            <Picker.Item label="Select District" value=""/>
                            {ncrDistricts.map((d: string) => (
                                <Picker.Item key={d} label={d} value={d}/>
                            ))}
                        </Picker>
                    </View>

                    {/* City */}
                    <View style={styles.labelRow}>
                        <Text style={styles.labelText}>City</Text>
                        <Text style={styles.requiredAsterisk}>*</Text>
                    </View>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={city}
                            onValueChange={(val: any) => {
                                setCity(String(val));
                                setMunicipality('');
                                setBarangay('');
                            }}
                            enabled={filteredCities.length > 0}
                        >
                            <Picker.Item label="Select City" value=""/>
                            {filteredCities.map((c: string) => (
                                <Picker.Item key={c} label={c} value={c}/>
                            ))}
                        </Picker>
                    </View>

                    {/* Municipality */}
                    <View style={styles.labelRow}>
                        <Text style={styles.labelText}>Municipality</Text>
                        <Text style={styles.requiredAsterisk}>*</Text>
                    </View>
                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={municipality} onValueChange={(val: any) => setMunicipality(String(val))}
                                enabled={filteredMunicipalities.length > 0}>
                            <Picker.Item label="Select Municipality" value=""/>
                            {filteredMunicipalities.map((m: string) => (
                                <Picker.Item key={m} label={m} value={m}/>
                            ))}
                        </Picker>
                    </View>

                    {/* Barangay */}
                    <View style={styles.labelRow}>
                        <Text style={styles.labelText}>Barangay</Text>
                        <Text style={styles.requiredAsterisk}>*</Text>
                    </View>
                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={barangay} onValueChange={(val: any) => setBarangay(String(val))}
                                enabled={filteredBarangays.length > 0}>
                            <Picker.Item label="Select Barangay" value=""/>
                            {filteredBarangays.map((b: string) => (
                                <Picker.Item key={b} label={b} value={b}/>
                            ))}
                        </Picker>
                    </View>

                    {/* Service Area Details */}
                    <View style={styles.labelRow}>
                        <Text style={styles.labelText}>Service Area Details</Text>
                    </View>
                    <TextInput style={styles.input} value={areaDetails} onChangeText={setAreaDetails}/>

                    <TouchableOpacity style={styles.nextButton} onPress={requestLocation}>
                        <Text style={styles.nextText}>Pin Your Service Area</Text>
                    </TouchableOpacity>

                    {location && (
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                        >
                            <Marker
                                coordinate={{
                                    latitude: location.coords.latitude,
                                    longitude: location.coords.longitude,
                                }}
                                draggable
                                onDragEnd={(e) => {
                                    const {latitude, longitude} = e.nativeEvent.coordinate;
                                    setLocation({
                                        ...location,
                                        coords: {...location.coords, latitude, longitude},
                                    });
                                }}
                                title="Your Service Area"
                                description="Drag to adjust your exact location"
                            />
                        </MapView>
                    )}

                    {/* Final Next Button */}
                    <View style={styles.fixedButtonContainer}>
                        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                            <Text style={styles.nextText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    scrollContainer: {paddingBottom: 120},
    container: {flex: 1, backgroundColor: '#fff'},
    title: {fontSize: 22, fontWeight: 'bold', marginBottom: 8, paddingHorizontal: 20, marginTop: 1},
    subtext: {fontSize: 14, color: '#666', marginBottom: 20, paddingHorizontal: 20},
    photoContainer: {alignItems: 'center', marginBottom: 10},
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    addPhotoText: {fontSize: 14, color: '#008080'},
    photo: {width: 100, height: 100, borderRadius: 50},
    instructions: {fontSize: 14, color: '#666', textAlign: 'justify', marginBottom: 20, paddingHorizontal: 20},
    labelRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 4, paddingHorizontal: 20},
    labelText: {fontSize: 16, color: '#333', fontWeight: '500'},
    requiredAsterisk: {color: 'red', marginLeft: 2, fontSize: 16},
    input: {padding: 14, marginBottom: 12, backgroundColor: '#f9f9f9', marginHorizontal: 20, borderRadius: 30},
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f9f9f9',
        marginBottom: 12,
        marginHorizontal: 20,
        borderRadius: 30,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 24,
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    dropdownArrow: {fontSize: 15, color: '#008080'},
    pickerContainer: {
        backgroundColor: '#f9f9f9',
        marginHorizontal: 20,
        marginBottom: 12,
        borderRadius: 30,
        overflow: 'hidden',
    },
    map: {height: 300, marginHorizontal: 20, marginBottom: 20, borderRadius: 20},
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    nextButton: {
        backgroundColor: '#008080',
        paddingVertical: 15,
        borderRadius: 40,
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
    },
    nextText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
    backButton: {marginBottom: 30, marginLeft: 10, marginTop: Platform.OS === 'ios' ? 60 : 40},
});
