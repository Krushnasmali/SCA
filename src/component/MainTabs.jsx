import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import SettingsScreen from './SettingsScreen';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ThemeContext } from './ThemeContext';

const Tab = createBottomTabNavigator();

export default function MainTabs({ route }) {
  const { theme } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route: tabRoute }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.headerBackground,
          elevation: 4,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        headerTitleStyle: {
          fontSize: 22,
          fontWeight: '700',
          letterSpacing: -0.3,
        },
        headerTintColor: theme.headerText,
        tabBarShowLabel: true,
        tabBarStyle: [
          styles.tabBarStyle,
          {
            backgroundColor: theme.tabBarBackground,
            borderTopColor: theme.tabBarBorder,
            shadowColor: theme.cardShadow,
          },
        ],

        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarIcon: ({ focused }) => {
          let iconName = 'home';
          if (tabRoute.name === 'Settings') iconName = 'setting';
          else if (tabRoute.name === 'Profile') iconName = 'user';
          return (
            <AntDesign
              name={iconName}
              size={24}
              color={focused ? theme.tabBarActive : theme.tabBarInactive}
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
  tabBarStyle: {
    position: 'absolute',
    bottom: 20,
    marginHorizontal: '5%',
    alignSelf: 'center',
    width: '90%',
    elevation: 5,
    borderRadius: 30,
    height: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
});
