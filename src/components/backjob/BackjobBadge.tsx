import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackjobStatus } from '@/types/appointment';

interface BackjobBadgeProps {
  status: BackjobStatus;
  size?: 'small' | 'medium' | 'large';
}

const BACKJOB_CONFIG: Record<BackjobStatus, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string; bgColor: string }> = {
  'pending': {
    icon: 'time-outline',
    color: '#FFA500',
    label: 'Pending',
    bgColor: '#FFF3E0',
  },
  'approved': {
    icon: 'alert-circle',
    color: '#FF6B6B',
    label: 'Action Required',
    bgColor: '#FFE5E5',
  },
  'disputed': {
    icon: 'shield-checkmark-outline',
    color: '#9C27B0',
    label: 'Disputed',
    bgColor: '#F3E5F5',
  },
  'rescheduled': {
    icon: 'calendar-outline',
    color: '#4CAF50',
    label: 'Rescheduled',
    bgColor: '#E8F5E9',
  },
  'cancelled-by-admin': {
    icon: 'close-circle-outline',
    color: '#9E9E9E',
    label: 'Cancelled',
    bgColor: '#F5F5F5',
  },
  'cancelled-by-customer': {
    icon: 'close-circle-outline',
    color: '#9E9E9E',
    label: 'Cancelled',
    bgColor: '#F5F5F5',
  },
  'cancelled-by-user': {
    icon: 'close-circle-outline',
    color: '#9E9E9E',
    label: 'Cancelled',
    bgColor: '#F5F5F5',
  },
};

export default function BackjobBadge({ status, size = 'medium' }: BackjobBadgeProps) {
  const config = BACKJOB_CONFIG[status];
  
  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      icon: 12,
      text: styles.textSmall,
    },
    medium: {
      container: styles.containerMedium,
      icon: 16,
      text: styles.textMedium,
    },
    large: {
      container: styles.containerLarge,
      icon: 20,
      text: styles.textLarge,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, currentSize.container, { backgroundColor: config.bgColor }]}>
      <Ionicons name={config.icon} size={currentSize.icon} color={config.color} />
      <Text style={[styles.text, currentSize.text, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  containerMedium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  containerLarge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  text: {
    fontFamily: 'PoppinsMedium',
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 14,
  },
});
