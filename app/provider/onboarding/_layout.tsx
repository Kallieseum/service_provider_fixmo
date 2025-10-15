import { NotificationProvider } from '@/context/NotificationContext';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <NotificationProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </NotificationProvider>
  );
}
