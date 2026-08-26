// import React from 'react';
// import { Alert } from 'react-native';
// import ReactNativeBiometrics from 'react-native-biometrics';
// import * as Keychain from 'react-native-keychain';
// import { storage, setItem } from './StorageService';
// const rnBiometrics = new ReactNativeBiometrics();

// export const promptEnableBiometric = async () => {
//     try {
//         const { available, biometryType } = await rnBiometrics.isSensorAvailable();

//         if (!available) return;

//         Alert.alert(
//             'Enable Biometric Login?',
//             'You can login faster next time using Fingerprint / Face ID',
//             [
//                 { text: 'No', style: 'cancel' },
//                 {
//                     text: 'Yes', onPress: async () => {
//                         try {
//                             const result = await rnBiometrics.simplePrompt({
//                                 promptMessage:
//                                     biometryType === 'FaceID' ? 'Confirm Face ID' :
//                                         biometryType === 'TouchID' ? 'Confirm Fingerprint' :
//                                             'Confirm Biometrics',
//                             });

//                             if (result.success) {
//                                 // Store token securely with biometric lock
//                                 // await Keychain.setGenericPassword(
//                                 //     'userToken',
//                                 //     userToken,
//                                 //     {
//                                 //         service: 'user_token_service_bio',
//                                 //         accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET
//                                 //     }
//                                 // );
//                                 await setItem('biometric_enabled', 'true');
//                                 Alert.alert('Success', 'Biometric login enabled!');
//                                 return true;
//                             } else {
//                                 console.log('User cancelled biometric setup');
//                             }
//                         } catch (err) {
//                             console.log('Error enabling biometric:', err);
//                         }
//                     }
//                 }
//             ]
//         );

//         return true;
//     } catch (err) {
//         console.log('Biometric not available:', err);
//     }
// };



import React from 'react';
import { Button, Text, View } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';
import { Toast } from 'toastify-react-native';
import Modal from 'react-native-modal';
import { setItem } from './StorageService';
import { useNavigation } from '@react-navigation/native';

const rnBiometrics = new ReactNativeBiometrics();

export const PromptEnableBiometric = ({ isModalVisible, data = {}, onModalHide }) => {
    const navigation = useNavigation();

    const handleEnableBiometric = async () => {
        const token = data?.token;
        const rider = data?.rider;

        if (!token) {
            Toast.show({
                type: 'error',
                text1: 'Unable to enable biometric',
                text2: 'Missing token data',
                position: 'top',
                visibilityTime: 3000,
                autoHide: true,
            });
            return;
        }

        try {
            const { available, biometryType } = await rnBiometrics.isSensorAvailable();
            if (!available) {
                return;
            }

            const result = await rnBiometrics.simplePrompt({
                promptMessage:
                    biometryType === 'FaceID'
                        ? 'Confirm Face ID'
                        : biometryType === 'TouchID'
                            ? 'Confirm Fingerprint'
                            : 'Confirm Biometrics',
            });

            if (!result.success) {
                Toast.show({
                    type: 'info',
                    text1: 'Biometric setup cancelled',
                    position: 'top',
                    visibilityTime: 2500,
                    autoHide: true,
                });
                return;
            }
            await Keychain.setGenericPassword('userToken', String(token), {
                service: 'user_token_service_bio',
                accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
            });
           
            
            setItem('token', token);
            if (rider !== undefined) setItem('rider', rider);
            setItem('biometric_enabled', 'true');

            Toast.show({
                type: 'success',
                text1: 'Biometric login enabled!',
                position: 'top',
                visibilityTime: 2500,
                autoHide: true,
            });
            onModalHide?.();
            Toast.show({
                type: 'success',
                text1: data?.message || 'Login successful!',
                position: 'top',
                visibilityTime: 4000,
                autoHide: true,

            })
            navigation.replace('AppTabs');
        } catch (error) {
           
            
            Toast.show({
                type: 'error',
                text1: 'Failed to enable biometric login',
                text2: error?.message || 'Unknown error',
                position: 'top',
                visibilityTime: 3000,
                autoHide: true,
            });
        }
    };

    const onClose = () => {
        if (data?.token) setItem('token', data.token);
        if (data?.rider) setItem('rider', data.rider);
        // Clear any existing biometric data to ensure it's not enabled
        Keychain.resetGenericPassword({ service: 'user_token_service_bio' }).catch(() => { });
        setItem('biometric_enabled', 'false');
        onModalHide?.();
        Toast.show({
            type: 'success',
            text1: data?.message || 'Login successful!',
            position: 'top',
            visibilityTime: 4000,
            autoHide: true,

        })
        navigation.replace('AppTabs');
    };


    return (
        <>
            <Modal
                isVisible={isModalVisible}

                animationIn="zoomIn"
                animationOut="zoomOut"
                backdropOpacity={0.5}
                useNativeDriver={true}
                hideModalContentWhileAnimating={true}
                style={{ justifyContent: 'center', alignItems: 'center', margin: 0 }}
            >
                <View
                    style={{
                        backgroundColor: 'white',
                        padding: 25,
                        borderRadius: 20,
                        width: '85%',
                        alignItems: 'center',
                    }}
                >
                    {/* 🔐 Icon */}
                    <Text style={{ fontSize: 50, marginBottom: 10 }}>🔒</Text>

                    {/* Title */}
                    <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 10 }}>
                        Enable Biometric Login
                    </Text>

                    {/* Description */}
                    <Text
                        style={{
                            fontSize: 14,
                            color: '#666',
                            textAlign: 'center',
                            marginBottom: 20,
                        }}
                    >
                        Use your fingerprint or face unlock to login quickly and securely next time.
                    </Text>

                    {/* Buttons */}
                    <View style={{ flexDirection: 'row', gap: 10 }}>

                        {/* Cancel */}
                        <View style={{ flex: 1 }}>
                            <Button title="Not Now" onPress={() => {
                                onClose()
                            }} />
                        </View>

                        {/* Enable */}
                        <View style={{ flex: 1 }}>
                            <Button title="Enable" onPress={handleEnableBiometric} />
                        </View>
                    </View>
                </View>
            </Modal>


        </>
    )
};

