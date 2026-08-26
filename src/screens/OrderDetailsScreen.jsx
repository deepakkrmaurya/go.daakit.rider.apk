
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Linking, Platform, TextInput, ActivityIndicator, Pressable } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from "../components/Header"
import Icon from 'react-native-vector-icons/Ionicons'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import Currency from 'react-native-vector-icons/MaterialCommunityIcons'
import { getItem } from '../utils/StorageService'
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native'
import axios from 'axios';
import Modal from 'react-native-modal'
import getCurrentLocation from '../utils/GetLocation'
import { requestLocationPermission } from '../permission/LocationPermission'
import Geolocation from "@react-native-community/geolocation";
import GenerateUPI from '../utils/Payment';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown'
const baseUrl = 'https://go-admin.daakit.com';
import openMap from '@utils/openmap'
const OrderDetailsScreen = ({ route }) => {
    const navigation = useNavigation()
    const [tempStartDate, setTempStartDate] = useState('');
    const [showStartPicker, setShowStartPicker] = useState(true);
    const [rescheduledDate, setRescheduledDate] = useState(null);
    const selectedAssignment = route?.params?.order
    const [showCallOptions, setShowCallOptions] = useState(false);
    const [reschedule, setReschedule] = useState('')
    const [otherReason, setOtherReason] = useState('')
    const [codPopup, setCodPopup] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [isUndeliveredModalVisible, setIsUndeliveredModalVisible] = useState(false)
    const [isCodPaymentModalVisible, setIsCodPaymentModalVisible] = useState(false)
    const [isDeliveredModalVisible, setIsDeliveredModalVisible] = useState(false)
    const [undeliveredReason, setUndeliveredReason] = useState('')
    const [otherReasen, setOtherReasen] = useState('')
    const [Subremarks, setSubRemarksReason] = useState(null)
    const [cancelReason, setCancelReason] = useState(null);
    const [undeliveredModalScrollOffset, setUndeliveredModalScrollOffset] = useState(0)
    const [deliveredModalScrollOffset, setDeliveredModalScrollOffset] = useState(0)
    const [codPaymentModalScrollOffset, setCodPaymentModalScrollOffset] = useState(0)
    const [otpCode, setOtpCode] = useState('')
    const [deliveryMethod, setDeliveryMethod] = useState('')
    const [isGettingLocation, setIsGettingLocation] = useState(false)
    const [address, setAddress] = useState({
        latitude: '',
        longitude: '',
        address: ''
    })

    // Refs for performance
    const scrollViewRef = useRef(null)
    const locationFetchedRef = useRef(false)




    const openNavigation = ({ latitude, longitude, address, navigationTarget = 'delivery' }) => {
        openMap(latitude, longitude, address)
    };

    const [isCallActive, setIsCallActive] = useState(true);
    const [callModel, setCallModel] = useState('');
    const [callDirectModel, setcallDirectModel] = useState('');
    const handleCall = async (order_id) => {
        setIsCallActive(false);
        const token = getItem("token");
        try {
            setCallModel("Call initiated, Please Wait");

            if (isCallActive) {

                const res = await axios.post(
                    `${baseUrl}/api/rider/connectCall`,
                    { order_id },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setTimeout(() => {
                    setCallModel('');
                    setIsCallActive(true);
                }, 10000);
            }

            // demo auto stop after 10 sec

        } catch (error) {
            setIsCallActive(true);
            //   stopCall();
            // toast.error("Something went wrong");
        }
    }



    const makeCall = async (phone) => {

        if (!phone) {
            Alert.alert("Error", "Customer mobile number not available.");
            return;
        }

        const url = `tel:${phone}`;

        const supported = await Linking.canOpenURL(url);

        if (supported) {
            Linking.openURL(url);
        } else {
            Alert.alert("Error", "Unable to make call.");
        }
    };




    const getAddressFromCoords = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCavwYyxMy-eqPfjW1iUffUEP7SQ4evafM`
            );

            const data = await response.json();
            if (data.results.length > 0) {
                const address = data.results[0].formatted_address;

                setAddress((pre) => (
                    {
                        ...pre,
                        address: address
                    }
                ))
            }
        } catch (error) {

        }
    };
    const GetLocation = async () => {
        const position = await getCurrentLocation(show = false);

        const { latitude, longitude } = position.coords;
        setAddress((pre) => (
            {
                ...pre,
                latitude,
                longitude
            }
        ))
        console.log(latitude, longitude)
        getAddressFromCoords(latitude, longitude)
    };

    const handleUndeliveredSubmit = async ({ id, otherReasen, status, undeliveredReason }) => {
        if (!undeliveredReason) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select a reason',
                position: 'top',
            });
            return;
        }



        if (undeliveredReason === 'Customer Requested Reschedule' && (!rescheduledDate || !Subremarks)) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select rescheduled date and Sub Remark',
                position: 'top',
            });
            return;
        }
        if (
            undeliveredReason === 'Customer Refused / Cancelled' &&
            !cancelReason
        ) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select Sub Remark',
                position: 'top',
            });

            return;
        }


        if (!address.latitude || !address.longitude) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Fetching location... Please try again',
                position: 'top',
            });
            return;
        }


        //     const formData = new FormData();
        // // formData.append("remarks", reschedule?.trim() ? ${remarks} | Reschedule Date: ${reschedule} : otherReason?.trim() ? otherReason : remarks);

        // formData.append('rescheduled_date', reschedule)
        // formData.append('detailed_remarks', otherReason)
        // formData.append('sub_remarks', subReason)

        const formData = new FormData();
        formData.append('status', status)
        // formData.append("remarks", undeliveredReason === 'delivery_rescheduled_by_customer' ? ` 'delivery_rescheduled_by_customer' | 'Date : ' ${rescheduledDate}` : undeliveredReason === 'other' ? otherReasen : undeliveredReason);
        formData.append("remarks", undeliveredReason)
        formData.append('latitude', address.latitude)
        formData.append('longitude', address.longitude)
        formData.append('address', address.address)
        formData.append('rescheduled_date', rescheduledDate)
        formData.append('detailed_remarks', otherReason)
        formData.append('sub_remarks', cancelReason ? cancelReason : Subremarks)


        try {
            const token = getItem("token");
            await axios.post(
                `https://go-admin.daakit.com/api/rider/updateOrderStatus/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    }
                }
            );

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Order marked as undelivered',
                position: 'top',
            });

            setIsUndeliveredModalVisible(false);
            resetUndeliveredModal();
            navigation.goBack();

        } catch (error) {

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to update status',
                position: 'top',
            });
        } finally {
            setIsLoading(false);
        }
    };



    const resetUndeliveredModal = () => {
        setUndeliveredReason('');
        setOtherReasen('');
        setOtherReason('');
        setReschedule('');
    };

    const generateOtp = async (number) => {

        const token = getItem("token");
        // setLoading(true);
        try {
            const res = await axios.post(`${baseUrl}/api/otp/sendOtp`, {
                phone: number,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            Toast.show({
                type: 'success',
                text1: "OTP sent successfully",
                position: 'top',
            });

        } catch (err) {
            if (err.response.status === 400 || err?.response?.data?.message === 'OTP already sent. Please wait 2 minutes before requesting again.') {
                // setOtpPopup(order);

                return
            }
            Toast.show({
                type: 'error',
                text1: err.response?.data?.message || err.message || "Can't generate OTP",
                position: 'top',
            });

        } finally {
            //   setLoading(false);
        }
    };

    const verifyOtp = async ({ otpCode, order, collected_by }) => {
        console.log(otpCode, order.delivery_phone)
        const token = getItem("token");
        try {


            const res = await axios.post(`${baseUrl}/api/otp/verifyOTP`, {
                phone: order.delivery_phone,
                otp: otpCode,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            handleDeliveredWithOTP()

        } catch (err) {
            console.log(err.response)
            Toast.show({
                type: 'error',
                text1: err.response?.data?.message,
                position: 'top',
            });

        }
    };

    const handleStatusUpdate = async ({ id, status }) => {

        // if (status === 'undelivered') {
        //     setIsUndeliveredModalVisible(true);
        //     return;
        // }


        try {
            // https://go-admin.daakit.com/api/rider/updateOrderStatus
            setIsLoading(true)
            const token = getItem("token");
            await axios.post(
                `${baseUrl}/api/rider/updateOrderStatus/${id}`,
                {
                    status: status
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Status updated successfully',
                position: 'top',
            });
            navigation.goBack();
            // getOrders(true);
            // setModalVisible(false);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to update status',
                position: 'top',
            });
        } finally {
            setIsLoading(false)
        }

        // Alert.alert(
        //     'Update Status',
        //     `Change status to ${status.replace(/\b\w/g, l => l.toUpperCase())}?`,
        //     [
        //         { text: 'Cancel', style: 'cancel' },
        //         {
        //             text: 'Confirm',
        //             onPress: async () => {
        //                 try {
        //                     // https://go-admin.daakit.com/api/rider/updateOrderStatus
        //                     const token = getItem("token");
        //                     await axios.post(
        //                         `${baseUrl}/api/rider/updateOrderStatus/${id}`,
        //                         {
        //                             status: status
        //                         },
        //                         { headers: { Authorization: `Bearer ${token}` } }
        //                     );

        //                     Toast.show({
        //                         type: 'success',
        //                         text1: 'Success',
        //                         text2: 'Status updated successfully',
        //                         position: 'top',
        //                     });
        //                     navigation.goBack();
        //                     // getOrders(true);
        //                     // setModalVisible(false);
        //                 } catch (error) {
        //                     Toast.show({
        //                         type: 'error',
        //                         text1: 'Error',
        //                         text2: error.response?.data?.message || 'Failed to update status',
        //                         position: 'top',
        //                     });
        //                 }
        //             }
        //         }
        //     ]
        // );
    };

    const handleDeliveredWithOTP = async () => {
        console.log(otpCode, address)
        const token = getItem("token");
        if (!otpCode || otpCode.length < 4) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter valid OTP',
                position: 'top',
            });
            return;
        }

        if (!address.latitude || !address.longitude) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Fetching location... Please try again',
                position: 'top',
            });
            return;
        }
        setIsLoading(true);
        const formData = new FormData();
        formData.append('status', 'delivered');
        formData.append('otp', otpCode);
        formData.append('remarks', "Delivery verified with OTP");
        formData.append('latitude', address.latitude);
        formData.append('longitude', address.longitude);
        formData.append('address', address.address);

        console.log(formData)
        try {
            const token = getItem("token");
            await axios.post(
                `${baseUrl}/api/rider/updateOrderStatus/${selectedAssignment.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    }
                }
            );

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Order delivered successfully',
                position: 'top',
            });

            setIsDeliveredModalVisible(false);
            setOtpCode('');
            navigation.goBack();

        } catch (error) {

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to deliver order',
                position: 'top',
            });
        } finally {
            setIsLoading(false);
        }
    };


    const requestReschedule = [
        {
            label: "Unavailable at Location",
            value: "Unavailable at Location",
            icon: "person-outline",
        },
        {
            label: "Out of Station",
            value: "Out of Station",
            icon: "person-outline",
        },
        {
            label: "COD Amount Not Ready",
            value: "COD Amount Not Ready",
            icon: "person-outline",
        },
        {
            label: "Require Different Time Slot",
            value: "Require Different Time Slot",
            icon: "person-outline",
        },
        {
            label: "Other",
            value: "Other",
            icon: "person-outline",
        },
    ];



    const requestCancelled = [
        {
            label: 'Duplicate Order',
            value: 'Duplicate Order',
            icon: 'person-outline',
        },
        {
            label: 'Order Placed by Mistake',
            value: 'Order Placed by Mistake',
            icon: 'person-outline',
        },
        {
            label: 'COD Amount Not Ready',
            value: 'COD Amount Not Ready',
            icon: 'person-outline',
        },
        {
            label: 'Better Price Elsewhere',
            value: 'Better Price Elsewhere',
            icon: 'person-outline',
        },
        {
            label: 'Other',
            value: 'Other',
            icon: 'person-outline',
        },
    ];



    const undeliveredReasons = [
        {
            label: 'Address Incorrect / Incomplete',
            value: 'Address Incorrect / Incomplete',
            icon: 'person-outline',
        },
        {
            label: 'Customer Requested Reschedule',
            value: 'Customer Requested Reschedule',
            icon: 'calendar-outline',
        },
        {
            label: 'Customer Refused / Cancelled',
            value: 'Customer Refused / Cancelled',
            icon: 'call-outline',
        },
        {
            label: 'Delivery Attempted – Not Reachable',
            value: 'Delivery Attempted – Not Reachable',
            icon: 'close-circle-outline',
        },
        {
            label: 'Delivery Attempted – No Response',
            value: 'Delivery Attempted – No Response',
            icon: 'key-outline',
        },
        {
            label: 'Wrong Pincode / Address',
            value: 'Wrong Pincode / Address',
            icon: 'map-outline',
        },
        {
            label: 'Wrong Contact Details',
            value: 'Wrong Contact Details',
            icon: 'help-circle-outline',
        },
        {
            label: 'Vehicle / Weather / Road Issue',
            value: 'Vehicle / Weather / Road Issue',
            icon: 'help-circle-outline',
        },
        {
            label: 'Package Damaged',
            value: 'Package Damaged',
            icon: 'help-circle-outline',
        },
    ];

    const renderUndeliveredModal = () => (
        <Modal
            isVisible={isUndeliveredModalVisible}
            onBackdropPress={() => {
                setIsUndeliveredModalVisible(false);
                resetUndeliveredModal();
            }}
            onBackButtonPress={() => {
                setIsUndeliveredModalVisible(false);
                resetUndeliveredModal();
            }}
            swipeDirection="down"
            onSwipeComplete={() => {
                setIsUndeliveredModalVisible(false);
                resetUndeliveredModal();
            }}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={300}
            animationOutTiming={300}
            style={styles.modal}
            propagateSwipe={true}
            scrollOffset={undeliveredModalScrollOffset}
            scrollOffsetMax={400}
            panResponderThreshold={4}
            swipeThreshold={120}
            avoidKeyboard={true}
            backdropOpacity={0.5}
            useNativeDriver={false}
            useNativeDriverForBackdrop={true}
            hideModalContentWhileAnimating={true}
            onModalHide={() => {
                setUndeliveredModalScrollOffset(0)
                setCancelReason(null)
                setRescheduledDate(null)
                setOtherReason(null)

            }}
        >
            <View style={styles.modalContainer}>
                {/* Drag Handle */}
                <View style={styles.dragHandleContainer}>
                    <View style={styles.dragHandle} />
                </View>

                {/* Modal Header */}
                <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderLeft}>
                        <View style={styles.modalIconContainer}>
                            <Icon name="close-circle" size={24} color="#EEEEEE" />
                        </View>
                        <View>
                            <Text style={styles.modalTitle}>Mark as Undelivered</Text>
                            <Text style={styles.modalSubtitle}>Please select a reason</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            setIsUndeliveredModalVisible(false);
                            resetUndeliveredModal();
                        }}
                        style={styles.closeButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Icon name="close" size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    nestedScrollEnabled={true}
                    decelerationRate="normal"
                    scrollEventThrottle={16}
                    keyboardShouldPersistTaps="handled"
                    overScrollMode="never"
                    contentContainerStyle={styles.modalScrollContent}
                    onScroll={event => {
                        setUndeliveredModalScrollOffset(event.nativeEvent.contentOffset.y)
                    }}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.reasonLabel}>Reason for Undelivered</Text>

                        <Dropdown
                            style={styles.reasonDropdown}
                            containerStyle={styles.reasonDropdownContainer}
                            placeholderStyle={styles.reasonDropdownPlaceholder}
                            selectedTextStyle={styles.reasonDropdownSelectedText}
                            iconStyle={styles.reasonDropdownIcon}
                            data={undeliveredReasons}
                            maxHeight={280}
                            labelField="label"
                            valueField="value"
                            placeholder="Select reason"
                            value={undeliveredReason}
                            onChange={item => {
                                if (item.value === 'Customer Requested Reschedule') {
                                    setShowStartPicker(true)
                                } else {
                                    setShowStartPicker(false)
                                    setRescheduledDate(null)
                                    setCancelReason(null)
                                    setSubRemarksReason(null)
                                }
                                setUndeliveredReason(item.value)
                            }}
                            renderLeftIcon={() => {
                                const selectedReason = undeliveredReasons.find(item => item.value === undeliveredReason)

                                // return (
                                //     <Icon
                                //         name={selectedReason?.icon || 'help-circle-outline'}
                                //         size={20}
                                //         color={undeliveredReason ? '#F97316' : '#9CA3AF'}
                                //         style={styles.reasonDropdownLeftIcon}
                                //     />
                                // )
                            }}
                            renderRightIcon={() => (
                                <Icon name="chevron-down" size={20} color="#6B7280" />
                            )}
                            renderItem={(item) => {
                                const isSelected = undeliveredReason === item.value

                                return (
                                    <View style={[
                                        styles.reasonDropdownItem,
                                        isSelected && styles.reasonDropdownItemSelected
                                    ]}>
                                        <View style={styles.reasonItemLeft}>
                                            {/* <View style={[
                                                styles.reasonIconContainer,
                                                isSelected && styles.reasonIconContainerSelected
                                            ]}>
                                                
                                            </View> */}
                                            <Text style={[
                                                styles.reasonText,
                                                isSelected && styles.reasonTextSelected
                                            ]}>
                                                {item.label}
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <Icon name="checkmark-circle" size={20} color="#F97316" />
                                        )}
                                    </View>
                                )
                            }}
                        />

                        {
                            undeliveredReason === 'Customer Requested Reschedule' && (
                                <>
                                    <TouchableOpacity
                                        style={styles.reasonDropdown}
                                        onPress={() => {
                                            console.log('ddd');
                                            setShowStartPicker(true);
                                        }}
                                        className=' flex justify-center'
                                    >
                                        <Text style={{ fontWeight: '600' }}>
                                            {rescheduledDate || 'Select Date'}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )
                        }


                        {undeliveredReason === 'Customer Requested Reschedule' && (
                            <Dropdown
                                style={styles.reasonDropdown}
                                containerStyle={styles.reasonDropdownContainer}
                                placeholderStyle={styles.reasonDropdownPlaceholder}
                                selectedTextStyle={styles.reasonDropdownSelectedText}
                                iconStyle={styles.reasonDropdownIcon}
                                data={requestReschedule}
                                maxHeight={280}
                                labelField="label"
                                valueField="value"
                                placeholder="Select reason"
                                value={Subremarks}
                                onChange={item => {
                                    setSubRemarksReason(item.value);
                                }}
                                renderLeftIcon={() => {
                                    const selectedReason = requestReschedule.find(
                                        item => item.value === Subremarks
                                    );

                                    // return (
                                    //     <Icon
                                    //         name={selectedReason?.icon || 'help-circle-outline'}
                                    //         size={20}
                                    //         color={Subremarks ? '#F97316' : '#9CA3AF'}
                                    //         style={styles.reasonDropdownLeftIcon}
                                    //     />
                                    // );
                                }}
                                renderRightIcon={() => (
                                    <Icon name="chevron-down" size={20} color="#6B7280" />
                                )}
                                renderItem={item => {
                                    const isSelected = Subremarks === item.value;

                                    return (
                                        <View
                                            style={[
                                                styles.reasonDropdownItem,
                                                isSelected && styles.reasonDropdownItemSelected,
                                            ]}
                                        >
                                            <View style={styles.reasonItemLeft}>
                                                <Text
                                                    style={[
                                                        styles.reasonText,
                                                        isSelected && styles.reasonTextSelected,
                                                    ]}
                                                >
                                                    {item.label}
                                                </Text>
                                            </View>

                                            {isSelected && (
                                                <Icon name="checkmark-circle" size={20} color="#F97316" />
                                            )}
                                        </View>
                                    );
                                }}
                            />
                        )}


                        {
                            undeliveredReason === 'Customer Refused / Cancelled' && (

                                <Dropdown
                                    style={styles.reasonDropdown}
                                    containerStyle={styles.reasonDropdownContainer}
                                    placeholderStyle={styles.reasonDropdownPlaceholder}
                                    selectedTextStyle={styles.reasonDropdownSelectedText}
                                    iconStyle={styles.reasonDropdownIcon}
                                    data={requestCancelled}
                                    maxHeight={280}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select cancel reason"
                                    value={cancelReason}
                                    onChange={item => {
                                        setCancelReason(item.value);
                                    }}
                                    renderLeftIcon={() => {
                                        const selectedReason = requestCancelled.find(
                                            item => item.value === cancelReason
                                        );
                                        // return (
                                        //     <Icon
                                        //         name={selectedReason?.icon || 'help-circle-outline'}
                                        //         size={20}
                                        //         color={cancelReason ? '#EF4444' : '#9CA3AF'}
                                        //         style={styles.reasonDropdownLeftIcon}
                                        //     />
                                        // );
                                    }}
                                    renderRightIcon={() => (
                                        <Icon name="chevron-down" size={20} color="#6B7280" />
                                    )}
                                    renderItem={item => {
                                        const isSelected = cancelReason === item.value;

                                        return (
                                            <View
                                                style={[
                                                    styles.reasonDropdownItem,
                                                    isSelected && styles.reasonDropdownItemSelected,
                                                ]}
                                            >
                                                <View style={styles.reasonItemLeft}>
                                                    <Text
                                                        style={[
                                                            styles.reasonText,
                                                            isSelected && styles.reasonTextSelected,
                                                        ]}
                                                    >
                                                        {item.label}
                                                    </Text>
                                                </View>

                                                {isSelected && (
                                                    <Icon
                                                        name="checkmark-circle"
                                                        size={20}
                                                        color="#EF4444"
                                                    />
                                                )}
                                            </View>
                                        );
                                    }}
                                />
                            )
                        }






                        <View style={styles.otherReasonContainer}>
                            <Text style={styles.reasonLabel}>Other Reason</Text>

                            <TextInput
                                placeholder="Please specify the reason..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                value={otherReason}
                                onChangeText={setOtherReason}
                                style={styles.otherReasonInput}
                            />
                        </View>


                        {undeliveredReason === 'Customer Requested Reschedule' && (
                            <View style={styles.otherReasonContainer}>
                                {showStartPicker && Platform.OS === 'android' && (
                                    <DateTimePicker
                                        value={tempStartDate ? new Date(tempStartDate) : new Date()}
                                        mode="date"
                                        display="calendar"
                                        onChange={(event, selectedDate) => {


                                            setRescheduledDate(selectedDate.toISOString().split('T')[0]);
                                            setShowStartPicker(false);
                                        }}
                                    />
                                )}
                            </View>
                        )}

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsUndeliveredModalVisible(false);
                                    resetUndeliveredModal();
                                }}
                                style={styles.cancelButton}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={async () => {
                                    await handleUndeliveredSubmit({
                                        id: selectedAssignment.id,
                                        status: "ndr",
                                        otherReasen: otherReason,
                                        undeliveredReason: undeliveredReason,


                                    });
                                }}
                                disabled={isLoading || !undeliveredReason}
                                style={[
                                    styles.submitButton,
                                    (!undeliveredReason || isLoading) && styles.submitButtonDisabled
                                ]}
                                activeOpacity={0.7}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Submit</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );

    const renderDeliveredModal = () => (
        <Modal
            isVisible={isDeliveredModalVisible}
            onBackdropPress={() => {
                setIsDeliveredModalVisible(false);
                setOtpCode('');
                setDeliveryMethod('');
            }}
            onBackButtonPress={() => {
                setIsDeliveredModalVisible(false);
                setOtpCode('');
                setDeliveryMethod('');
            }}
            swipeDirection="down"
            onSwipeComplete={() => {
                setIsDeliveredModalVisible(false);
                setOtpCode('');
                setDeliveryMethod('');
            }}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={300}
            animationOutTiming={300}
            style={styles.modal}
            propagateSwipe={true}
            scrollOffset={deliveredModalScrollOffset}
            scrollOffsetMax={400}
            panResponderThreshold={4}
            swipeThreshold={120}
            avoidKeyboard={true}
            backdropOpacity={0.5}
            useNativeDriver={false}
            useNativeDriverForBackdrop={true}
            hideModalContentWhileAnimating={true}
            onModalHide={() => setDeliveredModalScrollOffset(0)}
        >
            <View style={styles.modalContainer}>
                {/* Drag Handle */}
                <View style={styles.dragHandleContainer}>
                    <View style={styles.dragHandle} />
                </View>

                {/* Modal Header */}
                <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderLeft}>
                        <View style={[styles.modalIconContainer, { backgroundColor: '#D1FAE5' }]}>
                            <Icon name="checkmark-circle" size={24} color="#10B981" />
                        </View>
                        <View>
                            <Text style={styles.modalTitle}>Mark as Delivered</Text>
                            <Text style={styles.modalSubtitle}>Choose verification method</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            setIsDeliveredModalVisible(false);
                            setOtpCode('');
                            setDeliveryMethod('');
                        }}
                        style={styles.closeButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Icon name="close" size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {/* Method Selector */}
                <View style={styles.methodSelector}>
                    <TouchableOpacity
                        style={[
                            styles.methodButton,
                            deliveryMethod === 'otp' && styles.methodButtonActive
                        ]}
                        onPress={async () => {

                            await generateOtp(selectedAssignment.delivery_phone)
                            setDeliveryMethod('otp')
                        }}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name="keypad-outline"
                            size={20}
                            color={deliveryMethod === 'otp' ? '#F97316' : '#6B7280'}
                        />
                        <Text style={[
                            styles.methodButtonText,
                            deliveryMethod === 'otp' && styles.methodButtonTextActive
                        ]}>
                            OTP
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.methodButton,
                            deliveryMethod === 'photo' && styles.methodButtonActive
                        ]}
                        onPress={() => {
                            setDeliveryMethod('photo');
                            setIsDeliveredModalVisible(false);
                            navigation.navigate('DeliveryProof', {
                                order: selectedAssignment,
                                address: address
                            });
                        }}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name="camera-outline"
                            size={20}
                            color={deliveryMethod === 'photo' ? '#F97316' : '#6B7280'}
                        />
                        <Text style={[
                            styles.methodButtonText,
                            deliveryMethod === 'photo' && styles.methodButtonTextActive
                        ]}>
                            Photo Proof
                        </Text>
                    </TouchableOpacity>

                </View>

                {deliveryMethod === 'otp' && (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        bounces={true}
                        nestedScrollEnabled={true}
                        decelerationRate="normal"
                        scrollEventThrottle={16}
                        keyboardShouldPersistTaps="handled"
                        overScrollMode="never"
                        contentContainerStyle={styles.modalScrollContent}
                        onScroll={event => {
                            setDeliveredModalScrollOffset(event.nativeEvent.contentOffset.y)
                        }}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.otpContainer}>
                                <Text style={styles.otpLabel}>Enter OTP</Text>
                                <Text style={styles.otpHint}>
                                    Please ask the customer for the 4-digit OTP
                                </Text>

                                <TextInput
                                    style={styles.otpInput}
                                    placeholder="0000"
                                    placeholderTextColor="#D1D5DB"
                                    keyboardType="number-pad"
                                    maxLength={4}
                                    value={otpCode}
                                    onChangeText={setOtpCode}
                                    autoFocus={true}
                                />

                                <View style={styles.modalFooter}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setIsDeliveredModalVisible(false);
                                            setOtpCode('');
                                        }}
                                        style={styles.cancelButton}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => {
                                            verifyOtp({
                                                otpCode,
                                                order: selectedAssignment
                                            })
                                        }}
                                        disabled={isLoading || otpCode.length < 4}
                                        style={[
                                            styles.submitButton,
                                            (isLoading || otpCode.length < 4) && styles.submitButtonDisabled
                                        ]}
                                        activeOpacity={0.7}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <Text style={styles.submitButtonText}>Verify & Deliver</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                )}
            </View>
        </Modal>
    );

    // Get location when undelivered modal opens
    useEffect(() => {
        GetLocation();
        if (isUndeliveredModalVisible && !locationFetchedRef.current) {
            GetLocation();
        }
    }, [isUndeliveredModalVisible]);

    // Get location when delivered modal opens
    useEffect(() => {
        if (isDeliveredModalVisible && deliveryMethod === 'otp' && !locationFetchedRef.current) {
            GetLocation();
        }
    }, [isDeliveredModalVisible, deliveryMethod]);

    const InfoCard = ({ title, icon, iconBg, iconColor, children }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: iconBg }]}>
                    <Icon name={icon} size={20} color={iconColor} />
                </View>
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            {children}
        </View>
    );

    const InfoRow = ({ label, value, icon, onPress }) => (
        <TouchableOpacity
            style={styles.infoRow}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.infoRowLeft}>
                {icon && (
                    <View style={styles.infoRowIcon}>
                        <Icon name={icon} size={16} color="#9CA3AF" />
                    </View>
                )}
                <View>
                    <Text style={styles.infoRowLabel}>{label}</Text>
                    <Text style={[styles.infoRowValue, onPress && styles.infoRowValueLink]}>
                        {value || 'N/A'}
                    </Text>
                </View>
            </View>
            {onPress && <Icon name="chevron-forward" size={18} color="#9CA3AF" />}
        </TouchableOpacity>
    );


    const CodPaymentModal = () => (
        <Modal
            isVisible={isCodPaymentModalVisible}
            onBackdropPress={() => {
                setIsCodPaymentModalVisible(false);
            }}
            onBackButtonPress={() => {
                setIsCodPaymentModalVisible(false);
            }}
            swipeDirection="down"
            onSwipeComplete={() => {
                setIsCodPaymentModalVisible(false);
            }}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={300}
            animationOutTiming={300}
            style={styles.modal}
            propagateSwipe={true}
            scrollOffset={codPaymentModalScrollOffset}
            scrollOffsetMax={400}
            panResponderThreshold={4}
            swipeThreshold={120}
            avoidKeyboard={true}
            backdropOpacity={0.5}
            useNativeDriver={false}
            useNativeDriverForBackdrop={true}
            hideModalContentWhileAnimating={true}
            onModalHide={() => setCodPaymentModalScrollOffset(0)}
        >
            <View className="bg-white rounded-t-3xl pb-6">

                {/* Drag Handle */}
                <View className="items-center pt-3 pb-2">
                    <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </View>

                {/* Modal Header */}
                <View className="flex-row justify-between items-center px-6 py-3">
                    <View className="flex-row items-center">

                        {/* Icon Container */}
                        <View className="w-11 h-11 rounded-xl bg-orange-100 items-center justify-center mr-3">
                            <Icon name="cash-outline" size={24} color="#F97316" />
                        </View>

                        <View>
                            <Text className="text-lg font-bold text-gray-900">
                                COD Payment
                            </Text>
                        </View>

                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    nestedScrollEnabled={true}
                    decelerationRate="normal"
                    scrollEventThrottle={16}
                    keyboardShouldPersistTaps="handled"
                    overScrollMode="never"
                    contentContainerStyle={styles.modalScrollContent}
                    onScroll={event => {
                        setCodPaymentModalScrollOffset(event.nativeEvent.contentOffset.y)
                    }}
                >
                    {/* Amount Section */}
                    <View className="px-6 items-center justify-center py-6">
                        <Text className="text-2xl font-semibold text-green-500">
                            ₹{selectedAssignment?.collectable_amount}
                        </Text>

                        <Text className="text-gray-500 mt-1">
                            Amount to collect
                        </Text>
                    </View>

                    {/* Button */}
                    <View className="px-6">
                        <GenerateUPI
                            //   onClick={setCurrentState}
                            orderId={selectedAssignment?.id}
                            amount={Number(selectedAssignment?.collectable_amount)}
                        // className="w-full"
                        />
                        {/* selectedAssignment?.collectable_amount */}
                        <TouchableOpacity
                            className="border-2 border-gray-300 py-4 rounded-xl items-center active:bg-gray-100"
                            onPress={() => setCodPopup(null)}
                        >
                            <Text className="text-gray-700 font-semibold">
                                Mark as Cash Collected
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

            </View>

        </Modal>
    );



    return (

        <View style={styles.container} >
            <Header title="Order Details" showBack={true} />
            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >



                <InfoCard
                    title="Order Information"
                    icon="cart-outline"
                    iconBg="#F3E8FF"
                    iconColor="#8B5CF6"
                >
                    <View style={styles.orderInfoGrid}>
                        <View style={styles.orderInfoRow}>
                            <Text style={styles.orderInfoLabel}>AWB Number</Text>
                            <Text style={styles.orderInfoValue}>
                                {selectedAssignment?.awb_number || 'N/A'}
                            </Text>
                        </View>
                        {
                            (selectedAssignment.status === 'out for delivery' || selectedAssignment.status === 'delivered') && (
                                <View style={styles.orderInfoRow}>
                                    <Text style={styles.orderInfoLabel}>Payment Type</Text>
                                    <View style={[
                                        styles.paymentBadge,
                                        selectedAssignment?.order_type === 'cod' ? styles.codBadge : styles.prepaidBadge
                                    ]}>
                                        <Currency
                                            name={selectedAssignment?.order_type === 'cod' ? 'cash' : 'credit-card'}
                                            size={12}
                                            color={selectedAssignment?.order_type === 'cod' ? '#DC2626' : '#059669'}
                                        />
                                        <Text style={[
                                            styles.paymentBadgeText,
                                            selectedAssignment?.order_type === 'cod' ? styles.codText : styles.prepaidText
                                        ]}>
                                            {selectedAssignment?.order_type?.toUpperCase() || 'N/A'}
                                        </Text>
                                    </View>
                                </View>
                            )
                        }
                        {
                            selectedAssignment?.collectable_amount && (

                                <View style={styles.orderInfoRow}>
                                    <Text style={styles.orderInfoLabel}>Collectable Amount</Text>
                                    <View style={styles.amountContainer}>
                                        <Currency name="currency-inr" size={18} color="#059669" />
                                        <Text style={styles.amountValue}>
                                            {selectedAssignment?.collectable_amount || '0'}
                                        </Text>
                                    </View>
                                </View>
                            )
                        }
                    </View>
                </InfoCard>

                {/* Pickup Details - Conditional */}
                {['in transit', 'assigned', 'undelivered assigned'].includes(selectedAssignment?.status) && (
                    <InfoCard
                        title="Pickup Details"
                        icon="business-outline"
                        iconBg="#E6F0FF"
                        iconColor="#0446DB"
                    >
                        <InfoRow
                            label="Contact Person"
                            value={selectedAssignment?.pickup_contact_name}
                            icon="person-outline"
                        />

                        <InfoRow
                            label="Phone Number"
                            value={selectedAssignment?.pickup_phone || 'No phone number'}
                            icon="call-outline"
                            onPress={() => handleCall(selectedAssignment?.pickup_phone)}
                        />

                        <View style={styles.addressContainer}>
                            <View style={styles.addressIcon}>
                                <Icon name="location-outline" size={18} color="#0446DB" />
                            </View>
                            <View style={styles.addressContent}>
                                <Text style={styles.addressLabel}>Pickup Address</Text>
                                <Text style={styles.addressText}>
                                    {selectedAssignment?.pickup_address_line || 'N/A'}
                                </Text>
                                {(selectedAssignment?.pickup_city || selectedAssignment?.pickup_state || selectedAssignment?.pickup_pincode) && (
                                    <Text style={styles.addressMeta}>
                                        {[selectedAssignment?.pickup_city, selectedAssignment?.pickup_state].filter(Boolean).join(', ')}
                                        {selectedAssignment?.pickup_pincode ? ` - ${selectedAssignment?.pickup_pincode}` : ''}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </InfoCard>
                )}
                <InfoCard
                    title="Delivery Details"
                    icon="location"
                    iconBg="#E6F7F0"
                    iconColor="#10B981"
                >
                    <InfoRow
                        label="Contact Person"
                        value={selectedAssignment?.delivery_contact_name}
                        icon="person-outline"
                    />

                    {console.log(selectedAssignment)}
                    {selectedAssignment?.status !== 'delivered' && (

                        // <View className=' flex-row gap-3'>
                        //     <TouchableOpacity
                        //         className="bg-green-500 flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center"
                        //         onPress={() => handleCall(selectedAssignment?.id)}
                        //         activeOpacity={0.7}
                        //     >
                        //         {/* Icon */}
                        //         <View className="mr-2">
                        //             <Icon name="call-outline" size={18} color="#ffffff" />
                        //         </View>

                        //         {/* Text */}
                        //         <Text className="text-white font-semibold text-base">
                        //             {callModel || 'Call Customer'}
                        //         </Text>
                        //     </TouchableOpacity>
                        //     <TouchableOpacity
                        //         className="bg-green-500 flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center"
                        //         onPress={() =>  {
                        //             makeCall(selectedAssignment?.delivery_phone)
                        //         }}
                        //         activeOpacity={0.7}
                        //     >
                        //         {/* Icon */}
                        //         <View className="mr-2">
                        //             <Icon name="call-outline" size={18} color="#ffffff" />
                        //         </View>

                        //         {/* Text */}
                        //         <Text className="text-white font-semibold text-base">
                        //             {'Direct Call'}
                        //         </Text>
                        //     </TouchableOpacity>
                        // </View>
                        <View className="flex-row gap-3">

                            <TouchableOpacity
                                className="bg-green-500 flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center"
                                // onPress={() => handleCall(selectedAssignment?.id)}
                                onPress={() => setShowCallOptions(true)}
                            >
                                <Icon name="call-outline" size={18} color="#fff" />
                                <Text className="text-white font-semibold text-base ml-2">
                                    {callModel || "Call Customer"}
                                </Text>
                            </TouchableOpacity>

                            {/* <TouchableOpacity
                                className="bg-[#0446DB] py-3 px-4 rounded-xl flex-row items-center"
                                onPress={() => setShowCallOptions(true)}
                            >
                                <Icon name="ellipsis-vertical" size={18} color="#fff" />
                            </TouchableOpacity> */}

                        </View>
                    )
                    }




                    <View style={styles.addressContainer}>
                        <View style={styles.addressIcon}>
                            <Icon name="location-outline" size={18} color="#10B981" />
                        </View>
                        <View style={styles.addressContent}>
                            <Text style={styles.addressLabel}>Delivery Address</Text>
                            <Text style={styles.addressText}>
                                {selectedAssignment?.delivery_address_line || 'N/A'}
                            </Text>
                            {(selectedAssignment?.delivery_city || selectedAssignment?.delivery_state || selectedAssignment?.delivery_pincode) && (
                                <Text style={styles.addressMeta}>
                                    {[selectedAssignment?.delivery_city, selectedAssignment?.delivery_state].filter(Boolean).join(', ')}
                                    {selectedAssignment?.delivery_pincode ? ` - ${selectedAssignment?.delivery_pincode}` : ''}
                                </Text>
                            )}
                        </View>
                    </View>
                </InfoCard>
                <Modal
                    isVisible={showCallOptions}
                    animationIn="slideInUp"
                    animationOut="slideOutDown"
                    style={styles.modal}
                    onBackdropPress={() => setShowCallOptions(false)}
                    onBackButtonPress={() => setShowCallOptions(false)}
                    onSwipeComplete={() => setShowCallOptions(false)}
                    swipeDirection="down"
                    backdropOpacity={0.5}
                >
                    <View style={styles.bottomSheet}>

                        <View className="items-center pb-4">
                            <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </View>

                        <Text className="text-lg font-bold text-gray-900 mb-5">
                            Call Options
                        </Text>

                        <TouchableOpacity
                            className="flex-row items-center py-4 border-b border-gray-200"
                            onPress={() => {
                                setShowCallOptions(false);
                                handleCall(selectedAssignment?.id);
                            }}
                        >
                            <Icon name="call-outline" size={22} color="#22c55e" />
                            <Text className="ml-3 text-base font-medium">
                                Call Customer
                            </Text>
                        </TouchableOpacity>

                        

                        <TouchableOpacity
                            className="flex-row items-center py-4"
                            onPress={() => {
                                setShowCallOptions(false);
                                console.log(selectedAssignment)
                                makeCall(selectedAssignment?.delivery_phone);
                            }}
                        >
                            <Icon name="person-outline" size={22} color="#22c55e" />
                            <Text className="ml-3 text-base font-medium">
                               Direct Call
                            </Text>
                        </TouchableOpacity>

                    </View>
                </Modal>
                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    {/* Assigned Status Actions */}
                    {['assigned', 'in transit', 'undelivered assigned'].includes(selectedAssignment?.status) && (
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                className=' flex-row'
                                onPress={() => openNavigation({
                                    latitude: selectedAssignment?.pickup_latitude,
                                    longitude: selectedAssignment?.pickup_longitude,
                                    address: selectedAssignment?.pickup_address_line + ' ' + selectedAssignment?.pickup_city + ' ' + selectedAssignment?.pickup_state,
                                    navigationTarget: 'pickup',
                                })}
                                style={[styles.actionButton, styles.navigateButton]}
                                activeOpacity={0.8}
                            >
                                <Icon name="navigate-outline" size={22} color="white" />
                                <Text style={styles.actionButtonText}>Maps</Text>
                            </TouchableOpacity>

                            {
                                isLoading ? (
                                    <>
                                        <TouchableOpacity
                                            className='flex-row'

                                            style={[styles.actionButton, styles.outForDeliveryButton]}
                                            activeOpacity={0.8}
                                        >

                                            <Text style={styles.actionButtonText}>
                                                <ActivityIndicator color="#fff" />
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            className='flex-row'
                                            onPress={() => handleStatusUpdate({
                                                id: selectedAssignment.id,
                                                status: 'out for delivery'
                                            })}
                                            style={[styles.actionButton, styles.outForDeliveryButton]}
                                            activeOpacity={0.8}
                                        >
                                            <Icon name="bicycle-outline" size={22} color="white" />
                                            <Text style={styles.actionButtonText}>Out for Delivery</Text>
                                        </TouchableOpacity>
                                    </>
                                )
                            }

                        </View>
                    )}

                    {/* Out for Delivery Actions */}
                    {selectedAssignment?.status === 'out for delivery' && (
                        <View className="flex-row flex-wrap justify-between gap-2 px-4 mt-4">
                            <TouchableOpacity
                                className="flex-row items-center justify-center bg-blue-500 rounded-xl py-3.5 px-3 w-[48%]"
                                // onPress={() => openNavigation(28.644800, 77.216721)}
                                onPress={() => openNavigation({
                                    latitude: selectedAssignment?.delivery_latitude || selectedAssignment?.latitude,
                                    longitude: selectedAssignment?.delivery_longitude || selectedAssignment?.longitude,
                                    address: selectedAssignment?.delivery_address_line + ' ' + selectedAssignment?.delivery_city + ' ' + selectedAssignment?.delivery_state,
                                    navigationTarget: 'delivery',
                                })}
                                activeOpacity={0.8}
                            >
                                <Icon name="navigate-outline" size={28} color="white" />
                                <Text className="text-white font-semibold text-sm ml-2">Maps</Text>
                            </TouchableOpacity>
                            {
                                selectedAssignment?.order_type === 'cod' && (

                                    <TouchableOpacity
                                        className="flex-row items-center justify-center bg-purple-500 rounded-xl py-3.5 px-3 w-[48%]"
                                        activeOpacity={0.8}
                                        onPress={() => setIsCodPaymentModalVisible(true)}
                                    >
                                        <MaterialIcon name="payment" size={28} color="white" />
                                        <Text className="text-white font-semibold text-sm ml-2">Payment</Text>
                                    </TouchableOpacity>
                                )
                            }

                            <TouchableOpacity
                                className="flex-row items-center justify-center bg-green-500 rounded-xl py-3.5 px-3 w-[48%]"
                                onPress={async () => {

                                    setIsDeliveredModalVisible(true);
                                }}
                                activeOpacity={0.8}
                            >
                                <Icon name="checkmark-circle-outline" size={28} color="white" />
                                <Text className="text-white font-semibold text-sm ml-2">Delivered</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`flex-row items-center justify-center bg-red-500 rounded-xl py-3.5 px-3 ${selectedAssignment?.order_type === 'cod' ? "w-[48%]" : "w-full"} `}
                                onPress={async () => {
                                    await GetLocation();
                                    setIsUndeliveredModalVisible(true);
                                }}
                                activeOpacity={0.8}
                            >
                                <Icon name="close-circle-outline" size={28} color="white" />
                                <Text className="text-white font-semibold text-sm ml-2">Undelivered</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Delivered Status */}
                    {selectedAssignment?.status === 'delivered' && (
                        <View style={styles.statusContainer}>
                            <View style={styles.statusIconContainer}>
                                <Icon name="checkmark-circle" size={48} color="#10B981" />
                            </View>
                            <Text style={styles.statusTitle}>Order Delivered</Text>
                            <Text style={styles.statusDescription}>
                                This order has been successfully delivered
                            </Text>
                        </View>
                    )}

                    {/* Cancelled Status */}
                    {selectedAssignment?.status === 'cancelled' && (
                        <View style={[styles.statusContainer, styles.cancelledContainer]}>
                            <View style={[styles.statusIconContainer, styles.cancelledIconContainer]}>
                                <Icon name="close-circle" size={48} color="#EF4444" />
                            </View>
                            <Text style={[styles.statusTitle, styles.cancelledTitle]}>Order Cancelled</Text>
                            <Text style={styles.statusDescription}>
                                This order has been cancelled
                            </Text>
                        </View>
                    )}
                </View>

                {/* Loading Indicator for Location */}
                {isGettingLocation && (
                    <View style={styles.locationLoadingContainer}>
                        <ActivityIndicator size="small" color="#F97316" />
                        <Text style={styles.locationLoadingText}>Getting your location...</Text>
                    </View>
                )}

            </ScrollView>


            {CodPaymentModal()}
            {renderUndeliveredModal()}
            {renderDeliveredModal()}

        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    scrollContent: {
        paddingBottom: 24,
        paddingTop: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    orderInfoGrid: {
        gap: 12,
    },
    orderInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    orderInfoLabel: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    orderInfoValue: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111827',
    },
    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    codBadge: {
        backgroundColor: '#FEE2E2',
    },
    prepaidBadge: {
        backgroundColor: '#D1FAE5',
    },
    paymentBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    codText: {
        color: '#DC2626',
    },
    prepaidText: {
        color: '#059669',
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    amountValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#059669',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    infoRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoRowIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    infoRowLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    infoRowValue: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111827',
    },
    infoRowValueLink: {
        color: '#F97316',
    },
    addressContainer: {
        flexDirection: 'row',
        paddingVertical: 12,
    },
    addressIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    addressContent: {
        flex: 1,
    },
    addressLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 4,
    },
    addressMeta: {
        fontSize: 13,
        color: '#6B7280',
    },
    actionContainer: {
        marginBottom: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    navigateButton: {
        backgroundColor: '#0446DB',
    },
    outForDeliveryButton: {
        backgroundColor: '#10B981',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    gridButton: {
        width: '48%',
        aspectRatio: 1.2,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    navigateGridButton: {
        backgroundColor: '#0446DB',
    },
    paymentGridButton: {
        backgroundColor: '#8B5CF6',
    },
    deliveredGridButton: {
        backgroundColor: '#10B981',
    },
    undeliveredGridButton: {
        backgroundColor: '#F97316',
    },
    gridButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    statusContainer: {
        backgroundColor: '#F0FDF4',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
    },
    cancelledContainer: {
        backgroundColor: '#FEF2F2',
    },
    statusIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#D1FAE5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    cancelledIconContainer: {
        backgroundColor: '#FEE2E2',
    },
    statusTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#10B981',
        marginBottom: 8,
    },
    cancelledTitle: {
        color: '#EF4444',
    },
    statusDescription: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    locationLoadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        marginBottom: 16,
    },
    locationLoadingText: {
        fontSize: 13,
        color: '#4B5563',
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: '80%',
    },
    modalScrollContent: {
        paddingBottom: 8,
    },
    dragHandleContainer: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 8,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modalIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#0446DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    modalSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
    },
    reasonLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 16,
    },
    reasonDropdown: {
        height: 52,
        backgroundColor: 'white',
        borderRadius: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 16,
    },
    reasonDropdownContainer: {
        borderRadius: 14,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    reasonDropdownPlaceholder: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    reasonDropdownSelectedText: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
    },
    reasonDropdownIcon: {
        width: 20,
        height: 20,
    },
    reasonDropdownLeftIcon: {
        marginRight: 10,
    },
    reasonDropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'white',
    },
    reasonDropdownItemSelected: {
        backgroundColor: '#FEF3C7',
    },
    reasonsContainer: {
        gap: 8,
        marginBottom: 16,
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    reasonItemSelected: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F97316',
    },
    reasonItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    reasonIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reasonIconContainerSelected: {
        backgroundColor: 'white',
    },
    reasonText: {
        fontSize: 14,
        color: '#374151',
    },
    reasonTextSelected: {
        fontWeight: '600',
        color: '#F97316',
    },
    otherReasonContainer: {
        marginTop: 8,
        marginBottom: 20,
    },
    otherReasonInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#111827',
        backgroundColor: 'white',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4B5563',
    },
    submitButton: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: '#F97316',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#FBD1A6',
    },
    submitButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: 'white',
    },
    methodSelector: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    methodButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    methodButtonActive: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F97316',
    },
    methodButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    methodButtonTextActive: {
        color: '#F97316',
    },
    otpContainer: {
        paddingVertical: 16,
    },
    otpLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    otpHint: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 20,
    },
    otpInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 24,
        fontWeight: '600',
        color: '#111827',
        backgroundColor: '#F9FAFB',
        textAlign: 'center',
        letterSpacing: 8,
        marginBottom: 24,
    },
    modal: {
    justifyContent: "flex-end",
    margin: 0,
  },

  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    minHeight: 220,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
  },



});

export default OrderDetailsScreen;
