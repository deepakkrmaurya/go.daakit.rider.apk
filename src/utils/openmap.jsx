import { Linking } from "react-native";

const openMap = (lat, long, address) => {
    let url = "";

    // Detect iOS devices
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // Apple Maps
      if (lat && long) {
        url = `http://maps.apple.com/?daddr=${lat},${long}`;
      } else {
        const encodedAddress = encodeURIComponent(address);
        url = `http://maps.apple.com/?daddr=${encodedAddress}`;
      }
    } else {
      if (lat && long) {
        url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}`;
      } else {
        const encodedAddress = encodeURIComponent(address);
        url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      }
    }
    Linking.openURL(url)
  };

export default openMap