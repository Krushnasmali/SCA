import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';

const Student = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Dummy static data (replacing Firebase)
  const dummyData = [
    { id: '1', name: 'Krushna Mali', contact: '9876543210', email: 'krushna@example.com' },
    { id: '2', name: 'Ravi Patil', contact: '9822334455', email: 'ravi@example.com' },
    { id: '3', name: 'Sneha Joshi', contact: '9765432109', email: 'sneha@example.com' },
  ];

  useEffect(() => {
    // Simulate network loading
    setTimeout(() => {
      setStudents(dummyData);
      setLoading(false);
    }, 1000);
  }, []);

  const deleteStudent = (id) => {
    const filtered = students.filter((s) => s.id !== id);
    setStudents(filtered);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Delete Button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteStudent(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>

      {/* Edit Button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          setSelectedStudent(item);
          setIsModalVisible(true);
        }}
      >
        <Text style={styles.editButtonText}>View</Text>
      </TouchableOpacity>

      <Text style={styles.label}>
        👤 Name: <Text style={styles.value}>{item.name}</Text>
      </Text>
      <Text style={styles.label}>
        📞 Contact: <Text style={styles.value}>{item.contact}</Text>
      </Text>
      <Text style={styles.label}>
        📧 Email: <Text style={styles.value}>{item.email}</Text>
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>User Data List</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedStudent && (
              <>
                <Text style={styles.modalHeading}>Student Information</Text>
                <Text style={styles.label}>
                  👤 Name: <Text style={styles.value}>{selectedStudent.name}</Text>
                </Text>
                <Text style={styles.label}>
                  📞 Contact: <Text style={styles.value}>{selectedStudent.contact}</Text>
                </Text>
                <Text style={styles.label}>
                  📧 Email: <Text style={styles.value}>{selectedStudent.email}</Text>
                </Text>
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F2F2F2',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    position: 'relative',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 5,
  },
  value: {
    fontWeight: 'normal',
    color: '#000',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'red',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  editButton: {
    position: 'absolute',
    top: 10,
    right: 70,
    backgroundColor: 'blue',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default Student;
