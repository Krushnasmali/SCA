import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const AccountScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const doc = await firestore().collection('users').doc(user.uid).get();
          if (doc.exists) {
            setUserData(doc.data());
          }
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileBox}>
        <Icon name="person-circle-outline" size={100} color="#438596" />
        <Text style={styles.name}>{userData?.name || 'Nitin Nikam'}</Text>
        <Text style={styles.number}>{userData?.email || 'No Email Found'}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('My Booking')}>
          <Icon name="calendar-outline" size={20} color="#333" style={styles.icon} />
          <Text style={styles.menuText}>My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Payment')}>
          <Icon name="card-outline" size={20} color="#333" style={styles.icon} />
          <Text style={styles.menuText}>Payment Methods</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings-outline" size={20} color="#333" style={styles.icon} />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('About')}>
          <Icon name="information-circle-outline" size={20} color="#333" style={styles.icon} />
          <Text style={styles.menuText}>About</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Edit Account')}>
          <Icon name="create-outline" size={20} color="#333" style={styles.icon} />
          <Text style={styles.menuText}>Edit Account</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('LogoutScreen')}>
        <Icon name="log-out-outline" size={20} color="red" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  profileBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  number: {
    fontSize: 14,
    color: '#555',
  },
  menu: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  icon: {
    marginRight: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginHorizontal: 40,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: 'red',
    borderRadius: 30,
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logoutText: {
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
  },
});
