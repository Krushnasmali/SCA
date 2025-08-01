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

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 36) / 2;

// Example Non SCA courses (empty array means no courses added yet)
const nonScaCourses = [
  // Example:
  // {
  //   id: 'ns1',
  //   title: 'Photography Basics',
  //   duration: '1 Month',
  //   fees: '₹3,000',
  //   image: require('../assets/photography.png'),
  //   introduction: 'Learn basic photography skills.',
  // },
];

const NonScaCoursesScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);
  const { theme } = useContext(ThemeContext);

  const filteredCourses = search
    ? nonScaCourses.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          (item.introduction && item.introduction.toLowerCase().includes(search.toLowerCase()))
      )
    : nonScaCourses;

  const handleSearchBarPress = () => {
    inputRef.current && inputRef.current.focus();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.topbar, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: theme.text }]}>Non SCA Courses</Text>
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
            placeholder="Search non SCA courses"
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

      {filteredCourses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text }]}>No courses available.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatlist}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                onPress={() => alert(`View details for: ${item.title}`)}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
});

export default NonScaCoursesScreen;
