
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { Camera, useCameraDevice, useCameraFormat, useCodeScanner } from 'react-native-vision-camera';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { getItem } from '../utils/StorageService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCANNER_BOX_SIZE = SCREEN_WIDTH * 0.7;
const SCANNER_BORDER_LENGTH = 40;

const AssignScanner = ({ navigation, route }) => {
  const {
    onScanComplete,
    scanType = 'both',
    title = 'Scan Code',
    showFlashToggle = true,
    showCameraToggle = true,
    torch = 'off',
  } = route?.params || {};

  const camera = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(true);
  const [cameraType, setCameraType] = useState('back');
  const [flash, setFlash] = useState(torch);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedData, setScannedData] = useState(null);
  const [scannedType, setScannedType] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [message, setMessage] = useState(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualAwb, setManualAwb] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const device = useCameraDevice(cameraType);

  // Animation values
  const lineAnim = useRef(new Animated.Value(0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  // Get optimal camera format
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1920, height: 1080 } },
    { fps: 30 },
  ]);

  // Configure code scanner
  const codeScanner = useCodeScanner({
    codeTypes: scanType === 'both'
      ? ['qr', 'ean-13', 'ean-8', 'upc-e', 'upc-a', 'code-128', 'code-39', 'code-93', 'codabar', 'itf', 'data-matrix']
      : scanType === 'qr'
        ? ['qr']
        : ['ean-13', 'ean-8', 'upc-e', 'upc-a', 'code-128', 'code-39', 'code-93', 'codabar', 'itf', 'data-matrix'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && isScanning && cameraOpen) {
        const code = codes[0];
        if (code.value) {
          handleCodeScanned(code.value, code.type);
        }
      }
    },
  });

  // Start animations
  useEffect(() => {
    if (permissionGranted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(lineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(lineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(borderAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(borderAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    return () => {
      lineAnim.stopAnimation();
      borderAnim.stopAnimation();
    };
  }, [permissionGranted]);

  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const permission = await Camera.requestCameraPermission();

        if (permission === 'granted' || permission === 'authorized') {
          setPermissionGranted(true);
        } else {
          Alert.alert(
            'Permission Required',
            'Camera permission is required to scan codes.',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
              {
                text: 'Open Settings',
                onPress: () => {
                  Linking.openSettings();
                  navigation.goBack();
                }
              }
            ]
          );
        }
      } catch (error) {
        console.error('Camera permission error:', error);
        Alert.alert('Error', 'Failed to access camera. Please check permissions.');
      }
    };

    checkCameraPermission();
  }, []);

  const handleCodeScanned = useCallback(async (data, type) => {
    const token = getItem("token");
    if (!isScanning || (!cameraOpen && type !== 'manual')) return;

    setIsScanning(false);


    // Close camera immediately after scan
    setCameraOpen(false);
    setIsProcessing(true);
    const baseUrl = 'https://go-admin.daakit.com';
    try {
      const res = await axios.post(
        `${baseUrl}/api/rider/assignOrderToSelf`,
        { awb_number: String(data) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setScannedData({
        ...res?.data,
        awb_number: data,
        isSuccess: res?.data?.success
      });
      setScannedType(type);
    } catch (error) {
      setScannedData({
        isSuccess: false,
        message: error?.response?.data?.message || error?.message || 'Something went wrong',
        awb_number: data
      });
    } finally {
      setIsProcessing(false);
    }


  }, [isScanning, cameraOpen, onScanComplete]);

  const toggleFlash = () => {
    setFlash(flash === 'off' ? 'on' : 'off');
  };

  const toggleCameraType = () => {
    setCameraType(cameraType === 'back' ? 'front' : 'back');
  };

  const resumeScanning = () => {
    setIsScanning(true);
    setScannedData(null);
    setScannedType(null);
    setShowManualEntry(false);
    setManualAwb('');
    setCameraOpen(true);
    setZoom(1);
  };
  if (!device) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0446DB" />
        <Text style={styles.loadingText}>Loading scanner...</Text>
      </View>
    );
  }

  if (!permissionGranted) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0446DB" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  const scannerBoxTop = (SCREEN_HEIGHT - SCANNER_BOX_SIZE) / 2;
  const scannerBoxLeft = (SCREEN_WIDTH - SCANNER_BOX_SIZE) / 2;
  const maxZoom = device?.maxZoom || 5;
  const zoomPercentage = ((zoom - 1) / (maxZoom - 1)) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="light-content" backgroundColor="#000" /> */}

      {/* Camera View */}
      {cameraOpen && (
        <View style={styles.cameraContainer}>
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={cameraOpen}
            codeScanner={codeScanner}
            format={format}
            enableZoomGesture={true}
            torch={flash}
            zoom={zoom}
            photo={false}
            video={false}
          />

          {/* Scanner Overlay - Touchable opacity wrapper to allow touches to pass through */}
          <View style={styles.overlay} pointerEvents="box-none">
            {/* Top Header - Touchable */}
            <View style={styles.header} pointerEvents="box-none">
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              <View style={styles.headerCenter}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>
                  {scanType === 'both' ? 'Position QR/barcode in frame' :
                    scanType === 'qr' ? 'Position QR code in frame' :
                      'Position barcode in frame'}
                </Text>
              </View>

              <View style={styles.headerRight} />
            </View>

            {/* Scanner Frame - Non-touchable */}
            <View
              style={[styles.scannerBox, {
                top: scannerBoxTop,
                left: scannerBoxLeft,
                width: SCANNER_BOX_SIZE,
                height: SCANNER_BOX_SIZE,
              }]}
              pointerEvents="none"
            >
              {/* Animated Scanning Line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{
                      translateY: lineAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, SCANNER_BOX_SIZE - 2],
                      }),
                    }],
                  },
                ]}
              />

              {/* Animated Border Corners */}
              <Animated.View style={[
                styles.cornerTL,
                {
                  borderColor: borderAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: ['#0446DB', '#fff', '#0446DB'],
                  }),
                },
              ]} />

              <Animated.View style={[
                styles.cornerTR,
                {
                  borderColor: borderAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: ['#0446DB', '#fff', '#0446DB'],
                  }),
                },
              ]} />

              <Animated.View style={[
                styles.cornerBL,
                {
                  borderColor: borderAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: ['#0446DB', '#fff', '#0446DB'],
                  }),
                },
              ]} />

              <Animated.View style={[
                styles.cornerBR,
                {
                  borderColor: borderAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: ['#0446DB', '#fff', '#0446DB'],
                  }),
                },
              ]} />

              {/* Center Guide */}
              {/* <View style={styles.centerGuide} /> */}
            </View>

            {/* Bottom Controls - Touchable */}
            <View style={styles.bottomControls} pointerEvents="box-none">
              <View style={styles.controlsRow}>
                {showFlashToggle && (
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={toggleFlash}
                  >
                    <View style={styles.controlIcon}>
                      <MaterialIcons
                        name={flash === 'on' ? 'flash-on' : 'flash-off'}
                        size={24}
                        color="white"
                      />
                    </View>
                    <Text style={styles.controlLabel}>
                      {flash === 'on' ? 'Flash On' : 'Flash Off'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => {
                    setCameraOpen(false);
                    setShowManualEntry(true);
                  }}
                >
                  <View style={styles.controlIcon}>
                    <MaterialIcons name="keyboard" size={24} color="white" />
                  </View>
                  <Text style={styles.controlLabel}>Manual</Text>
                </TouchableOpacity>

                {showCameraToggle && (
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={toggleCameraType}
                  >
                    <View style={styles.controlIcon}>
                      <MaterialIcons
                        name="flip-camera-ios"
                        size={24}
                        color="white"
                      />
                    </View>
                    <Text style={styles.controlLabel}>
                      {cameraType === 'back' ? 'Rear' : 'Front'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.instruction}>
                Hold steady and ensure good lighting
              </Text>
            </View>

            {/* Dimmed Areas - Non-touchable */}
            <View
              style={[styles.dimmedArea, {
                top: 0,
                left: 0,
                right: 0,
                height: scannerBoxTop,
              }]}
              pointerEvents="none"
            />
            <View
              style={[styles.dimmedArea, {
                bottom: 0,
                left: 0,
                right: 0,
                height: SCREEN_HEIGHT - scannerBoxTop - SCANNER_BOX_SIZE,
              }]}
              pointerEvents="none"
            />
            <View
              style={[styles.dimmedArea, {
                top: scannerBoxTop,
                left: 0,
                width: scannerBoxLeft,
                height: SCANNER_BOX_SIZE,
              }]}
              pointerEvents="none"
            />
            <View
              style={[styles.dimmedArea, {
                top: scannerBoxTop,
                right: 0,
                width: scannerBoxLeft,
                height: SCANNER_BOX_SIZE,
              }]}
              pointerEvents="none"
            />
          </View>
        </View>
      )}

      {/* Processing State */}
      {isProcessing && (
        <View style={styles.resultModal}>
          <View style={styles.resultContent}>
             <ActivityIndicator size="large" color="#0446DB" />
             <Text style={[styles.resultTitle, {marginTop: 16, fontSize: 18}]}>Processing AWB...</Text>
          </View>
        </View>
      )}

      {/* Manual Entry Modal */}
      {showManualEntry && !isProcessing && !scannedData && (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.resultModal}
        >
          <View style={styles.resultContent}>
            <View style={styles.resultHeader}>
              <MaterialIcons name="keyboard" size={50} color="#0446DB" />
              <Text style={styles.resultTitle}>Enter AWB</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Type AWB number here"
              value={manualAwb}
              onChangeText={setManualAwb}
              placeholderTextColor="#999"
              autoCapitalize="characters"
              autoFocus
            />

            <View style={styles.resultActions}>
              <TouchableOpacity
                style={[styles.resultButton, {backgroundColor: '#ef4444'}]}
                onPress={() => {
                  setShowManualEntry(false);
                  setCameraOpen(true);
                }}
              >
                <Text style={styles.resultButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resultButton, styles.rescanButton]}
                onPress={() => {
                  if(manualAwb.trim() !== '') {
                    handleCodeScanned(manualAwb.trim(), 'manual');
                  }
                }}
              >
                <Text style={styles.resultButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Scan Result Modal */}
      {scannedData && !cameraOpen && !isProcessing && (
        <View style={styles.resultModal}>
          <View style={styles.resultContent}>
            <View style={styles.resultHeader}>
              <MaterialIcons
                name={scannedData?.isSuccess !== false ? "check-circle" : "error"}
                size={50}
                color={scannedData?.isSuccess !== false ? "#10b981" : "#ef4444"}
              />
              <Text style={[styles.resultTitle, scannedData?.isSuccess === false && { color: '#ef4444', textAlign: 'center' }]}>
                {scannedData?.message || (scannedData?.isSuccess === false ? 'Error' : 'Success')}
              </Text>
            </View>



            <View style={styles.resultActions}>


              <TouchableOpacity
                style={[styles.resultButton, styles.rescanButton, scannedData?.isSuccess === false && { backgroundColor: '#ef4444' }]}
                onPress={resumeScanning}
              >
                <MaterialIcons name="replay" size={20} color="white" />
                <Text style={styles.resultButtonText}>Scan Again</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AssignScanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Added background for better visibility
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)', // Added text shadow for better visibility
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerRight: {
    width: 40,
  },
  scannerBox: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#0446DB',
    shadowColor: '#0446DB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCANNER_BORDER_LENGTH,
    height: SCANNER_BORDER_LENGTH,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: SCANNER_BORDER_LENGTH,
    height: SCANNER_BORDER_LENGTH,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: SCANNER_BORDER_LENGTH,
    height: SCANNER_BORDER_LENGTH,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: SCANNER_BORDER_LENGTH,
    height: SCANNER_BORDER_LENGTH,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  centerGuide: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
    backgroundColor: 'rgba(86, 78, 193, 0.3)',
    borderRadius: 10,
  },
  bottomControls: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 40,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  controlLabel: {
    color: 'white',
    fontSize: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  instruction: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dimmedArea: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  resultModal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  resultContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  resultType: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultData: {
    width: '100%',
    marginBottom: 24,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#555',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    width: '100%',
  },
  resultButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  copyButton: {
    backgroundColor: '#0446DB',
  },
  shareButton: {
    backgroundColor: '#3b82f6',
  },
  rescanButton: {
    backgroundColor: '#10b981',
  },
  resultButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  doneButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
    backgroundColor: '#fafafa',
  },
});