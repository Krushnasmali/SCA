import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';


const Welcome = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#FF6A3D', '#EF5F8A', '#B067C7']}
      style={styles.container}
    >
      
      <StatusBar barStyle="light-content" backgroundColor="#f2709c" />

      {/* Logo + App Name */}
      <View style={styles.logoContainer} >
         <Image source={require('../img/bag.png')} style={styles.logoImage} />
        <Text style={styles.logoText}>LocalServices</Text>
      </View>

      {/* Illustration */}
      <Image
        source={require('../img/logo1.png')}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Heading */}
      <Text style={styles.heading}>Welcome to LocalServices</Text>
      <Text style={styles.subheading}>
        
      </Text>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.signupText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 40,
  },
  logoImage: {
    width: 36,
    height: 36,
    marginRight: 8,
  },
  logoText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  image: {
    width: 400,
    height: 300,
    marginVertical: 30,
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 19,
    color: '#fce4ec',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButton: {
    backgroundColor: '#F37A30',
    paddingVertical: 12,
    width: '100%',
    borderRadius: 10,
    marginBottom: 12,
  },
  signupButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    width: '100%',
    borderRadius: 10,
    marginBottom: 12,
  },
  loginText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  signupText: {
    color: '#6855D6',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign:'center'
  },
});