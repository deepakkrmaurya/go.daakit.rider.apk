import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import { Platform } from 'react-native';

const enableLocation = async () => {
    if (Platform.OS === 'android') {
        try {
            const data = await promptForEnableLocationIfNeeded({
                interval: 10000,
                fastInterval: 5000,
            });
        } catch (err) {

        }
    }

};

export default enableLocation;