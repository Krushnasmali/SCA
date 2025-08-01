import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CustomHeader = ({ title, navigation }) => {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
      </View>

      
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
   
    paddingTop: 30,
    paddingBottom: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    width: 40, // future use
  },
  title: {
    fontSize: 25,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
