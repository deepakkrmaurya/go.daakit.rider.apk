import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { Camera } from "react-native-camera-kit";
import {
  ArrowLeft,
  CheckCircle2,
  RefreshCcw,
  ScanLine,
  X,
  Zap,
  AlertTriangle
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import axios from 'axios';
import { getItem } from '../utils/StorageService';
import Toast from 'react-native-toast-message';

const baseURL = 'https://go-admin.daakit.com';

export default function ScannerScreen({ navigation, route }) {
  const lockRef = useRef(false);
  const [awb, setAwb] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cameraKey, setCameraKey] = useState(1);
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualAwb, setManualAwb] = useState("");
  const [scanType, setScanType] = useState(route?.params?.scanType || 'Pickup');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshCamera = () => {
    lockRef.current = false;
    setScannerEnabled(true);
    setShowSuccess(false);
    setShowError(false);
    setAwb("");
    setCameraKey(prev => prev + 1);
    setIsProcessing(false);
    setIsModalOpen(false);
  };

  const handlePickupScan = async (awbNumber) => {
    try {
      const token = getItem("token");
      const res = await axios.post(
        `${baseURL}/api/rider/pickupOrderByVendorRider`,
        { awb_number: String(awbNumber) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res?.data?.success) {
        return {
          success: true,
          message: res?.data?.message || 'Order picked up successfully',
          data: res?.data
        };
      } else {
        return {
          success: false,
          message: res?.data?.message || 'Failed to pickup order'
        };
      }
    } catch (error) {
      console.log('Pickup Error:', error);
      return {
        success: false,
        message: error?.response?.data?.message || error?.message || 'Failed to pickup order'
      };
    }
  };

  const handleAssignScan = async (awbNumber) => {
    try {
      const token = getItem("token");
      const res = await axios.post(
        `${baseURL}/api/rider/assignOrderToSelf`,
        { awb_number: String(awbNumber) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res?.data?.success) {
        return {
          success: true,
          message: res?.data?.message || 'Order assigned successfully',
          data: res?.data
        };
      } else {
        return {
          success: false,
          message: res?.data?.message || 'Failed to assign order'
        };
      }
    } catch (error) {
      console.log('Assign Error:', error);
      return {
        success: false,
        message: error?.response?.data?.message || error?.message || 'Failed to assign order'
      };
    }
  };

  const processScan = async (awbNumber) => {
    // Prevent processing if already processing or modal is open
    if (isProcessing || isModalOpen) {
      console.log('Scan blocked: Already processing or modal open');
      return;
    }

    setIsProcessing(true);
    setAwb(awbNumber);

    let result;
    console.log(scanType)
    
    if (scanType === 'pickup') {
      result = await handlePickupScan(awbNumber);
    } else if (scanType === 'assign') {
      result = await handleAssignScan(awbNumber);
    } else {
      result = {
        success: false,
        message: 'Invalid scan type'
      };
    }

    setIsProcessing(false);

    if (result.success) {
      setSuccessMessage(result.message);
      setShowSuccess(true);
      setIsModalOpen(true);
      // Show toast notification
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: result.message,
        position: 'top',
      });
    } else {
      setErrorMessage(result.message);
      setShowError(true);
      setIsModalOpen(true);
      // Show toast notification
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: result.message,
        position: 'top',
      });
    }

    // Reset lock after processing
    lockRef.current = true;
  };

  const onReadCode = async (event) => {
    // Check if already processing or modal is open
    if (lockRef.current || isProcessing || isModalOpen) {
      console.log('Scan blocked: lockRef:', lockRef.current, 'isProcessing:', isProcessing, 'isModalOpen:', isModalOpen);
      return;
    }

    const value = event?.nativeEvent?.codeStringValue;
    if (!value) return;

    lockRef.current = true;
    const cleanAwb = value.trim().toUpperCase();
    
    await processScan(cleanAwb);
  };

  const saveManualAwb = () => {
    if (!manualAwb.trim()) return;
    
    // Check if already processing or modal is open
    if (isProcessing || isModalOpen) {
      console.log('Manual scan blocked: Already processing or modal open');
      return;
    }
    
    const cleanAwb = manualAwb.trim().toUpperCase();
    setManualAwb("");
    setShowManualModal(false);
    
    // Process the manual AWB
    processScan(cleanAwb);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    lockRef.current = false;
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage("");
    setSuccessMessage("");
    setAwb("");
    refreshCamera();
  };

  useFocusEffect(
    useCallback(() => {
      // Reset states when screen comes into focus
      refreshCamera();
      return () => {
        lockRef.current = false;
        setIsProcessing(false);
        setIsModalOpen(false);
      };
    }, [])
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      <Camera
        key={cameraKey}
        style={styles.camera}
        scanBarcode
        onReadCode={onReadCode}
        showFrame={false}
        laserColor="transparent"
        frameColor="transparent"
        
      />

      <View style={styles.overlay} />

      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation?.goBack?.()}
          style={styles.iconBtn}
        >
          <ArrowLeft size={22} color="#FFFFFF" />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Barcode Scanner</Text>
          {/* <Text style={styles.subtitle}>
            Scan Type: {scanType || 'Pickup'} Scan
          </Text> */}
        </View>

        <Pressable onPress={refreshCamera} style={styles.iconBtn}>
          <RefreshCcw size={21} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>

      <View style={styles.scanArea}>
        <View style={styles.cornerTL} />
        <View style={styles.cornerTR} />
        <View style={styles.cornerBL} />
        <View style={styles.cornerBR} />

        <View style={styles.scanLine} />

        <View style={styles.scanIconBox}>
          <ScanLine size={22} color="#FFC107" />
          <Text style={styles.scanText}>Align barcode inside frame</Text>
        </View>
      </View>

      <View style={styles.bottomPanel}>
        <View style={styles.tipRow}>
          <Zap size={18} color="#FFC107" />
          <Text style={styles.tipText}>
            Hold steady and keep barcode inside the yellow frame
          </Text>
        </View>
        <Pressable
          onPress={() => {
            if (!isModalOpen && !isProcessing) {
              setShowManualModal(true);
            }
          }}
          style={{
            position: "absolute",
            bottom: 120,
            alignSelf: "center",
            backgroundColor: (isModalOpen || isProcessing) ? "#93A3B8" : "#0446DB",
            paddingHorizontal: 24,
            paddingVertical: 14,
            borderRadius: 16,
            opacity: (isModalOpen || isProcessing) ? 0.5 : 1,
          }}
          disabled={isModalOpen || isProcessing}
        >
          <Text
            style={{
              color: "#FFF",
              fontWeight: "900",
              fontSize: 14,
            }}
          >
            Manual Enter AWB
          </Text>
        </Pressable>
      </View>

      {/* Success Modal */}
      <Modal 
        transparent 
        visible={showSuccess} 
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <Pressable
              onPress={handleModalClose}
              style={styles.closeBtn}
            >
              <X size={20} color="#6B7280" />
            </Pressable>

            <View style={styles.successIcon}>
              <CheckCircle2 size={52} color="#16A34A" />
            </View>

            <Text style={styles.successTitle}>Scan Successful</Text>
            <Text style={styles.successSub}>
              {successMessage || `${scanType} completed successfully`}
            </Text>

            <View style={styles.awbBox}>
              <Text style={styles.awbLabel}>AWB / Code</Text>
              <Text style={styles.awbText}>{awb}</Text>
            </View>

            <Pressable
              onPress={handleModalClose}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryText}>Continue Scanning</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal 
        transparent 
        visible={showError} 
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.duplicateCard}>
            <Pressable
              onPress={handleModalClose}
              style={styles.closeBtn}
            >
              <X size={20} color="#6B7280" />
            </Pressable>

            <View style={styles.duplicateIcon}>
              <AlertTriangle size={52} color="#DC2626" />
            </View>

            <Text style={styles.duplicateTitle}>Scan Failed</Text>

            <Text
              style={[
                styles.duplicateSub,
                {
                  marginTop: 15,
                  textAlign: "center",
                },
              ]}
            >
              {errorMessage || 'Failed to process the scan'}
            </Text>

            <View style={styles.awbBox}>
              <Text style={styles.awbLabel}>AWB</Text>
              <Text style={styles.awbText}>{awb}</Text>
            </View>

            <Pressable
              onPress={handleModalClose}
              style={styles.dangerBtn}
            >
              <Text style={styles.primaryText}>Continue Scanning</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Manual AWB Modal */}
      <Modal
        transparent
        visible={showManualModal}
        animationType="slide"
        onRequestClose={() => {
          if (!isProcessing) {
            setShowManualModal(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={{
              width: "100%",
              backgroundColor: "#FFF",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "900",
                color: "#111827",
                marginBottom: 20,
              }}
            >
              Enter AWB Number
            </Text>

            <TextInput
              value={manualAwb}
              onChangeText={setManualAwb}
              placeholder="Enter AWB"
              autoCapitalize="characters"
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 14,
                paddingHorizontal: 16,
                height: 56,
                fontSize: 16,
              }}
              editable={!isProcessing}
            />

            <View
              style={{
                flexDirection: "row",
                marginTop: 20,
                gap: 10,
              }}
            >
              <Pressable
                onPress={() => {
                  if (!isProcessing) {
                    setShowManualModal(false);
                    setManualAwb("");
                  }
                }}
                style={{
                  flex: 1,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: isProcessing ? "#E5E7EB" : "#E5E7EB",
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: isProcessing ? 0.5 : 1,
                }}
                disabled={isProcessing}
              >
                <Text>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={saveManualAwb}
                disabled={isProcessing || isModalOpen}
                style={{
                  flex: 1,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: (isProcessing || isModalOpen) ? "#93A3B8" : "#0446DB",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFF", fontWeight: "900" }}>
                  {isProcessing ? 'Processing...' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Loading Indicator */}
      {isProcessing && !isModalOpen && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = {
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },

  camera: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(2,6,23,0.35)",
  },

  topBar: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  subtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    marginTop: 3,
  },

  liveBadge: {
    position: "absolute",
    top: 118,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(22,163,74,0.18)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: "#22C55E",
  },

  liveText: {
    color: "#BBF7D0",
    fontSize: 11,
    fontWeight: "900",
  },

  scanArea: {
    position: "absolute",
    left: 32,
    right: 32,
    top: "32%",
    height: 230,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  cornerTL: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 50,
    height: 50,
    borderLeftWidth: 5,
    borderTopWidth: 5,
    borderColor: "#FFC107",
    borderTopLeftRadius: 24,
  },

  cornerTR: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 50,
    height: 50,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderColor: "#FFC107",
    borderTopRightRadius: 24,
  },

  cornerBL: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 50,
    height: 50,
    borderLeftWidth: 5,
    borderBottomWidth: 5,
    borderColor: "#FFC107",
    borderBottomLeftRadius: 24,
  },

  cornerBR: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 50,
    height: 50,
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderColor: "#FFC107",
    borderBottomRightRadius: 24,
  },

  scanLine: {
    width: "82%",
    height: 3,
    backgroundColor: "#FFC107",
    shadowColor: "#FFC107",
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },

  scanIconBox: {
    position: "absolute",
    bottom: -52,
    alignItems: "center",
  },

  scanText: {
    color: "#FFFFFF",
    fontSize: 13,
    marginTop: 8,
    fontWeight: "700",
  },

  bottomPanel: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: "rgba(15,23,42,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    padding: 18,
  },

  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  tipText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  successCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
  },

  duplicateCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
  },

  closeBtn: {
    position: "absolute",
    right: 16,
    top: 16,
    width: 34,
    height: 34,
    borderRadius: 99,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  successIcon: {
    width: 86,
    height: 86,
    borderRadius: 999,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },

  duplicateIcon: {
    width: 86,
    height: 86,
    borderRadius: 999,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },

  successTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 18,
  },

  duplicateTitle: {
    color: "#DC2626",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 18,
  },

  successSub: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 5,
    textAlign: "center",
  },

  duplicateSub: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 5,
    textAlign: "center",
  },

  awbBox: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
    marginTop: 16,
  },

  awbLabel: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  awbText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 6,
  },

  primaryBtn: {
    width: "100%",
    height: 56,
    backgroundColor: "#0446DB",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  dangerBtn: {
    width: "100%",
    height: 56,
    backgroundColor: "#DC2626",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  loadingCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
};