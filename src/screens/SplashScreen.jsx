// import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect } from 'react'
import { View, Text, StatusBar, Alert, StyleSheet, Image } from 'react-native'
import Loader from '../components/Loder'
import { getItem } from '../utils/StorageService'
import * as Keychain from 'react-native-keychain';
import ReactNativeBiometrics from 'react-native-biometrics';
import { Colors } from '@utils/Constants';
const rnBiometrics = new ReactNativeBiometrics();
import Logo from "@assets/DaakitGOLogo.png"
import { screenHeight, screenWidth } from '@utils/Scaling';
import { navigate,resetAndNavigate } from '@utils/NavigationUtils';
import { requestLocationPermission } from 'src/permission/LocationPermission';
const SplashScreen = () => {



    const isBiometricLoginEnabled = async () => {
        try {
            const biometricFlag = getItem('biometric_enabled');
            if (biometricFlag) {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    };

    useEffect(() => {
        let timer;

        const bootstrapAuth = async () => {
            const token = getItem('token');
            const { available } = await rnBiometrics.isSensorAvailable();
            if (!token) {
               
                timer = setTimeout(() => resetAndNavigate('Login'), 2000);
                return;
            }
            const biometricFlag = getItem('biometric_enabled');
            const biometricEnabled = await isBiometricLoginEnabled();

            if (!biometricFlag) {
                timer = setTimeout(() => resetAndNavigate('AppTabs'), 2000);
                return;
            }

            if (available) {
                timer = setTimeout(() => resetAndNavigate('BiometricLockScreen'), 500);
                return
            } else {
                timer = setTimeout(() => resetAndNavigate('AppTabs'), 2000);
                return
            }

        };

        bootstrapAuth();

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [navigate]);
    return (
        <View style={styles.container}>
            <StatusBar translucent barStyle="dark-content" backgroundColor={Colors.backgroundSecondary} />
            {/* <Image source={Logo} style={styles.logo} /> */}
            <Loader />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.backgroundSecondary,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',

    },
    logo: {
        height: screenHeight * 0.7,
        width: screenWidth * 0.7,
        resizeMode: 'contain'
    }

});

export default SplashScreen
