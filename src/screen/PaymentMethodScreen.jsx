import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const paymentOptions = [
  { id: '1', name: 'UPI', icon: 'logo-google' },
  { id: '2', name: 'Debit / Credit Card', icon: 'card-outline' },
  { id: '3', name: 'Wallet', icon: 'wallet-outline' },
  { id: '4', name: 'Cash on Delivery', icon: 'cash-outline' },
];

const PaymentMethodScreen = ({ navigation }) => {
  const [selectedId, setSelectedId] = useState(null);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.optionContainer,
        selectedId === item.id && styles.selectedOption,
      ]}
      onPress={() => setSelectedId(item.id)}
    >
      <Icon name={item.icon} size={24} color="#438596" style={styles.icon} />
      <Text style={styles.optionText}>{item.name}</Text>
      {selectedId === item.id && (
        <Icon name="checkmark-circle" size={24} color="green" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      

      
      <FlatList
        data={paymentOptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
      />

      
      <TouchableOpacity
        style={styles.proceedButton}
        onPress={() => {
          if (selectedId) {
           
            
          } else {
            alert('Please select a payment method');
          }
        }}
      >
        <Text style={styles.buttonText}>Proceed to Pay</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentMethodScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f8f8',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop:25,
  },
  icon1:{
    marginTop:25,
  },
  icon: {
    marginRight: 12,
    
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
    justifyContent: 'space-between',
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#438596',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
    color: '#333',
  },
  proceedButton: {
    backgroundColor: '#438596',
    padding: 16,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
