import React, { useContext } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { ThemeContext } from './ThemeContext';  // Since SettingsScreen.jsx is inside component folder

export default function SettingsScreen() {
  const { theme, toggleTheme, isDark } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.titleText, { color: theme.text }]}>
        Select app Theme
      </Text>

      <View style={styles.switchContainer}>
        <Text style={[styles.labelText, { color: theme.text, marginRight: 10 }]}>
          {isDark ? 'Dark Theme' : 'Light Theme'}
        </Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          thumbColor={isDark ? theme.switchThumb : '#f4f3f4'}
          trackColor={{ false: theme.switchTrack, true: theme.switchTrack }}
          ios_backgroundColor="#3e3e3e"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20 
  },
  titleText: {
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 40,
  },
  labelText: { 
    fontSize: 20 
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
