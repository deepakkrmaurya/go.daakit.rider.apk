import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';

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
import { requestLocationPermission } from 'src/permission/LocationPermission';

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
               
                const position = await getCurrentLocation(show=true);
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

            const res = await AxiosInstance.post(`/rider/loginRider`,
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
            <StatusBar translucent barStyle="dark-content" backgroundColor="#FFF" />

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
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.subContainer}
                        keyboardDismissMode="none"
                        keyboardShouldPersistTaps="always"
                        showsVerticalScrollIndicator={false}
                        bounces={false}
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
                            <CustomText fontSize={RFValue(9)} fontFamily={Fonts.SemiBold}>
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
                                <CustomText fontSize={RFValue(9)} fontFamily={Fonts.SemiBold}>
                                    Password
                                </CustomText>

                                <TouchableOpacity
                                    onPress={() => navigation.navigate('ForgotPassword')}
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

                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
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

                        {/* <TouchableOpacity
                            onPress={() => navigation.navigate('Register')}
                            className="mt-5 items-center"
                        >
                            <Text className="text-sm text-gray-600">
                                Don’t have an account?{' '}
                                <Text className="text-[#0446DB] font-bold">
                                    Sign Up
                                </Text>
                            </Text>
                        </TouchableOpacity> */}
                    </ScrollView>
                </KeyboardAvoidingView>
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
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 30,
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