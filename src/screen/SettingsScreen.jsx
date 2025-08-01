import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SettingsScreen = ({ navigation }) => {
    const [isEnabled1, setIsEnabled1] = React.useState(true);
    const toggleSwitch1 = () => setIsEnabled1(previousState => !previousState);
    
    const [isEnabled2, setIsEnabled2] = React.useState(false);
    const toggleSwitch2 = () => setIsEnabled2(previousState => !previousState);
    return (
        <View style={styles.container}>
            

            {/* Settings Options */}
            <TouchableOpacity style={styles.option}>
                <Icon name="person-outline" size={22} color="#438596" style={styles.icon} />
                <Text style={styles.optionText}>Account</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Edit Account')}>
                    <Icon name="create-outline" size={24} color="#333" />
                </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option}>
                <Icon name="notifications-outline" size={22} color="#438596" style={styles.icon} />
                <Text style={styles.optionText}>Notifications </Text>
                <Switch value={isEnabled1} onValueChange={toggleSwitch1} />
            </TouchableOpacity>

            <View style={styles.option}>
                <Icon name="moon-outline" size={22} color="#438596" style={styles.icon} />
                <Text style={styles.optionText}>Dark Mode</Text>
                <Switch value={isEnabled2} onValueChange={toggleSwitch2} />
            </View>

            <TouchableOpacity style={styles.option}>
                <Icon name="document-text-outline" size={22} color="#438596" style={styles.icon} />
                <Text style={styles.optionText}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option}>
                <Icon name="help-circle-outline" size={22} color="#438596" style={styles.icon} />
                <Text style={styles.optionText}>Help & Support</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('LogoutScreen')}>
                <Icon name="log-out-outline" size={22} color="red" style={styles.icon} />
                <Text style={[styles.optionText, { color: 'red' }]}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Delete Account')}>
                <Icon name="trash-outline" size={22} color="red" style={styles.icon}  />
                <Text style={[styles.optionText, { color: 'red' }]}>Delete Account</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SettingsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop:25,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    optionText: {
        fontSize: 16,
        marginLeft: 12,
        flex: 1,
        color: '#333',
    },
    icon: {
        width: 28,
    },
});
