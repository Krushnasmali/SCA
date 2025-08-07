import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { Platform } from 'react-native';

class AuthService {
  constructor() {
    this.configureGoogleSignIn();
  }

  configureGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: '1098688948575-7fq8d4culr2ostle8cv7qr06soio4th6.apps.googleusercontent.com',
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
  }

  // Email and Password Authentication
  async signInWithEmailAndPassword(email, password) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Get user data from Realtime Database
      const userSnapshot = await database().ref(`users/${user.uid}`).once('value');

      return {
        success: true,
        user: user,
        userData: userSnapshot.exists() ? userSnapshot.val() : null
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async createUserWithEmailAndPassword(email, password, userData) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Save additional user data to Realtime Database
      const newUserData = {
        email: email,
        name: userData.name || '',
        contactNumber: userData.contactNumber || '',
        profilePicture: '',
        fcmToken: '',
        notificationSettings: {
          enabled: true,
          courseUpdates: true,
          generalAnnouncements: true,
          lastUpdated: database.ServerValue.TIMESTAMP
        },
        createdAt: database.ServerValue.TIMESTAMP,
        updatedAt: database.ServerValue.TIMESTAMP
      };

      await database().ref(`users/${user.uid}`).set(newUserData);

      return {
        success: true,
        user: user,
        userData: newUserData
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Google Sign In
  async signInWithGoogle() {
    try {
      console.log('Starting Google Sign-In process...');

      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('Google Play Services available');

      // Sign out any existing user first to ensure clean state
      await GoogleSignin.signOut();

      // Get the users ID token
      const signInResult = await GoogleSignin.signIn();
      console.log('Google Sign-In successful, got result:', signInResult);

      // Extract idToken from the result
      const idToken = signInResult.idToken || signInResult.data?.idToken;

      if (!idToken) {
        console.error('Sign-in result:', JSON.stringify(signInResult, null, 2));
        throw new Error('No ID token received from Google Sign-In. Please try again.');
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      console.log('Created Google credential');

      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;
      console.log('Firebase authentication successful for user:', user.uid);

      // Check if user exists in Realtime Database, if not create profile
      const userSnapshot = await database().ref(`users/${user.uid}`).once('value');

      let userData = null;
      if (!userSnapshot.exists()) {
        console.log('Creating new user profile in Realtime Database');
        userData = {
          email: user.email,
          name: user.displayName || '',
          contactNumber: '',
          profilePicture: user.photoURL || '',
          fcmToken: '',
          notificationSettings: {
            enabled: true,
            courseUpdates: true,
            generalAnnouncements: true,
            lastUpdated: database.ServerValue.TIMESTAMP
          },
          createdAt: database.ServerValue.TIMESTAMP,
          updatedAt: database.ServerValue.TIMESTAMP
        };
        await database().ref(`users/${user.uid}`).set(userData);
      } else {
        userData = userSnapshot.val();
      }

      return {
        success: true,
        user: user,
        userData: userData
      };
    } catch (error) {
      console.error('Google Sign-In error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      // Handle specific Google Sign-In errors
      let errorMessage = 'Google Sign-In failed';

      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMessage = 'Sign-in was cancelled';
      } else if (error.code === 'IN_PROGRESS') {
        errorMessage = 'Sign-in is already in progress';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Google Play Services is not available';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Apple Sign In
  async signInWithApple() {
    try {
      console.log('Starting Apple Sign-In process...');

      // Check if Apple Sign-In is available (only on iOS 13+)
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign-In is only available on iOS devices');
      }

      // Check if Apple Sign-In is supported
      const isSupported = appleAuth.isSupported;
      if (!isSupported) {
        throw new Error('Apple Sign-In is not supported on this device (requires iOS 13+)');
      }

      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      console.log('Apple Sign-In response received:', appleAuthRequestResponse);

      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identify token returned');
      }

      // Create a Firebase credential from the response
      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
      console.log('Created Apple credential');

      // Sign the user in with the credential
      const userCredential = await auth().signInWithCredential(appleCredential);
      const user = userCredential.user;
      console.log('Firebase authentication successful for user:', user.uid);

      // Check if user exists in Realtime Database, if not create profile
      const userSnapshot = await database().ref(`users/${user.uid}`).once('value');

      let userData = null;
      if (!userSnapshot.exists()) {
        console.log('Creating new user profile in Realtime Database');
        const fullName = appleAuthRequestResponse.fullName;
        const displayName = fullName ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() : '';

        userData = {
          email: user.email || appleAuthRequestResponse.email || '',
          name: displayName,
          contactNumber: '',
          profilePicture: '',
          fcmToken: '',
          notificationSettings: {
            enabled: true,
            courseUpdates: true,
            generalAnnouncements: true,
            lastUpdated: database.ServerValue.TIMESTAMP
          },
          createdAt: database.ServerValue.TIMESTAMP,
          updatedAt: database.ServerValue.TIMESTAMP
        };
        await database().ref(`users/${user.uid}`).set(userData);
      } else {
        userData = userSnapshot.val();
      }

      return {
        success: true,
        user: user,
        userData: userData
      };
    } catch (error) {
      console.error('Apple Sign-In error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      // Handle specific Apple Sign-In errors with user-friendly messages
      let errorMessage = 'Apple Sign-In failed';

      if (error.message === 'Apple Sign-In is only available on iOS devices') {
        errorMessage = 'Apple Sign-In is only available on iOS devices. Please use Google Sign-In or email/password instead.';
      } else if (error.message === 'Apple Sign-In is not supported on this device (requires iOS 13+)') {
        errorMessage = 'Apple Sign-In requires iOS 13 or later. Please update your device or use another sign-in method.';
      } else if (error.code === '1001') {
        errorMessage = 'Apple Sign-In was cancelled.';
      } else if (error.code === '1000') {
        errorMessage = 'Apple Sign-In failed. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Password Reset
  async sendPasswordResetEmail(email) {
    try {
      await auth().sendPasswordResetEmail(email);
      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign Out
  async signOut() {
    try {
      await auth().signOut();
      await GoogleSignin.signOut();
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get current user
  getCurrentUser() {
    return auth().currentUser;
  }

  // Listen to authentication state changes
  onAuthStateChanged(callback) {
    return auth().onAuthStateChanged(callback);
  }

  // Update user profile
  async updateUserProfile(userId, userData) {
    try {
      await database().ref(`users/${userId}`).update({
        ...userData,
        updatedAt: database.ServerValue.TIMESTAMP
      });

      return {
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get user data from Realtime Database
  async getUserData(userId) {
    try {
      const userSnapshot = await database().ref(`users/${userId}`).once('value');

      if (userSnapshot.exists()) {
        return {
          success: true,
          userData: userSnapshot.val()
        };
      } else {
        return {
          success: false,
          error: 'User data not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper method to get user-friendly error messages
  getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      // Google Sign-In specific errors
      case 'SIGN_IN_CANCELLED':
        return 'Sign-in was cancelled.';
      case 'IN_PROGRESS':
        return 'Sign-in is already in progress.';
      case 'PLAY_SERVICES_NOT_AVAILABLE':
        return 'Google Play Services is not available.';
      case 'SIGN_IN_REQUIRED':
        return 'Please sign in to continue.';
      // Apple Sign-In specific errors
      case '1001':
        return 'Apple Sign-In was cancelled.';
      case '1000':
        return 'Apple Sign-In failed. Please try again.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

export default new AuthService();
