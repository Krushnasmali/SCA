import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const Login = ({ navigation }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!usernameOrEmail.trim() || !password.trim()) {
      alert('Please enter username/email and password');
      return;
    }
    navigation.replace('MainTabs', { usernameOrEmail });
  };

  const handleGoogleLogin = () => {
    alert('Error to Google login');
  };

  const handleAppleLogin = () => {
    alert('Error to Apple login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Image
          source={require('../assets/scalogo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.academyName}>Shweta Computers Academy</Text>

        <TextInput
          style={styles.input}
          placeholder="Username or Email"
          value={usernameOrEmail}
          onChangeText={setUsernameOrEmail}
          placeholderTextColor="#888"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => alert('Forgot Password pressed')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Social Login Options */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.appleButton} onPress={handleAppleLogin}>
            <Image
              source={require('../assets/apple.png')} // 👈 Make sure you have this image in assets
              style={styles.appleIconImage}
              resizeMode="contain"
            />
            <Text style={styles.socialText}>Sign in with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <Image
              source={require('../assets/google.png')}
              style={styles.googleIcon}
              resizeMode="contain"
            />
            <Text style={styles.socialText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '90%',
    paddingVertical: 40,
    paddingHorizontal: 25,
    backgroundColor: '#fff',
    borderRadius: 22,
    elevation: 8,
    shadowColor: '#3a0842',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    alignItems: 'center',
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 20,
    marginBottom: 10,
  },
  academyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#800080',
    marginBottom: 26,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    borderColor: '#aaa',
    borderWidth: 1,
    marginBottom: 22,
    paddingHorizontal: 20,
    backgroundColor: '#F3F3FF',
    fontSize: 16,
    color: '#222',
  },
  loginButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#800080',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    shadowColor: '#800080',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  forgotPassword: {
    color: '#3a24fc',
    marginTop: 10,
    fontSize: 16,
    letterSpacing: 0.3,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  socialContainer: {
    width: '100%',
    marginTop: 22,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
    height: 48,
    borderWidth: 1,
    borderColor: '#eee',
    width: '100%',
  },
  appleIconImage: {
    width: 75,
    height: 75,
    marginRight: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    height: 48,
    width: '100%',
    marginBottom: 6,
  },
  googleIcon: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  socialText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    letterSpacing: 0.4,
  },
});

export default Login;
