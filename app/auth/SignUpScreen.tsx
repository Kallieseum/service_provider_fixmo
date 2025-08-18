import React from "react";
import {View, StyleSheet} from "react-native";
import {TextInput, Button, Text} from "react-native-paper";

export default function SignUpScreen({navigation}: any) {
    return (
        <View style={styles.container}>
            <Text variant="titleLarge">Don'</Text>
            <TextInput label="Email" style={styles.input}/>
            <TextInput label="Password" secureTextEntry style={styles.input}/>
            <Button
                mode="contained"
                onPress={() => navigation.replace("Main")}
            >
                Sign In
            </Button>
            <Button onPress={() => navigation.navigate("SignUp")}>
                Create Account
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, justifyContent: "center", padding: 16},
    input: {marginBottom: 12},
});
