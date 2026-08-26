// import React, { useState } from 'react';
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     StyleSheet,
//     StatusBar,
//     Animated,
//     KeyboardAvoidingView,
//     Platform,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import Toast from 'react-native-toast-message';
// import ToastManager from 'toastify-react-native/components/ToastManager';
// import Icon from 'react-native-vector-icons/Feather';
// import LottieView from 'lottie-react-native';

// import CustomSafeAreaView from '@components/global/CustomSafeAreaView';
// import CustomText from '@components/ui/CustomText';
// import CustomButten from '@components/ui/CustomButten';
// import { RFValue } from 'react-native-responsive-fontsize';
// import { Colors, Fonts } from '@utils/Constants';
// import AxiosInstance from '../services/AxiosInstance';
// import { resetAndNavigate } from '@utils/NavigationUtils';

// const baseURL = 'https://go-admin.daakit.com';

// const RegisterScreen = () => {
//     const navigation = useNavigation();

//     const [loading, setLoading] = useState(false);
//     const [otpLoading, setOtpLoading] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);

//     const [otpSent, setOtpSent] = useState(false);
//     const [otpVerified, setOtpVerified] = useState(false);
//     const [otp, setOtp] = useState('');

//     const [registerData, setRegisterData] = useState({
//         name: '',
//         email: '',
//         phone_number: '',
//         password: '',
//         referral_code: '',
//     });

//     const handlePhoneChange = phone_number => {
//         setRegisterData(prev => ({
//             ...prev,
//             phone_number,
//         }));

//         setOtp('');
//         setOtpSent(false);
//         setOtpVerified(false);
//     };

//     const handleSendOtp = async () => {
//         if (!registerData.phone_number?.trim()) {
//             Toast.show({
//                 type: 'error',
//                 text1: 'Phone number is required.',
//                 position: 'top',
//             });
//             return;
//         }

//         if (registerData.phone_number.length !== 10) {
//             Toast.show({
//                 type: 'error',
//                 text1: 'Please enter valid 10 digit phone number.',
//                 position: 'top',
//             });
//             return;
//         }

//         try {
//             setOtpLoading(true);

//             const check = await AxiosInstance.post(
//                 `${baseURL}/api/check/user`,
//                 {
//                     phone: registerData.phone_number,
//                     user_type: "rider"
//                 },
//             );

//             if (check.data.exists) {
//                 Toast.show({
//                     type: 'error',
//                     text1: check?.data?.message,
//                     position: 'top',
//                 });
//                 re
//             }

//             const res = await AxiosInstance.post(
//                 `${baseURL}/api/otp/sendsignupotp`,
//                 {
//                     phone: registerData.phone_number,
//                 },
//             );

//             setOtpSent(true);

//             Toast.show({
//                 type: 'success',
//                 text1: res?.data?.message || 'OTP sent successfully.',
//                 position: 'top',
//             });
//         } catch (error) {
//             console.log(error.response)
//             Toast.show({
//                 type: 'error',
//                 text1: error?.response?.data?.message || 'OTP send failed.',
//                 position: 'top',
//             });
//         } finally {
//             setOtpLoading(false);
//         }
//     };

//     const handleVerifyOtp = async () => {
//         if (!otp?.trim()) {
//             Toast.show({
//                 type: 'error',
//                 text1: 'Please enter OTP.',
//                 position: 'top',
//             });
//             return;
//         }

//         try {

//             console.log(otp, registerData.phone_number)
//             setOtpLoading(true);

//             const res = await AxiosInstance.post(
//                 `${baseURL}/api/otp/verifysignupotp`,
//                 {
//                     phone: registerData.phone_number,
//                     otp,
//                 },
//             );



//             setOtpVerified(true);

//             Toast.show({
//                 type: 'success',
//                 text1: res?.data?.message || 'Phone number verified.',
//                 position: 'top',
//             });
//         } catch (error) {
//             setOtpVerified(false);
//             console.log()
//             Toast.show({
//                 type: 'error',
//                 text1: error?.response?.data?.message || 'Invalid OTP.',
//                 position: 'top',
//             });
//         } finally {
//             setOtpLoading(false);
//         }
//     };

//     const handleRegister = async () => {
//         if (!registerData.name?.trim()) {
//             Toast.show({
//                 type: 'error',
//                 text1: 'Name is required.',
//                 position: 'top',
//             });
//             return;
//         }

//         if (!registerData.email?.trim()) {
//             Toast.show({
//                 type: 'error',
//                 text1: 'Email is required.',
//                 position: 'top',
//             });
//             return;
//         }

//         if (!registerData.phone_number?.trim()) {
//             Toast.show({
//                 type: 'error',
//                 text1: 'Phone number is required.',
//                 position: 'top',
//             });
//             return;
//         }

//         if (!otpVerified) {
//             Toast.show({
//                 type: 'error',
//                 text1: 'Please verify your phone number.',
//                 position: 'top',
//             });
//             return;
//         }

//         if (!registerData.password?.trim()) {
//             Toast.show({
//                 type: 'error',
//                 text1: 'Password is required.',
//                 position: 'top',
//             });
//             return;
//         }

//         try {
//             setLoading(true);

//             const res = await AxiosInstance.post(
//                 `${baseURL}/api/rider/createRider`,
//                 registerData,
//                 {
//                     headers: {
//                         Accept: 'application/json',
//                     },
//                 },
//             );

//             Toast.show({
//                 type: 'success',
//                 text1: res?.data?.message || 'Registration successful!',
//                 position: 'top',
//             });

//             resetAndNavigate('Login');
//         } catch (error) {
//             Toast.show({
//                 type: 'error',
//                 text1: error?.response?.data?.message || 'Registration failed.',
//                 position: 'top',
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <View style={styles.container}>
//             <StatusBar
//                 translucent
//                 barStyle="dark-content"
//                 backgroundColor={Colors.border}
//             />

//             <CustomSafeAreaView>
//                 <KeyboardAvoidingView
//                     style={styles.container}
//                     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//                 >
//                     <Animated.ScrollView
//                         bounces={false}
//                         keyboardDismissMode="none"
//                         keyboardShouldPersistTaps="always"
//                         showsVerticalScrollIndicator={false}
//                         contentContainerStyle={styles.subContainer}
//                     >
//                         <View className="items-center mb-8">
//                             <LottieView
//                                 autoPlay
//                                 loop
//                                 style={{
//                                     width: 150,
//                                     height: 150,
//                                 }}
//                                 source={require('../assets/animations/delivery_man.json')}
//                                 hardwareAccelerationAndroid
//                             />

//                             <Text
//                                 className={`text-[28px] text-[${Colors.primary}] font-extrabold tracking-tight mb-2`}
//                             >
//                                 Create Account
//                             </Text>

//                             <CustomText fontSize={RFValue(9)}>
//                                 Register to start delivering with Daakit
//                             </CustomText>
//                         </View>

//                         <View className="mb-3">
//                             <CustomText fontSize={RFValue(9)} fontFamily={Fonts.SemiBold}>
//                                 Name
//                             </CustomText>

//                             <View style={styles.inputBox}>
//                                 <Icon name="user" size={20} color="#6B7280" />

//                                 <TextInput
//                                     style={styles.input}
//                                     placeholder="Enter your name"
//                                     placeholderTextColor="#9CA3AF"
//                                     value={registerData.name}
//                                     onChangeText={name =>
//                                         setRegisterData(prev => ({
//                                             ...prev,
//                                             name,
//                                         }))
//                                     }
//                                 />
//                             </View>
//                         </View>

//                         <View className="mb-3">
//                             <CustomText fontSize={RFValue(9)} fontFamily={Fonts.SemiBold}>
//                                 Email Address
//                             </CustomText>

//                             <View style={styles.inputBox}>
//                                 <Icon name="mail" size={20} color="#6B7280" />

//                                 <TextInput
//                                     style={styles.input}
//                                     placeholder="Enter your email"
//                                     placeholderTextColor="#9CA3AF"
//                                     value={registerData.email}
//                                     keyboardType="email-address"
//                                     autoCapitalize="none"
//                                     onChangeText={email =>
//                                         setRegisterData(prev => ({
//                                             ...prev,
//                                             email,
//                                         }))
//                                     }
//                                 />
//                             </View>
//                         </View>

//                         <View className="mb-3">
//                             <CustomText fontSize={RFValue(9)} fontFamily={Fonts.SemiBold}>
//                                 Phone Number
//                             </CustomText>

//                             <View style={styles.inputBox}>
//                                 <Icon name="phone" size={20} color="#6B7280" />

//                                 <TextInput
//                                     style={styles.input}
//                                     placeholder="Enter your phone number"
//                                     placeholderTextColor="#9CA3AF"
//                                     value={registerData.phone_number}
//                                     keyboardType="phone-pad"
//                                     maxLength={10}
//                                     editable={!otpVerified}
//                                     onChangeText={handlePhoneChange}
//                                 />

//                                 {otpVerified ? (
//                                     <Icon name="check-circle" size={22} color="#22C55E" />
//                                 ) : (
//                                     <TouchableOpacity
//                                         onPress={handleSendOtp}
//                                         disabled={otpLoading}
//                                     >
//                                         <Text style={styles.otpText}>
//                                             {otpSent ? 'Resend' : 'Send OTP'}
//                                         </Text>
//                                     </TouchableOpacity>
//                                 )}
//                             </View>
//                         </View>

//                         {otpSent && !otpVerified && (
//                             <View className="mb-3">
//                                 <CustomText fontSize={RFValue(9)} fontFamily={Fonts.SemiBold}>
//                                     Enter OTP
//                                 </CustomText>

//                                 <View style={styles.inputBox}>
//                                     <Icon name="shield" size={20} color="#6B7280" />

//                                     <TextInput
//                                         style={styles.input}
//                                         placeholder="Enter OTP"
//                                         placeholderTextColor="#9CA3AF"
//                                         value={otp}
//                                         keyboardType="number-pad"
//                                         maxLength={4}
//                                         onChangeText={setOtp}
//                                     />

//                                     <TouchableOpacity
//                                         onPress={handleVerifyOtp}
//                                         disabled={otpLoading}
//                                     >
//                                         <Text style={styles.otpText}>
//                                             Verify
//                                         </Text>
//                                     </TouchableOpacity>
//                                 </View>
//                             </View>
//                         )}

//                         {otpVerified && (
//                             <View style={styles.verifiedBox}>
//                                 <Icon name="check-circle" size={16} color="#22C55E" />
//                                 <Text style={styles.verifiedText}>
//                                     Phone number verified
//                                 </Text>
//                             </View>
//                         )}

//                         <View className="mb-3">
//                             <CustomText fontSize={RFValue(9)} fontFamily={Fonts.SemiBold}>
//                                 Password
//                             </CustomText>

//                             <View style={styles.inputBox}>
//                                 <Icon name="lock" size={20} color="#6B7280" />

//                                 <TextInput
//                                     style={styles.input}
//                                     placeholder="Enter your password"
//                                     placeholderTextColor="#9CA3AF"
//                                     value={registerData.password}
//                                     secureTextEntry={!showPassword}
//                                     autoCapitalize="none"
//                                     onChangeText={password =>
//                                         setRegisterData(prev => ({
//                                             ...prev,
//                                             password,
//                                         }))
//                                     }
//                                 />

//                                 <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//                                     <Icon
//                                         name={showPassword ? 'eye' : 'eye-off'}
//                                         size={20}
//                                         color="#6B7280"
//                                     />
//                                 </TouchableOpacity>
//                             </View>
//                         </View>

//                         <View className="mb-6">
//                             <CustomText fontSize={RFValue(9)} fontFamily={Fonts.SemiBold}>
//                                 Referral Code
//                             </CustomText>

//                             <View style={styles.inputBox}>
//                                 <Icon name="gift" size={20} color="#6B7280" />

//                                 <TextInput
//                                     style={styles.input}
//                                     placeholder="Enter referral code"
//                                     placeholderTextColor="#9CA3AF"
//                                     value={registerData.referral_code}
//                                     autoCapitalize="characters"
//                                     onChangeText={referral_code =>
//                                         setRegisterData(prev => ({
//                                             ...prev,
//                                             referral_code,
//                                         }))
//                                     }
//                                 />
//                             </View>
//                         </View>

//                         <CustomButten
//                             onPress={handleRegister}
//                             disabled={
//                                 !registerData.name ||
//                                 !registerData.email ||
//                                 !registerData.phone_number ||
//                                 !registerData.password ||
//                                 !otpVerified
//                             }
//                             loding={loading}
//                             title="Register"
//                         />

//                         <TouchableOpacity
//                             onPress={() => navigation.navigate('Login')}
//                             className="mt-5 items-center"
//                         >
//                             <Text className="text-sm text-gray-600">
//                                 Already have an account?{' '}
//                                 <Text className="text-[#0446DB] font-bold">
//                                     Sign In
//                                 </Text>
//                             </Text>
//                         </TouchableOpacity>
//                     </Animated.ScrollView>
//                 </KeyboardAvoidingView>
//             </CustomSafeAreaView>

//             <ToastManager />
//         </View>
//     );
// };

// export default RegisterScreen;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     subContainer: {
//         flexGrow: 1,
//         paddingHorizontal: 20,
//         paddingTop: 30,
//         paddingBottom: 40,
//     },
//     inputBox: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderWidth: 1,
//         borderColor: '#E5E7EB',
//         borderRadius: 16,
//         paddingHorizontal: 16,
//         height: 50,
//         marginTop: 8,
//     },
//     input: {
//         flex: 1,
//         fontSize: 16,
//         fontWeight: '700',
//         color: '#1F2937',
//         marginLeft: 10,
//     },
//     otpText: {
//         color: '#0446DB',
//         fontSize: 14,
//         fontWeight: '700',
//     },
//     verifiedBox: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 12,
//         marginTop: -2,
//     },
//     verifiedText: {
//         color: '#22C55E',
//         fontSize: 13,
//         fontWeight: '700',
//         marginLeft: 6,
//     },
// });



import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import ToastManager from 'toastify-react-native/components/ToastManager';
import Icon from 'react-native-vector-icons/Feather';
import * as Keychain from 'react-native-keychain';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useNavigation } from '@react-navigation/native';

import CustomSafeAreaView from '@components/global/CustomSafeAreaView';
import CustomText from '@components/ui/CustomText';
import CustomButten from '@components/ui/CustomButten';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors, Fonts } from '@utils/Constants';
import LottieView from 'lottie-react-native';

import AxiosInstance from '../services/AxiosInstance';
import { setItem } from '../utils/StorageService';
import { PromptEnableBiometric } from '../utils/PromptEnableBiometric';
import getCurrentLocation from '../utils/GetLocation';

const rnBiometrics = new ReactNativeBiometrics();
const baseURL = 'https://go-admin.daakit.com';

const LoginScreen = () => {
    const navigation = useNavigation();

    const [isModalVisible, setModalVisible] = useState({
        visible: false,
        data: null,
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
        latitude: '',
        longitude: '',
    });

    useEffect(() => {
        (async () => {
            try {
                const position = await getCurrentLocation();
                const { latitude, longitude } = position.coords;

                setLoginData(prev => ({
                    ...prev,
                    latitude,
                    longitude,
                }));
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

    const handleLogin = async () => {
        if (!loginData.email?.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Email is required.',
                position: 'top',
            });
            return;
        }

        if (!loginData.password?.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Password is required.',
                position: 'top',
            });
            return;
        }

        try {
            setLoading(true);

            const res = await AxiosInstance.post(
                `${baseURL}/api/rider/loginRider`,
                loginData,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (res?.status === 200) {
                const { available } = await rnBiometrics.isSensorAvailable();

                if (!available) {
                    setItem('token', res?.data?.token);
                    setItem('rider', res?.data?.rider);

                    Keychain.resetGenericPassword({
                        service: 'user_token_service_bio',
                    }).catch(() => {});

                    setItem('biometric_enabled', 'false');

                    Toast.show({
                        type: 'success',
                        text1: res?.data?.message || 'Login successful!',
                        position: 'top',
                    });

                    navigation.replace('AppTabs');
                    return;
                }

                setModalVisible({
                    visible: true,
                    data: res?.data,
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1:
                    error?.response?.data?.message ||
                    'Login failed. Please try again.',
                position: 'top',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar
                translucent
                barStyle="dark-content"
                backgroundColor="#FFF"
            />

            <PromptEnableBiometric
                isModalVisible={isModalVisible.visible}
                data={isModalVisible.data}
                onModalHide={() => {
                    setModalVisible({
                        visible: false,
                        data: null,
                    });
                }}
                setLoading={setLoading}
            />

            <CustomSafeAreaView>
                <KeyboardAwareScrollView
                    style={styles.scrollView}
                    enableOnAndroid={true}
                    extraScrollHeight={80}
                    keyboardOpeningTime={0}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.subContainer}
                >
                    <View className="items-center mb-8">
                        <LottieView
                            autoPlay
                            loop
                            style={{
                                width: 150,
                                height: 150,
                            }}
                            source={require('../assets/animations/delivery_man.json')}
                            hardwareAccelerationAndroid
                        />

                        <Text
                            className={`text-[28px] text-[${Colors.primary}] font-extrabold tracking-tight mb-2`}
                        >
                            Welcome Back
                        </Text>

                        <CustomText fontSize={RFValue(9)}>
                            Log in to start delivering with Daakit
                        </CustomText>
                    </View>

                    <View className="mb-3">
                        <CustomText
                            fontSize={RFValue(9)}
                            fontFamily={Fonts.SemiBold}
                        >
                            Email Address
                        </CustomText>

                        <View style={styles.inputBox}>
                            <Icon name="mail" size={20} color="#6B7280" />

                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#9CA3AF"
                                value={loginData.email}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                scrollEnabled={false}
                                onChangeText={email =>
                                    setLoginData(prev => ({
                                        ...prev,
                                        email,
                                    }))
                                }
                            />
                        </View>
                    </View>

                    <View className="mb-6">
                        <View className="flex-row justify-between items-center mb-2 ml-1">
                            <CustomText
                                fontSize={RFValue(9)}
                                fontFamily={Fonts.SemiBold}
                            >
                                Password
                            </CustomText>

                            <TouchableOpacity
                                onPress={() =>
                                    navigation.navigate('ForgotPassword')
                                }
                            >
                                <Text className="text-[#0446DB] text-sm font-bold">
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputBox}>
                            <Icon name="lock" size={20} color="#6B7280" />

                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#9CA3AF"
                                value={loginData.password}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                scrollEnabled={false}
                                onChangeText={password =>
                                    setLoginData(prev => ({
                                        ...prev,
                                        password,
                                    }))
                                }
                            />

                            <TouchableOpacity
                                onPress={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                <Icon
                                    name={showPassword ? 'eye' : 'eye-off'}
                                    size={20}
                                    color="#6B7280"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <CustomButten
                        onPress={handleLogin}
                        disabled={!loginData.email || !loginData.password}
                        loding={loading}
                        title="Sign In"
                    />

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Register')}
                        className="mt-5 items-center"
                    >
                        <Text className="text-sm text-gray-600">
                            Don’t have an account?{' '}
                            <Text className="text-[#0446DB] font-bold">
                                Sign Up
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </KeyboardAwareScrollView>
            </CustomSafeAreaView>

            <ToastManager />
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },

    scrollView: {
        flex: 1,
    },

    subContainer: {
        flexGrow: 1,
        minHeight: '110%',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 120,
    },

    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
        marginTop: 8,
    },

    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginLeft: 10,
        paddingVertical: 0,
    },
});