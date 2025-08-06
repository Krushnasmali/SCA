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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={[styles.welcomeText, { color: theme.text }]}>
          Welcome back,
        </Text>
        <Text style={[styles.nameText, { color: theme.primary }]}>
          {getDisplayName()}
        </Text>
      </View>

      {/* Hero Image Slider */}
      <View style={{ marginBottom: 20, alignItems: 'center' }}>
        <Animated.Image
          source={sliderImages[activeSlide]}
          style={[styles.sliderImg, { opacity: fadeAnim }]}
        />
      </View>

      {/* Categories Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Categories
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Explore our courses
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryRow}
          contentContainerStyle={styles.categoryRowContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryTab,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                  shadowColor: theme.cardShadow,
                },
              ]}
              onPress={() => handleCategoryPress(cat.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryText, { color: theme.text }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Access Cards */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Access
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Jump to your favorite sections
          </Text>
        </View>

        <View style={styles.cardsGrid}>
          {cards.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                  shadowColor: theme.cardShadow,
                },
              ]}
              onPress={() => handleCardPress(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardImageContainer}>
                <Image source={item.img} style={styles.cardImg} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardText, { color: theme.text }]}>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 100, // Account for tab bar
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 2,
  },
  nameText: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sliderImg: {
    width: SCREEN_WIDTH * 0.9,
    height: 180,
    borderRadius: 18,
    alignSelf: 'center',
    marginVertical: 4,
    resizeMode: 'cover',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '400',
  },
  categoryRow: {
    paddingLeft: 20,
  },
  categoryRowContent: {
    paddingRight: 20,
    gap: 12,
  },
  categoryTab: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  categoryText: {
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  card: {
    width: (SCREEN_WIDTH - 48) / 2,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 4,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImageContainer: {
    height: 120,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardImg: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
  },
  cardText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomeScreen;
