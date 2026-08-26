
import React, { useEffect, useRef } from "react";
import { PermissionsAndroid, Platform, Linking } from "react-native";
import BackgroundService from "react-native-background-actions";
import Geolocation from "@react-native-community/geolocation";
import axios from "axios";
import { getItem } from "./StorageService";
import { Toast } from "toastify-react-native";

/* GLOBAL WATCH ID */
let watchId = null;

/* PERMISSIONS */
const requestPermissions = async () => {
  const fine = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  

  const background = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
  );

  if (background === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    Linking.openSettings();
  }

  let notification = "granted";

  if (Platform.Version >= 33) {
    notification = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
  }

  return (
    fine === "granted" &&
    background === "granted" &&
    notification === "granted"
  );
};





/* START LOCATION TRACKING (CONTINUOUS) */
const startLocationTracking = async (baseUrl) => {
  const token = await getItem("token");

  if (!token) {
    console.log("No token found");
    return false;
  }

  // prevent multiple watchers
  if (watchId !== null) {
    console.log("Already tracking...");
    return true;
  }

  let lastCallTime = 0;

  watchId = Geolocation.watchPosition(
    async (position) => {
      const now = Date.now();

      if (now - lastCallTime < 30000) {
      
        return;
      }
      lastCallTime = now;
      const { latitude, longitude } = position.coords;
      console.log("📍 Controlled:", latitude, longitude);
      try {
        const res = await axios.post(
          `${baseUrl}/api/rider/updateRiderLocation`,
          { latitude, longitude },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(res.data.message)
      } catch (error) {
        console.log("API error:", error?.response?.status);

        if (error?.response?.status === 401) {
          stopService();
        }
      }
    },
    (error) => console.log(error),
    {
      enableHighAccuracy: true,
      distanceFilter: 0,
      interval: 30000,
      fastestInterval: 30000,
    }
  );


  return true;
};

/* BACKGROUND TASK */
const backgroundTask = async (taskData) => {
  const { baseUrl } = taskData;

  await startLocationTracking(baseUrl);

  // keep service alive
  while (BackgroundService.isRunning()) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
};

/* OPTIONS */
const baseUrl = "https://go-admin.daakit.com";

const options = {
  taskName: "RiderTracking",
  taskTitle: "Rider Location Tracking",
  taskDesc: "Tracking rider location",
  taskIcon: {
    name: "ic_launcher",
    type: "mipmap",
  },
  color: "#0446DB",
  foregroundServiceType: ["location"],

  parameters: {
    baseUrl,
  },
};

/* START SERVICE */
const startService = async () => {
  try {
    const token = await getItem("token");

  if (!token) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Login required",
    });
    return false;
  }

  const permission = await requestPermissions();
  if (!permission) return false;

  if (BackgroundService.isRunning()) {
    console.log("Already running");
    return true;
  }

  const baseUrl = "https://go-admin.daakit.com";

  await BackgroundService.start(backgroundTask, {
    ...options,
    parameters: { baseUrl },
  });

  console.log("✅ Service Started");
  return true;
  } catch (error) {
    console.log("BackgroundService Error:", error);
    return false;
  }
};

/* STOP SERVICE */
const stopService = async () => {
  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
    watchId = null;
    console.log("Location tracking stopped");
  }

  if (BackgroundService.isRunning()) {
    await BackgroundService.stop();
    console.log("Service stopped");
  }
};

/* CHECK STATUS */
const isServiceRunning = () => {
  return BackgroundService.isRunning();
};

/* COMPONENT */
const RiderTracking = () => {
  const startedRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      const token = await getItem("token");

      if (token && !startedRef.current) {
        await startService();
        startedRef.current = true;
      }
    };

    init();

    return () => { };
  }, []);

  return null;
};

export default RiderTracking;
export { startService, stopService, isServiceRunning };