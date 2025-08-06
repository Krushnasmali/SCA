import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useUser } from '../context/UserContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../component/SplashScreen';
import Login from '../component/Login';
import RegisterScreen from '../component/RegisterScreen';
import ForgotPasswordScreen from '../component/ForgotPasswordScreen';
import MainTabs from '../component/MainTabs';
import AllCoursesScreen from '../component/AllCoursesScreen';
import MyCoursesScreen from '../component/MyCoursesScreen';
import CourseDetailsScreen from '../component/CourseDetailsScreen';
import ProfileScreen from '../component/ProfileScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const { isAuthenticated, loading } = useUser();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800080" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // User is authenticated - show main app screens
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="AllCourses" component={AllCoursesScreen} />
          <Stack.Screen name="MyCourses" component={MyCoursesScreen} />
          <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      ) : (
        // User is not authenticated - show auth screens
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
  },
});

export default AuthNavigator;
