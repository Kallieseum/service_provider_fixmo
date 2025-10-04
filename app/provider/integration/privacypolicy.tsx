import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';

const PrivacyPolicy = () => {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Privacy Policy</Text>

            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.text}>
                We may collect your name, email, phone number, address, payment details, service requests, booking
                history, device information, and usage data.
            </Text>

            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.text}>
                To provide and improve services, process bookings/payments, communicate updates, analyze usage, and
                comply with legal obligations.
            </Text>

            <Text style={styles.sectionTitle}>3. Sharing Your Information</Text>
            <Text style={styles.text}>
                We do not sell your data. We may share with service providers, legal authorities, or in business
                transfers.
            </Text>

            <Text style={styles.sectionTitle}>4. Security & Retention</Text>
            <Text style={styles.text}>
                We implement reasonable measures to protect your data and retain it only as long as necessary.
            </Text>

            <Text style={styles.sectionTitle}>5. Your Rights</Text>
            <Text style={styles.text}>
                You may access, update, or request deletion of your personal data and opt-out of marketing
                communications.
            </Text>

            <Text style={styles.sectionTitle}>6. Contact Us</Text>
            <Text style={styles.text}>
                Email: support@fixmo.com{"\n"}
                Address: [Insert Address]
            </Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1, padding: 20, backgroundColor: '#fff'},
    title: {fontSize: 24, fontWeight: 'bold', marginBottom: 20},
    sectionTitle: {fontSize: 18, fontWeight: '600', marginTop: 15},
    text: {fontSize: 16, marginTop: 5, lineHeight: 22},
});

export default PrivacyPolicy;
