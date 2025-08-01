import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import CustomHeader from './CustomHeader';
import LinearGradient from 'react-native-linear-gradient';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // TEMPORARY LOGIN: You can later replace this with real logic
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // Navigate to Home
    navigation.navigate('Home');
  };

  return (
    <LinearGradient
      colors={['#f2709c', '#ff9472']}
      style={styles.container}
    >
      <CustomHeader title="Login" navigation={navigation} />

      <View style={{ alignContent: 'center', justifyContent: 'center', flex: 1 }}>
        <View style={styles.card}>
          <Text style={styles.heading}>Login here</Text>
          <Text style={styles.subheading}>Welcome back you've been missed!</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Enter Your Email"
              placeholderTextColor="black"
              style={[styles.input, styles.passwordInput]}
              onChangeText={setEmail}
              value={email}
            />
            <FontAwesome6 style={styles.user} name="user" size={22} color="#666" />
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Enter Your Password"
              placeholderTextColor="black"
              style={[styles.input, styles.passwordInput]}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              value={password}
            />
            <FontAwesome6 style={styles.user} name="lock" size={22} color="#666" />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{ width: '100%', alignItems: 'flex-end' }}
            onPress={() => navigation.navigate('Forgot Password')}
          >
            <Text style={styles.forgot}>Forgot your password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginText}>Log in</Text>
          </TouchableOpacity>

          <Text style={styles.create}>
            Don't have an account?
            <TouchableOpacity>
              <Text style={{ color: 'blue' }} onPress={() => navigation.navigate('Signup')}> Sign up</Text>
            </TouchableOpacity>
          </Text>

          <Text style={styles.or}>──── or login with ────</Text>

          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <FontAwesome6 name="google" size={22} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <FontAwesome6 name="facebook" size={22} color="#4267B2" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  user: {
    position: 'absolute',
    left: 10,
    top: 12,
    color: '#666'
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
    color: '#0777'
  },
  heading: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#002366',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    padding: 12,
    paddingLeft: 40,
    fontSize: 16,
    height: 50,
    color: '#333',
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 20,
  },
  passwordInput: {
    paddingRight: 50
  },
  forgot: {
    color: '#002366',
    marginBottom: 20
  },
  loginBtn: {
    backgroundColor: '#002366',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 10,
    width: '100%',
    height: 50,
  },
  loginText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  create: {
    color: '#333',
    marginTop: 8,
    marginBottom: 10,
    alignItems: 'center',
    textAlign: 'center',
  },
  or: {
    textAlign: 'center',
    marginVertical: 15,
    color: '#666'
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20
  },
  iconBtn: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 50,
    elevation: 3,
    marginHorizontal: 10
  },
  card: {
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 3, 3, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(15, 5, 5, 0.49)',
    padding: 25,
    borderRadius: 25,
  }
});
