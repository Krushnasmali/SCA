import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { ThemeContext } from './ThemeContext';

const ProfileScreen = () => {
  const { theme } = useContext(ThemeContext);
  const [photo, setPhoto] = useState(require('../assets/profile.png'));
  const [name, setName] = useState('User Name');
  const [gender, setGender] = useState('Not specified');
  const [enrolledCourses, setEnrolledCourses] = useState(['Course 1', 'Course 2']);
  const [editingName, setEditingName] = useState(false);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES || PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Permission Required',
          message: 'This app needs access to your photo library',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Cannot access gallery');
      return;
    }

    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Something went wrong');
      } else if (response.assets && response.assets.length > 0) {
        setPhoto({ uri: response.assets[0].uri });
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.photoContainer}>
        <Image source={photo} style={styles.photo} />
        <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.text }]} onPress={pickImage}>
          <Text style={styles.editText}>✎</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.nameContainer}>
        {editingName ? (
          <TextInput
            style={[styles.nameInput, { color: theme.text, borderColor: theme.text }]}
            value={name}
            onChangeText={setName}
            onBlur={() => setEditingName(false)}
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setEditingName(true)}>
            <Text style={[styles.nameText, { color: theme.text }]}>{name}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.infoLabel, { color: theme.text }]}>Gender</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{gender}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.infoLabel, { color: theme.text }]}>Enrolled Courses</Text>
        {enrolledCourses.length ? (
          enrolledCourses.map((course, idx) => (
            <Text key={idx} style={[styles.infoValue, { color: theme.text }]}>- {course}</Text>
          ))
        ) : (
          <Text style={[styles.infoValue, { color: theme.text }]}>No enrolled courses yet</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  photoContainer: {
    alignSelf: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
  },
  editButton: {
    position: 'absolute',
    right: -10,
    bottom: 0,
    borderRadius: 16,
    padding: 6,
    elevation: 5,
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  nameContainer: {
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'center',
    minWidth: '60%',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
  },
  infoContainer: {
    marginTop: 24,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
  },
});

export default ProfileScreen;
