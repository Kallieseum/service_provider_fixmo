import React from 'react';
import {Pressable, Image, StyleSheet, ViewStyle, ImageStyle} from 'react-native';

type Props = {
    icon: any;
    isActive: boolean;
    onPress: () => void;
};

export const TabIconButton: React.FC<Props> = ({icon, isActive, onPress}) => {
    return (
        <Pressable
            onPress={onPress}
            style={({pressed}) => [
                styles.wrapper,
                isActive && styles.activeCircle,
                isActive && {transform: [{translateY: -35}]},
                pressed && {opacity: 0.7},
            ]}
        >
            <Image
                source={icon}
                style={[styles.icon, isActive && styles.activeIcon]}
                resizeMode="contain"
            />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    activeCircle: {
        backgroundColor: '#B2EBF2',
        elevation: 8,
    } as ViewStyle,
    icon: {
        width: 40,
        height: 40,
        tintColor: '#008080',
    } as ImageStyle,
    activeIcon: {
        tintColor: '#004D40',
    } as ImageStyle,
});