import React, { useState, useRef, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { ThemeContext } from './ThemeContext';

const courses = [
  {
    id: '1',
    title: 'MSCIT',
    duration: '4 Months',
    fees: '₹5,000',
    image: require('../assets/mscitLogo.png'),
    syllabus: 'Introduction to Mobile app using React-Native',
    introduction: 'Introduction to Mobile app using React-Native',
    categories: ['digital_literacy'],
  },
  {
    id: '2',
    title: 'Advanced Excel',
    duration: '2 Months',
    fees: '₹4,000',
    image: require('../assets/AdvancedExcel.jpg'),
    syllabus: 'Introduction to Mobile app using React-Native',
    introduction: 'Introduction to Mobile app using React-Native',
    categories: ['business'],
  },
  {
    id: '3',
    title: 'App Development',
    duration: '4 Months',
    fees: '₹30,000',
    image: require('../assets/reactNative.png'),
    syllabus: 'Introduction to Mobile app using React-Native',
    introduction: 'Introduction to Mobile app using React-Native',
    categories: ['coding'],
  },
  {
    id: '4',
    title: 'Web Development',
    duration: '4 Months',
    fees: '₹15,000',
    image: require('../assets/webdevelopment.png'),
    syllabus: 'HTML, CSS, JavaScript, React, Node.js, ...',
    introduction: 'Become a full-stack web developer.',
    categories: ['coding'],
  },
  {
    id: '5',
    title: 'Python for Beginners',
    duration: '2 Months',
    fees: '₹4,000',
    image: require('../assets/python.jpg'),
    syllabus: 'Introduction to Python, Variables, Loops, Functions, ...',
    introduction: 'Learn programming from scratch using Python language.',
    categories: ['coding'],
  },
  {
    id: '6',
    title: 'C Language',
    duration: '2 Months',
    fees: '₹3,000',
    image: require('../assets/c.png'),
    syllabus: 'Introduction to the Basic of coding from C',
    introduction: 'Learn programming from scratch using C language.',
    categories: ['coding'],
  },
  {
    id: '7',
    title: 'C++ Language ',
    duration: '2 Months',
    fees: '₹3,500',
    image: require('../assets/cpp.png'),
    syllabus: 'HTML, CSS, JavaScript, React, Node.js, ...',
    introduction: 'Learn programming from OPPs concepts using C++ language.',
    categories: ['coding'],
  },
  {
    id: '8',
    title: 'core-JAVA ',
    duration: '2 Months',
    fees: '₹4,000',
    image: require('../assets/java.png'),
    syllabus: 'Introduction to Core-Java, Variables, Loops, Functions,',
    introduction: 'Learn programming from scratch using Java language.',
    categories: ['coding'],
  },
  {
    id: '9',
    title: 'Advanced-JAVA ',
    duration: '2 Months',
    fees: '₹3,000',
    image: require('../assets/advjava.png'),
    syllabus: 'Introduction to Advanced-Java, Variables, Loops, Functions, ..',
    introduction: 'Learn programming for DataBase System using Advanced-Java language.',
    categories: ['coding'],
  },
  {
    id: '10',
    title: 'Advanced-Python ',
    duration: '2 Months',
    fees: '₹3,000',
    image: require('../assets/advpython.png'),
    syllabus: 'Introduction to Advanced-Python, Variables, Loops, Functions, .',
    introduction: 'Learn programming for DataBase System using Advanced-Python language.',
    categories: ['coding'],
  },
  {
    id: '11',
    title: 'Tally With GST',
    duration: '3 Months',
    fees: '₹3,000',
    image: require('../assets/Tally.png'),
    syllabus: 'Introduction to Advanced-Python, Variables, Loops, Functions, .',
    introduction: 'Learn programming for DataBase System using Advanced-Python language.',
    categories: ['business'],
  },
  {
    id: '12',
    title: 'Autocad',
    duration: '3 Months',
    fees: '₹3,000',
    image: require('../assets/autocad.png'),
    syllabus: 'Introduction to Advanced-Python, Variables, Loops, Functions, .',
    introduction: 'Learn programming for DataBase System using Advanced-Python language.',
    categories: ['designing'],
  },
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 36) / 2;

const AllCoursesScreen = ({ navigation, route }) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);
  const { theme } = useContext(ThemeContext);

  const category = route?.params?.category;

  const categoryLabels = {
    coding: 'Coding',
    business: 'Business',
    designing: 'Designing',
    digital_literacy: 'Digital Literacy',
  };

  const headingTitle = category ? `All ${categoryLabels[category]} Courses` : 'Our All Courses';

  // Filtering courses by category and search
  const filteredCourses = courses.filter((course) => {
    if (category) {
      if (!course.categories || !course.categories.includes(category)) {
        return false;
      }
    }
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        course.title.toLowerCase().includes(searchLower) ||
        (course.introduction && course.introduction.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const handleSearchBarPress = () => {
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.topbar, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: theme.text }]}>{headingTitle}</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* SEARCH BAR */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleSearchBarPress}
        style={[
          styles.searchBarWrapper,
          { backgroundColor: theme.background, borderColor: theme.text, borderWidth: 1 },
        ]}
      >
        <View style={styles.searchBarInner}>
          <FontAwesome name="search" size={20} color="#666" style={{ marginHorizontal: 10 }} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search courses"
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="while-editing"
            underlineColorAndroid="transparent"
          />
        </View>
      </TouchableOpacity>

      {/* COURSES GRID */}
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatlist}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={[styles.noResults, { color: theme.text }]}>No courses found.</Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.background, borderColor: theme.text, borderWidth: 1 },
            ]}
          >
            <Image source={item.image} style={styles.img} />
            <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.detail, { color: theme.text }]}>Duration: {item.duration}</Text>
            <Text style={[styles.detail, { color: theme.text }]}>Fees: {item.fees}</Text>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.text }]}
              onPress={() => navigation.navigate('CourseDetails', { course: item })}
            >
              <Text style={{ color: theme.background, fontWeight: 'bold' }}>View Details</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  backBtn: { padding: 4, width: 32 },
  heading: {
    fontWeight: 'bold',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
  },
  searchBarWrapper: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 14,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  searchBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
  },
  flatlist: { paddingHorizontal: 6, paddingVertical: 10 },
  card: {
    borderRadius: 16,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10,
    width: CARD_WIDTH,
    elevation: 6,
    marginBottom: 16,
    marginRight: 12,
    marginTop: 20,
  },
  img: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
    textAlign: 'center',
  },
  detail: { fontSize: 13 },
  btn: {
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
});

export default AllCoursesScreen;
