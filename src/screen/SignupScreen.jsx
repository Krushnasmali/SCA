import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import CustomHeader from './CustomHeader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Temporary success simulation
    Alert.alert('Success', 'Account created successfully!');
    navigation.navigate('Login');
  };

  return (
    <LinearGradient
      colors={['#00c3ff', '#ffff1c']}
      style={styles.container}
    >
      <CustomHeader title="Sign up" navigation={navigation} />

      <View style={{ alignContent: 'center', justifyContent: 'center', flex: 1 }}>
        <View style={styles.card}>
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subheading}>Register now to Local services</Text>

          <View>
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#777"
              style={styles.input}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
            />
            <FontAwesome6 style={styles.user} name="user" size={22} color="#666" />
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#777"
              style={[styles.input, styles.passwordInput]}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              value={password}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#666" />
            </TouchableOpacity>
            <FontAwesome6 style={styles.user} name="lock" size={22} color="#666" />
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#777"
              style={[styles.input, styles.passwordInput]}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#666" />
            </TouchableOpacity>
            <FontAwesome6 style={styles.user} name="lock" size={22} color="#666" />
          </View>

          <TouchableOpacity style={styles.signupBtn} onPress={handleSignup}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>

          <Text style={styles.already}>
            Already have an account?{' '}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: 'blue', position: 'relative', top: 5 }}>Login</Text>
            </TouchableOpacity>
          </Text>

          <Text style={styles.or}>──── or Signup with ────</Text>

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

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center'
  },
  card: {
    justifyContent: 'center',
    backgroundColor: 'rgba(4, 1, 1, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(10, 3, 3, 0.49)',
    padding: 25,
    borderRadius: 25,
  },
  heading: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#002366',
    textAlign: 'center'
  },
  subheading: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 30
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    paddingLeft: 40,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f0f0f0',
    color: '#333'
  },
  user: {
    position: 'absolute',
    left: 10,
    top: 12,
    color: '#666'
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 20
  },
  passwordInput: {
    paddingRight: 50
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 18
  },
  signupBtn: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10
  },
  signupText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },
  already: {
    fontSize: 14,
    color: '#444',
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
  }
});
