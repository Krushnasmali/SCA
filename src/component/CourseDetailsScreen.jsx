import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ThemeContext } from './ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CourseDetailsScreen = ({ navigation, route }) => {
  const { course } = route.params;
  const { theme } = useContext(ThemeContext);

  // Function to get the correct image source (same as AllCoursesScreen)
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          Course Details
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={getImageSource(course)}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={[styles.imageOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
          <View style={styles.imageContent}>
            <Text style={styles.courseTitle}>{course.title}</Text>
          </View>
        </View>

        {/* Course Info Cards */}
        <View style={styles.contentContainer}>
          {/* Quick Info Section */}
          <View style={[styles.infoCard, {
            backgroundColor: theme.cardBackground || '#f8f9fa',
            borderColor: theme.cardBorder || theme.border || '#e9ecef',
            shadowColor: theme.cardShadow || 'rgba(0, 0, 0, 0.1)'
          }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Course Information</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <View style={[styles.iconContainer, { backgroundColor: `${theme.primary || '#8000ff'}15` }]}>
                  <MaterialIcons name="schedule" size={20} color={theme.primary || '#8000ff'} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary || '#666' }]}>Duration</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{course.duration || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.iconContainer, { backgroundColor: `${theme.primary || '#8000ff'}15` }]}>
                  <MaterialIcons name="attach-money" size={20} color={theme.primary || '#8000ff'} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary || '#666' }]}>Fees</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{course.fees || 'N/A'}</Text>
                </View>
              </View>
            </View>

            {course.categories && course.categories.length > 0 && (
              <View style={styles.categoriesContainer}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary || '#666' }]}>Categories</Text>
                <View style={styles.categoriesRow}>
                  {course.categories.map((category, index) => (
                    <View key={index} style={[styles.categoryTag, { backgroundColor: theme.primary || '#8000ff' }]}>
                      <Text style={styles.categoryText}>{category}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Introduction Section */}
          {course.introduction && (
            <View style={[styles.sectionCard, {
              backgroundColor: theme.cardBackground || '#f8f9fa',
              borderColor: theme.cardBorder || theme.border || '#e9ecef',
              shadowColor: theme.cardShadow || 'rgba(0, 0, 0, 0.1)'
            }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${theme.primary || '#8000ff'}15` }]}>
                  <MaterialIcons name="info" size={20} color={theme.primary || '#8000ff'} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Introduction</Text>
              </View>
              <Text style={[styles.sectionContent, { color: theme.text }]}>{course.introduction}</Text>
            </View>
          )}

          {/* Syllabus Section */}
          {course.syllabus && (
            <View style={[styles.sectionCard, {
              backgroundColor: theme.cardBackground || '#f8f9fa',
              borderColor: theme.cardBorder || theme.border || '#e9ecef',
              shadowColor: theme.cardShadow || 'rgba(0, 0, 0, 0.1)'
            }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${theme.primary || '#8000ff'}15` }]}>
                  <MaterialIcons name="list" size={20} color={theme.primary || '#8000ff'} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Syllabus</Text>
              </View>
              <Text style={[styles.sectionContent, { color: theme.text }]}>{course.syllabus}</Text>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.actionButton, {
              backgroundColor: theme.primary || '#8000ff',
              shadowColor: theme.primary || '#8000ff'
            }]}
            onPress={() => {
              // Add enrollment or contact action here
              alert('Contact admin for enrollment details');
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="school" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Contact for Enrollment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(128, 0, 255, 0.1)',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    marginTop: 8,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sectionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'justify',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CourseDetailsScreen;
