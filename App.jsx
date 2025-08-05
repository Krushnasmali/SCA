import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import '@react-native-firebase/app';

import { ThemeProvider } from './src/component/ThemeContext';
import { UserProvider } from './src/context/UserContext';
import AuthNavigator from './src/navigation/AuthNavigator';

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <NavigationContainer>
          <AuthNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </UserProvider>
  );
}
