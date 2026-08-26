
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Dimensions,
    ActivityIndicator,
    Touchable,
} from 'react-native';
import Header from '../components/Header'
import Modal from 'react-native-modal';
import axios from 'axios';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import { clearStorage, getItem, removeItem } from '../utils/StorageService';
import { stopService } from '../utils/RiderTracking';
const { width, height } = Dimensions.get('window');
const baseURL = 'https://go-admin.daakit.com'


// Profile Completion Progress Component
const ProfileCompletionProgress = ({
    riderData = {},
    onProfileImageChange,
    previewImage,
    onImageClick
}) => {
    const fields = [
        "name", "email", "phone", "address_line",
        "city", "state", "pincode", "country",
        "bank_account_number", "bank_name",
        "bank_ifsc_code", "document_id",
    ];

    const completedFields = fields.filter((f) => {
        const v = riderData[f];
        return v && v.toString().trim() !== "";
    }).length;
    const completionPercentage = Math.round((completedFields / fields.length) * 100);

    const getStatusColor = (p) => {
        if (p >= 80) return "#10b981";
        if (p >= 50) return "#f59e0b";
        return "#ef4444";
    };

    return (
        <View className="bg-white rounded-2xl shadow-sm mx-0 mt-0 p-6 border border-gray-100">
            <View className="flex-row items-center mb-6">
                {/* <TouchableOpacity onPress={onImageClick} className="relative">
                    <View className="w-20 h-20 z-10 rounded-full border-2 border-white shadow-lg overflow-hidden bg-gradient-to-br from-[#0446DB] to-[#857de3]">
                        <Image
                            source={{
                                uri: previewImage ||
                                    (riderData.profile_image ? `${baseURL}/${riderData.profile_image}` : 'https://via.placeholder.com/80')
                            }}
                            className="w-full h-full"
                        />
                    </View>
                    <TouchableOpacity
                        onPress={onProfileImageChange}
                        className="absolute bottom-0 right-0 w-8 h-8 z-90 bg-[#0446DB] rounded-full items-center justify-center border-2 border-white shadow-md"
                    >
                        <Feather name="camera" size={14} color="white" />
                    </TouchableOpacity>
                </TouchableOpacity> */}

                <TouchableOpacity onPress={onImageClick} style={{ position: 'relative' }}>

                    <View
                        style={{ zIndex: 1 }}
                        className="w-20 h-20 rounded-full border-2 border-white shadow-lg overflow-hidden bg-[#0446DB]"
                    >
                        <Image
                            source={{
                                uri:
                                    previewImage ||
                                    (riderData.profile_image
                                        ? `${baseURL}/${riderData.profile_image}`
                                        : 'https://via.placeholder.com/80'),
                            }}
                            className="w-full h-full"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={onProfileImageChange}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            zIndex: 999,
                            elevation: 10,
                        }}
                        className="w-8 h-8 bg-[#0446DB] rounded-full items-center justify-center border-2 border-white"
                    >
                        <Feather name="camera" size={14} color="white" />
                    </TouchableOpacity>

                </TouchableOpacity>

                <View className="ml-4 flex-1">
                    <Text className="text-xl font-bold text-gray-900">
                        {riderData?.name || 'User'}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <MaterialCommunityIcons name="email-outline" size={14} color="#6b7280" />
                        <Text className="text-sm text-gray-500 ml-1">
                            {riderData?.email || 'No email'}
                        </Text>
                    </View>
                    <View className="flex-row items-center mt-2">
                        <View className="flex-1 bg-gray-200 rounded-full h-2">
                            <View
                                className="h-2 rounded-full"
                                style={{
                                    width: `${completionPercentage}%`,
                                    backgroundColor: getStatusColor(completionPercentage)
                                }}
                            />
                        </View>
                        <Text className="ml-2 text-sm font-medium" style={{ color: getStatusColor(completionPercentage) }}>
                            {completionPercentage}%
                        </Text>
                    </View>
                </View>
            </View>

            <View className="bg-[#0446DB] rounded-xl p-4 mb-4">
                <View className="flex-row items-center justify-between">
                    <View>
                        <View className="flex-row items-center mb-1">
                            <Ionicons name="wallet-outline" size={16} color="white" />
                            <Text className="text-sm opacity-90 text-white ml-2">Wallet Balance</Text>
                        </View>
                        <View className="flex-row items-baseline">
                            <Text className="text-2xl font-bold text-white">₹{riderData?.wallet_balance || '0'}</Text>
                            <Text className="text-sm opacity-80 text-white ml-2">Available</Text>
                        </View>
                    </View>
                    {riderData?.kyc_verified !== '2' && (
                        <View className="bg-white/10 rounded-lg p-2">
                            <Feather name="shield" size={20} color="rgba(255,255,255,0.8)" />
                        </View>
                    )}
                </View>

                {riderData?.kyc_verified !== '2' && (
                    <View className="mt-3 bg-white/10 rounded-lg p-2">
                        <View className="flex-row items-center">
                            <Feather name="shield" size={12} color="white" />
                            <Text className="text-xs text-white ml-1">
                                Complete KYC & 2 deliveries to enable withdrawal
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

// Bottom Sheet Modal Component using react-native-modal - FIXED VERSION
const BottomSheet = ({
    isOpen,
    onClose,
    title,
    children
}) => {
    return (
        <Modal
            isVisible={isOpen}
            onBackdropPress={onClose}
            onSwipeComplete={onClose}
            swipeDirection={['down']}
            style={{
                margin: 0,
                justifyContent: 'flex-end',
            }}
            backdropOpacity={0.5}
            avoidKeyboard={true}
            propagateSwipe={true}
            useNativeDriver={false}
            hideModalContentWhileAnimating={false}
        >
            <View
                style={{
                    backgroundColor: 'white',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    maxHeight: height * 0.8,
                    width: '100%',
                    paddingBottom: 20
                }}
            >
                <View style={{ padding: 16 }}>
                    <View style={{ alignItems: 'center', marginBottom: 8 }}>
                        <View style={{ width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2 }} />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>{title}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={{ padding: 8, backgroundColor: '#F3F4F6', borderRadius: 999 }}
                        >
                            <Entypo name="cross" size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 2 }}
                >
                    {children}
                </ScrollView>
            </View>
        </Modal>
    );
};

// Reusable Info Field Component
const InfoField = ({
    label,
    value,
    icon: Icon,
    onEdit,
    type = 'text'
}) => (
    <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
        <View className="flex-row flex-1">
            {Icon && (
                <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 items-center justify-center mr-3">
                    <Icon size={20} color="#0446DB" />
                </View>
            )}
            <View className="flex-1">
                <Text className="text-sm text-gray-500">{label}</Text>
                <View className="flex-row items-center">
                    <Text className={`font-medium ${!value ? 'text-gray-400' : 'text-gray-900'}`}>
                        {value || 'Not provided'}
                    </Text>
                    {type === 'email' && value && (
                        <MaterialCommunityIcons name="email-outline" size={16} color="#0446DB" style={{ marginLeft: 8 }} />
                    )}
                </View>
            </View>
        </View>
        {onEdit && (
            <TouchableOpacity
                onPress={onEdit}
                className="p-2 rounded-lg bg-gray-100"
            >
                <Feather name="edit-2" size={20} color="#0446DB" />
            </TouchableOpacity>
        )}
    </View>
);

function Profile({ navigation }) {
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [riderData, setRiderData] = useState({});
    const [editName, setEditName] = useState(false);
    const [tempName, setTempName] = useState("");
    const [editPhone, setEditPhone] = useState(false);
    const [phone, setPhone] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showBankModal, setShowBankModal] = useState(false);
    const [showKycModal, setShowKycModal] = useState(false);
    const [showKycViewModal, setShowKycViewModal] = useState(false);
    const [showKycUpdateModal, setShowKycUpdateModal] = useState(false);
    const [chequePreview, setChequePreview] = useState(null);
    const [bankFormData, setBankFormData] = useState({
        bank_account_number: '',
        bank_name: '',
        bank_branch: '',
        bank_ifsc_code: '',
        cheque_image: null
    });
    const [addressFormData, setAddressFormData] = useState({
        address_line: '',
        city: '',
        state: '',
        pincode: '',
        country: '',
        facility_city: ''
    });
    const logoutSimple = async () => {

        try {
            await stopService()
            console.log('login')
            removeItem('token');
            removeItem('rider');
            removeItem('biometric_enabled');
            clearStorage()
            navigation.replace('Login');

        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    const [kycData, setKycData] = useState({
        document_image: null,
        document_id: "",
        document_type: "driving_license"
    });
    const [expandedSection, setExpandedSection] = useState({
        personal: true,
        address: false,
        capacity: false,
        bank: false
    });

    const getProfile = async () => {
        try {
            const token = getItem('token');
            const res = await axios.get(`${baseURL}/api/rider/getRiderProfile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRiderData(res.data.data);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response.data.message,
                position: 'top',
            });
            console.error('Failed to fetch profile');
        } finally {
            setLoading(false);

        }
    };

    const handleBankSubmit = async () => {
        try {
            const token = getItem('token');
            const formData = new FormData();
            formData.append("bank_account_number", bankFormData.bank_account_number);
            formData.append("bank_name", bankFormData.bank_name);
            formData.append("bank_branch", bankFormData.bank_branch);
            formData.append("bank_ifsc_code", bankFormData.bank_ifsc_code);
            if (bankFormData.cheque_image) {
                formData.append("cheque_image", {
                    uri: bankFormData.cheque_image.path,
                    type: bankFormData.cheque_image.mime,
                    name: 'cheque.jpg'
                });
            }

            const res = await axios.post(`${baseURL}/api/rider/updateRiderProfile`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            Toast.show({
                type: 'success',
                text1: res?.data?.message || 'Bank details updated successfully',
                position: 'top',
                visibilityTime: 4000,
                autoHide: true,
            });
            setShowBankModal(false);
            resetBankForm();
            getProfile();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: error.response?.data?.message || 'Failed to update bank details',
                position: 'top',
                visibilityTime: 4000,
                autoHide: true,
            });
        }
    };

    const handleAddressSubmit = async () => {
        try {
            const token = getItem('token');
            const formData = new FormData();
            formData.append("address_line", addressFormData.address_line || "");
            formData.append("city", addressFormData.city || "");
            formData.append("state", addressFormData.state || "");
            formData.append("pincode", addressFormData.pincode || "");

            const res = await axios.post(
                `${baseURL}/api/rider/updateRiderProfile`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            Toast.show({
                type: 'success',
                text1: res?.data?.message || "Address updated successfully",
                position: 'top',
                visibilityTime: 4000,
                autoHide: true,
            });
            setShowAddressModal(false);
            getProfile();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: error.response?.data?.message || "Failed to update address",
                position: 'top',
                visibilityTime: 4000,
                autoHide: true,
            });
        }
    };

    const resetBankForm = () => {
        setBankFormData({
            bank_account_number: '',
            bank_name: '',
            bank_branch: '',
            bank_ifsc_code: '',
            cheque_image: null
        });
        setChequePreview(null);
    };

    const submitKyc = async () => {
        if (!kycData.document_id || !kycData.document_image) {
            Toast.show({
                type: 'error',
                text1: "Please fill all required fields",
                position: 'top',
                visibilityTime: 4000,
                autoHide: true,
            });
            return;
        }

        try {
            const token = getItem('token');
            const form = new FormData();
            form.append('document_image', {
                uri: kycData.document_image.path,
                type: kycData.document_image.mime,
                name: 'document.jpg'
            });
            form.append('document_id', kycData.document_id);
            form.append('document_type', kycData.document_type);

            const res = await axios.post(`${baseURL}/api/rider/updateRiderProfile`,
                form,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            Toast.show({
                type: 'success',
                text1: res?.data?.message || 'KYC submitted successfully',
                position: 'top',
                visibilityTime: 4000,
                autoHide: true,
            });
            setShowKycModal(false);
            setShowKycUpdateModal(false);
            setKycData({
                document_image: null,
                document_id: "",
                document_type: "driving_license"
            });
            getProfile();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: error.response?.data?.message || 'Failed to submit KYC',
                position: 'top',
                visibilityTime: 4000,
                autoHide: true,
            });
        }
    };

    const resetKycForm = () => {
        setKycData({
            document_image: null,
            document_id: "",
            document_type: "driving_license"
        });
    };

    const getKycStatus = () => {
        if (riderData?.kyc_verified === '1') return 'verified';
        if (riderData?.document_id && riderData?.kyc_verified === '0') return 'pending';
        return 'not_submitted';
    };

    const getKycStatusColor = (status) => {
        switch (status) {
            case 'verified': return '#10b981';
            case 'pending': return '#f59e0b';
            default: return '#ef4444';
        }
    };

    const handleKycAction = () => {
        const status = getKycStatus();
        switch (status) {
            case 'verified':
                setShowKycViewModal(true);
                break;
            case 'pending':
                setShowKycViewModal(true);
                break;
            default:
                setShowKycModal(true);
                break;
        }
    };

    const updateProfile = async (croppedFile = null) => {
        try {
            const token = getItem('token');
            const formData = new FormData();
            if (editName && tempName.trim()) {
                formData.append("name", tempName.trim());
            }
            if (croppedFile || profileImage) {
                const image = croppedFile || profileImage;
                formData.append("profile_image", {
                    uri: image.path,
                    type: image.mime,
                    name: 'profile.jpg'
                });
            }

            const res = await axios.post(
                `${baseURL}/api/rider/updateRiderProfile`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (res.data.success) {
                console.log("Profile updated:", res.data);
                getProfile();
                setProfileImage(null);
                setEditName(false);
                Toast.show({
                    type: 'success',
                    text1: 'Profile updated successfully',
                    position: 'top',
                    visibilityTime: 4000,
                    autoHide: true,
                })
            }
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: err.response?.data?.message || "Profile update failed. Please try again.",
                position: 'top',
                visibilityTime: 4000,
                autoHide: true,
            });
        }
    };

    const handleProfileImageChange = async () => {
        try {
            const image = await ImagePicker.openPicker({
                width: 300,
                height: 300,
                cropping: true,
                cropperCircleOverlay: true,
                compressImageQuality: 0.8,
            });

            setProfileImage(image);
            setPreviewImage({ uri: image.path });
            await updateProfile(image);
        } catch (error) {
            if (error.code !== 'E_PICKER_CANCELLED') {
                console.log('Image picker error:', error);
            }
        }
    };

    const sendOTP = async () => {
        try {
            if (!phone) {
                Toast.show({
                    type: 'error',
                    text1: "Please enter a valid phone number",
                    position: 'top',
                    visibilityTime: 4000,
                    autoHide: true,
                });
                return;
            }

            if (riderData.phone === phone) {
                Toast.show({
                    type: 'error',
                    text1: "Please enter a different number",
                    position: 'top',
                    visibilityTime: 4000,
                    autoHide: true,
                });
                return;
            }

            if (!/^[0-9]{10}$/.test(phone)) {
                Toast.show({
                    type: 'error',
                    text1: "Please enter a valid 10-digit phone number",
                    position: 'top',
                    visibilityTime: 4000,
                    autoHide: true,
                });
                return;
            }

            const response = await axios.post(`${baseURL}/api/otp/sendphonenumberchangeotp`, {
                phone: phone,
            },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.data.success) {
                Toast.show({
                    type: 'success',
                    text1: "OTP sent successfully",
                    position: 'top',
                    visibilityTime: 4000,
                    autoHide: true,
                });
                setShowOTPModal(true);
                setEditPhone(false);
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: error.response?.data?.message || "Failed to send OTP",
                position: 'top',
                visibilityTime: 4000,
                autoHide: true,
            });
        }
    };

    const verifyOTP = async (otpCode) => {
        setVerificationLoading(true);
        try {
            const token = getItem('token');
            const response = await axios.post(`${baseURL}/api/otp/verifyphonenumberchangeotp`, {
                phone: phone,
                otp: otpCode
            },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success) {
                const formData = new FormData();
                formData.append('phone', phone);

                const res = await axios.post(`${baseURL}/api/rider/updateRiderProfile`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                });

                if (res.data.success) {
                    getProfile();
                    setShowOTPModal(false);
                    Toast.show({
                        type: 'success',
                        text1: "Phone number updated successfully",
                        position: 'top',
                        visibilityTime: 4000,
                        autoHide: true,
                    });
                }
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: error?.response?.data?.message || "Verification failed",
                position: 'top',
                visibilityTime: 4000,
                autoHide: true,
            });
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleChequeImagePick = async () => {
        try {
            const image = await ImagePicker.openPicker({
                width: 800,
                height: 600,
                cropping: true,
                compressImageQuality: 0.8,
            });

            setBankFormData({
                ...bankFormData,
                cheque_image: image,
            });
            setChequePreview({ uri: image.path });
        } catch (error) {
            if (error.code !== 'E_PICKER_CANCELLED') {
                console.log('Image picker error:', error);
            }
        }
    };

    const handleDocumentImagePick = async () => {
        try {
            const image = await ImagePicker.openPicker({
                width: 800,
                height: 600,
                cropping: true,
                compressImageQuality: 0.8,
            });

            setKycData({
                ...kycData,
                document_image: image,
            });
        } catch (error) {
            if (error.code !== 'E_PICKER_CANCELLED') {
                console.log('Image picker error:', error);
            }
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    useEffect(() => {
        if (riderData) {
            setBankFormData({
                bank_account_number: riderData.bank_account_number || "",
                bank_ifsc_code: riderData.bank_ifsc_code || "",
                bank_branch: riderData.bank_branch || "",
                bank_name: riderData.bank_name || "",
                cheque_image: null
            });
            setAddressFormData({
                address_line: riderData.address_line || "",
                city: riderData.city || "",
                state: riderData.state || "",
                pincode: riderData.pincode || "",
                country: riderData.country || "",
                facility_city: riderData.facility_city || ""
            });
            setKycData(prev => ({
                ...prev,
                document_id: riderData?.document_id || "",
            }));
        }
    }, [riderData]);

    const OTPModal = ({ isOpen, onClose, onVerify, phoneNumber, loading = false }) => {
        const [otp, setOtp] = useState(['', '', '', '']);
        const [timeLeft, setTimeLeft] = useState(180);
        const otpInputs = useRef([]);

        useEffect(() => {
            if (isOpen) {
                setOtp(['', '', '', '']);
                setTimeLeft(180);
            }
        }, [isOpen]);

        useEffect(() => {
            if (timeLeft > 0 && isOpen) {
                const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
                return () => clearTimeout(timer);
            }
        }, [timeLeft, isOpen]);

        const handleInputChange = (index, value) => {
            const numericValue = value.replace(/[^0-9]/g, '');
            if (numericValue.length <= 1) {
                const newOtp = [...otp];
                newOtp[index] = numericValue;
                setOtp(newOtp);

                if (numericValue && index < 3) {
                    otpInputs.current[index + 1]?.focus();
                }
            }
        };

        const handleVerify = () => {
            if (otp.join('').length === 4) {
                onVerify(otp.join(''));
            }
        };

        return (
            <BottomSheet
                isOpen={isOpen}
                onClose={onClose}
                title="Verify Phone Number"
            >
                <View className="px-6 pb-8">
                    <View className="items-center mb-6">
                        <View className="w-16 h-16 bg-[#0446DB] rounded-full items-center justify-center mb-4">
                            <Feather name="shield" size={32} color="white" />
                        </View>
                        <Text className="text-gray-600 mb-2">
                            Enter the 4-digit code sent to
                        </Text>
                        <Text className="text-[#0446DB] font-semibold">{phoneNumber}</Text>
                    </View>

                    <View className="flex-row justify-center gap-3 mb-6">
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (otpInputs.current[index] = ref)}
                                value={digit}
                                onChangeText={(text) => handleInputChange(index, text)}
                                className="w-14 h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-xl focus:border-[#0446DB]"
                                maxLength={1}
                                keyboardType="numeric"
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={handleVerify}
                        disabled={otp.join('').length !== 4 || loading}
                        className="w-full py-3.5 bg-[#0446DB] rounded-xl"
                    >
                        <Text className="text-white font-medium text-center">
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </Text>
                    </TouchableOpacity>

                    <Text className="text-center text-sm text-gray-500 mt-4">
                        Code expires in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </Text>
                </View>
            </BottomSheet>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#0446DB" />
                <Text className="text-gray-500 font-medium mt-4">Loading Data...</Text>
            </View>
        );
    }

    const kycStatus = getKycStatus();

    return (
        <View className="flex-1 bg-gray-50">
            <Header title="My Profile" showBack={true} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <ProfileCompletionProgress
                    riderData={riderData}
                    onProfileImageChange={handleProfileImageChange}
                    previewImage={previewImage?.uri}
                    onImageClick={() => setShowImageModal(true)}
                />

                {/* Personal Information Section */}
                <View className="mx-4 mt-4 bg-white rounded-2xl shadow-sm">
                    <TouchableOpacity
                        onPress={() => setExpandedSection(prev => ({ ...prev, personal: !prev.personal }))}
                        className="w-full flex-row items-center justify-between p-6"
                    >
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 items-center justify-center mr-3">
                                <Feather name="user" size={20} color="#0446DB" />
                            </View>
                            <Text className="font-semibold text-gray-900">Personal Information</Text>
                        </View>
                        {expandedSection.personal ? (
                            <Feather name="chevron-up" size={20} color="#6b7280" />
                        ) : (
                            <Feather name="chevron-down" size={20} color="#6b7280" />
                        )}
                    </TouchableOpacity>

                    {expandedSection.personal && (
                        <View className="px-6 pb-6">
                            <View className="mb-4">
                                <Text className="text-sm text-gray-500 mb-2">Full Name</Text>
                                {!editName ? (
                                    <View className="flex-row items-center justify-between">
                                        <View className="p-3 bg-gray-50 rounded-xl flex-1">
                                            <Text className="font-medium">{riderData?.name || "Not provided"}</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setEditName(true);
                                                setTempName(riderData?.name || "");
                                            }}
                                            className="ml-3 p-2 bg-gray-100 rounded-lg"
                                        >
                                            <Feather name="edit-2" size={20} color="#0446DB" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View>
                                        <TextInput
                                            value={tempName}
                                            onChangeText={setTempName}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#0446DB]"
                                            placeholder="Enter your name"
                                        />
                                        <View className="flex-row gap-2 mt-2">
                                            <TouchableOpacity
                                                onPress={() => updateProfile()}
                                                className="flex-1 py-2 bg-[#0446DB] rounded-xl"
                                            >
                                                <Text className="text-white text-center">Save</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => setEditName(false)}
                                                className="flex-1 py-2 bg-gray-200 rounded-xl"
                                            >
                                                <Text className="text-gray-700 text-center">Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>

                            <InfoField
                                label="Email"
                                value={riderData?.email}
                                icon={MaterialCommunityIcons}
                                type="email"
                            />

                            <View className="mb-4">
                                <Text className="text-sm text-gray-500 mb-2">Phone Number</Text>
                                {!editPhone ? (
                                    <View className="flex-row items-center justify-between">
                                        <View className="p-3 bg-gray-50 rounded-xl flex-1">
                                            <Text className="font-medium">{riderData?.phone || "Not provided"}</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setEditPhone(true);
                                                setPhone(riderData?.phone || "");
                                            }}
                                            className="ml-3 p-2 bg-gray-100 rounded-lg"
                                        >
                                            <Feather name="edit-2" size={20} color="#0446DB" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View>
                                        <TextInput
                                            value={phone}
                                            onChangeText={setPhone}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#0446DB]"
                                            placeholder="Enter phone number"
                                            keyboardType="phone-pad"
                                        />
                                        <View className="flex-row gap-2 mt-2">
                                            <TouchableOpacity
                                                onPress={sendOTP}
                                                className="flex-1 py-2 bg-[#0446DB] rounded-xl"
                                            >
                                                <Text className="text-white text-center">Update</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => setEditPhone(false)}
                                                className="flex-1 py-2 bg-gray-200 rounded-xl"
                                            >
                                                <Text className="text-gray-700 text-center">Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>

                            <View className="mt-6">
                                <View className="flex-row items-center justify-between mb-3">
                                    <Text className="font-medium">KYC Status</Text>
                                    <View
                                        className="px-3 py-1 rounded-full"
                                        style={{
                                            backgroundColor: `${getKycStatusColor(kycStatus)}20`,
                                        }}
                                    >
                                        <Text
                                            className="text-xs font-medium"
                                            style={{ color: getKycStatusColor(kycStatus) }}
                                        >
                                            {kycStatus === 'verified' ? 'Verified' :
                                                kycStatus === 'pending' ? 'Under Review' : 'Not Submitted'}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={handleKycAction}
                                    className="w-full py-3.5 rounded-xl"
                                    style={{
                                        backgroundColor: kycStatus === 'verified' ? '#10b981' : '#0446DB',
                                    }}
                                >
                                    <Text className="text-white text-center font-medium">
                                        {kycStatus === 'verified' ? 'View KYC Details' :
                                            kycStatus === 'pending' ? 'KYC Under Review' : 'Complete KYC Verification'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* Address Information Section */}
                <View className="mx-4 mt-4 bg-white rounded-2xl shadow-sm">
                    <TouchableOpacity
                        onPress={() => setExpandedSection(prev => ({ ...prev, address: !prev.address }))}
                        className="w-full flex-row items-center justify-between p-6"
                    >
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 items-center justify-center mr-3">
                                <Feather name="home" size={20} color="#0446DB" />
                            </View>
                            <Text className="font-semibold text-gray-900">Address Details</Text>
                        </View>
                        {expandedSection.address ? (
                            <Feather name="chevron-up" size={20} color="#6b7280" />
                        ) : (
                            <Feather name="chevron-down" size={20} color="#6b7280" />
                        )}
                    </TouchableOpacity>

                    {expandedSection.address && (
                        <View className="px-6 pb-6">
                            <View className="space-y-3">
                                <InfoField label="Address" value={riderData?.address_line} />
                                <View className="flex-row gap-3">
                                    <View className="flex-1">
                                        <Text className="text-sm text-gray-500 mb-1">City</Text>
                                        <Text className="font-medium">{riderData?.city || 'Not provided'}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm text-gray-500 mb-1">State</Text>
                                        <Text className="font-medium">{riderData?.state || 'Not provided'}</Text>
                                    </View>
                                </View>
                                <View className="flex-row gap-3">
                                    <View className="flex-1">
                                        <Text className="text-sm text-gray-500 mb-1">Pincode</Text>
                                        <Text className="font-medium">{riderData?.pincode || 'Not provided'}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm text-gray-500 mb-1">Country</Text>
                                        <Text className="font-medium">{riderData?.country || 'Not provided'}</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowAddressModal(true)}
                                className="w-full mt-6 py-3.5 bg-[#0446DB] rounded-xl"
                            >
                                <Text className="text-white text-center font-medium">
                                    Update Address
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Delivery Capacity Section */}
                <View className="mx-4 mt-4 bg-white rounded-2xl shadow-sm">
                    <TouchableOpacity
                        onPress={() => setExpandedSection(prev => ({ ...prev, capacity: !prev.capacity }))}
                        className="w-full flex-row items-center justify-between p-6"
                    >
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 items-center justify-center mr-3">
                                <Feather name="package" size={20} color="#0446DB" />
                            </View>
                            <Text className="font-semibold text-gray-900">Delivery Capacity</Text>
                        </View>
                        {expandedSection.capacity ? (
                            <Feather name="chevron-up" size={20} color="#6b7280" />
                        ) : (
                            <Feather name="chevron-down" size={20} color="#6b7280" />
                        )}
                    </TouchableOpacity>

                    {expandedSection.capacity && (
                        <View className="px-6 pb-6">
                            <View className="space-y-6">
                                <View>
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-sm text-gray-600">Max Weight</Text>
                                        <Text className="font-bold text-[#0446DB]">
                                            {riderData?.max_weight_capacity || 0} kg
                                        </Text>
                                    </View>
                                    <View className="w-full bg-gray-200 rounded-full h-2">
                                        <View
                                            className="bg-[#0446DB] h-2 rounded-full"
                                            style={{
                                                width: `${Math.min(((riderData?.max_weight_capacity || 0) / 50) * 100, 100)}%`
                                            }}
                                        />
                                    </View>
                                </View>

                                <View>
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-sm text-gray-600">Max Packets</Text>
                                        <Text className="font-bold text-[#0446DB]">
                                            {riderData?.max_packet_limit || 0} packets
                                        </Text>
                                    </View>
                                    <View className="w-full bg-gray-200 rounded-full h-2">
                                        <View
                                            className="bg-[#0446DB] h-2 rounded-full"
                                            style={{
                                                width: `${Math.min(((riderData?.max_packet_limit || 0) / 100) * 100, 100)}%`
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Bank Details Section */}
                <View className="mx-4 mt-4 bg-white rounded-2xl shadow-sm mb-6">
                    <TouchableOpacity
                        onPress={() => setExpandedSection(prev => ({ ...prev, bank: !prev.bank }))}
                        className="w-full flex-row items-center justify-between p-6"
                    >
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 items-center justify-center mr-3">
                                <Feather name="credit-card" size={20} color="#0446DB" />
                            </View>
                            <Text className="font-semibold text-gray-900">Bank Details</Text>
                        </View>
                        {expandedSection.bank ? (
                            <Feather name="chevron-up" size={20} color="#6b7280" />
                        ) : (
                            <Feather name="chevron-down" size={20} color="#6b7280" />
                        )}
                    </TouchableOpacity>

                    {expandedSection.bank && (
                        <View className="px-6 pb-6">
                            {riderData?.bank_account_number ? (
                                <>
                                    <View className="space-y-4">
                                        <InfoField label="Account Number" value={riderData.bank_account_number} />
                                        <InfoField label="Bank Name" value={riderData.bank_name} />
                                        <InfoField label="Branch" value={riderData.bank_branch} />
                                        <InfoField label="IFSC Code" value={riderData.bank_ifsc_code} />
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setShowBankModal(true)}
                                        className="w-full mt-6 py-3.5 bg-[#0446DB] rounded-xl"
                                    >
                                        <Text className="text-white text-center font-medium">
                                            Update Bank Details
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View className="items-center py-6">
                                    <Feather name="credit-card" size={48} color="#9ca3af" />
                                    <Text className="text-gray-500 my-4">No bank details added</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowBankModal(true)}
                                        className="px-6 py-3 bg-[#0446DB] rounded-xl"
                                    >
                                        <Text className="text-white font-medium">Add Bank Details</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Address Update Modal */}
            <BottomSheet
                isOpen={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                title="Update Address"
            >
                <View className="px-6 pb-8">
                    <View className="space-y-4">
                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Address Line *
                            </Text>
                            <TextInput
                                value={addressFormData.address_line}
                                onChangeText={(text) => setAddressFormData({ ...addressFormData, address_line: text })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#0446DB]"
                                placeholder="Enter your address"
                            />
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-sm font-medium text-gray-700 mb-2">
                                    City *
                                </Text>
                                <TextInput
                                    value={addressFormData.city}
                                    onChangeText={(text) => setAddressFormData({ ...addressFormData, city: text })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#0446DB]"
                                    placeholder="City"
                                />
                            </View>

                            <View className="flex-1">
                                <Text className="text-sm font-medium text-gray-700 mb-2">
                                    State *
                                </Text>
                                <TextInput
                                    value={addressFormData.state}
                                    onChangeText={(text) => setAddressFormData({ ...addressFormData, state: text })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#0446DB]"
                                    placeholder="State"
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Pincode *
                            </Text>
                            <TextInput
                                value={addressFormData.pincode}
                                onChangeText={(text) => setAddressFormData({ ...addressFormData, pincode: text })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#0446DB]"
                                placeholder="Pincode"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleAddressSubmit}
                        className="w-full mt-8 py-3.5 bg-[#0446DB] rounded-xl"
                    >
                        <Text className="text-white font-medium text-center">
                            Save Address
                        </Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>

            {/* Bank Details Modal */}
            <BottomSheet
                isOpen={showBankModal}
                onClose={() => {
                    setShowBankModal(false);
                    resetBankForm();
                }}
                title={riderData?.bank_account_number ? "Update Bank Details" : "Add Bank Details"}
            >
                <View className="px-6 pb-8">
                    <View className="space-y-4">
                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Account Number *
                            </Text>
                            <TextInput
                                value={bankFormData.bank_account_number}
                                onChangeText={(text) => setBankFormData({ ...bankFormData, bank_account_number: text })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#0446DB]"
                                placeholder="Enter account number"
                                keyboardType="numeric"
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                IFSC Code *
                            </Text>
                            <TextInput
                                value={bankFormData.bank_ifsc_code}
                                onChangeText={(text) => setBankFormData({ ...bankFormData, bank_ifsc_code: text.toUpperCase() })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#0446DB]"
                                placeholder="Enter IFSC code"
                                autoCapitalize="characters"
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Bank Name *
                            </Text>
                            <TextInput
                                value={bankFormData.bank_name}
                                onChangeText={(text) => setBankFormData({ ...bankFormData, bank_name: text })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#0446DB]"
                                placeholder="Enter bank name"
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Branch *
                            </Text>
                            <TextInput
                                value={bankFormData.bank_branch}
                                onChangeText={(text) => setBankFormData({ ...bankFormData, bank_branch: text })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#0446DB]"
                                placeholder="Enter branch name"
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Cheque Image *
                            </Text>
                            <TouchableOpacity
                                onPress={handleChequeImagePick}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-6"
                            >
                                <Feather name="upload" size={32} color="#9ca3af" style={{ alignSelf: 'center' }} />
                                <Text className="text-sm text-gray-600 text-center mt-2">Upload Cheque Image</Text>
                                <Text className="text-xs text-gray-500 text-center mt-1">PNG, JPG up to 5MB</Text>
                            </TouchableOpacity>
                            {chequePreview && (
                                <View className="mt-2">
                                    <Image
                                        source={chequePreview}
                                        className="w-full h-40 rounded-xl"
                                        resizeMode="cover"
                                    />
                                </View>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleBankSubmit}
                        className="w-full mt-8 py-3.5 bg-[#0446DB] rounded-xl"
                    >
                        <Text className="text-white font-medium text-center">
                            {riderData?.bank_account_number ? "Update Details" : "Save Details"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>

            {/* KYC View Modal */}
            <BottomSheet
                isOpen={showKycViewModal}
                onClose={() => setShowKycViewModal(false)}
                title="KYC Details"
            >
                <View className="px-6 pb-8">
                    <View className="space-y-6">
                        <View className="bg-gray-50 rounded-xl p-4">
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-sm text-gray-600">Document Type</Text>
                                <Text className="font-medium capitalize">
                                    {riderData.document_type?.replace('_', ' ') || 'Not provided'}
                                </Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-sm text-gray-600">Document ID</Text>
                                <Text className="font-medium">{riderData.document_id || 'Not provided'}</Text>
                            </View>
                        </View>

                        <View className={`p-4 rounded-xl ${kycStatus === 'verified'
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-amber-50 border border-amber-200'
                            }`}>
                            <View className="flex-row items-center">
                                {kycStatus === 'verified' ? (
                                    <Feather name="check-circle" size={20} color="#16a34a" />
                                ) : (
                                    <ActivityIndicator size="small" color="#d97706" style={{ marginRight: 8 }} />
                                )}
                                <Text className={kycStatus === 'verified' ? 'text-green-800 ml-2' : 'text-amber-800 ml-2'}>
                                    {kycStatus === 'verified'
                                        ? 'Your KYC has been verified successfully'
                                        : 'Your KYC is under review. Please wait for verification.'}
                                </Text>
                            </View>
                        </View>

                        {kycStatus === 'pending' && (
                            <TouchableOpacity
                                onPress={() => {
                                    setShowKycViewModal(false);
                                    setShowKycUpdateModal(true);
                                }}
                                className="w-full py-3.5 bg-[#0446DB] rounded-xl"
                            >
                                <Text className="text-white text-center font-medium">
                                    Update KYC
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </BottomSheet>

            {/* KYC Submit/Update Modal */}
            <BottomSheet
                isOpen={showKycModal || showKycUpdateModal}
                onClose={() => {
                    setShowKycModal(false);
                    setShowKycUpdateModal(false);
                    resetKycForm();
                }}
                title={showKycUpdateModal ? "Update KYC" : "Complete KYC"}
            >
                <View className="px-6 pb-8">
                    <View className="space-y-6">
                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Document Type *
                            </Text>
                            <View className="border border-gray-300 rounded-xl">
                                <View className="flex-row justify-around p-2">
                                    {['driving_license', 'aadhar', 'pan'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => setKycData({ ...kycData, document_type: type })}
                                            className={`px-4 py-2 rounded-lg ${kycData.document_type === type ? 'bg-[#0446DB]' : 'bg-gray-100'
                                                }`}
                                        >
                                            <Text className={kycData.document_type === type ? 'text-white' : 'text-gray-700'}>
                                                {type.replace('_', ' ').toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Document ID *
                            </Text>
                            <TextInput
                                placeholder="Enter document ID"
                                value={kycData.document_id}
                                onChangeText={(text) => setKycData({ ...kycData, document_id: text })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#0446DB]"
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Document Image *
                            </Text>
                            <TouchableOpacity
                                onPress={handleDocumentImagePick}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-6"
                            >
                                <Feather name="upload" size={32} color="#9ca3af" style={{ alignSelf: 'center' }} />
                                <Text className="text-sm text-gray-600 text-center mt-2">Upload Document Image</Text>
                                <Text className="text-xs text-gray-500 text-center mt-1">PNG, JPG up to 5MB</Text>
                            </TouchableOpacity>
                            {kycData.document_image && (
                                <View className="mt-2 flex-row items-center">
                                    <Feather name="check-circle" size={16} color="#16a34a" />
                                    <Text className="text-sm text-green-600 ml-1">
                                        File selected: {kycData.document_image.filename || 'document.jpg'}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <Text className="text-sm text-blue-800">
                                Ensure the document is valid, clear, and all details are visible in the uploaded image.
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={submitKyc}
                            className="w-full py-3.5 bg-[#0446DB] rounded-xl"
                        >
                            <Text className="text-white text-center font-medium">
                                {showKycUpdateModal ? "Update KYC" : "Submit KYC"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomSheet>

            {/* OTP Modal */}
            <OTPModal
                isOpen={showOTPModal}
                onClose={() => setShowOTPModal(false)}
                onVerify={verifyOTP}
                phoneNumber={phone}
                loading={verificationLoading}
            />
            <View className="px-6 mt-2 mb-1">
                <TouchableOpacity
                    onPress={logoutSimple}
                    activeOpacity={0.8}
                    className="bg-red-500 py-4 rounded-xl flex-row items-center justify-center shadow-sm"
                >
                    {/* <Icon name="log-out-outline" size={20} color="#FFFFFF" /> */}

                    <Text className="text-white text-base font-semibold ml-2">
                        Logout
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default Profile;