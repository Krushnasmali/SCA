import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const EditAccountScreen = ({ navigation, route }) => {
  // Optional: receive pre-filled data via navigation
  const [name, setName] = useState(route?.params?.name || '');
  const [email, setEmail] = useState(route?.params?.email || '');

  const handleUpdate = () => {
    if (!name || !email) {
      Alert.alert('Input Required', 'Both name and email are required!');
      return;
    }

    // Simulate saving
    Alert.alert('Success', 'Profile updated successfully!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#002366',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    backgroundColor: '#1e40af',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
