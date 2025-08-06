import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import { ThemeContext } from './ThemeContext';
import { useUser } from '../context/UserContext';

const categories = [
  { id: 'coding', label: 'Coding' },
  { id: 'business', label: 'Business' },
  { id: 'designing', label: 'Designing' },
  { id: 'digital_literacy', label: 'Digital Literacy' },
];

const sliderImages = [
  require('../assets/coding.jpg'),
  require('../assets/mscitImg.jpg'),
  require('../assets/coding.jpg'),
];

const cards = [
  {
    name: 'All SCA Courses',
    screen: 'AllCourses',
    img: require('../assets/allCourses2.jpg'),
  },
  {
    name: 'My Courses',
    screen: 'MyCourses',
    img: require('../assets/myCourses.png'),
  },
  {
    name: 'Certificates',
    screen: 'Certificates',
    img: require('../assets/certificates.png'),
  },
  {
    name: 'Non SCA Courses',
    screen: 'NonScaCourses',
    img: require('../assets/nonScaCourses.png'),
  },
];

const SCREEN_WIDTH = Dimensions.get('window').width;

const HomeScreen = ({ route, navigation }) => {
  const { userData, user } = useUser();
  const [activeSlide, setActiveSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { theme } = useContext(ThemeContext);

  // Get the display name from user data, fallback to user email or 'User'
  const getDisplayName = () => {
    if (userData?.name) {
      return userData.name;
    }
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      return user.email.split('@')[0]; // Use part before @ as fallback
    }
    return 'User';
  };

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        setActiveSlide((prev) => {
          const next = (prev + 1) % sliderImages.length;
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }).start();
          return next;
        });
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [fadeAnim]);

  const handleCardPress = (item) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else {
      alert(`${item.name} pressed (no linked screen)`);
    }
  };

  const handleCategoryPress = (categoryId) => {
    navigation.navigate('AllCourses', { category: categoryId });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome {getDisplayName()}</Text>
      <View style={{ marginBottom: 20, alignItems: 'center' }}>
        <Animated.Image source={sliderImages[activeSlide]} style={[styles.sliderImg, { opacity: fadeAnim }]} />
      </View>

      <Text style={{ color: 'purple', fontSize: 27, textAlign: 'center' }}> ★ Category ★ </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryTab,
              {
                backgroundColor: theme.background,
                borderColor: theme.text,
                borderWidth: 1,
              },
            ]}
            onPress={() => handleCategoryPress(cat.id)}
          >
            <Text style={[styles.categoryText, { color: theme.text }]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={cards}
        numColumns={2}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.cardsContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: theme.background,
                borderColor: theme.text,
                borderWidth: 1,
              },
            ]}
            onPress={() => handleCardPress(item)}
          >
            <Image source={item.img} style={styles.cardImg} />
            <Text style={[styles.cardText, { color: theme.text }]}>{item.name}</Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 12 },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    paddingLeft: 16,
    paddingBottom: 4,
  },
  sliderImg: {
    width: SCREEN_WIDTH * 0.9,
    height: 180,
    borderRadius: 18,
    alignSelf: 'center',
    marginVertical: 4,
    resizeMode: 'cover',
  },
  categoryRow: {
    margin: 5,
    marginHorizontal: 12,
    flexGrow: 0,
    padding: 4,
  },
  categoryTab: {
    borderRadius: 10,
    height: 34,
    minWidth: 100,
    marginBottom: 10,
    marginRight: 10,
    elevation: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  categoryText: {
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  cardsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  card: {
    width: (SCREEN_WIDTH - 48) / 2,
    height: 180,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    marginBottom: 16,
    marginRight: 12,
    marginTop: 20,
    borderWidth: 1,
  },
  cardImg: { width: '160%', height: 120, marginBottom: 10, resizeMode: 'contain' },
  cardText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
});

export default HomeScreen;
