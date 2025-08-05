import React, { useState, useContext, useEffect } from 'react';
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
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { ThemeContext } from './ThemeContext';
import { useUser } from '../context/UserContext';
import storage from '@react-native-firebase/storage';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const ProfileScreen = () => {
  const { theme } = useContext(ThemeContext);
  const { user, userData, updateProfile, refreshUserData, logout } = useUser();

  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState(['Course 1', 'Course 2']);
  const [editingName, setEditingName] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setContactNumber(userData.contactNumber || '');
      setPhoto(userData.profilePicture ? { uri: userData.profilePicture } : null);
    }
  }, [userData]);

  const uploadImageToFirebase = async (imageUri) => {
    try {
      const filename = `profile_pictures/${user.uid}_${Date.now()}.jpg`;
      const reference = storage().ref(filename);

      await reference.putFile(imageUri);
      const downloadURL = await reference.getDownloadURL();

      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

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

    launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
    }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Something went wrong');
      } else if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        setPhoto({ uri: imageUri });

        // Upload to Firebase Storage
        setIsUploading(true);
        try {
          const downloadURL = await uploadImageToFirebase(imageUri);

          // Update user profile with new image URL
          const result = await updateProfile({ profilePicture: downloadURL });
          if (result.success) {
            Alert.alert('Success', 'Profile picture updated successfully!');
          } else {
            Alert.alert('Error', 'Failed to update profile picture');
            setPhoto(userData.profilePicture ? { uri: userData.profilePicture } : null);
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to upload image');
          setPhoto(userData.profilePicture ? { uri: userData.profilePicture } : null);
        } finally {
          setIsUploading(false);
        }
      }
    });
  };

  const handleUpdateName = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setIsUpdating(true);
    const result = await updateProfile({ name: name.trim() });
    setIsUpdating(false);

    if (result.success) {
      setEditingName(false);
      Alert.alert('Success', 'Name updated successfully!');
    } else {
      Alert.alert('Error', 'Failed to update name');
    }
  };



  const handleUpdateContact = async () => {
    setIsUpdating(true);
    const result = await updateProfile({ contactNumber: contactNumber.trim() });
    setIsUpdating(false);

    if (result.success) {
      setEditingContact(false);
      Alert.alert('Success', 'Contact number updated successfully!');
    } else {
      Alert.alert('Error', 'Failed to update contact number');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              // Navigation will be handled by the auth state change
            } else {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.photoContainer}>
          <Image
            source={photo || require('../assets/profile.png')}
            style={styles.photo}
          />
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.text }]}
            onPress={pickImage}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <FontAwesome6 name="camera" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoContainer}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>Name</Text>
            {editingName ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[styles.editInput, { color: theme.text, borderColor: theme.text }]}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  placeholder="Enter your name"
                  placeholderTextColor="#999"
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleUpdateName}
                    disabled={isUpdating}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setName(userData?.name || '');
                      setEditingName(false);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.valueContainer}
                onPress={() => setEditingName(true)}
              >
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {name || 'Tap to add name'}
                </Text>
                <FontAwesome6 name="edit" size={16} color="#666" />
              </TouchableOpacity>
            )}
          </View>



          <View style={styles.infoContainer}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>Email</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {user?.email || 'No email'}
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>Contact Number</Text>
            {editingContact ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[styles.editInput, { color: theme.text, borderColor: theme.text }]}
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  autoFocus
                  placeholder="Enter contact number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleUpdateContact}
                    disabled={isUpdating}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setContactNumber(userData?.contactNumber || '');
                      setEditingContact(false);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.valueContainer}
                onPress={() => setEditingContact(true)}
              >
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {contactNumber || 'Tap to add contact number'}
                </Text>
                <FontAwesome6 name="edit" size={16} color="#666" />
              </TouchableOpacity>
            )}
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

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FontAwesome6 name="sign-out-alt" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#ddd',
  },
  editButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoSection: {
    flex: 1,
  },
  infoContainer: {
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    marginLeft: 5,
    color: '#666',
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  editContainer: {
    marginTop: 5,
  },
  editInput: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#800080',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 30,
    marginBottom: 20,
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProfileScreen;
