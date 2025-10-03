import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AvailabilityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Availability Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});
