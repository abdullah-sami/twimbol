// App.js
import React, { useEffect, useState } from 'react';
import { AsyncStorage } from 'react-native'; // Adjust import based on your setup

import Onboarding from './onboarding.tsx';
import Index from './(tabs)/index.tsx';

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const value = await AsyncStorage.getItem('hasSeenOnboarding');
      if (value === null) {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        setIsFirstLaunch(true);
    } else {
          await AsyncStorage.setItem('hasSeenOnboarding', null);
        setIsFirstLaunch(true);
      }
    };

    checkOnboarding();
  }, []);

  if (isFirstLaunch === null) {
    return null; // or loading indicator
  }

  return isFirstLaunch ? <Onboarding /> : <Index />;
}
