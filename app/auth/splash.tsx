import {View, Text, StyleSheet} from 'react-native';

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <Text>Loading FixMo...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});