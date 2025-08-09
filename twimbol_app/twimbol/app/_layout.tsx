import './globals.css';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
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
import CreateContents from './[create_contents]';
import EventScreen from './event/[eventid]';
import SettingsScreen from './(settings)/settings';
import TermsAndConditions from './(settings)/termsnconsditions';
import FAQScreen from './(settings)/faq';
import ParentalControlsMain from './(settings)/parentalcontrols';
  

const Stack = createNativeStackNavigator<RootStackParamList>();

export const linking = {
  prefixes: ['twimbol://', 'https://twimbol.com'],
  config: {
    screens: {
      '(tabs)': '',
      authentication: 'auth/:authpage',
      onboarding: 'onboarding',
      search: 'search',
      reel: 'reel/:postId',
      post: 'post/:id',
      profile: 'profile',
      profile_user: 'profile/:userId',
      profile_edit: 'profile/edit',
      createcontents: 'createcontents',
      events: 'event/:eventid',
      settings: 'settings',
      notifications: 'notifications',
      termsnconditions: 'termsnconditions',
      faq: 'faq',
      parentalcontrols: 'parentalcontrols',
    },
  },
};



export default function RootLayout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" component={TabsLayout} />
      <Stack.Screen name="authentication" component={AuthScreen} />
      <Stack.Screen name="onboarding" component={OnboardingScreen} />
      <Stack.Screen name="search" component={SearchScreen} />
      <Stack.Screen name="reel" component={ReelScreen} />
      <Stack.Screen name="post" component={PostScreen} />
      <Stack.Screen name="events" component={EventScreen} />
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen name="profile_user" component={ProfileUserScreen} />
      <Stack.Screen name="profile_edit" component={ProfileEdit} />
      <Stack.Screen name="createcontents" component={CreateContents} />
      <Stack.Screen name="settings" component={SettingsScreen} />
      <Stack.Screen name="parentalcontrols" component={ParentalControlsMain} />      
      <Stack.Screen name="notifications" component={NotificationsScreen} />
      <Stack.Screen name="termsnconditions" component={TermsAndConditions} />
      <Stack.Screen name="faq" component={FAQScreen} />
    </Stack.Navigator>
  );
}
