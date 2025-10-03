import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from "react-native";

export default function EditProfileScreen() {
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [validID, setValidID] = useState("");
    const [avatarUri, setAvatarUri] = useState("");

    const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission denied", "We need access to your photos.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        if (!firstName || !lastName || !validID || validID.length < 5) {
            Alert.alert("Incomplete", "Please fill in all required fields with valid data.");
            return;
        }

        console.log("Full Name:", fullName);
        console.log("Valid ID:", validID);
        console.log("Avatar URI:", avatarUri);
        router.back();
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Header */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="#333"/>
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>

            {/* Avatar */}
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                {avatarUri ? (
                    <Image source={{uri: avatarUri}} style={styles.avatarImage}/>
                ) : (
                    <Ionicons name="person-circle-outline" size={80} color="#ccc"/>
                )}
                <Text style={styles.name}>{fullName || "Your Name"}</Text>
                <Text style={styles.phone}>+63 0000000000</Text>
                <Text style={styles.changePhoto}>Tap to change photo</Text>
            </TouchableOpacity>

            {/* Form Fields */}
            <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
            />
            <TextInput
                style={styles.input}
                placeholder="Middle Name (Optional)"
                value={middleName}
                onChangeText={setMiddleName}
            />
            <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
            />
            <TextInput
                style={styles.input}
                placeholder="Valid ID"
                value={validID}
                onChangeText={setValidID}
            />

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: Platform.OS === "ios" ? 60 : 40,
        backgroundColor: "#fff",
    },
    backButton: {
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    name: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 8,
    },
    phone: {
        fontSize: 14,
        color: "#666",
    },
    changePhoto: {
        fontSize: 12,
        color: "#008080",
        marginTop: 4,
    },
    input: {
        backgroundColor: "#f9f9f9",
        padding: 14,
        borderRadius: 30,
        marginBottom: 12,
    },
    saveButton: {
        backgroundColor: "#008080",
        paddingVertical: 15,
        borderRadius: 40,
        alignItems: "center",
        marginTop: 20,
    },
    saveText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});