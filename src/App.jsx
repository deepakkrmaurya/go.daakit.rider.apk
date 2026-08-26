import "../global.css"
import { Text, View, StatusBar } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message'
import RootNavigator from './navigation/RootNavigation'
import NoInternetScreen from '@screens/NoInternet'
import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { navigationRef } from "@utils/NavigationUtils";
import { Colors } from "@utils/Constants";
export default function App() {
  const [isConnected, setIsConnected] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  if (!isConnected) {
    return <NoInternetScreen />
  }
  return (
    <>

      <GestureHandlerRootView style={{ flex: 1 }}>
        
        <NavigationContainer ref={navigationRef}>
          <RootNavigator />
        </NavigationContainer>
        <Toast />

      </GestureHandlerRootView>
    </>
  );
}