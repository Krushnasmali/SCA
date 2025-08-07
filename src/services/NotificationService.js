import messaging from '@react-native-firebase/messaging';
import database from '@react-native-firebase/database';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.unsubscribeTokenRefresh = null;
    this.unsubscribeForegroundListener = null;
    this.unsubscribeBackgroundListener = null;
  }

  // Initialize notification service
  async initialize(user) {
    if (this.isInitialized && this.currentUser?.uid === user?.uid) {
      return;
    }

    this.currentUser = user;
    
    try {
      // Request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('Notification permission denied');
        return false;
      }

      // Get and save FCM token
      await this.getFCMToken();

      // Set up listeners
      this.setupTokenRefreshListener();
      this.setupForegroundListener();
      this.setupBackgroundListener();

      this.isInitialized = true;
      console.log('NotificationService initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing NotificationService:', error);
      return false;
    }
  }

  // Request notification permission
  async requestPermission() {
    try {
      if (Platform.OS === 'android') {
        // For Android 13+ (API 33+), request POST_NOTIFICATIONS permission
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message: 'SCA would like to send you notifications about new courses and updates.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            return false;
          }
        }
      }

      // Request Firebase messaging permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        // Show user-friendly explanation
        Alert.alert(
          'Enable Notifications',
          'To receive important updates about your courses and academy news, please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => this.openNotificationSettings() }
          ]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Get FCM token and save to database
  async getFCMToken() {
    try {
      const token = await messaging().getToken();
      if (token && this.currentUser) {
        console.log('FCM Token:', token);
        
        // Save token to user profile in database
        await this.saveFCMToken(token);
        
        // Store locally for comparison
        await AsyncStorage.setItem('fcm_token', token);
        
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Save FCM token to Firebase Realtime Database
  async saveFCMToken(token) {
    if (!this.currentUser || !token) return;

    try {
      const userRef = database().ref(`users/${this.currentUser.uid}`);
      await userRef.update({
        fcmToken: token,
        notificationSettings: {
          enabled: true,
          courseUpdates: true,
          generalAnnouncements: true,
          lastUpdated: database.ServerValue.TIMESTAMP
        },
        updatedAt: database.ServerValue.TIMESTAMP
      });
      
      console.log('FCM token saved to database');
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }

  // Setup token refresh listener
  setupTokenRefreshListener() {
    this.unsubscribeTokenRefresh = messaging().onTokenRefresh(async (token) => {
      console.log('FCM token refreshed:', token);
      await this.saveFCMToken(token);
      await AsyncStorage.setItem('fcm_token', token);
    });
  }

  // Setup foreground message listener
  setupForegroundListener() {
    this.unsubscribeForegroundListener = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground notification received:', remoteMessage);
      
      // Show in-app notification
      this.showInAppNotification(remoteMessage);
      
      // Save notification to local storage for history
      await this.saveNotificationLocally(remoteMessage);
    });
  }

  // Setup background message listener
  setupBackgroundListener() {
    this.unsubscribeBackgroundListener = messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background notification received:', remoteMessage);
      
      // Save notification to local storage for history
      await this.saveNotificationLocally(remoteMessage);
    });
  }

  // Show in-app notification for foreground messages
  showInAppNotification(remoteMessage) {
    const { notification, data } = remoteMessage;
    
    if (notification) {
      Alert.alert(
        notification.title || 'SCA Notification',
        notification.body || 'You have a new notification',
        [
          { text: 'Dismiss', style: 'cancel' },
          { 
            text: 'View', 
            onPress: () => this.handleNotificationPress(remoteMessage)
          }
        ]
      );
    }
  }

  // Handle notification press
  handleNotificationPress(remoteMessage) {
    const { data } = remoteMessage;
    
    // Handle different notification types based on data
    if (data?.type === 'course_assignment') {
      // Navigate to My Courses screen
      console.log('Navigate to My Courses');
    } else if (data?.type === 'general_announcement') {
      // Navigate to announcements or home screen
      console.log('Navigate to Home');
    }
    
    // You can extend this to handle navigation based on notification type
  }

  // Save notification locally for history
  async saveNotificationLocally(remoteMessage) {
    try {
      const notifications = await this.getLocalNotifications();
      const newNotification = {
        id: Date.now().toString(),
        title: remoteMessage.notification?.title || 'SCA Notification',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data || {},
        receivedAt: new Date().toISOString(),
        read: false
      };
      
      notifications.unshift(newNotification);
      
      // Keep only last 50 notifications
      const limitedNotifications = notifications.slice(0, 50);
      
      await AsyncStorage.setItem('local_notifications', JSON.stringify(limitedNotifications));
    } catch (error) {
      console.error('Error saving notification locally:', error);
    }
  }

  // Get local notifications
  async getLocalNotifications() {
    try {
      const notifications = await AsyncStorage.getItem('local_notifications');
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('Error getting local notifications:', error);
      return [];
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    if (!this.currentUser) return false;

    try {
      const userRef = database().ref(`users/${this.currentUser.uid}`);
      await userRef.update({
        notificationSettings: {
          ...settings,
          lastUpdated: database.ServerValue.TIMESTAMP
        },
        updatedAt: database.ServerValue.TIMESTAMP
      });
      
      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }

  // Get notification settings
  async getNotificationSettings() {
    if (!this.currentUser) return null;

    try {
      const userSnapshot = await database().ref(`users/${this.currentUser.uid}/notificationSettings`).once('value');
      return userSnapshot.val() || {
        enabled: true,
        courseUpdates: true,
        generalAnnouncements: true
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return null;
    }
  }

  // Open device notification settings
  openNotificationSettings() {
    // This would typically open device settings
    // Implementation depends on specific requirements
    console.log('Open notification settings');
  }

  // Cleanup listeners
  cleanup() {
    if (this.unsubscribeTokenRefresh) {
      this.unsubscribeTokenRefresh();
      this.unsubscribeTokenRefresh = null;
    }
    
    if (this.unsubscribeForegroundListener) {
      this.unsubscribeForegroundListener();
      this.unsubscribeForegroundListener = null;
    }
    
    if (this.unsubscribeBackgroundListener) {
      this.unsubscribeBackgroundListener();
      this.unsubscribeBackgroundListener = null;
    }
    
    this.isInitialized = false;
    this.currentUser = null;
  }

  // Check if notifications are enabled
  async areNotificationsEnabled() {
    try {
      const authStatus = await messaging().hasPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
             authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;
