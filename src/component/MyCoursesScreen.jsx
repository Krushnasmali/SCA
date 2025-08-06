import React, { useState, useRef, useContext, useEffect } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { ThemeContext } from './ThemeContext';
import { useUser } from '../context/UserContext';
import CourseService from '../services/CourseService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 36) / 2;

const MyCoursesScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const { theme } = useContext(ThemeContext);
  const { user } = useUser();

  // Load user's courses from Firebase
  useEffect(() => {
    if (user) {
      loadUserCourses();
      
      // Set up real-time listener for user courses
      const unsubscribe = CourseService.onUserCoursesChanged(user.uid, (coursesData) => {
        setCourses(coursesData);
        setLoading(false);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } else {
      setLoading(false);
      setCourses([]);
    }
  }, [user]);

  const loadUserCourses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await CourseService.getUserCourses(user.uid);
      
      if (result.success) {
        setCourses(result.courses);
      } else {
        setError(result.error);
        Alert.alert('Error', 'Failed to load your courses. Please try again.');
      }
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', 'Failed to load your courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filtering courses by search
  const filteredCourses = courses.filter((course) => {
    // Ensure course object exists and has required properties
    if (!course || typeof course !== 'object') {
      return false;
    }

    if (search) {
      const searchLower = search.toLowerCase();
      const courseTitle = course.title || '';
      const courseIntroduction = course.introduction || '';
      return (
        courseTitle.toLowerCase().includes(searchLower) ||
        courseIntroduction.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleSearchBarPress = () => {
    if (inputRef.current) inputRef.current.focus();
  };

  const getImageSource = (course) => {
    // Ensure course object exists and has title property
    if (!course || typeof course !== 'object') {
      return require('../assets/mscitLogo.png');
    }

    // If course has a valid image URL, use it; otherwise use a default
    if (course.image && course.image.startsWith('http')) {
      return { uri: course.image };
    }

    // Fallback to local assets based on course title or category
    const title = (course.title || '').toLowerCase();
    if (title.includes('mscit')) return require('../assets/mscitLogo.png');
    if (title.includes('excel')) return require('../assets/AdvancedExcel.jpg');
    if (title.includes('app') || title.includes('react')) return require('../assets/reactNative.png');
    if (title.includes('web')) return require('../assets/webdevelopment.png');
    if (title.includes('python')) return require('../assets/python.jpg');
    if (title.includes('java')) return require('../assets/java.png');
    if (title.includes('c++')) return require('../assets/cpp.png');
    if (title.includes('c ')) return require('../assets/c.png');
    if (title.includes('tally')) return require('../assets/Tally.png');
    if (title.includes('autocad')) return require('../assets/autocad.png');

    // Default image
    return require('../assets/mscitLogo.png');
  };

  const formatAssignmentDate = (assignmentData) => {
    if (assignmentData && assignmentData.assignedAt) {
      return new Date(assignmentData.assignedAt).toLocaleDateString();
    }
    return 'N/A';
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="book-open" size={64} color={theme.textMuted || '#999'} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No Courses Assigned</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textMuted || '#666' }]}>
        You haven't been assigned to any courses yet.
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textMuted || '#666' }]}>
        Contact your administrator to get enrolled.
      </Text>
      <TouchableOpacity 
        style={[styles.browseBtn, { backgroundColor: theme.text }]}
        onPress={() => navigation.navigate('AllCourses')}
      >
        <Text style={[styles.browseBtnText, { color: theme.background }]}>
          Browse All Courses
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.topbar, { backgroundColor: theme.background }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.heading, { color: theme.text }]}>My Courses</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Please Log In</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textMuted || '#666' }]}>
            You need to be logged in to view your courses.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.topbar, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: theme.text }]}>My Courses</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* SEARCH BAR */}
      {courses.length > 0 && (
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
              placeholder="Search your courses"
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
      )}

      {/* LOADING INDICATOR */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.text} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading your courses...</Text>
        </View>
      )}

      {/* ERROR MESSAGE */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: 'red' }]}>Error: {error}</Text>
          <TouchableOpacity 
            style={[styles.retryBtn, { backgroundColor: theme.text }]}
            onPress={loadUserCourses}
          >
            <Text style={[styles.retryText, { color: theme.background }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* COURSES GRID */}
      {!loading && !error && (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatlist}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={renderEmptyState}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.background, borderColor: theme.text, borderWidth: 1 },
              ]}
            >
              <Image source={getImageSource(item)} style={styles.img} />
              <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.detail, { color: theme.text }]}>Duration: {item.duration}</Text>
              <Text style={[styles.detail, { color: theme.text }]}>Fees: {item.fees}</Text>
              {item.assignmentData && (
                <Text style={[styles.assignedDate, { color: theme.textMuted || '#666' }]}>
                  Assigned: {formatAssignmentDate(item.assignmentData)}
                </Text>
              )}
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.text }]}
                onPress={() => navigation.navigate('CourseDetails', { course: item })}
              >
                <Text style={{ color: theme.background, fontWeight: 'bold' }}>View Details</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  detail: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 2,
  },
  assignedDate: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  btn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  browseBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyCoursesScreen;
