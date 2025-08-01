import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const DeleteAccountScreen = ({ navigation }) => {
  const handleDeleteAccount = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Simulate successful deletion
            Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.warningText}>
        Deleting your account will permanently remove your data and cannot be undone.
      </Text>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Icon name="trash-outline" size={20} color="white" style={{ marginRight: 10 }} />
        <Text style={styles.deleteText}>Delete My Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DeleteAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginVertical: 30,
    marginTop: 90,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'red',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    elevation: 5,
  },
  deleteText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
