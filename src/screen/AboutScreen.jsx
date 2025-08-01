import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const AboutScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      

      {/* Logo or Image (Optional) */}
      <Image source={require('../img/logo.png')} style={styles.logo} />

      <Text style={styles.appName}>UrbanMitra</Text>
      <Text style={styles.version}>Version 1.0.0</Text>

      <Text style={styles.description}>
        UrbanMitra is a local service booking app that helps users find and schedule trusted professionals for home services like AC repair, salon, plumbing, and more.
      </Text>

      <Text style={styles.developer}>Developed by: Pavan Yevle</Text>
      <Text style={styles.contact}>Contact: urbanmitra.help@gmail.com</Text>
    </View>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop:25,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#438596',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
    marginBottom: 30,
  },
  developer: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  contact: {
    fontSize: 14,
    color: '#666',
  },
});
