import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './src/component/SplashScreen';
import Login from './src/component/Login';
import MainTabs from './src/component/MainTabs';
import AllCoursesScreen from './src/component/AllCoursesScreen';
import CourseDetailsScreen from './src/component/CourseDetailsScreen';
import ProfileScreen from './src/component/ProfileScreen';

import { ThemeProvider } from './src/component/ThemeContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="AllCourses" component={AllCoursesScreen} />
          <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          {/* add other screens here */}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
