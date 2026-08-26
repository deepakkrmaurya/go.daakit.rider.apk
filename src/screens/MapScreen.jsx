// import { View, StyleSheet, Pressable, Text } from 'react-native';
// import React from 'react';
// import Header from '../Components/Header';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { MapView, Camera, ShapeSource, LineLayer } from 'mappls-map-react-native';
// import MapplsDirectionWidget from 'mappls-direction-widget-react-native';
// import polyline from '@mapbox/polyline';
// const DEFAULT_CENTER_COORDINATE = [77.2090, 28.6139];

// const MapScreen = () => {
//     const pickup = [28.6139, 77.2090]; // Delhi
//     const destination = [28.6162, 77.231409]; // India Gate
//     const fetchRoute = async () => {

//         try {
//             const response = await fetch(
//                 `https://apis.mapmyindia.com/advancedmaps/v1/8c7adbc75e7f3ccd01849857149297ac/route_adv/driving/77.227434,28.610981;77.665589,28.255594;77.212021,28.616679?alternatives=true&rtype=0&geometries=polyline&overview=full&exclude=&steps=true&region=ind`
//             );
//             const data = await response.json();
//             const encoded = data.routes[0].geometry;
//             const decoded = polyline.decode(encoded);
//             console.log("Decoded route coordinates:", decoded);
//         } catch (error) {
//             console.error("Failed to fetch route:", error);
//         }
//     };
//     // useEffect(() => {

//     //     fetchRoute();
//     // }, []);
//     const routeGeoJSON = {
//        type: "Feature",
//         geometry: {
//             type: "LineString",
//             coordinates: [
//                 [77.2090, 28.6139],   // pickup
//                 [77.231409, 28.6162], // destination
//             ],
//         },
//     };
//     const startNavigation = async () => {
//         fetchRoute()
//         return
//         console.log("Starting navigation...");
//         const data = await MapplsDirectionWidget.openDirectionWidget({
//             destination: {
//                 longitude: 77.231409,
//                 latitude: 28.6162,
//                 name: "India Gate",
//                 address: "New Delhi"
//             },
//             resource: "route_eta",
//             profile: "driving",
//             showAlternative: true,
//             showStartNavigation: true,
//             excludes: ["toll", "motorway"],
//         });
//     }


//     return (
//         <View style={styles.container}>
//             <Header showBack={true} />
//             <View style={{ flex: 1 }}>
//                 <MapView
//                     onMapError={error => console.log(error.code + ' ' + error.message)}
//                     style={{ flex: 1 }}

//                 >
//                     <Camera
//                         zoomLevel={12}
//                         centerCoordinate={DEFAULT_CENTER_COORDINATE}

//                     />
//                     <ShapeSource id="routeSource" shape={routeGeoJSON}>
//                         <LineLayer
//                             id="routeLine"
//                             style={{
//                                 lineColor: '#2563eb',
//                                 lineWidth: 4,
//                             }}
//                         />
//                     </ShapeSource>
//                 </MapView>

//                 <Pressable
//                     style={styles.button}
//                     onPress={startNavigation}
//                 >
//                     <Text style={styles.buttonText}>
//                         Start Navigation
//                     </Text>
//                 </Pressable>

//             </View>
//         </View>
//     );
// };

// export default MapScreen;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#F9FAFB',
//     },
//     button: {
//         position: 'absolute',
//         bottom: 20,
//         left: 16,
//         right: 16,
//         backgroundColor: '#564ec1',
//         paddingVertical: 14,
//         borderRadius: 12,
//         alignItems: 'center',
//         justifyContent: 'center',
//         elevation: 5, // Android shadow
//     },
//     buttonText: {
//         color: '#fff',
//         fontSize: 16,
//         fontWeight: '600',
//     },
// });


// import { View, StyleSheet, Pressable, Text } from 'react-native';
// import React, { useState, useEffect } from 'react';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import Header from '../components/Header';
// import { MapView, Camera, ShapeSource, LineLayer, MarkerView } from 'mappls-map-react-native';
// import MapplsDirectionWidget from 'mappls-direction-widget-react-native';
// import polyline from '@mapbox/polyline';
// import { LogBox } from 'react-native';

// // Add this at the top of your root file
// LogBox.ignoreLogs([
//     'Mappls error enableTraffic: Method not Provisioned',
//     'Mbgl-MapplsMap',
// ]);
// const DEFAULT_CENTER_COORDINATE = [77.391029, 28.535517];

// const MapScreen = () => {
//     const pickup = [77.391029, 28.535517];
//     const destination = [77.102493, 28.704060];
//     const [routeCoords, setRouteCoords] = useState(null);

//     const fetchRoute = async () => {
//         try {
//             const response = await fetch(
//                 `https://apis.mapmyindia.com/advancedmaps/v1/8c7adbc75e7f3ccd01849857149297ac/route_adv/driving/77.391029,28.535517;77.102493,28.704060?alternatives=true&rtype=0&geometries=polyline&overview=full&exclude=&steps=true&region=ind`
//             );
//             const data = await response.json();

//             if (data.routes && data.routes.length > 0) {
//                 const encoded = data.routes[0].geometry;
//                 const decoded = polyline.decode(encoded);
//                 const coords = decoded.map(([lat, lng]) => [lng, lat]);
//                 setRouteCoords(coords);
//             }
//         } catch (error) {

//         }
//     };

//     const startNavigation = async () => {

//         const data = await MapplsDirectionWidget.openDirectionWidget({
//             destination: {
//                 longitude: 77.231409,
//                 latitude: 28.6162,
//                 name: "India Gate",
//                 address: "New Delhi"
//             },
//             resource: "route_eta",
//             profile: "driving",
//             showAlternative: true,
//             showStartNavigation: true,
//             excludes: ["toll", "motorway"],
//         });
//     };


//     useEffect(() => {
//         fetchRoute()
//     }, [])

//     const routeGeoJSON = {
//         type: "Feature",
//         geometry: {
//             type: "LineString",
//             coordinates: routeCoords || [], // use decoded route coordinates or empty array
//         },
//     };

//     return (
//         <View style={styles.container}>
//             <Header showBack={true} />
//             <View style={{ flex: 1 }}>
//                 <MapView
//                     style={{ flex: 1 }}
//                 >
//                     <Camera zoomLevel={12} centerCoordinate={DEFAULT_CENTER_COORDINATE} />

//                     <MarkerView coordinate={pickup}>
//                         <View style={styles.markerContainer}>
//                             <MaterialCommunityIcons name="map-marker" size={40} color="#10B981" />
//                         </View>
//                     </MarkerView>

//                     <MarkerView coordinate={destination}>
//                         <View style={styles.markerContainer}>
//                             <MaterialCommunityIcons name="home" size={35} color="#EF4444" />
//                         </View>
//                     </MarkerView>

//                     {routeCoords && (
//                         <ShapeSource id="routeSource" shape={routeGeoJSON}>
//                             <LineLayer
//                                 id="routeLine"
//                                 style={{
//                                     lineColor: '#2563eb',
//                                     lineWidth: 4,
//                                 }}
//                             />
//                         </ShapeSource>
//                     )}
//                 </MapView>

//                 <Pressable
//                     style={styles.button}
//                     onPress={startNavigation}
//                 >
//                     <Text style={styles.buttonText}>Start Navigation</Text>
//                 </Pressable>
//             </View>
//         </View>
//     );
// };

// export default MapScreen;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#F9FAFB',
//     },
//     button: {
//         position: 'absolute',
//         bottom: 20,
//         left: 16,
//         right: 16,
//         backgroundColor: '#564ec1',
//         paddingVertical: 14,
//         borderRadius: 12,
//         alignItems: 'center',
//         justifyContent: 'center',
//         elevation: 5, // Android shadow
//     },
//     buttonText: {
//         color: '#fff',
//         fontSize: 16,
//         fontWeight: '600',
//     },
//     markerContainer: {
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
// });




import { View, Text } from 'react-native'
import React from 'react'

const MapScreen = () => {
  return (
    <View>
      <Text>MapScreen</Text>
    </View>
  )
}

export default MapScreen