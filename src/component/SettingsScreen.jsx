import React, { useContext } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from './ThemeContext';
import { useUser } from '../context/UserContext';

export default function SettingsScreen({ navigation }) {
  const { theme, toggleTheme, isDark } = useContext(ThemeContext);
  const { logout } = useUser();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              // Navigation will be handled by the auth state change
            } else {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const settingsOptions = [
    {
      id: 'theme',
      title: 'Theme',
      subtitle: isDark ? 'Dark mode enabled' : 'Light mode enabled',
      icon: isDark ? 'moon' : 'sunny-outline',
      iconColor: theme.primary,
      hasSwitch: true,
      switchValue: isDark,
      switchAction: toggleTheme,
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'Read our privacy terms',
      icon: 'shield-checkmark-outline',
      iconColor: theme.primary,
      action: () => {},
      showArrow: true,
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline',
      iconColor: theme.primary,
      action: () => {},
      showArrow: true,
    },
    {
      id: 'logout',
      title: 'Logout',
      subtitle: 'Sign out of your account',
      icon: 'log-out-outline',
      iconColor: theme.error,
      action: handleLogout,
      showArrow: true,
      isDestructive: true,
    },
  ];

  const renderSettingItem = (item) => {
    const ItemComponent = item.hasSwitch ? View : TouchableOpacity;

    return (
      <ItemComponent
        key={item.id}
        style={[
          styles.settingCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.cardBorder,
            shadowColor: theme.cardShadow,
          },
        ]}
        onPress={item.action}
        activeOpacity={item.hasSwitch ? 1 : 0.7}
      >
        <View style={styles.settingContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}15` }]}>
            <Icon name={item.icon} size={24} color={item.iconColor} />
          </View>

          <View style={styles.textContainer}>
            <Text style={[
              styles.settingTitle,
              { color: item.isDestructive ? theme.error : theme.text }
            ]}>
              {item.title}
            </Text>
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
              {item.subtitle}
            </Text>
          </View>

          <View style={styles.actionContainer}>
            {item.hasSwitch ? (
              <Switch
                value={item.switchValue}
                onValueChange={item.switchAction || (() => {})}
                thumbColor={item.switchValue ? theme.switchThumb : theme.textMuted}
                trackColor={{
                  false: theme.switchTrack,
                  true: theme.switchTrackActive,
                }}
                ios_backgroundColor={theme.switchTrack}
              />
            ) : item.showArrow ? (
              <Icon
                name="chevron-forward"
                size={20}
                color={theme.textMuted}
              />
            ) : null}
          </View>
        </View>
      </ItemComponent>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Settings
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Manage your app preferences
          </Text>
        </View>

        <View style={styles.settingsContainer}>
          {settingsOptions.map(renderSettingItem)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Account for tab bar
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  settingsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  settingCard: {
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
    lineHeight: 22,
  },
  settingSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
  },
});
