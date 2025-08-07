import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';

import { ThemeProvider } from './src/component/ThemeContext';
import { UserProvider } from './src/context/UserContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import notificationService from './src/services/NotificationService';

export default function App() {
  useEffect(() => {
    // Handle background/quit state notifications
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      // Handle navigation based on notification data
      if (remoteMessage?.data?.type) {
        // You can add navigation logic here based on notification type
        console.log('Navigate to:', remoteMessage.data.type);
      }
    });

    // Handle notification when app is opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
          // Handle navigation based on notification data
          if (remoteMessage?.data?.type) {
            console.log('Navigate to:', remoteMessage.data.type);
          }
        }
      });

    return unsubscribe;
  }, []);

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
