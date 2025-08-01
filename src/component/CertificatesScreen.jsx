import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { ThemeContext } from './ThemeContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CertificatesScreen = () => {
  const { theme } = useContext(ThemeContext);

  // Example: Admin issued certificates list (empty means no certificates)
  const certificates = [
    // Example:
    // { id: 'c1', title: 'React Native Basics', issuedDate: '2023-06-15' },
    // Add certificates here or leave empty array to test "no certificates"
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {certificates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            You have no certificates available.
          </Text>
        </View>
      ) : (
        <FlatList
          data={certificates}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderColor: theme.text }]}>
              <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.detail, { color: theme.text }]}>Issued on: {item.issuedDate}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, paddingHorizontal: 12 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  listContainer: {
    paddingBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    backgroundColor: '#f9f9f9',
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detail: {
    marginTop: 6,
    fontSize: 14,
  },
});

export default CertificatesScreen;
