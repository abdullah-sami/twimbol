import './globals.css';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';

import TabsLayout from './(tabs)/_layout';
import PostScreen from './post/[id]';
import ReelScreen from './reel/[postId]';
import SearchScreen from './search';
import AuthScreen from './auth/[authpage]';
import OnboardingScreen from './onboarding';
import NotificationsScreen from './notifications';
import ProfileScreen from './profile/index';
import ProfileUserScreen from './profile/[userId]';
import ProfileEdit from './profile/profile_edit';
import SettingsScreen from './(settings)/settings';
import CreateContents from './[create_contents]';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootLayout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" component={TabsLayout} />
      <Stack.Screen name="authentication" component={AuthScreen} />
      <Stack.Screen name="onboarding" component={OnboardingScreen} />
      <Stack.Screen name="search" component={SearchScreen} />
      <Stack.Screen name="reel" component={ReelScreen} />
      <Stack.Screen name="post" component={PostScreen} />
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen name="profile_user" component={ProfileUserScreen} />
      <Stack.Screen name="profile_edit" component={ProfileEdit} />
      <Stack.Screen name="settings" component={SettingsScreen} />
      <Stack.Screen name="notifications" component={NotificationsScreen} />
      <Stack.Screen name="createcontents" component={CreateContents} />
    </Stack.Navigator>
  );
}
