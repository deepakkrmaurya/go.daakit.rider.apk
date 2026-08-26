
import React, { useEffect } from 'react';
import { View, Text, Touchable, TouchableOpacity, Platform } from 'react-native';
import BackgroundService from 'react-native-background-actions';
import Geolocation from 'react-native-geolocation-service';
import { requestLocationPermission } from '../Permission/LocationPermission';
import { Toast } from 'toastify-react-native';
import axios from 'axios';
import { getItem } from '../utils/StorageService';
import { PermissionsAndroid } from 'react-native';

/* ================= SLEEP ================= */

const sleep = time => new Promise(resolve => setTimeout(resolve, time));
const requestPermissions = async () => {

  const fine = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  const background = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
  );

  let notification = "granted";

  if (Platform.Version >= 33) {
    notification = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
  }

  if (
    fine === "granted" &&
    background === "granted" &&
    notification === "granted"
  ) {
    console.log("All permissions granted");
    return true;
  }

  return false;

};


/* ================= BACKGROUND TASK ================= */
const getCurrentLocation = async () => {
  const token = getItem('token');
  console.log(token)
  const baseUrl = "https://go-admin.daakit.com"
  console.log('Requesting location permission...');
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;


  Geolocation.getCurrentPosition(
    async (position) => {
      try {
        console.log("BACKGROUND LOCATION:", position.coords.latitude, position.coords.longitude);
        const res = await axios.post(`${baseUrl}/api/rider/updateRiderLocation`, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(res.data)
        Toast.show({
          type: 'success',
          text1: res?.data?.message || 'Location updated successfully!',
          position: 'top',
          visibilityTime: 4000,
          autoHide: true,

        })
      } catch (error) {
           console.log(error.response)
           console.log("location update fails")
      }

    },
    (error) => {
      console.log("ERROR CODE:", error.code);
      console.log("ERROR MESSAGE:", error.message);
    },
    {
      enableHighAccuracy: false,
      timeout: 30000,
      maximumAge: 20000,
      forceLocationManager: true,
      showLocationDialog: true,
    }
  );
};

const backgroundTask = async () => {

  let counter = 0;

  while (BackgroundService.isRunning()) {
    await getCurrentLocation();
    counter++;

    console.log('Counter:', counter);

    // ✅ notification update every 5 sec
    await BackgroundService.updateNotification({

      taskDesc: `Counter running: ${counter}`,
    });

    await sleep(30000); 
  }
};

/* ================= START SERVICE ================= */

const startBackgroundService = async () => {

  try {
    if (BackgroundService.isRunning()) return;

  await BackgroundService.start(backgroundTask, {
    // taskName: 'Rider Tracking',
    // taskTitle: 'Background Counter Running',
    // taskDesc: 'Counter running: 0',
    taskName: 'Rider Tracking',
    taskTitle: 'Tracking Location',
    taskDesc: 'Your location is being tracked',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#22c55e',
  });

  console.log('✅ Background Service Started');
  } catch (error) {
      console.log('⛔ Error starting background service:', error);
  }
};

/* ================= COMPONENT ================= */

const RiderTracking = () => {

  useEffect(() => {

    try {
      startBackgroundService();
      return () => {
        BackgroundService.stop();
        console.log('⛔ Background Service Stopped');
      };
    } catch (error) {
      console.log('⛔ Error in RiderTracking component:', error);
    }

  }, []);

  return (
    <View>

    </View>
  );
};

export default RiderTracking;
