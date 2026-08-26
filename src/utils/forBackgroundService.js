// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import { useEffect, useRef } from 'react';
// import BackgroundGeolocation from 'react-native-background-geolocation';
// import { Toast } from 'toastify-react-native';
// const baseUrl = "https://go-admin.daakit.com"
// const RiderTrackingService = (riderId) => {
//     const rider = riderId?.rider;
//     const isSending = useRef(false);
//     const lastSentTime = useRef(0);
//     // console.log("rider",rider)
//     useEffect(() => {
//         const sendLocationToServer = async (location) => {
//             const token = await AsyncStorage.getItem('token');
//             const now = Date.now();
//             if (isSending.current || (now - lastSentTime.current < 30000)) {
//                 // console.log("⏳ Skipping duplicate API call");
//                 return;
//             }
//             // console.log("rider",rider)

//             isSending.current = true;
//             lastSentTime.current = now;

//             try {
//                 const payload = {
//                     rider_id: rider?.id,
//                     latitude: location.coords.latitude,
//                     longitude: location.coords.longitude,
//                     accuracy: location.coords.accuracy,
//                     time: location.timestamp,
//                 };

//                 console.log("📡 Sending API:", payload);
//                 const res = await axios.post(`${baseUrl}/api/rider/updateRiderLocation`, {
//                     latitude: location.coords.latitude,
//                     longitude: location.coords.longitude,
//                 }, {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 });
//                 Toast.show({
//                     type: 'success',
//                     text1: res?.data?.message || 'Location updated successfully!',
//                     position: 'top',
//                     visibilityTime: 4000,
//                     autoHide: true,

//                 })
//                 console.log("✅ API Response:", res.data);

//             } catch (error) {
//                 Toast.show({
//                     type: 'error',
//                     text1: error?.response?.data?.message || 'Failed to update location!',
//                     position: 'top',
//                     visibilityTime: 4000,
//                     autoHide: true,

//                 })
//                 console.log("❌ API Error:", error.response);
//             } finally {
//                 isSending.current = false;
//             }
//         };

//         const init = async () => {

//             await BackgroundGeolocation.requestPermission();

//             BackgroundGeolocation.ready({

//                 desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
//                 distanceFilter: 10,
//                 stopOnTerminate: false,
//                 startOnBoot: true,
//                 foregroundService: true,
//                 heartbeatInterval: 30,
//                 enableHeadless: true,
//                 debug: false,

//             }).then((state) => {

//                 // console.log("⚙️ STATE:", state);

//                 // 📍 Movement update
//                 BackgroundGeolocation.onLocation(location => {
//                     sendLocationToServer(location);
//                 });

//                 // 💓 30 sec forced update
//                 BackgroundGeolocation.onHeartbeat(async () => {
//                     const location = await BackgroundGeolocation.getCurrentPosition({
//                         samples: 1,
//                         persist: false,
//                     });

//                     sendLocationToServer(location);
//                 });

//                 if (!state.enabled) {
//                     BackgroundGeolocation.start();
//                 }

//             });

//         };

//         init();

//         return () => {
//             BackgroundGeolocation.removeListeners();
//         };

//     }, [riderId]);

//     return null;
// };

// export default RiderTrackingService;


import { View, Text } from 'react-native'
import React from 'react'

const ForegroundLocationService = () => {
  return (
    <View>
      <Text>ForegroundLocationService</Text>
    </View>
  )
}

export default ForegroundLocationService