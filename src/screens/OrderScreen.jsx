
// import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl, ActivityIndicator, TextInput, Keyboard, Modal } from 'react-native'
// import React, { useState, useEffect, useCallback } from 'react'
// import Header from '../components/Header'
// import Icon from 'react-native-vector-icons/Ionicons'
// import { Dropdown } from 'react-native-element-dropdown'
// import axios from 'axios'
// import { getItem } from '../utils/StorageService'
// import Toast from 'react-native-toast-message';
// import Loader from '../components/Loder'
// import { useIsFocused, useNavigation } from '@react-navigation/native'
// import AxiosInstance from '../services/AxiosInstance'

// const baseURL = 'https://go-admin.daakit.com'

// const AssignmentsScreen = () => {
//   const navigation = useNavigation();
//   const [assignments, setAssignments] = useState([])
//   const [loadSummary, setLoadSummary] = useState({})
//   const [refreshing, setRefreshing] = useState(false)
//   const [selectedAssignment, setSelectedAssignment] = useState(null)
//   const [isModalVisible, setModalVisible] = useState(false)
//   const [isUndeliveredModalVisible, setIsUndeliveredModalVisible] = useState(false)
//   const [filterStatus, setFilterStatus] = useState('assigned')
//   const [loading, setLoading] = useState(false)
//   const [page, setPage] = useState(1)
//   const [totalPages, setTotalPages] = useState(1)
//   const [loadingMore, setLoadingMore] = useState(false)
//   const [selectedOrders, setSelectedOrders] = useState([])
//   const [isBulkUpdating, setIsBulkUpdating] = useState(false)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [isManualSelectModalVisible, setIsManualSelectModalVisible] = useState(false)
//   const [manualAWBInput, setManualAWBInput] = useState('')
//   const [address, setAddress] = useState({
//     latitude: '',
//     longitude: '',
//     address: ''
//   })

//   const statusOptions = [
//     { label: 'Assigned', value: 'assigned' },
//     { label: 'Out for Delivery', value: 'out for delivery' },
//     { label: 'Delivered', value: 'delivered' },
//   ]

//   const getOrders = async (resetPage = false) => {
//     const token = getItem("token");
//     const currentPage = resetPage ? 1 : page;
//     try {
//       if (resetPage) {
//         setLoading(true);
//         setPage(1);
//       } else {
//         setLoadingMore(true);
//       }

//       let res;
//       if (filterStatus === "assigned") {
//         res = await AxiosInstance.get(`/rider/getRiderReadyAssignments`);
//         if (resetPage) {
//           setAssignments(res?.data?.data?.filter(o => o.status !== "out for delivery") || []);
//         } else {
//           setAssignments(prev => [...prev, ...(res?.data?.data?.filter(o => o.status !== "out for delivery") || [])]);
//         }
//         setLoadSummary(res?.data?.load_summary || {});
//         console.log(res.data.data)
//       } else {
//         res = await axios.get(
//           `${baseURL}/api/rider/getRiderOrdersByStatus`,
//           {
//             params: { status: filterStatus, page: currentPage, limit: 10 },
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         if (resetPage) {
//           setAssignments(res.data.data || []);
//         } else {
//           setAssignments(prev => [...prev, ...(res.data.data || [])]);

//         }
//         console.log(res.data.pagination)
//         setTotalPages(res.data.pagination?.totalPages || 1);
//       }
//     } catch (err) {
//       Toast.show({
//         type: 'error',
//         text1: 'Error',
//         text2: err.response?.data?.message || err.message || `Error fetching orders`,
//         position: 'top',
//       });
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   };




//   const isFocused = useIsFocused();

//   useEffect(() => {
//     if (isFocused) {
//       getOrders(true);
//     }
//   }, [isFocused]);

//   useEffect(() => {
//     setSelectedOrders([]);
//     getOrders(true);
//   }, [filterStatus]);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     setSelectedOrders([]);
//     getOrders(true).finally(() => setRefreshing(false));
//   }, [filterStatus]);

//   const loadMore = () => {
//     if (filterStatus !== 'assigned' && page < totalPages && !loadingMore) {
//       setPage(prev => prev + 1);
//       getOrders();
//     }
//   };

//   const handleStatusUpdate = async (assignmentId, newStatus) => {
//     if (newStatus === 'undelivered') {
//       setIsUndeliveredModalVisible(true);
//       return;
//     }

//     Alert.alert(
//       'Update Status',
//       `Change status to ${newStatus.replace(/\b\w/g, l => l.toUpperCase())}?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Confirm',
//           onPress: async () => {
//             try {
//               const token = getItem("token");
//               await axios.post(
//                 `${baseURL}/api/rider/updateAssignmentStatus`,
//                 {
//                   id: assignmentId,
//                   status: newStatus
//                 },
//                 { headers: { Authorization: `Bearer ${token}` } }
//               );

//               Toast.show({
//                 type: 'success',
//                 text1: 'Success',
//                 text2: 'Status updated successfully',
//                 position: 'top',
//               });

//               getOrders(true);
//               setModalVisible(false);
//             } catch (error) {
//               Toast.show({
//                 type: 'error',
//                 text1: 'Error',
//                 text2: error.response?.data?.message || 'Failed to update status',
//                 position: 'top',
//               });
//             }
//           }
//         }
//       ]
//     );
//   };

//   // Toggle selection function
//   const toggleSelection = (assignmentId) => {
//     setSelectedOrders(prev => {
//       if (prev.includes(assignmentId)) {
//         return prev.filter(id => id !== assignmentId);
//       } else {
//         return [...prev, assignmentId];
//       }
//     });
//   };

//   // Manual selection by AWB number
//   const handleManualSelect = () => {
//     if (!manualAWBInput.trim()) {
//       Toast.show({
//         type: 'warning',
//         text1: 'Warning',
//         text2: 'Please enter an AWB number',
//         position: 'top',
//       });
//       return;
//     }

//     const assignment = assignments.find(
//       a => a.awb_number === manualAWBInput.trim() || a.orderno === manualAWBInput.trim()
//     );

//     if (assignment) {
//       if (assignment.status === 'assigned') {
//         if (!selectedOrders.includes(assignment.id)) {
//           toggleSelection(assignment.id);
//           Toast.show({
//             type: 'success',
//             text1: 'Success',
//             text2: 'Order selected successfully',
//             position: 'top',
//           });
//         } else {
//           Toast.show({
//             type: 'info',
//             text1: 'Info',
//             text2: 'Order already selected',
//             position: 'top',
//           });
//         }
//       } else {
//         Toast.show({
//           type: 'error',
//           text1: 'Error',
//           text2: 'Only assigned orders can be selected',
//           position: 'top',
//         });
//       }
//     } else {
//       Toast.show({
//         type: 'error',
//         text1: 'Not Found',
//         text2: 'No assignment found with this AWB number',
//         position: 'top',
//       });
//     }

//     setManualAWBInput('');
//     setIsManualSelectModalVisible(false);
//   };

//   const handleBulkUpdate = async () => {
//     if (selectedOrders.length === 0) return;
//     setIsBulkUpdating(true);
//     try {

//       const token = getItem("token");
//       await Promise.all(selectedOrders.map(assignmentId =>
//         axios.post(
//           `${baseURL}/api/rider/updateOrderStatus/${assignmentId}`,
//           {
//             status: 'out for delivery'
//           },
//           { headers: { Authorization: `Bearer ${token}` } }
//         )
//       ));

//       Toast.show({
//         type: 'success',
//         text1: 'Success',
//         text2: 'Orders updated successfully',
//         position: 'top',
//       });

//       setSelectedOrders([]);
//       getOrders(true);
//     } catch (error) {
//       console.log(error)
//       Toast.show({
//         type: 'error',
//         text1: 'Error',
//         text2: error.response?.data?.message || 'Failed to update some orders',
//         position: 'top',
//       });
//     } finally {
//       setIsBulkUpdating(false);
//     }
//   };

//   // Handle select all
//   const handleSelectAll = () => {
//     if (selectedOrders.length === filteredAndSortedAssignments.length && filteredAndSortedAssignments.length > 0) {
//       setSelectedOrders([]);
//     } else {
//       const allAssignmentIds = filteredAndSortedAssignments.map(a => a.id);
//       setSelectedOrders(allAssignmentIds);
//     }
//   };

//   const filteredAndSortedAssignments = [...assignments]

//   const renderAssignmentCard = (assignment) => {
//     const isSelected = selectedOrders.includes(assignment.id);

//     return (
//       <TouchableOpacity
//         key={assignment.id}
//         activeOpacity={0.7}
//         onPress={() => {
//           if(assignment.status == 'assigned' || assignment.status == 'undelivered assigned') {

//             toggleSelection(assignment.id);
//           }
//         }}
//         onLongPress={() => {
//           if (assignment.status === 'assigned') {
//             toggleSelection(assignment.id);
//           }
//         }}
//         className={`mt-2 bg-white rounded-2xl p-4 border shadow-sm ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-blue-200'}`}
//       >
//         <View className="mb-4 space-y-2">
//           <View className="flex-row items-start">
//             {/* Radio Button for Selection */}
//             {assignment.status === 'assigned' && (
//               <View className="mt-1 mr-2">
//                 <Icon
//                   name={isSelected ? "radio-button-on" : "radio-button-off"}
//                   size={28}
//                   color={isSelected ? "#2563EB" : "#9CA3AF"}
//                 />
//               </View>
//             )}

//             <View className={`flex-col flex-1 ${assignment.status === 'assigned' ? 'pr-2' : ''}`}>
//               <View className='flex-1'>
//                 <Text className="text-xl font-semibold text-gray-900">{assignment.delivery_contact_name || 'N/A'}</Text>
//               </View>
//               <View className="mt-1 flex-1">
//                 <Text className="text-gray-500">AWB: {assignment.awb_number || 'N/A'}</Text>
//               </View>
//               <View className="mt-2 flex-1 bg-gray-100 py-1.5 px-3 rounded-lg">
//                 <Text className='text-emerald-600 font-bold text-xs uppercase'>Delivery Address</Text>
//                 <Text className="text-gray-700 mt-0.5 text-sm" numberOfLines={2}>
//                   {assignment.delivery_address_line || 'N/A'}
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Action Buttons */}
//         <View className="flex-row space-x-3 pt-3 border-t border-gray-100">
//           <TouchableOpacity
//             onPress={(e) => {
//               e.stopPropagation();
//               navigation.navigate('OrderDetailsScreen', {
//                 order: assignment,
//               });
//             }}
//             className="flex-1 py-2.5 bg-blue-50 rounded-lg flex-row items-center justify-center"
//           >
//             <Icon name="eye-outline" size={18} color="#2563EB" />
//             <Text className="ml-2 text-sm font-semibold text-blue-600">View Details</Text>
//           </TouchableOpacity>

//           {assignment.status === 'assigned' && (
//             <TouchableOpacity
//               onPress={(e) => {
//                 e.stopPropagation(); // Prevent triggering the card's onPress
//                 handleStatusUpdate(assignment.id, 'out for delivery');
//               }}
//               className="flex-1 py-2.5 bg-emerald-50 rounded-lg flex-row items-center justify-center"
//             >
//               <Icon name="bicycle-outline" size={18} color="#059669" />
//               <Text className="ml-2 text-sm font-semibold text-emerald-600">Start Delivery</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View className="flex-1 mb-0 bg-[#F8FAFC]">
//       <Header title="My Orders" showBack={true} />

//       {/* Filters */}
//       <View className="px-5 py-1 bg-gray-300 border-b border-gray-100">
//         <View className="flex-row space-x-3">
//           <View className="flex-1">
//             <View className="flex-row items-center gap-2 mb-2">
//               <TouchableOpacity
//                 onPress={() => {
//                   navigation.navigate('GlobalScanner', {
//                     onScanComplete: (data, type) => {
//                       const scannedAssignment = assignments.find(
//                         a => a.awb_number === data || a.orderno === data
//                       );
//                       if (scannedAssignment) {
//                         setSelectedAssignment(scannedAssignment);
//                         setModalVisible(true);
//                       } else {
//                         Toast.show({
//                           type: 'info',
//                           text1: 'Not Found',
//                           text2: 'No assignment found for this code',
//                           position: 'top',
//                         });
//                       }
//                     },
//                     scanType: 'both',
//                     title: 'Scan Assignment',
//                     showFlashToggle: true,
//                     showCameraToggle: true,
//                     autoFocus: 'enabled',
//                     vibrateOnScan: true,
//                   });
//                 }}
//                 activeOpacity={0.9}
//                 className='w-1/2 flex-row gap-1 bg-[#0446DB] px-12 py-2 justify-center items-center rounded'
//               >
//                 <Icon name="qr-code-outline" size={20} color="#FFFFFF" />
//                 <Text className='text-white text-xl self-center'>Pickup</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={() => {
//                   navigation.navigate('AssignScanner', {
//                     onScanComplete: (data, type) => {
//                       const scannedAssignment = assignments.find(
//                         a => a.awb_number === data || a.orderno === data
//                       );
//                       if (scannedAssignment) {
//                         setSelectedAssignment(scannedAssignment);
//                         setModalVisible(true);
//                       } else {
//                         Toast.show({
//                           type: 'info',
//                           text1: 'Not Found',
//                           text2: 'No assignment found for this code',
//                           position: 'top',
//                         });
//                       }
//                     },
//                     scanType: 'both',
//                     title: 'Scan Assignment',
//                     showFlashToggle: true,
//                     showCameraToggle: true,
//                     autoFocus: 'enabled',
//                     vibrateOnScan: true,
//                   });
//                 }}
//                 className='bg-[#0446DB] w-1/2 flex-row justify-center items-center gap-1 px-12 py-2 rounded'
//               >
//                 <Icon name="qr-code-outline" size={20} color="#FFFFFF" />
//                 <Text className='text-white text-xl self-center'>Assign</Text>
//               </TouchableOpacity>
//             </View>

//             <View className="flex-row items-center justify-between mb-1">
//               <Text className="text-xl font-semibold text-[#111827]">Filter by Status</Text>
//               {/* {filterStatus === 'assigned' && assignments.length > 0 && (
//                 <TouchableOpacity
//                   onPress={() => setIsManualSelectModalVisible(true)}
//                   className="flex-row items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg"
//                 >
//                   <Icon name="create-outline" size={18} color="#2563EB" />
//                   <Text className="text-sm font-semibold text-blue-600">Manual Select</Text>
//                 </TouchableOpacity>
//               )} */}
//             </View>
//             <Dropdown
//               style={styles.dropdown}
//               placeholderStyle={styles.placeholderStyle}
//               selectedTextStyle={styles.selectedTextStyle}
//               iconStyle={styles.iconStyle}
//               data={statusOptions}
//               maxHeight={300}
//               labelField="label"
//               valueField="value"
//               placeholder="Select status"
//               value={filterStatus}
//               onChange={item => setFilterStatus(item.value)}
//               renderRightIcon={() => (
//                 <Icon name="chevron-down" size={20} color="#6B7280" />
//               )}
//             />
//           </View>
//         </View>
//       </View>

//       {/* Assignments List */}
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         className="flex-1"
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#3B82F6']}
//             tintColor="#3B82F6"
//           />
//         }
//         onScroll={({ nativeEvent }) => {
//           const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
//           const paddingToBottom = 20;
//           if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
//             loadMore();
//           }
//         }}
//         scrollEventThrottle={400}
//       >
//         <View className="px-5 pt-4">
//           <View className="flex-row items-center justify-between mb-4">
//             <Text className="text-lg font-bold text-[#111827]">
//               {filteredAndSortedAssignments.length} Assignment{filteredAndSortedAssignments.length !== 1 ? 's' : ''}
//             </Text>
//             {filterStatus === 'assigned' && filteredAndSortedAssignments.length > 0 ? (
//               <TouchableOpacity
//                 className="flex-row items-center gap-1"
//                 onPress={handleSelectAll}
//               >
//                 <Icon
//                   name={selectedOrders.length === filteredAndSortedAssignments.length && filteredAndSortedAssignments.length > 0 ? "checkmark-circle" : "ellipse-outline"}
//                   size={20}
//                   color="#2563EB"
//                 />
//                 <Text className="text-sm font-semibold text-blue-600">Select All</Text>
//               </TouchableOpacity>
//             ) : (
//               <Text className="text-sm text-gray-600">
//                 Page {page} of {totalPages}
//               </Text>
//             )}
//           </View>

//           {loading && page === 1 ? (
//             <View className="flex-1 py-12 items-center justify-center">
//               <ActivityIndicator size="large" color="#0446DB" />
//               <Text className="text-gray-500 font-medium mt-4">Loading Orders...</Text>
//             </View>
//           ) : (
//             <>
//               {filteredAndSortedAssignments.map((assignment, index) => (
//                 <React.Fragment key={assignment.id || assignment.awb_number || assignment.order_id || index}>
//                   {renderAssignmentCard(assignment)}
//                 </React.Fragment>
//               ))}

//               {loadingMore && (
//                 <View className="py-4 flex-1 items-center justify-center">
//                   <ActivityIndicator size="large" color="#0446DB" />
//                 </View>
//               )}

//               {filteredAndSortedAssignments.length === 0 && !loading && (
//                 <View className="py-12 items-center">
//                   <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
//                     <Icon name="document-text-outline" size={48} color="#9CA3AF" />
//                   </View>
//                   <Text className="text-xl font-bold text-gray-400">No assignments found</Text>
//                   <Text className="text-gray-400 mt-2 text-center px-8">
//                     {filterStatus === 'all'
//                       ? "You don't have any assignments yet"
//                       : `No ${filterStatus} assignments found`
//                     }
//                   </Text>
//                   {filterStatus !== 'assigned' && (
//                     <TouchableOpacity
//                       onPress={() => setFilterStatus('assigned')}
//                       className="mt-4 px-6 py-3 bg-blue-600 rounded-xl"
//                     >
//                       <Text className="text-white font-semibold">View Assigned Orders</Text>
//                     </TouchableOpacity>
//                   )}
//                 </View>
//               )}
//             </>
//           )}
//         </View>
//         <View className="h-6" />
//       </ScrollView>

//       {/* Bulk Bottom Action Bar */}
//       {selectedOrders.length > 0 && filterStatus === 'assigned' && (
//         <View className=" bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex-row items-center justify-between elevation-5">
//           <View>
//             <Text className="text-sm font-semibold text-gray-500">Selected</Text>
//             <Text className="text-lg font-bold text-gray-900">{selectedOrders.length} Orders</Text>
//           </View>
//           <TouchableOpacity
//             onPress={handleBulkUpdate}
//             disabled={isBulkUpdating}
//             className={`flex-row items-center gap-2 px-6 py-3 rounded-xl ${isBulkUpdating ? 'bg-emerald-300' : 'bg-emerald-600'}`}
//           >
//             {isBulkUpdating ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <Icon name="bicycle-outline" size={20} color="#FFFFFF" />
//             )}
//             <Text className="text-white font-bold text-base">Bulk Start Delivery</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   dropdown: {
//     height: 48,
//     backgroundColor: 'white',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   placeholderStyle: {
//     fontSize: 14,
//     color: '#9CA3AF',
//   },
//   selectedTextStyle: {
//     fontSize: 14,
//     color: '#111827',
//     fontWeight: '500',
//   },
//   iconStyle: {
//     width: 20,
//     height: 20,
//   },
//   modal: {
//     justifyContent: 'flex-end',
//     margin: 0,
//   },
//   modalContainer: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: '50%'
//   },
//   modalScrollView: {
//     maxHeight: 'auto',
//   },
//   modalScrollContent: {
//     paddingBottom: 0,
//   },
// });

// export default AssignmentsScreen;


import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl, ActivityIndicator, TextInput, Keyboard, Modal } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import Header from '../components/Header'
import Icon from 'react-native-vector-icons/Ionicons'
import { Dropdown } from 'react-native-element-dropdown'
import axios from 'axios'
import { getItem } from '../utils/StorageService'
import Toast from 'react-native-toast-message';
import Loader from '../components/Loder'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import AxiosInstance from '../services/AxiosInstance'

const baseURL = 'https://go-admin.daakit.com'

const AssignmentsScreen = () => {
  const navigation = useNavigation();
  const [assignments, setAssignments] = useState([])
  const [loadSummary, setLoadSummary] = useState({})
  const [refreshing, setRefreshing] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [isModalVisible, setModalVisible] = useState(false)
  const [isUndeliveredModalVisible, setIsUndeliveredModalVisible] = useState(false)
  const [filterStatus, setFilterStatus] = useState('assigned')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState([])
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isManualSelectModalVisible, setIsManualSelectModalVisible] = useState(false)
  const [manualAWBInput, setManualAWBInput] = useState('')
  const [address, setAddress] = useState({
    latitude: '',
    longitude: '',
    address: ''
  })

  const statusOptions = [
    { label: 'Assigned', value: 'assigned' },
    { label: 'Out for Delivery', value: 'out for delivery' },
    { label: 'Delivered', value: 'delivered' },
  ]

  const getOrders = async (pageToFetch = 1, resetPage = false) => {
    const token = getItem("token");

    try {
      if (resetPage) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let res;
      if (filterStatus === "assigned") {
        // For 'assigned' status with pagination
        res = await AxiosInstance.get(`/rider/getRiderReadyAssignments`, {
          params: {
            page: pageToFetch,
            limit: 10
          }
        });

        const data = res?.data?.data || [];
        const filteredData = data.filter(o => o.status !== "out for delivery");

        setAssignments(filteredData);
        setLoadSummary(res?.data?.load_summary || {});

        // Set pagination info for assigned status
        if (res?.data?.pagination) {
          console.log(res?.data?.pagination)
          setTotalPages(res.data.pagination.total_pages || 1);
          setTotalItems(res.data.pagination.total || 0);
          setPage(res.data.pagination.page || pageToFetch);
        } else {
          // Fallback if pagination object doesn't exist
          setTotalPages(1);
          setTotalItems(filteredData.length);
          setPage(1);
        }

      } else {
        // For other statuses, use pagination
        res = await axios.get(
          `${baseURL}/api/rider/getRiderOrdersByStatus`,
          {
            params: {
              status: filterStatus,
              page: pageToFetch,
              limit: 10
            },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const newData = res.data.data || [];
        setAssignments(newData);

        // Set pagination info
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
          setTotalItems(res.data.pagination.total || 0);
          setPage(res.data.pagination.page || pageToFetch);
        }
      }

    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || err.message || `Error fetching orders`,
        position: 'top',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setPage(1);
      getOrders(1, true);
    }
  }, [isFocused]);

  useEffect(() => {
    setSelectedOrders([]);
    setPage(1);
    getOrders(1, true);
  }, [filterStatus]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSelectedOrders([]);
    setPage(1);
    getOrders(1, true).finally(() => setRefreshing(false));
  }, [filterStatus]);

  // Go to specific page
  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      getOrders(newPage, false);
      // Scroll to top
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    }
  };

  // Previous page
  const goToPreviousPage = () => {
    if (page > 1) {
      goToPage(page - 1);
    }
  };

  // Next page
  const goToNextPage = () => {
    if (page < totalPages) {
      goToPage(page + 1);
    }
  };

  const handleStatusUpdate = async (assignmentId, newStatus) => {
    if (newStatus === 'undelivered') {
      setIsUndeliveredModalVisible(true);
      return;
    }

    Alert.alert(
      'Update Status',
      `Change status to ${newStatus.replace(/\b\w/g, l => l.toUpperCase())}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const token = getItem("token");
              await axios.post(
                `${baseURL}/api/rider/updateAssignmentStatus`,
                {
                  id: assignmentId,
                  status: newStatus
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Status updated successfully',
                position: 'top',
              });

              setPage(1);
              getOrders(1, true);
              setModalVisible(false);
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to update status',
                position: 'top',
              });
            }
          }
        }
      ]
    );
  };

  // Toggle selection function
  const toggleSelection = (assignmentId) => {
    setSelectedOrders(prev => {
      if (prev.includes(assignmentId)) {
        return prev.filter(id => id !== assignmentId);
      } else {
        return [...prev, assignmentId];
      }
    });
  };

  // Manual selection by AWB number
  const handleManualSelect = () => {
    if (!manualAWBInput.trim()) {
      Toast.show({
        type: 'warning',
        text1: 'Warning',
        text2: 'Please enter an AWB number',
        position: 'top',
      });
      return;
    }

    const assignment = assignments.find(
      a => a.awb_number === manualAWBInput.trim() || a.orderno === manualAWBInput.trim()
    );

    if (assignment) {
      if (assignment.status === 'assigned') {
        if (!selectedOrders.includes(assignment.id)) {
          toggleSelection(assignment.id);
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Order selected successfully',
            position: 'top',
          });
        } else {
          Toast.show({
            type: 'info',
            text1: 'Info',
            text2: 'Order already selected',
            position: 'top',
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Only assigned orders can be selected',
          position: 'top',
        });
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Not Found',
        text2: 'No assignment found with this AWB number',
        position: 'top',
      });
    }

    setManualAWBInput('');
    setIsManualSelectModalVisible(false);
  };

  const handleBulkUpdate = async () => {
    if (selectedOrders.length === 0) return;
    setIsBulkUpdating(true);
    try {
      const token = getItem("token");
      await Promise.all(selectedOrders.map(assignmentId =>
        axios.post(
          `${baseURL}/api/rider/updateOrderStatus/${assignmentId}`,
          {
            status: 'out for delivery'
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ));

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Orders updated successfully',
        position: 'top',
      });

      setSelectedOrders([]);
      setPage(1);
      getOrders(1, true);
    } catch (error) {
      console.log(error)
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to update some orders',
        position: 'top',
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedOrders.length === filteredAndSortedAssignments.length && filteredAndSortedAssignments.length > 0) {
      setSelectedOrders([]);
    } else {
      const allAssignmentIds = filteredAndSortedAssignments.map(a => a.id);
      setSelectedOrders(allAssignmentIds);
    }
  };

  const filteredAndSortedAssignments = [...assignments]

  const renderAssignmentCard = (assignment) => {
    const isSelected = selectedOrders.includes(assignment.id);

    return (
      <TouchableOpacity
        key={assignment.id}
        activeOpacity={0.7}
        onPress={() => {
          console.log(assignment)
          // Toggle selection on card click for assigned orders only
          if (assignment.status === 'assigned' || assignment.status==='in transit' || assignment.status === 'undelivered assigned') {
            console.log(assignment.id)
            toggleSelection(assignment.id);
          }
        }}
        onLongPress={() => {
          // Long press also toggles selection
          if (assignment.status === 'assigned') {
            toggleSelection(assignment.id);
          }
        }}
        className={`mt-2 bg-white rounded-2xl p-4 border shadow-sm ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-blue-200'}`}
      >
        <View className="mb-4 space-y-2">
          <View className="flex-row items-start">
            {/* Radio Button for Selection */}
            {assignment.status === 'assigned' && (
              <View className="mt-1 mr-2">
                <Icon
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={28}
                  color={isSelected ? "#2563EB" : "#9CA3AF"}
                />
              </View>
            )}

            <View className={`flex-col flex-1 ${assignment.status === 'assigned' ? 'pr-2' : ''}`}>
              <View className='flex-1'>
                <Text className="text-xl font-semibold text-gray-900">{assignment.delivery_contact_name || 'N/A'}</Text>
              </View>
              <View className="mt-1 flex-1">
                <Text className="text-gray-500">AWB: {assignment.awb_number || 'N/A'}</Text>
              </View>
              <View className="mt-2 flex-1 bg-gray-100 py-1.5 px-3 rounded-lg">
                <Text className='text-emerald-600 font-bold text-xs uppercase'>Delivery Address</Text>
                <Text className="text-gray-700 mt-0.5 text-sm" numberOfLines={2}>
                  {assignment.delivery_address_line || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-3 pt-3 border-t border-gray-100">
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation(); // Prevent card click when clicking this button
              navigation.navigate('OrderDetailsScreen', {
                order: assignment,
              });
            }}
            className="flex-1 py-2.5 bg-blue-50 rounded-lg flex-row items-center justify-center"
          >
            <Icon name="eye-outline" size={18} color="#2563EB" />
            <Text className="ml-2 text-sm font-semibold text-blue-600">View Details</Text>
          </TouchableOpacity>
          
          {assignment.status === 'assigned' && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation(); // Prevent card click when clicking this button
                handleStatusUpdate(assignment.id, 'out for delivery');
              }}
              className="flex-1 py-2.5 bg-emerald-50 rounded-lg flex-row items-center justify-center"
            >
              <Icon name="bicycle-outline" size={18} color="#059669" />
              <Text className="ml-2 text-sm font-semibold text-emerald-600">Start Delivery</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Create scrollView ref
  const scrollViewRef = React.useRef(null);

  // Render bottom pagination controls
  const renderBottomPagination = () => {
    // if (filterStatus === 'assigned') {
    //   return null; // No pagination controls for assigned status, only select all
    // }

    // Alert.alert(totalPages)

    if (totalPages <= 1) {
      return null; // No pagination needed if only one page
    }

    return (
      <View className="px-5 py-4 bg-white border-t border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={goToPreviousPage}
            disabled={page === 1 || loading}
            className={`flex-row items-center px-4 py-2 rounded-lg ${page === 1 || loading ? 'bg-gray-100' : 'bg-blue-100'}`}
          >
            <Icon
              name="chevron-back"
              size={20}
              color={page === 1 || loading ? '#9CA3AF' : '#2563EB'}
            />
            <Text className={`ml-1 font-semibold ${page === 1 || loading ? 'text-gray-400' : 'text-blue-600'}`}>
              Previous
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <Text className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </Text>
            {totalItems > 0 && (
              <Text className="text-sm text-gray-400">
                ({((page - 1) * 10) + 1}-{Math.min(page * 10, totalItems)} of {totalItems})
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={goToNextPage}
            disabled={page === totalPages || loading}
            className={`flex-row items-center px-4 py-2 rounded-lg ${page === totalPages || loading ? 'bg-gray-100' : 'bg-blue-100'}`}
          >
            <Text className={`mr-1 font-semibold ${page === totalPages || loading ? 'text-gray-400' : 'text-blue-600'}`}>
              Next
            </Text>
            <Icon
              name="chevron-forward"
              size={20}
              color={page === totalPages || loading ? '#9CA3AF' : '#2563EB'}
            />
          </TouchableOpacity>
        </View>

        {/* Page number buttons */}
        {/* <View className="flex-row justify-center items-center mt-3 gap-2">
          {totalPages <= 5 ? (
            // Show all pages if total pages <= 5
            Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <TouchableOpacity
                key={pageNum}
                onPress={() => goToPage(pageNum)}
                disabled={loading}
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  pageNum === page ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <Text className={`font-semibold ${pageNum === page ? 'text-white' : 'text-gray-700'}`}>
                  {pageNum}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            // Show limited pages with ellipsis
            <>
              <TouchableOpacity
                onPress={() => goToPage(1)}
                disabled={loading}
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  1 === page ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <Text className={`font-semibold ${1 === page ? 'text-white' : 'text-gray-700'}`}>
                  1
                </Text>
              </TouchableOpacity>

              {page > 3 && (
                <Text className="text-gray-400">...</Text>
              )}

              {page > 2 && page < totalPages - 1 && (
                <TouchableOpacity
                  onPress={() => goToPage(page)}
                  disabled={loading}
                  className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center"
                >
                  <Text className="font-semibold text-white">{page}</Text>
                </TouchableOpacity>
              )}

              {page < totalPages - 2 && (
                <Text className="text-gray-400">...</Text>
              )}

              <TouchableOpacity
                onPress={() => goToPage(totalPages)}
                disabled={loading}
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  totalPages === page ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <Text className={`font-semibold ${totalPages === page ? 'text-white' : 'text-gray-700'}`}>
                  {totalPages}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View> */}
      </View>
    );
  };

  return (
    <View className="flex-1 mb-0 bg-[#F8FAFC]">
      <Header title="My Orders" showBack={true} />

      {/* Filters */}
      <View className="px-5 py-1 bg-gray-300 border-b border-gray-100">
        <View className="flex-row space-x-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-2">
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Scanner", {
                    scanType: "pickup",
                  });
                }}
                activeOpacity={0.9}
                className='w-1/2 flex-row gap-1 bg-[#0446DB] px-12 py-2 justify-center items-center rounded'
              >
                <Icon name="qr-code-outline" size={20} color="#FFFFFF" />
                <Text className='text-white text-xl self-center'>Pickup</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Scanner", {
                    scanType: "assign",
                  });
                }}
                className='bg-[#0446DB] w-1/2 flex-row justify-center items-center gap-1 px-12 py-2 rounded'
              >
                <Icon name="qr-code-outline" size={20} color="#FFFFFF" />
                <Text className='text-white text-xl self-center'>Assign</Text>
              </TouchableOpacity>
            </View>

            {/* <View className="flex-row items-center justify-between mb-1">
              <Text className="text-xl font-semibold text-[#111827]">Filter by Status</Text>
              {filterStatus === 'assigned' && assignments.length > 0 && (
                <TouchableOpacity
                  onPress={() => setIsManualSelectModalVisible(true)}
                  className="flex-row items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg"
                >
                  <Icon name="create-outline" size={18} color="#2563EB" />
                  <Text className="text-sm font-semibold text-blue-600">Manual Select</Text>
                </TouchableOpacity>
              )}
            </View> */}
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              data={statusOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select status"
              value={filterStatus}
              onChange={item => setFilterStatus(item.value)}
              renderRightIcon={() => (
                <Icon name="chevron-down" size={20} color="#6B7280" />
              )}
            />
          </View>
        </View>
      </View>

      {/* Assignments List */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        <View className="px-5 pt-4 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-[#111827]">
              {filteredAndSortedAssignments.length} Assignment{filteredAndSortedAssignments.length !== 1 ? 's' : ''}
            </Text>
            {filterStatus === 'assigned' && filteredAndSortedAssignments.length > 0 ? (
              <TouchableOpacity
                className="flex-row items-center gap-1"
                onPress={handleSelectAll}
              >
                <Icon
                  name={selectedOrders.length === filteredAndSortedAssignments.length && filteredAndSortedAssignments.length > 0 ? "checkmark-circle" : "ellipse-outline"}
                  size={20}
                  color="#2563EB"
                />
                <Text className="text-sm font-semibold text-blue-600">Select All</Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </Text>
            )}
          </View>

          {loading ? (
            <View className="flex-1 py-12 items-center justify-center">
              <ActivityIndicator size="large" color="#0446DB" />
              <Text className="text-gray-500 font-medium mt-4">Loading Orders...</Text>
            </View>
          ) : (
            <>
              {filteredAndSortedAssignments.map((assignment, index) => (
                <React.Fragment key={assignment.id || assignment.awb_number || assignment.order_id || index}>
                  {renderAssignmentCard(assignment)}
                </React.Fragment>
              ))}

              {filteredAndSortedAssignments.length === 0 && !loading && (
                <View className="py-12 items-center">
                  <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <Icon name="document-text-outline" size={48} color="#9CA3AF" />
                  </View>
                  <Text className="text-xl font-bold text-gray-400">No assignments found</Text>
                  <Text className="text-gray-400 mt-2 text-center px-8">
                    {filterStatus === 'all'
                      ? "You don't have any assignments yet"
                      : `No ${filterStatus} assignments found`
                    }
                  </Text>
                  {filterStatus !== 'assigned' && (
                    <TouchableOpacity
                      onPress={() => setFilterStatus('assigned')}
                      className="mt-4 px-6 py-3 bg-blue-600 rounded-xl"
                    >
                      <Text className="text-white font-semibold">View Assigned Orders</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Pagination Controls */}
      {renderBottomPagination()}
    

      {/* Bulk Bottom Action Bar */}
      {selectedOrders.length > 0 && filterStatus === 'assigned' && (
        <View className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex-row items-center justify-between elevation-5">
          <View>
            <Text className="text-sm font-semibold text-gray-500">Selected</Text>
            <Text className="text-lg font-bold text-gray-900">{selectedOrders.length} Orders</Text>
          </View>
          <TouchableOpacity
            onPress={handleBulkUpdate}
            disabled={isBulkUpdating}
            className={`flex-row items-center gap-2 px-6 py-3 rounded-xl ${isBulkUpdating ? 'bg-emerald-300' : 'bg-emerald-600'}`}
          >
            {isBulkUpdating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="bicycle-outline" size={20} color="#FFFFFF" />
            )}
            <Text className="text-white font-bold text-base">Bulk Start Delivery</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Manual Select Modal */}
      <Modal
        visible={isManualSelectModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsManualSelectModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Select Order by AWB</Text>
              <TouchableOpacity onPress={() => setIsManualSelectModalVisible(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text className="text-gray-500 mb-4">Enter the AWB number to select the order</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholder="Enter AWB number"
              value={manualAWBInput}
              onChangeText={setManualAWBInput}
              autoFocus={true}
              onSubmitEditing={handleManualSelect}
            />
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={() => setIsManualSelectModalVisible(false)}
                className="flex-1 py-3 bg-gray-100 rounded-xl"
              >
                <Text className="text-center text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleManualSelect}
                className="flex-1 py-3 bg-blue-600 rounded-xl"
              >
                <Text className="text-center text-white font-semibold">Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 48,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '50%'
  },
  modalScrollView: {
    maxHeight: 'auto',
  },
  modalScrollContent: {
    paddingBottom: 0,
  },
});

export default AssignmentsScreen;