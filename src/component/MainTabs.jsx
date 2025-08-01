import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import SettingsScreen from './SettingsScreen';
import AntDesign from 'react-native-vector-icons/AntDesign';

const Tab = createBottomTabNavigator();
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MainTabs({ route }) {
  return (
    <Tab.Navigator
      screenOptions={({ route: tabRoute }) => ({
        headerShown: true,
        headerStyle: styles.headerStyle,
        headerTitleStyle: {
          fontSize: 27,
          fontWeight: 'bold',
        },
        headerTintColor: '#fff',
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBarStyle,
        tabBarIcon: ({ focused }) => {
          let iconName = 'home';
          if (tabRoute.name === 'Settings') iconName = 'setting';
          else if (tabRoute.name === 'Profile') iconName = 'user';
          return (
            <AntDesign
              name={iconName}
              size={24}
              color={focused ? '#800080' : 'gray'}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: 'Shweta Computers Academy',
          tabBarLabel: 'Home',
        }}
        initialParams={route?.params}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: 'Settings Panel',
          tabBarLabel: 'Setting',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: 'My Account',
          tabBarLabel: 'Account',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: '#960896ff',
  },
  tabBarStyle: {
    position: 'absolute',
    bottom: 20,
    width: SCREEN_WIDTH * 0.9,
    left: SCREEN_WIDTH * 0.05,
    elevation: 5,
    borderRadius: 30,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    backgroundColor: '#fff',
    marginLeft: '5%',
  },
});
