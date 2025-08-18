// components/DropdownSelector.tsx
import {View, Text, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';

type DropdownSelectorProps = {
    label: string;
    selectedValue: string;
    options: string[];
    onValueChange: (value: string) => void;
    required?: boolean;
};

export default function DropdownSelector({
                                             label,
                                             selectedValue,
                                             options,
                                             onValueChange,
                                             required = false,
                                         }: DropdownSelectorProps) {
    return (
        <View style={styles.section}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>{label}</Text>
                {required && <Text style={styles.required}>*</Text>}
            </View>
            <View style={styles.pickerWrapper}>
                <Picker selectedValue={selectedValue} onValueChange={onValueChange}>
                    <Picker.Item label={`Choose ${label.toLowerCase()}...`} value=""/>
                    {options.map((option) => (
                        <Picker.Item key={option} label={option} value={option}/>
                    ))}
                </Picker>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f9f9f9',
    },
});