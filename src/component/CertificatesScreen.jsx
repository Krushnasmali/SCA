import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  Image,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
} from 'react-native';
import { ThemeContext } from './ThemeContext';
import { useUser } from '../context/UserContext';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import database from '@react-native-firebase/database';
import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';

const CertificatesScreen = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useUser();
  
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingById, setDownloadingById] = useState({});
  const [openingById, setOpeningById] = useState({});

  useEffect(() => {
    if (user) {
      loadCertificates();
    }
  }, [user]);

  const loadCertificates = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get user's certificates
      const userCertificatesRef = database().ref(`users/${user.uid}/certificates`);
      const userCertificatesSnapshot = await userCertificatesRef.once('value');
      const userCertificates = userCertificatesSnapshot.val() || {};
      
      // Get full certificate details
      const certificatePromises = Object.keys(userCertificates).map(async (certId) => {
        const certRef = database().ref(`certificates/${certId}`);
        const certSnapshot = await certRef.once('value');
        const certData = certSnapshot.val();
        
        if (certData) {
          // Get course details
          const courseRef = database().ref(`courses/${certData.courseId}`);
          const courseSnapshot = await courseRef.once('value');
          const courseData = courseSnapshot.val();
          
          return {
            id: certId,
            ...certData,
            courseName: courseData?.title || 'Unknown Course',
            courseDescription: courseData?.description || '',
          };
        }
        return null;
      });
      
      const certificateResults = await Promise.all(certificatePromises);
      const validCertificates = certificateResults.filter(cert => cert !== null);
      
      // Sort by issue date (newest first)
      validCertificates.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
      
      setCertificates(validCertificates);
    } catch (error) {
      console.error('Error loading certificates:', error);
      Alert.alert('Error', 'Failed to load certificates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCertificates();
    setRefreshing(false);
  };

  const ensureAndroidDownloadPermission = async () => {
    if (Platform.OS !== 'android') return true;
    
    // For Android 13+ (API 33+), we don't need WRITE_EXTERNAL_STORAGE
    if (Platform.Version >= 33) return true;
    
    try {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (hasPermission) return true;
      
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'SCA needs access to storage to download and save your certificates.',
          buttonPositive: 'Allow',
        }
      );
      return status === PermissionsAndroid.RESULTS.GRANTED;
    } catch (e) {
      console.warn('Permission request error:', e);
      return false;
    }
  };

  const sanitizeFilename = (name) => {
    return (name || 'certificate')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 80);
  };

  const handleViewCertificate = async (certificate) => {
    try {
      setOpeningById((prev) => ({ ...prev, [certificate.id]: true }));
      // Download to a temporary cache file, then open with an external viewer
      const tempPath = `${RNFetchBlob.fs.dirs.CacheDir}/` +
        `${sanitizeFilename(certificate.title || 'certificate')}_${Date.now()}.pdf`;

      const res = await RNFetchBlob.config({
        fileCache: true,
        path: tempPath,
        appendExt: 'pdf',
      }).fetch('GET', certificate.fileUrl);

      const localPath = res.path();

      if (Platform.OS === 'android') {
        RNFetchBlob.android.actionViewIntent(localPath, 'application/pdf');
      } else {
        // iOS: open in external viewer if possible; fallback to in-app preview
        const canOpen = await Linking.canOpenURL(certificate.fileUrl);
        if (canOpen) {
          await Linking.openURL(certificate.fileUrl);
        } else {
          RNFetchBlob.ios.previewDocument(localPath);
        }
      }
    } catch (error) {
      console.error('Error viewing certificate:', error);
      Alert.alert('Error', 'Failed to view certificate.');
    } finally {
      setOpeningById((prev) => ({ ...prev, [certificate.id]: false }));
    }
  };

  const handleDownloadCertificate = async (certificate) => {
    try {
      if (Platform.OS === 'android') {
        const hasPermission = await ensureAndroidDownloadPermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission required',
            'Storage permission is needed to save certificates to Downloads.'
          );
          return;
        }

        setDownloadingById((prev) => ({ ...prev, [certificate.id]: true }));
        
        // Generate filename
        const filenameFromUrl = certificate.fileUrl?.split('?')[0]?.split('/')?.pop() || '';
        const baseName = sanitizeFilename(
          (certificate.title && `${certificate.title}.pdf`) || filenameFromUrl || 'certificate.pdf'
        );
        const filename = baseName.endsWith('.pdf') ? baseName : `${baseName}.pdf`;

        // Use RNFS for more reliable downloads
        const downloadDestPath = `${RNFS.DownloadDirectoryPath}/${filename}`;

        // Download the file
        const downloadResult = await RNFS.downloadFile({
          fromUrl: certificate.fileUrl,
          toFile: downloadDestPath,
          background: true,
          discretionary: true,
          cacheable: true,
          progressDivider: 1,
          begin: (res) => {
            console.log('Download begin, status:', res.statusCode);
            console.log('Content-Length:', res.contentLength);
          },
          progress: (res) => {
            const percentage = (res.bytesWritten / res.contentLength) * 100;
            console.log('Download progress:', percentage.toFixed(1) + '%');
          },
        }).promise;

        if (downloadResult.statusCode === 200) {
          // Show success message with toast
          if (Platform.OS === 'android') {
            ToastAndroid.show('Certificate downloaded to Downloads folder', ToastAndroid.LONG);
          }
          
          Alert.alert(
            'Download Complete',
            `Certificate saved to Downloads/${filename}`,
            [
              {
                text: 'Open',
                onPress: () => {
                  RNFetchBlob.android.actionViewIntent(downloadDestPath, 'application/pdf');
                },
              },
              { text: 'OK' },
            ]
          );
        } else {
          throw new Error(`Download failed with status code: ${downloadResult.statusCode}`);
        }
      } else {
        // iOS: download to Documents and present preview
        setDownloadingById((prev) => ({ ...prev, [certificate.id]: true }));
        
        const filenameFromUrl = certificate.fileUrl?.split('?')[0]?.split('/')?.pop() || '';
        const baseName = sanitizeFilename(filenameFromUrl || certificate.title || 'certificate');
        const filename = baseName.endsWith('.pdf') ? baseName : `${baseName}.pdf`;
        const downloadDestPath = `${RNFS.DocumentDirectoryPath}/${filename}`;

        const downloadResult = await RNFS.downloadFile({
          fromUrl: certificate.fileUrl,
          toFile: downloadDestPath,
        }).promise;

        if (downloadResult.statusCode === 200) {
          // Use RNFetchBlob for iOS preview
          RNFetchBlob.ios.previewDocument(downloadDestPath);
        } else {
          throw new Error(`Download failed with status code: ${downloadResult.statusCode}`);
        }
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      Alert.alert('Error', 'Failed to download certificate: ' + error.message);
    } finally {
      setDownloadingById((prev) => ({ ...prev, [certificate.id]: false }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderCertificateCard = (certificate) => (
    <View
      key={certificate.id}
      style={[
        styles.certificateCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.cardBorder,
          shadowColor: theme.cardShadow,
        }
      ]}
    >
      {/* Certificate Header */}
      <View style={styles.certificateHeader}>
        <View style={[styles.certificateIcon, { backgroundColor: theme.primary }]}>
          <FontAwesome6 name="certificate" size={24} color="#fff" />
        </View>
        <View style={styles.certificateInfo}>
          <Text style={[styles.certificateTitle, { color: theme.text }]}>
            {certificate.title}
          </Text>
          <Text style={[styles.courseName, { color: theme.primary }]}>
            {certificate.courseName}
          </Text>
        </View>
      </View>

      {/* Certificate Description */}
      {certificate.description && (
        <Text style={[styles.certificateDescription, { color: theme.textSecondary }]}>
          {certificate.description}
        </Text>
      )}

      {/* Certificate Details */}
      <View style={styles.certificateDetails}>
        <View style={styles.detailRow}>
          <FontAwesome6 name="calendar" size={16} color={theme.textMuted} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            Issued on {formatDate(certificate.issueDate)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.viewButton, { backgroundColor: theme.primary, opacity: (openingById[certificate.id] || downloadingById[certificate.id]) ? 0.8 : 1 }]}
          onPress={() => handleViewCertificate(certificate)}
          disabled={!!openingById[certificate.id] || !!downloadingById[certificate.id]}
        >
          {openingById[certificate.id] ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <FontAwesome6 name="eye" size={16} color="#fff" />
          )}
          <Text style={styles.buttonText}>{openingById[certificate.id] ? 'Opening…' : 'View Certificate'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.downloadButton, { borderColor: theme.primary, opacity: (downloadingById[certificate.id] || openingById[certificate.id]) ? 0.6 : 1 }]}
          onPress={() => handleDownloadCertificate(certificate)}
          disabled={!!downloadingById[certificate.id] || !!openingById[certificate.id]}
        >
          {downloadingById[certificate.id] ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <FontAwesome6 name="download" size={16} color={theme.primary} />
          )}
          <Text style={[styles.downloadButtonText, { color: theme.primary }]}>
            {downloadingById[certificate.id] ? 'Downloading…' : 'Download'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Image
        source={require('../assets/certificates.png')}
        style={styles.emptyStateImage}
        resizeMode="contain"
      />
      <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
        No Certificates Yet
      </Text>
      <Text style={[styles.emptyStateDescription, { color: theme.textSecondary }]}>
        Complete your courses to earn certificates. Your achievements will appear here.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading certificates...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            My Certificates
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Your earned certificates and achievements
          </Text>
        </View>

        {/* Certificates List */}
        {certificates.length > 0 ? (
          <View style={styles.certificatesList}>
            {certificates.map(renderCertificateCard)}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  certificatesList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  certificateCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  certificateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  certificateIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  certificateInfo: {
    flex: 1,
  },
  certificateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 24,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '500',
  },
  certificateDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  certificateDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyStateImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default CertificatesScreen;