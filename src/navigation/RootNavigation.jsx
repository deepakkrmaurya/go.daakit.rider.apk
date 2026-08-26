import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import SplashScreen from '@screens/SplashScreen'
import AppTabs from './AppTabs'
import LoginScreen from '@screens/LoginScreen'
import RiderRegister from '@screens/RegisterScreen'
import DeliveryProof from '@screens/DeliveryProof'
import GlobalScanner from '@screens/PickupScanner'
import AssignScanner from '@screens/AssignScanner'
import Scanner from '@screens/Scanner'
import MapScreen from '@screens/MapScreen'
import OrderDetailsScreen from '@screens/OrderDetailsScreen'
import OrderScreen from '../screens/OrderScreen'
// import NoInternetScreen from '../Screens/NoInternetScreen'
import ForgotPassword from '@screens/ForgotPassword'
import AuthScreen from '@screens/AuthScreen'
import BiometricLockScreen from '@screens/BiometricLockScreen'
const Stack = createNativeStackNavigator()
const RootNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName='Splash'
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                animationDuration: 300
            }}
        >
            <Stack.Screen

                name='Splash'
                component={SplashScreen} />


            <Stack.Screen
                options={{
                    animation: 'fade'
                }}
                name='Login'
                component={LoginScreen}
            />
            <Stack.Screen

                name='Register'
                component={RiderRegister}
            />
            <Stack.Screen
                options={{
                    headerShown: false
                }}
                name='AppTabs' component={AppTabs} />
            <Stack.Screen
                options={{
                    headerShown: false
                }}
                name='DeliveryProof' component={DeliveryProof} />
            <Stack.Screen
                options={{
                    headerShown: false
                }}
                name='GlobalScanner' component={GlobalScanner} />
            <Stack.Screen
                options={{
                    headerShown: false
                }}
                name='AssignScanner' component={AssignScanner} />
            <Stack.Screen
                options={{
                    headerShown: false
                }}
                name='MapScreen' component={MapScreen} />
            <Stack.Screen
                options={{
                    headerShown: false
                }}
                name='OrderDetailsScreen' component={OrderDetailsScreen} />
            <Stack.Screen
                options={{
                    headerShown: false
                }}
                name='Orders' component={OrderScreen} />
            <Stack.Screen
                options={{
                    headerShown: false
                }}
                name='ForgotPassword' component={ForgotPassword} />
            <Stack.Screen
                options={{
                    headerShown: false
                }}
                name='AuthScreen' component={AuthScreen} />
            <Stack.Screen
                options={{
                    headerShown: false
                }}
                name='BiometricLockScreen' component={BiometricLockScreen} />



                
            <Stack.Screen
                options={{
                    headerShown: false
                }}
                name='Scanner' component={Scanner} />
            
        </Stack.Navigator>
    )
}

export default RootNavigator