import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const services = [
  { title: 'AC & Appliance Repair', icon: require('../img/ac.jpg') },
  { title: 'Native Water Purifier', icon: require('../img/native.jpg') },
  { title: 'Salon for Women', icon: require('../img/woman.png') },
  { title: 'Haircut for Men', icon: require('../img/man.png') },
  { title: 'Cleaning & P', icon: require('../img/cleaning.png') },
];

const homeServices = [
  { title: 'Form Fill-up', icon: 'document-text', bg: '#D1FADF' },
  { title: 'Electrician', icon: 'hammer', bg: '#FEEBCB' },
  { title: 'Plumber', icon: 'water', bg: '#FFD6D6' },
  { title: 'Carpenter', icon: 'construct', bg: '#D6E4FF' },
];

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text>
          UrbanMitra
        </Text>
        {/* Search Bar */}
        <TextInput
          style={styles.searchBar}
          placeholder="Search for services"
          placeholderTextColor="#999"
        />

        {/* Service Category Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
          {services.map((item, index) => (
            <View key={index} style={styles.iconBox}>
              <Image source={item.icon} style={styles.iconImage} />
              <Text style={styles.iconText}>{item.title}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Home Services Grid */}
        <Text style={styles.sectionTitle}>Home services</Text>
        <View style={styles.grid}>
          {homeServices.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.gridItem, { backgroundColor: item.bg }]}
              onPress={() => {
                if (item.title === 'Form Fill-up') navigation.navigate('Booking');
              }}
            >
              <Ionicons name={item.icon} size={40} color="#333" />
              <Text style={styles.gridText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promotional Card */}
        <View style={styles.promoCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTitle}>Deep clean with foam-jet AC service</Text>
            <Text style={styles.promoSubtitle}>AC service & repair</Text>
            <TouchableOpacity style={styles.bookNowBtn}>
              <Text style={styles.bookNowText}>Book now</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={require('../img/acservice.png',)}
            style={styles.promoImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 40,
    flex: 1,
  },
  searchBar: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 20,
    marginBottom: 16,
  },
  iconScroll: {
    marginBottom: 5,
  },
  iconBox: {
    alignItems: 'center',
    marginRight: 16,
  },
  iconImage: {
    width:60 ,
    height: 60,
    borderRadius: 30,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
  },
  iconText: {
    fontSize: 10,
    textAlign: 'center',
    maxWidth: 100,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '45%',
    height: 100,
    borderRadius: 10,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'Center',
  },
  gridText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  promoCard: {
    flexDirection: 'row',
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  promoSubtitle: {
    fontSize: 13,
    color: '#555',
    marginBottom: 10,
  },
  bookNowBtn: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 13,
  },
  promoImage: {
    width: 100,
    height: 100,
    marginLeft: 10,
  },
});

export default HomeScreen;
