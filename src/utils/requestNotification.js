import { PermissionsAndroid } from 'react-native';

export const requestNotificationPermission = async () => {

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;

};