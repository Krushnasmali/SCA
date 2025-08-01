import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const LogoutScreen = ({ navigation }) => {
  const handleLogout = () => {
    Alert.alert("Logged Out", "You have been successfully logged out.");
    navigation.replace('Welcome'); // Simulate logout by navigating to Welcome screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoutBox}>
        <Text style={styles.title}>Are you sure you want to logout?</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LogoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4F6',
  },
  logoutBox: {
    backgroundColor: '#EAF4F6',
    margin: 20,
    borderRadius: 15,
    marginTop: '50%',
    padding: 24,
  },
  title: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  logoutButton: {
    backgroundColor: '#438596',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  cancelText: {
    fontSize: 16,
    color: '#333',
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
  },
});
