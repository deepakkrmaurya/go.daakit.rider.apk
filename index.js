
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
// import * as MapplsGL from 'mappls-map-react-native';

// MapplsGL.setMapSDKKey('9c1760744822f8346947a201c82ca178');
// MapplsGL.setRestAPIKey('9c1760744822f8346947a201c82ca178');
// MapplsGL.setAtlasClientId('96dHZVzsAutnKFQYKA2NSE5rz7FCFwnD9fu31ecFJHAa-H2EZhufZsfFv71DIODZXXaWKBmaKnTlPFjFS5EHiDyYPzYZwUVD');
// MapplsGL.setAtlasClientSecret('IrFxI-iSEg-lrFxI-iSEg-yxJ6kyZzjtSxdQEYVztFrLulZgkPbrDceKJ5hYsHIVS3Z3OPeAsp1a5EvXI5VYj2GA_gDimn1C0sBvsghrtwAYQcpa2Sgiys=');

// // Verify initialization
// MapplsGL.initialize((success, error) => {
//   if (success) {
//     console.log('✅ Mappls SDK initialized successfully');
//   } else {
//     console.error('❌ Mappls SDK init failed:', error);
//   }
// });
AppRegistry.registerComponent(appName, () => App);
