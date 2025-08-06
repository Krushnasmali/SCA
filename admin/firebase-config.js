// Firebase configuration for admin web interfaces
// This file initializes Firebase and exports the database instance

// Check if Firebase is loaded
if (typeof firebase === 'undefined') {
    console.error('Firebase is not loaded. Please ensure Firebase CDN scripts are loaded first.');
    throw new Error('Firebase not available');
}

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAKn138j32ixsHlrSmka32FfvPAFuueiM8",
    authDomain: "shweta-computers-academy-a2d54.firebaseapp.com",
    databaseURL: "https://shweta-computers-academy-a2d54-default-rtdb.firebaseio.com",
    projectId: "shweta-computers-academy-a2d54",
    storageBucket: "shweta-computers-academy-a2d54.firebasestorage.app",
    messagingSenderId: "1098688948575",
    appId: "1:1098688948575:web:aa510f0e01001c808eeeea",
    measurementId: "G-LVMR6324KC"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get database instance
const database = firebase.database();

// Export for use in other files
window.SCAFirebase = {
    database: database,
    config: firebaseConfig
};
