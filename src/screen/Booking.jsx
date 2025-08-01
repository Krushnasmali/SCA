import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const Booking = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [service, setService] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleBooking = async () => {
    if (!name || !mobile || !service || !address || !date || !time) {
      Alert.alert('Missing Fields', 'Please fill in all the details.');
      return;
    }

    try {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert('Error', 'User not logged in.');
        return;
      }

      await firestore()
        .collection('bookings')
        .add({
          name,
          mobile,
          service,
          address,
          date,
          time,
          userId: user.uid,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert(
        'Booking Confirmed',
        `Thank you ${name}, your ${service} service is booked on ${date} at ${time}`
      );

      // Reset fields
      setName('');
      setMobile('');
      setService('');
      setAddress('');
      setDate('');
      setTime('');
    } catch (error) {
      console.log('🔥 Booking Error:', error);
      Alert.alert('Error', error.message || 'Something went wrong while booking.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Book a Service</Text>

      <TextInput
        placeholder="Your Name"
        style={styles.input}
        placeholderTextColor="#777"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Mobile Number"
        style={styles.input}
        keyboardType="phone-pad"
        maxLength={10}
        placeholderTextColor="#777"
        value={mobile}
        onChangeText={setMobile}
      />
      <TextInput
        placeholder="Service Name"
        style={styles.input}
        placeholderTextColor="#777"
        value={service}
        onChangeText={setService}
      />
      <TextInput
        placeholder="Address"
        style={styles.input}
        placeholderTextColor="#777"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        placeholder="Preferred Date (e.g. 2025-06-23)"
        style={styles.input}
        placeholderTextColor="#777"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        placeholder="Preferred Time (e.g. 10:00 AM)"
        style={styles.input}
        placeholderTextColor="#777"
        value={time}
        onChangeText={setTime}
      />

      <TouchableOpacity style={styles.button} onPress={handleBooking}>
        <Text style={styles.buttonText}>Confirm Booking</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Booking;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
    color: '#000',
  },
  button: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
