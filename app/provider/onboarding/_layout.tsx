import { Stack } from 'expo-router';
import { NotificationProvider } from '@/context/NotificationContext';

export default function OnboardingLayout() {
  return (
    <NotificationProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </NotificationProvider>
  );
}
