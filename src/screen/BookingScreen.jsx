import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const bookings1 = [
    {
        id: '2',
        service: 'Haircut for Men',
        icon: 'cut-outline',
        date: '25 June 2025',
        time: '4:00 PM',
        status: 'Pending',
        address: 'Near Main Circle, Nashik',
    },
];

const bookings2 = [
    {
        id: '1',
        service: 'AC Service & Repair',
        icon: 'snow-outline',
        date: '22 June 2025',
        time: '10:00 AM',
        status: 'Confirmed',
        address: '123, MG Road, Nashik',
    },
];

const bookings3 = [
    {
        id: '3',
        service: 'Bathroom Cleaning',
        icon: 'water-outline',
        date: '20 June 2025',
        time: '2:00 PM',
        status: 'Completed',
        address: 'Nashik Main Road',
    },
];
const bookings4 = [
    {
        id: '4',
        service: 'Bathroom Cleaning',
        icon: 'water-outline',
        date: '17 June 2025',
        time: '2:00 PM',
        status: 'Canceled',
        address: 'Nashik College Road',
    },
];

const BookingScreen = ({ navigation }) => {
    const renderItem = ({ item }) => (

        <View style={styles.card}>
            <View style={styles.row}>
                <Icon name={item.icon} size={24} color="#438596" />
                <Text style={styles.service}>{item.service}</Text>
            </View>
            <Text style={styles.detail}>📆 {item.date} at {item.time}</Text>
            <Text style={styles.detail}>📍 {item.address}</Text>
            <Text style={styles.status(item.status)}>{item.status}</Text>
        </View>

    );

    return (
        <View style={styles.container}>
            

            {/* Booking Sections */}
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <TouchableOpacity>
                    <FlatList
                        data={bookings1}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                    />
                </TouchableOpacity>

                <TouchableOpacity>
                    <FlatList
                        data={bookings2}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                    />
                </TouchableOpacity>

                <TouchableOpacity>
                    <FlatList
                        data={bookings3}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                    />
                </TouchableOpacity>

                <TouchableOpacity>
                    <FlatList
                        data={bookings4}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                    />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default BookingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 15,
        justifyContent: 'space-between',
        backgroundColor: '#f8f8f8',
        elevation: 4,
    },
    icon: {
        marginTop: 25,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#333',
    },
    card: {
        backgroundColor: '#f1f1f1',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    service: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    detail: {
        fontSize: 14,
        color: '#444',
        marginBottom: 4,
    },
    status: (status) => ({
        marginTop: 8,
        fontWeight: 'bold',
        color: status === 'Confirmed' ? 'green' : status === 'Pending' ? 'orange' : 'gray',
    }),
});
