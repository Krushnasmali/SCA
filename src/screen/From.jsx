import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';

const DATABASE_URL = 'https://myapp-1a8b6-default-rtdb.firebaseio.com/users.json';

const Form = () => {
    const [form, setForm] = useState({
        name: '',
        college: '',
        department: '',
        rollNo: '',
    });

    const [submittedData, setSubmittedData] = useState([]);

    const Change = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const Submit = async () => {
        if (!form.name || !form.college || !form.department || !form.rollNo) {
            Alert.alert('Please fill all fields!');
            return;
        }

        try {
            await axios.post(DATABASE_URL, form);
            Alert.alert('Data Submitted!');
            setForm({ name: '', college: '', department: '', rollNo: '' });
            fetchData();
        } catch (error) {
            console.error(error);
            Alert.alert('Failed to submit!');
        }
    };

    const fetchData = async () => {
        try {
            const res = await axios.get(DATABASE_URL);
            const data = res.data ? Object.values(res.data) : [];
            setSubmittedData(data.reverse());
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    return (
        <ScrollView style={styles.container}>
            <Text style={styles.heading}>Student Registration</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter Name"
                value={form.name}
                placeholderTextColor="#888"
                onChangeText={(text) => Change('name', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Enter College Name"
                value={form.college}
                placeholderTextColor="#888"
                onChangeText={(text) => Change('college', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Enter Department"
                value={form.department}
                placeholderTextColor="#888"
                onChangeText={(text) => Change('department', text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Enter Roll No"
                keyboardType="numeric"
                value={form.rollNo}
                placeholderTextColor="#888"
                onChangeText={(text) => Change('rollNo', text)}
            />

            <TouchableOpacity style={styles.button} onPress={Submit}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>

            <Text style={styles.submittedHeading}>Submitted Data:</Text>
            {submittedData.map((item, index) => (
                <View key={index} style={styles.card}>
                    <Text>Name: {item.name}</Text>
                    <Text>College: {item.college}</Text>
                    <Text>Department: {item.department}</Text>
                    <Text>Roll No: {item.rollNo}</Text>
                </View>
            ))}
        </ScrollView>
    );
};

export default Form;

const styles = StyleSheet.create({
    container: {
        padding: 20,backgroundColor:'pink'
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    input: {
        borderWidth: 1,
        borderColor: 'black',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 5
    },
    buttonText: {
        color: 'purpule',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    submittedHeading: {
        fontSize: 20,
        marginVertical: 15
    },
    card: {
        backgroundColor: '#eee',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5
    },
});