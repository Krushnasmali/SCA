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
  RefreshControl,
  Linking,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { ThemeContext } from './ThemeContext';
import { useUser } from '../context/UserContext';
import storage from '@react-native-firebase/storage';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import CourseService from '../services/CourseService';

const ProfileScreen = () => {
  const { theme } = useContext(ThemeContext);
  const { user, userData, updateProfile, refreshUserData, logout } = useUser();

  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setContactNumber(userData.contactNumber || '');
      setPhoto(userData.profilePicture ? { uri: userData.profilePicture } : null);
    }
  }, [userData]);

  // Load enrolled courses
  useEffect(() => {
    const loadEnrolledCourses = async () => {
      if (!user) {
        setEnrolledCourses([]);
        setCoursesLoading(false);
        return;
      }

      try {
        setCoursesLoading(true);
        const result = await CourseService.getUserCourses(user.uid);

        if (result.success) {
          // Extract course titles from the result
          const courseTitles = result.courses.map(course => course.title).filter(Boolean);
          setEnrolledCourses(courseTitles);
        } else {
          console.error('Failed to load enrolled courses:', result.error);
          setEnrolledCourses([]);
        }
      } catch (error) {
        console.error('Error loading enrolled courses:', error);
        setEnrolledCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    loadEnrolledCourses();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();

    // Also refresh enrolled courses
    if (user) {
      try {
        const result = await CourseService.getUserCourses(user.uid);
        if (result.success) {
          const courseTitles = result.courses.map(course => course.title).filter(Boolean);
          setEnrolledCourses(courseTitles);
        }
      } catch (error) {
        console.error('Error refreshing enrolled courses:', error);
      }
    }

    setRefreshing(false);
  };

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

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissions = [];

        // For Android 13+ (API 33+), use READ_MEDIA_IMAGES
        if (Platform.Version >= 33) {
          permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
        } else {
          permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        }

        permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);

        const granted = await PermissionsAndroid.requestMultiple(permissions);

        const cameraGranted = granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
        const storageGranted = Platform.Version >= 33
          ? granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED
          : granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;

        const cameraResult = granted[PermissionsAndroid.PERMISSIONS.CAMERA];
        const storageResult = Platform.Version >= 33
          ? granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES]
          : granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE];

        return {
          camera: cameraGranted,
          storage: storageGranted,
          cameraDenied: cameraResult === PermissionsAndroid.RESULTS.DENIED,
          storageDenied: storageResult === PermissionsAndroid.RESULTS.DENIED,
          cameraNeverAskAgain: cameraResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
          storageNeverAskAgain: storageResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
        };
      } catch (err) {
        console.warn('Permission request error:', err);
        return { camera: false, storage: false, cameraDenied: false, storageDenied: false };
      }
    }
    return { camera: true, storage: true }; // iOS permissions are handled automatically
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose an option to select your profile picture',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
    const permissions = await requestPermissions();
    if (!permissions.camera) {
      if (permissions.cameraNeverAskAgain) {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos. Please enable it in app settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos. Please grant permission and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: () => openCamera() },
          ]
        );
      }
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchCamera(options, handleImageResponse);
  };

  const openGallery = async () => {
    const permissions = await requestPermissions();
    if (!permissions.storage) {
      if (permissions.storageNeverAskAgain) {
        Alert.alert(
          'Permission Required',
          'Storage permission is required to access photos. Please enable it in app settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        Alert.alert(
          'Permission Required',
          'Storage permission is required to access photos. Please grant permission and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: () => openGallery() },
          ]
        );
      }
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, handleImageResponse);
  };

  const handleImageResponse = async (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
      return;
    }

    if (response.errorCode || response.error) {
      Alert.alert('Error', response.errorMessage || response.error || 'Something went wrong');
      return;
    }

    if (response.assets && response.assets.length > 0) {
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
        console.error('Image upload error:', error);
        Alert.alert('Error', 'Failed to upload image. Please try again.');
        setPhoto(userData.profilePicture ? { uri: userData.profilePicture } : null);
      } finally {
        setIsUploading(false);
      }
    }
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.text]}
          tintColor={theme.text}
        />
      }
    >
      <View style={styles.content}>
        <View style={styles.photoContainer}>
          <Image
            source={photo || require('../assets/profile.png')}
            style={styles.photo}
          />
          <TouchableOpacity
            style={[
              styles.editButton,
              {
                backgroundColor: theme.primary,
                borderColor: theme.cardBackground,
              }
            ]}
            onPress={showImagePicker}
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
                  style={[
                    styles.editInput,
                    {
                      color: theme.text,
                      borderColor: theme.border,
                      backgroundColor: theme.cardBackground
                    }
                  ]}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  placeholder="Enter your name"
                  placeholderTextColor={theme.textMuted}
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
                style={[
                  styles.valueContainer,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  }
                ]}
                onPress={() => setEditingName(true)}
              >
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {name || 'Tap to add name'}
                </Text>
                <FontAwesome6 name="edit" size={16} color={theme.textMuted} />
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
                  style={[
                    styles.editInput,
                    {
                      color: theme.text,
                      borderColor: theme.border,
                      backgroundColor: theme.cardBackground
                    }
                  ]}
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  autoFocus
                  placeholder="Enter contact number"
                  placeholderTextColor={theme.textMuted}
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
                style={[
                  styles.valueContainer,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  }
                ]}
                onPress={() => setEditingContact(true)}
              >
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {contactNumber || 'Tap to add contact number'}
                </Text>
                <FontAwesome6 name="edit" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>Enrolled Courses</Text>
            {coursesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.text} />
                <Text style={[styles.infoValue, { color: theme.text, marginLeft: 10 }]}>Loading courses...</Text>
              </View>
            ) : enrolledCourses.length > 0 ? (
              enrolledCourses.map((course, idx) => (
                <Text key={idx} style={[styles.infoValue, { color: theme.text }]}>• {course}</Text>
              ))
            ) : (
              <Text style={[styles.infoValue, { color: theme.textMuted || theme.text, fontStyle: 'italic' }]}>
                No courses enrolled yet
              </Text>
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
    top: 5,
    right: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  editContainer: {
    marginTop: 5,
  },
  editInput: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
});

export default ProfileScreen;
