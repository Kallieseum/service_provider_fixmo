import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';

const TermsAndConditions = () => {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Terms & Conditions</Text>

            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.text}>
                By using FixMo, you agree to these terms and all applicable laws.
            </Text>

            <Text style={styles.sectionTitle}>2. User Accounts</Text>
            <Text style={styles.text}>
                Provide accurate info, maintain your credentials, and are responsible for all activities under your
                account.
            </Text>

            <Text style={styles.sectionTitle}>3. Booking Services</Text>
            <Text style={styles.text}>
                Bookings are subject to availability. Prices and service details may change.
            </Text>

            <Text style={styles.sectionTitle}>4. Payments</Text>
            <Text style={styles.text}>
                Payments must be made via approved methods. Refunds follow our policy. We aren't liable for third-party
                payment issues.
            </Text>

            <Text style={styles.sectionTitle}>5. User Conduct</Text>
            <Text style={styles.text}>
                Do not use the App for illegal purposes, post false/misleading content, or interfere with the App's
                operation.
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

export default TermsAndConditions;
