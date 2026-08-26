import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { SafeAreaView } from 'react-native-safe-area-context';

const rnBiometrics = new ReactNativeBiometrics();

const BiometricLockScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);

    const handleBiometricFlow = async () => {
        try {
            setLoading(true);
            const { available, biometryType } = await rnBiometrics.isSensorAvailable();
            if (!available) {
                console.log('Biometric sensor not available');
                setLoading(false);
                return;
            }

            const message =
                biometryType === 'FaceID'
                    ? 'Login with Face ID'
                    : biometryType === 'TouchID'
                        ? 'Login with Fingerprint'
                        : 'Login with Biometrics';

            const result = await rnBiometrics.simplePrompt({ promptMessage: message });
            
            if (result.success) {
                console.log('Biometric success');
                navigation.replace('AppTabs');
            } else {
                console.log('User cancelled biometric prompt');
                // stay on screen so they can click the button to try again
            }
            setLoading(false);
        } catch (err) {
            console.log('Biometric error', err);
            setLoading(false);
        }
    };

    // Auto trigger biometric flow once when screen mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            handleBiometricFlow();
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            
            <Image 
                source={require('../assets/DaakitGOLogo.png')} 
                className="w-32 h-32 mb-8" 
                resizeMode="contain"
            />
            
            <Text className="text-2xl font-bold text-gray-800 mb-2">App Locked</Text>
            <Text className="text-base text-gray-500 mb-8 text-center leading-6">
                Please authenticate using your fingerprint or face to unlock Daakit Rider App.
            </Text>

            <TouchableOpacity
                onPress={handleBiometricFlow}
                disabled={loading}
                className="bg-[#564ec1] px-10 py-4 rounded-xl flex-row items-center justify-center w-full shadow-sm"
            >
                <Text className="text-lg text-white font-semibold">
                    {loading ? 'Verifying...' : 'Unlock Now'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => {
                    // This is just a fallback in case biometric is broken
                    navigation.replace('Login');
                }}
                className="mt-6 p-2"
            >
                {/* <Text className="text-sm font-medium text-gray-500">
                    Login with Password
                </Text> */}
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default BiometricLockScreen;
