
import { Alert, Linking, PermissionsAndroid, Platform } from "react-native";

const requestLocationPermission = async () => {
  if (Platform.OS !== "android") return true;


  return new Promise((resolve) => {
    Alert.alert(
      "Background Location Access",
      "DAAKiT Go Rider collects location data to enable live rider tracking, delivery route updates, and shipment status updates even when the app is closed or not in use.",
      [
        {
          text: "Not Now",
          style: "cancel",
          onPress: () => resolve(false),
        },
        {
          text: "I Agree",
          onPress: async () => {
            const fine = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            

            if (fine !== PermissionsAndroid.RESULTS.GRANTED) {
              resolve(false);
              return;
            }

            const background = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
            );

            if (background === PermissionsAndroid.RESULTS.GRANTED) {
              resolve(true);
              return;
            }

            if (background === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
              Alert.alert(
                "Permission Required",
                "Please allow background location from app settings to enable live rider tracking.",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => resolve(false),
                  },
                  {
                    text: "Open Settings",
                    onPress: () => {
                      Linking.openSettings();
                      resolve(false);
                    },
                  },
                ]
              );
              return;
            }

            resolve(false);
          },
        },
      ],
      { cancelable: false }
    );
  });
};

export { requestLocationPermission };