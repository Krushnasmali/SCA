import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }) => {
  return (
    <ImageBackground source={require('../assets/splashscreen.jpg')} style={styles.bg}>
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.startBtnText}>Let's Start with SCA</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: 'flex-end' },
  bottomContainer: { alignItems: 'center', marginBottom: 60 },
  startBtn: {
    backgroundColor: '#800080',
    paddingVertical: 16,
    paddingHorizontal: 42,
    borderRadius: 32,
    elevation: 5,
  },
  startBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});

export default SplashScreen;
