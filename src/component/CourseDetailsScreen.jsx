import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from './ThemeContext';

const CourseDetailsScreen = ({ navigation, route }) => {
  const { course } = route.params;
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.topbar, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: theme.text }]} numberOfLines={1}>
          {course.title}
        </Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={course.image} style={styles.img} />
        <Text style={[styles.title, { color: theme.text }]}>{course.title}</Text>
        <Text style={[styles.sec, { color: theme.text }]}>
          Duration: <Text style={[styles.value, { color: theme.text }]}>{course.duration}</Text>
        </Text>
        <Text style={[styles.sec, { color: theme.text }]}>
          Fees: <Text style={[styles.value, { color: theme.text }]}>{course.fees}</Text>
        </Text>
        <Text style={[styles.sectionHeading, { color: theme.text }]}>Introduction</Text>
        <Text style={[styles.para, { color: theme.text }]}>{course.introduction}</Text>
        <Text style={[styles.sectionHeading, { color: theme.text }]}>Syllabus</Text>
        <Text style={[styles.para, { color: theme.text }]}>{course.syllabus}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  backBtn: { padding: 4, width: 32 },
  heading: { fontWeight: 'bold', fontSize: 18, flex: 1, textAlign: 'center' },
  content: { paddingHorizontal: 22, paddingVertical: 12, alignItems: 'center' },
  img: { width: '100%', height: 180, borderRadius: 16, marginBottom: 8, resizeMode: 'cover' },
  title: { fontWeight: 'bold', fontSize: 20, marginTop: 10 },
  sec: { fontSize: 15, marginVertical: 2 },
  value: { fontWeight: 'bold' },
  sectionHeading: { fontWeight: 'bold', marginTop: 18, fontSize: 16 },
  para: { fontSize: 15, marginTop: 2 },
});

export default CourseDetailsScreen;
