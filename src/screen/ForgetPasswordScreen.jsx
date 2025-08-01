import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ForgetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handlePasswordReset = () => {
    if (!email) {
      Alert.alert('Input Required', 'Please enter your registered email.');
      return;
    }

    // Simulate password reset
    Alert.alert(
      'Email Sent',
      'A password reset link would be sent to your email (simulated).'
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backIcon}
      >
        <Ionicons name="arrow-back-outline" size={28} color="#333" />
      </TouchableOpacity>

      <Text style={styles.heading}>Forgot Password</Text>
      <Text style={styles.subheading}>
        Enter your registered email to receive a password reset link.
      </Text>

      <TextInput
        placeholder="Email Address"
        placeholderTextColor="#777"
        style={styles.input}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
      />

      <TouchableOpacity style={styles.resetBtn} onPress={handlePasswordReset}>
        <Text style={styles.resetText}>Send Reset Email</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default ForgetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  backIcon: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#002366',
    marginBottom: 10,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
  },
  resetBtn: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
  },
  resetText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
