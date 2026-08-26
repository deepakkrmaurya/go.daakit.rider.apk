
// import React, { useEffect, useRef, useState } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     Linking,
//     TouchableOpacity,
//     Platform,
//     Image,
//     TextInput,
//     Alert,
//     ActivityIndicator,
//     SafeAreaView,
//     StatusBar,
//     KeyboardAvoidingView,

// } from 'react-native';
// import { Camera, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
// import Entypo from 'react-native-vector-icons/Entypo';
// import Modal from 'react-native-modal';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import { StackActions, useNavigation } from '@react-navigation/native';
// import { getItem } from '../utils/StorageService'
// import axios from 'axios';
// import { navigate, resetAndNavigate, replace, goBack } from '@utils/NavigationUtils';
// import Toast from 'react-native-toast-message';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// const baseURL = "https://go-admin.daakit.com"
// const DeliveryProof = ({ route }) => {
//     const { order, address } = route?.params
//     const navigation = useNavigation()
//     const [isModalVisible, setModalVisible] = useState(false);
//     const camera = useRef(null);
//     const [capturedPhoto, setCapturedPhoto] = useState(null);
//     const [cameraOpen, setCameraOpen] = useState(true);
//     const [cameraType, setCameraType] = useState('back');
//     const [flash, setFlash] = useState('off');
//     const [permissionGranted, setPermissionGranted] = useState(false);
//     const [note, setNote] = useState('');
//     const [isUploading, setIsUploading] = useState(false);

//     const [isRetaking, setIsRetaking] = useState(false);
//     const [loading, setLoading] = useState(false)
//     const device = useCameraDevice(cameraType);

//     // Get optimal camera format
//     const format = useCameraFormat(device, [
//         { photoResolution: { width: 1920, height: 1080 } },
//         { fps: 30 },
//         { videoResolution: { width: 1920, height: 1080 } }
//     ]);
//     const getPermission = async () => {
//         const permission = await Camera.requestCameraPermission();
//         if (permission === 'granted') {
//             setPermissionGranted(true);
//         } else {
//             Alert.alert(
//                 'Permission Required',
//                 'Camera permission is required to take delivery proof photos.',
//                 [
//                     { text: 'Cancel', style: 'cancel' },
//                     {
//                         text: 'Open Settings',
//                         onPress: () => Linking.openSettings()
//                     }
//                 ]
//             );
//         }
//     };

//     useEffect(() => {
//         const checkCameraPermission = async () => {
//             try {
//                 const permission = await getPermission();


//             } catch (error) {
//                 console.error('Camera permission error:', error);
//                 Alert.alert('Error', 'Failed to access camera. Please check permissions.');
//             }
//         };

//         checkCameraPermission();
//     }, []);

//     useEffect(() => {
//         // Reset camera when modal closes
//         if (!isModalVisible && capturedPhoto) {
//             setCameraOpen(true);
//         }
//     }, [isModalVisible, capturedPhoto]);

//     if (!device) {
//         return (
//             <View style={styles.centerContainer}>
//                 <ActivityIndicator size="large" color="#564ec1" />
//                 <Text style={styles.loadingText}>Loading camera...</Text>
//             </View>
//         );
//     }



//     const toggleModal = () => {
//         setModalVisible(!isModalVisible);
//     };

//     const takePhoto = async () => {
//         if (!camera.current) return;

//         try {
//             const photo = await camera.current.takePhoto({
//                 flash: flash,
//                 qualityPrioritization: 'quality',
//                 enableAutoStabilization: true,
//             });

//             const photoPath = Platform.OS === 'ios'
//                 ? photo.path.replace('file://', '')
//                 : photo.path;

//             setCapturedPhoto(photoPath);
//             setCameraOpen(false);
//             setModalVisible(true);
//         } catch (error) {
//             console.error('Failed to capture photo:', error);
//             Alert.alert('Error', 'Failed to take photo. Please try again.');
//         }
//     };

//     const toggleFlash = () => {
//         setFlash(flash === 'off' ? 'on' : 'off');
//     };

//     const toggleCameraType = () => {
//         setCameraType(cameraType === 'back' ? 'front' : 'back');
//     };
//     const handleRetake = () => {
//         setIsRetaking(true);
//         setModalVisible(false);
//         setCapturedPhoto(null);
//         setNote('');

//         // Small delay to ensure modal is closed before resetting camera
//         setTimeout(() => {
//             setCameraOpen(true);
//             setIsRetaking(false);
//         }, 300);
//     };

//     const handleUpload = async () => {


//        setIsUploading(true)

//         if (!capturedPhoto) return;
//         const { order, address } = route?.params
//         const token = getItem("token");

//         try {
//             const formData = new FormData();
//             formData.append('location_image', {
//                 uri: `file://${capturedPhoto}`,
//                 type: 'image/jpeg',
//                 name: `delivery-proof-${Date.now()}.jpg`,
//             });
//             formData.append('status', `delivered`);
//             formData.append('latitude', address.latitude);
//             formData.append('longitude', address.longitude);
//             formData.append('location', address.address);
//             formData.append('remarks', `Delivered to customer without OTP`);
//             formData.append('collected_by', note);
//             if (!note) {
//                 Toast.show({
//                     type: 'error',
//                     text1: 'Error',
//                     text2: 'Please enter the name of the person who collected the delivery.',
//                     position: 'top',
//                 });

//                 return;
//             }
//             const res = await axios.post(
//                 `${baseURL}/api/rider/updateOrderStatus/${order.id}`,
//                 formData,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         "Content-Type": "multipart/form-data",
//                     },
//                 }
//             );

//             if (res.data.success) {
//                 Toast.show({
//                     type: 'success',
//                     text1: 'Delivery proof uploaded successfully!',
//                     position: 'top',
//                 });
//                 navigation.dispatch(StackActions.pop(2));

//             } else {
//                 // throw new Error(result.message || 'Upload failed');
//             }
//         } catch (error) {
//             console.error('Upload failed:', error.response.data.message);
//             Toast.show({
//                 type: 'error',
//                 text1: error.response.data.message || 'Failed to upload delivery proof.',
//                 position: 'top',
//             });

//         } finally {

//             setIsUploading(false);
//         }
//     };

//     return (
//         <SafeAreaProvider style={styles.container}>
//             <StatusBar backgroundColor={'#0446DB'}/>
//             <StatusBar barStyle="light-content" backgroundColor="#000" />

//             {/* Camera View */}
//             {cameraOpen && !isModalVisible && (
//                 <View style={styles.cameraContainer}>
//                     <Camera
//                         ref={camera}
//                         style={StyleSheet.absoluteFill}
//                         device={device}
//                         isActive={cameraOpen && !isRetaking}
//                         photo={true}
//                         format={format}
//                         enableZoomGesture={true}
//                     />

//                     {/* Camera Overlay */}
//                     <View style={styles.cameraOverlay}>
//                         {/* Top Controls */}
//                         <View style={styles.topControls}>
//                             <TouchableOpacity
//                                 style={styles.controlButton}
//                                 onPress={toggleFlash}
//                             >
//                                 <MaterialIcons
//                                     name={flash === 'on' ? 'flash-on' : 'flash-off'}
//                                     size={28}
//                                     color="white"
//                                 />
//                             </TouchableOpacity>

//                             <TouchableOpacity
//                                 style={styles.controlButton}
//                                 onPress={toggleCameraType}
//                             >
//                                 <MaterialIcons
//                                     name="flip-camera-ios"
//                                     size={28}
//                                     color="white"
//                                 />
//                             </TouchableOpacity>
//                         </View>



//                         {/* Bottom Controls */}
//                         <View style={styles.bottomControls}>
//                             <View style={styles.captureButtonContainer}>
//                                 <TouchableOpacity
//                                     activeOpacity={0.7}
//                                     onPress={takePhoto}
//                                     style={styles.captureButton}
//                                     disabled={isRetaking}
//                                 >
//                                     <View style={styles.captureButtonInner}>
//                                         <Entypo name="camera" size={32} color="white" />
//                                     </View>
//                                 </TouchableOpacity>
//                             </View>
//                         </View>
//                     </View>
//                 </View>
//             )}

//             {/* Preview Modal */}
//             <Modal
//                 isVisible={isModalVisible}
//                 onBackdropPress={() => !isUploading && setModalVisible(false)}
//                 onBackButtonPress={() => !isUploading && setModalVisible(false)}
//                 swipeDirection="down"
//                 onSwipeComplete={() => !isUploading && toggleModal()}
//                 animationIn="slideInUp"
//                 animationOut="slideOutDown"
//                 animationInTiming={400}
//                 animationOutTiming={400}
//                 backdropTransitionInTiming={400}
//                 backdropTransitionOutTiming={400}
//                 style={styles.modal}
//                 backdropOpacity={0.8}
//                 avoidKeyboard={true}
//                 propagateSwipe={!isUploading}
//             >
//                 <KeyboardAvoidingView
//                     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//                     keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
//                     className="flex-1 justify-end"
//                 >
//                     <View style={styles.modalContent}>
//                         {/* Drag Handle */}
//                         <View style={styles.dragHandleContainer}>
//                             <View style={styles.dragHandle} />
//                         </View>



//                         {/* Header */}
//                         <View style={styles.modalHeader}>
//                             <Text style={styles.modalTitle}>Delivery Proof</Text>
//                             <Text style={styles.modalSubtitle}>Review and upload your photo</Text>
//                         </View>

//                         {/* Image Preview */}
//                         <View style={styles.imagePreviewContainer}>
//                             {capturedPhoto ? (
//                                 <Image
//                                     source={{ uri: `file://${capturedPhoto}` }}
//                                     style={styles.previewImage}
//                                     resizeMode="cover"
//                                 />
//                             ) : (
//                                 <View style={styles.noImageContainer}>
//                                     <FontAwesome name="photo" size={60} color="#ccc" />
//                                     <Text style={styles.noImageText}>No photo available</Text>
//                                 </View>
//                             )}
//                         </View>

//                         {/* Note Input */}
//                         <View style={styles.noteContainer}>
//                             <Text style={styles.noteLabel}>Collected By</Text>
//                             <TextInput
//                                 style={styles.noteInput}
//                                 placeholder="Add collected by name..."
//                                 placeholderTextColor="#999"
//                                 value={note}
//                                 onChangeText={setNote}
//                                 multiline
//                                 maxLength={200}
//                                 editable={!isUploading}
//                             />

//                         </View>

//                         {/* Action Buttons */}
//                         <View style={styles.actionButtons}>
//                             <TouchableOpacity
//                                 style={[styles.actionButton, styles.retakeButton]}
//                                 onPress={handleRetake}
//                                 disabled={isUploading}
//                             >
//                                 {isRetaking ? (
//                                     <ActivityIndicator size="small" color="#fff" />
//                                 ) : (
//                                     <>
//                                         <MaterialIcons name="replay" size={22} color="white" />
//                                         <Text style={styles.actionButtonText}>Retake</Text>
//                                     </>
//                                 )}
//                             </TouchableOpacity>

//                             <TouchableOpacity
//                                 style={[styles.actionButton, styles.uploadButton]}
//                                 onPress={handleUpload}
//                                 disabled={isUploading || !capturedPhoto}
//                             >
//                                 {isUploading ? (
//                                     <ActivityIndicator size="small" color="#fff" />
//                                 ) : (
//                                     <>
//                                         <MaterialIcons name="cloud-upload" size={22} color="white" />
//                                         <Text style={styles.actionButtonText}>
//                                             {capturedPhoto ? 'Upload' : 'No Photo'}
//                                         </Text>
//                                     </>
//                                 )}
//                             </TouchableOpacity>
//                         </View>

//                     </View>
//                 </KeyboardAvoidingView>
//             </Modal>
//         </SafeAreaProvider>




//     );
// };

// export default DeliveryProof;





// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#000',
//     },
//     centerContainer: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#fff',
//         padding: 20,
//     },
//     loadingText: {
//         marginTop: 16,
//         fontSize: 16,
//         color: '#666',
//     },
//     permissionText: {
//         fontSize: 18,
//         fontWeight: '600',
//         color: '#333',
//         marginTop: 20,
//         marginBottom: 30,
//         textAlign: 'center',
//     },
//     permissionButton: {
//         backgroundColor: '#564ec1',
//         paddingHorizontal: 30,
//         paddingVertical: 12,
//         borderRadius: 25,
//         elevation: 3,
//     },
//     permissionButtonText: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: '600',
//     },
//     cameraContainer: {
//         flex: 1,
//     },
//     cameraOverlay: {
//         ...StyleSheet.absoluteFillObject,
//         justifyContent: 'space-between',
//     },
//     topControls: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         paddingHorizontal: 20,
//         paddingTop: Platform.OS === 'ios' ? 50 : 20,
//         paddingBottom: 20,
//         backgroundColor: 'rgba(0,0,0,0.3)',
//     },
//     controlButton: {
//         width: 50,
//         height: 50,
//         borderRadius: 25,
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     captureGuide: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         flex: 1,
//     },
//     guideTextContainer: {
//         backgroundColor: 'rgba(0,0,0,0.7)',
//         paddingHorizontal: 20,
//         paddingVertical: 12,
//         borderRadius: 20,
//     },
//     guideText: {
//         color: 'white',
//         fontSize: 14,
//         textAlign: 'center',
//         marginVertical: 2,
//     },
//     bottomControls: {
//         paddingBottom: 40,
//         alignItems: 'center',
//     },
//     captureButtonContainer: {
//         alignItems: 'center',
//     },
//     captureButton: {
//         width: 80,
//         height: 80,
//         borderRadius: 40,
//         backgroundColor: '#564ec1',
//         alignItems: 'center',
//         justifyContent: 'center',
//         borderWidth: 4,
//         borderColor: 'rgba(255,255,255,0.3)',
//         elevation: 10,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//     },
//     captureButtonInner: {
//         width: 68,
//         height: 68,
//         borderRadius: 34,
//         backgroundColor: '#564ec1',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     modal: {
//         margin: 0,
//         justifyContent: 'flex-end',
//     },
//     modalContent: {
//         backgroundColor: 'white',
//         borderTopLeftRadius: 24,
//         borderTopRightRadius: 24,
//         height: 'auto'
//     },
//     dragHandleContainer: {
//         alignItems: 'center',
//         paddingVertical: 12,
//     },
//     dragHandle: {
//         width: 40,
//         height: 4,
//         borderRadius: 2,
//         backgroundColor: '#ddd',
//     },
//     modalHeader: {
//         paddingHorizontal: 24,
//         paddingTop: 8,
//         paddingBottom: 16,
//         borderBottomWidth: 1,
//         borderBottomColor: '#f0f0f0',
//     },
//     modalTitle: {
//         fontSize: 24,
//         fontWeight: '700',
//         color: '#333',
//     },
//     modalSubtitle: {
//         fontSize: 14,
//         color: '#666',
//         marginTop: 4,
//     },
//     imagePreviewContainer: {
//         marginHorizontal: 24,
//         marginVertical: 20,
//         height: 250,
//         borderRadius: 16,
//         overflow: 'hidden',
//         backgroundColor: '#f5f5f5',
//     },
//     previewImage: {
//         width: '100%',
//         height: '100%',
//     },
//     noImageContainer: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     noImageText: {
//         marginTop: 12,
//         fontSize: 16,
//         color: '#999',
//     },
//     noteContainer: {
//         paddingHorizontal: 24,
//         marginBottom: 24,
//     },
//     noteLabel: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#333',
//         marginBottom: 8,
//     },
//     noteInput: {
//         backgroundColor: '#f9f9f9',
//         borderRadius: 12,
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         fontSize: 16,
//         color: '#333',
//         minHeight: 50,
//         textAlignVertical: 'top',
//         borderWidth: 1,
//         borderColor: '#e0e0e0',
//     },
//     charCount: {
//         textAlign: 'right',
//         fontSize: 12,
//         color: '#999',
//         marginTop: 4,
//     },
//     actionButtons: {
//         flexDirection: 'row',
//         paddingHorizontal: 24,
//         paddingBottom: Platform.OS === 'ios' ? 40 : 24,
//         gap: 12,
//     },
//     actionButton: {
//         flex: 1,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 16,
//         borderRadius: 12,
//         gap: 8,
//     },
//     retakeButton: {
//         backgroundColor: '#f97316',
//     },
//     uploadButton: {
//         backgroundColor: '#10b981',
//     },
//     actionButtonText: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: '600',
//     },
// });



import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Linking,
    TouchableOpacity,
    Platform,
    Image,
    TextInput,
    Alert,
    ActivityIndicator,
    StatusBar,
    KeyboardAvoidingView,
    Dimensions,
    Animated,
} from 'react-native';
import { Camera, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
import Entypo from 'react-native-vector-icons/Entypo';
import Modal from 'react-native-modal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StackActions, useNavigation } from '@react-navigation/native';
import { getItem } from '../utils/StorageService';
import axios from 'axios';
import { navigate, resetAndNavigate, replace, goBack } from '@utils/NavigationUtils';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const baseURL = "https://go-admin.daakit.com";

const DeliveryProof = ({ route }) => {
    const { order, address } = route?.params;
    const navigation = useNavigation();
    const [isModalVisible, setModalVisible] = useState(false);
    const camera = useRef(null);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [cameraOpen, setCameraOpen] = useState(true);
    const [cameraType, setCameraType] = useState('back');
    const [flash, setFlash] = useState('off');
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [note, setNote] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isRetaking, setIsRetaking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(0);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const device = useCameraDevice(cameraType);
    const format = useCameraFormat(device, [
        { photoResolution: { width: 1920, height: 1080 } },
        { fps: 30 },
        { videoResolution: { width: 1920, height: 1080 } }
    ]);

    const getPermission = async () => {
        const permission = await Camera.requestCameraPermission();
        if (permission === 'granted') {
            setPermissionGranted(true);
        } else {
            Alert.alert(
                'Permission Required',
                'Camera permission is required to take delivery proof photos.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Open Settings',
                        onPress: () => Linking.openSettings()
                    }
                ]
            );
        }
    };

    useEffect(() => {
        const checkCameraPermission = async () => {
            try {
                await getPermission();
            } catch (error) {
                console.error('Camera permission error:', error);
                Alert.alert('Error', 'Failed to access camera. Please check permissions.');
            }
        };
        checkCameraPermission();
    }, []);

    useEffect(() => {
        if (!isModalVisible && capturedPhoto) {
            setCameraOpen(true);
        }
    }, [isModalVisible, capturedPhoto]);

    if (!device) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0446DB" />
                <Text style={styles.loadingText}>Initializing camera...</Text>
            </View>
        );
    }

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const takePhoto = async () => {
        if (!camera.current) return;

        // Animate capture button
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 0.8,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
            })
        ]).start();

        try {
            const photo = await camera.current.takePhoto({
                flash: flash,
                qualityPrioritization: 'quality',
                enableAutoStabilization: true,
            });

            const photoPath = Platform.OS === 'ios'
                ? photo.path.replace('file://', '')
                : photo.path;

            setCapturedPhoto(photoPath);
            setCameraOpen(false);
            setModalVisible(true);
        } catch (error) {
            console.error('Failed to capture photo:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
    };

    const toggleFlash = () => {
        setFlash(flash === 'off' ? 'on' : 'off');
    };

    const toggleCameraType = () => {
        setCameraType(cameraType === 'back' ? 'front' : 'back');
    };

    const handleRetake = () => {
        setIsRetaking(true);
        setModalVisible(false);
        setCapturedPhoto(null);
        setNote('');

        setTimeout(() => {
            setCameraOpen(true);
            setIsRetaking(false);
        }, 300);
    };

    const handleUpload = async () => {
        if (!capturedPhoto) return;

        if (!note.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Required Field',
                text2: 'Please enter the name of the person who collected the delivery.',
                position: 'top',
            });
            return;
        }

        setIsUploading(true);
        const token = getItem("token");

        try {
            const formData = new FormData();
            formData.append('location_image', {
                uri: `file://${capturedPhoto}`,
                type: 'image/jpeg',
                name: `delivery-proof-${Date.now()}.jpg`,
            });
            formData.append('status', 'delivered');
            formData.append('latitude', address.latitude);
            formData.append('longitude', address.longitude);
            formData.append('location', address.address);
            formData.append('remarks', 'Delivered to customer without OTP');
            formData.append('collected_by', note.trim());

            const res = await axios.post(
                `${baseURL}/api/rider/updateOrderStatus/${order.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (res.data.success) {
                Toast.show({
                    type: 'success',
                    text1: '✅ Delivery proof uploaded successfully!',
                    position: 'top',
                });
                navigation.dispatch(StackActions.pop(2));
            }
        } catch (error) {
            console.error('Upload failed:', error.response?.data?.message);
            Toast.show({
                type: 'error',
                text1: error.response?.data?.message || 'Failed to upload delivery proof.',
                position: 'top',
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <SafeAreaProvider style={styles.container}>
            <StatusBar backgroundColor="#0446DB" barStyle="light-content" />

            {/* Camera View */}
            {cameraOpen && !isModalVisible && (
                <View style={styles.cameraContainer}>
                    <Camera
                        ref={camera}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={cameraOpen && !isRetaking}
                        photo={true}
                        format={format}
                        enableZoomGesture={true}
                    />

                    {/* Camera Overlay */}
                    <View style={styles.cameraOverlay}>
                        {/* Top Controls - Enhanced */}
                        <SafeAreaView style={styles.topControls}>
                            <View style={styles.topControlsLeft}>
                                <TouchableOpacity
                                    style={[styles.controlButton, styles.glassMorphism]}
                                    onPress={toggleFlash}
                                >
                                    <MaterialIcons
                                        name={flash === 'on' ? 'flash-on' : 'flash-off'}
                                        size={22}
                                        color="white"
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.topControlsRight}>
                                <TouchableOpacity
                                    style={[styles.controlButton, styles.glassMorphism]}
                                    onPress={toggleCameraType}
                                >
                                    <MaterialIcons
                                        name="flip-camera-ios"
                                        size={22}
                                        color="white"
                                    />
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>

                        {/* Grid Lines */}
                        <View style={styles.gridOverlay}>
                            <View style={styles.gridHorizontal} />
                            <View style={styles.gridVertical} />
                            <View style={[styles.gridHorizontal, styles.gridHorizontalBottom]} />
                            <View style={[styles.gridVertical, styles.gridVerticalRight]} />
                        </View>

                        {/* Bottom Controls - Enhanced */}
                        <SafeAreaView style={styles.bottomControls}>
                            <View style={styles.bottomControlsLeft}>
                                <TouchableOpacity
                                    style={[styles.sideButton, styles.glassMorphism]}
                                    onPress={() => setModalVisible(true)}
                                >
                                    <MaterialIcons name="photo-library" size={22} color="white" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.captureButtonContainer}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={takePhoto}
                                    disabled={isRetaking}
                                >
                                    <Animated.View style={[
                                        styles.captureButtonOuterRing,
                                        { transform: [{ scale: scaleAnim }] }
                                    ]}>
                                        <View style={styles.captureButtonInnerRing}>
                                            <View style={styles.captureButtonCenter} />
                                        </View>
                                    </Animated.View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.bottomControlsRight}>
                                <TouchableOpacity
                                    style={[styles.sideButton, styles.glassMorphism]}
                                    onPress={() => console.log('Zoom')}
                                >
                                    <MaterialIcons name="zoom-in" size={22} color="white" />
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>

                        {/* Bottom Instruction */}
                        <View style={styles.instructionContainer}>
                            <Text style={styles.instructionText}>
                                Tap to capture delivery proof
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Enhanced Preview Modal */}
            <Modal
                isVisible={isModalVisible}
                onBackdropPress={() => !isUploading && setModalVisible(false)}
                onBackButtonPress={() => !isUploading && setModalVisible(false)}
                swipeDirection="down"
                onSwipeComplete={() => !isUploading && toggleModal()}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                animationInTiming={400}
                animationOutTiming={400}
                backdropTransitionInTiming={400}
                backdropTransitionOutTiming={400}
                style={styles.modal}
                backdropOpacity={0.6}
                avoidKeyboard={true}
                propagateSwipe={!isUploading}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        {/* Drag Handle */}
                        <View style={styles.dragHandleContainer}>
                            <View style={styles.dragHandle} />
                        </View>

                        {/* Enhanced Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.headerLeft}>
                                <View style={styles.headerIconContainer}>
                                    <FontAwesome name="camera" size={18} color="#0446DB" />
                                </View>
                                <View style={styles.headerTextContainer}>
                                    <Text style={styles.modalTitle}>Delivery Proof</Text>
                                    <Text style={styles.modalSubtitle}>Review and upload your photo</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => !isUploading && setModalVisible(false)}
                                disabled={isUploading}
                            >
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Image Preview with Status Badge */}
                        <View style={styles.imagePreviewContainer}>
                            {capturedPhoto ? (
                                <View style={styles.imageWrapper}>
                                    <Image
                                        source={{ uri: `file://${capturedPhoto}` }}
                                        style={styles.previewImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.imageBadge}>
                                        <MaterialIcons name="check-circle" size={14} color="#4CAF50" />
                                        <Text style={styles.imageBadgeText}>Ready to upload</Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.noImageContainer}>
                                    <FontAwesome name="photo" size={50} color="#ddd" />
                                    <Text style={styles.noImageText}>No photo available</Text>
                                </View>
                            )}
                        </View>

                        {/* Enhanced Note Input */}
                        <View style={styles.noteContainer}>
                            <View style={styles.noteLabelContainer}>
                                <View style={styles.noteLabelLeft}>
                                    <MaterialIcons name="person" size={18} color="#0446DB" />
                                    <Text style={styles.noteLabel}>Collected By</Text>
                                </View>
                                <Text style={styles.noteCounter}>
                                    {note.length}/200
                                </Text>
                            </View>
                            <TextInput
                                style={[
                                    styles.noteInput,
                                    isUploading && styles.noteInputDisabled
                                ]}
                                placeholder="Enter collector's name..."
                                placeholderTextColor="#999"
                                value={note}
                                onChangeText={setNote}
                                maxLength={200}
                                editable={!isUploading}
                            />
                        </View>

                        {/* Enhanced Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.retakeButton]}
                                onPress={handleRetake}
                                disabled={isUploading}
                            >
                                {isRetaking ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <MaterialIcons name="replay" size={18} color="white" />
                                        <Text style={styles.actionButtonText}>Retake</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    styles.uploadButton,
                                    (!capturedPhoto || isUploading) && styles.uploadButtonDisabled
                                ]}
                                onPress={handleUpload}
                                disabled={isUploading || !capturedPhoto}
                            >
                                {isUploading ? (
                                    <View style={styles.uploadingContent}>
                                        <ActivityIndicator size="small" color="#fff" />
                                        <Text style={styles.uploadingText}>Uploading...</Text>
                                    </View>
                                ) : (
                                    <>
                                        <MaterialIcons name="cloud-upload" size={18} color="white" />
                                        <Text style={styles.actionButtonText}>
                                            {capturedPhoto ? 'Upload Photo' : 'No Photo'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Footer Text */}
                        <Text style={styles.footerText}>
                            By uploading, you confirm this delivery proof is accurate
                        </Text>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaProvider>
    );
};

export default DeliveryProof;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f7fa',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    cameraOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        padding: 20,
    },

    // Top Controls
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 10 : 10,
    },
    topControlsLeft: {
        flexDirection: 'row',
        gap: 12,
    },
    topControlsRight: {
        flexDirection: 'row',
        gap: 12,
    },
    glassMorphism: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        backdropFilter: Platform.OS === 'ios' ? 'blur(10px)' : undefined,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    controlButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sideButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Grid Overlay
    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.12,
        pointerEvents: 'none',
    },
    gridHorizontal: {
        position: 'absolute',
        width: '100%',
        height: 1,
        backgroundColor: 'white',
        top: '33.33%',
    },
    gridHorizontalBottom: {
        top: '66.66%',
    },
    gridVertical: {
        position: 'absolute',
        width: 1,
        height: '100%',
        backgroundColor: 'white',
        left: '33.33%',
    },
    gridVerticalRight: {
        left: '66.66%',
    },

    // Bottom Controls
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 10 : 10,
    },
    bottomControlsLeft: {
        flex: 1,
        alignItems: 'flex-start',
    },
    bottomControlsRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    captureButtonContainer: {
        flex: 1,
        alignItems: 'center',
    },
    captureButtonOuterRing: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    captureButtonInnerRing: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonCenter: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#0446DB',
    },

    // Instruction
    instructionContainer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 120 : 100,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    instructionText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.5,
        opacity: 0.9,
    },

    // Modal Styles
    modal: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    dragHandleContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E0E0E0',
    },

    // Modal Header
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: -0.3,
    },
    modalSubtitle: {
        fontSize: 13,
        color: '#888',
        marginTop: 1,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Image Preview
    imagePreviewContainer: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#f8f8f8',
        borderWidth: 1,
        borderColor: '#eee',
    },
    imageWrapper: {
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: 220,
    },
    imageBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    imageBadgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 6,
    },
    noImageContainer: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
    },
    noImageText: {
        marginTop: 10,
        fontSize: 14,
        color: '#999',
    },

    // Note Input
    noteContainer: {
        marginBottom: 16,
    },
    noteLabelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    noteLabelLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    noteLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    noteCounter: {
        fontSize: 12,
        color: '#999',
    },
    noteInput: {
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1a1a1a',
        backgroundColor: '#fafafa',
        minHeight: 48,
    },
    noteInputDisabled: {
        opacity: 0.6,
    },

    // Action Buttons
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        gap: 8,
    },
    retakeButton: {
        backgroundColor: '#6c757d',
    },
    uploadButton: {
        backgroundColor: '#0446DB',
        flex: 1.5,
    },
    uploadButtonDisabled: {
        opacity: 0.5,
    },
    uploadingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    uploadingText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    // Footer
    footerText: {
        textAlign: 'center',
        fontSize: 11,
        color: '#999',
        lineHeight: 16,
    },
});