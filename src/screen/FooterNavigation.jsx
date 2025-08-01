// FooterNavigation.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import BookingScreen from './Booking';
import AccountScreen from './AccountScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const FooterNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Booking') iconName = 'book-outline';
          else if (route.name === 'Account') iconName = 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#eee',
        tabBarStyle: {
          backgroundColor: '#8000ff',
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Booking" component={BookingScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
};

export default FooterNavigation;
