import Geolocation from "@react-native-community/geolocation";
import enableLocation from "../permission/EnableLocation";
import { requestLocationPermission } from "../permission/LocationPermission";

const getCurrentLocation = async (show) => {
  console.log("getting location")
  const enabled = await enableLocation();
  // console.log("enabled", enabled)
  if (show) {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;
  }

  

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log("location", position)
        resolve(position);
      },
      (error) => {
        console.log("error", error)
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 20000,
        forceLocationManager: true,
        showLocationDialog: true,
      }
    );
  });
};

export default getCurrentLocation;