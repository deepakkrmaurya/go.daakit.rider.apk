import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';
import { getItem } from '../utils/StorageService'
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Header from '../components/Header'
import AnalyticsSkeleton from '../skeleton/AnalyticsSkeleton'
import CustomSafeAreaView from '@components/global/CustomSafeAreaView';
import AxiosInstance from "../services/AxiosInstance"
import RiderTracking from '@utils/RiderTracking';
// const formatDate = date => date.toISOString().split("T")[0];
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
const parseDate = dateString => {
  if (!dateString) {
    return new Date();
  }

  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export default function Analytics() {
  const baseUrl = "https://go-admin.daakit.com"

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState("Today");
  const today = new Date();
  const [analytics, setAnalytics] = useState({});
  const [filter, setFilter] = useState({
    start_date: today.toISOString().split("T")[0],
    end_date: today.toISOString().split("T")[0],
  });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [tempFilter, setTempFilter] = useState({
    start_date: today.toISOString().split("T")[0],
    end_date: today.toISOString().split("T")[0],
  });
  const [activePicker, setActivePicker] = useState(null);

  const closeFilterSheet = useCallback(() => {
    setShowCustomRange(false);
    setActivePicker(null);
  }, []);

  const openFilterSheet = () => {
    setTempFilter(filter);
    setActivePicker(null);
    setShowCustomRange(true);
  };

  const getDateRange = (value) => {
    let fromDate, toDate;

    switch (value) {
      case "Today": {
        fromDate = new Date();
        toDate = new Date();
        break;
      }

      case "Yesterday": {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        fromDate = yesterday;
        toDate = yesterday;
        break;
      }

      case "Last 7 Days": {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        fromDate = start;
        toDate = end;
        break;
      }

      case "Last 30 Days": {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);
        fromDate = start;
        toDate = end;
        break;
      }

      case "This Month": {
        fromDate = new Date();
        fromDate.setDate(1);
        toDate = new Date();
        break;
      }

      case "Last Month": {
        fromDate = new Date();
        fromDate.setMonth(fromDate.getMonth() - 1);
        fromDate.setDate(1);
        toDate = new Date();
        toDate.setDate(0);
        break;
      }

      default:
        return null;
    }

    return {
      start_date: formatDate(fromDate),
      end_date: formatDate(toDate),
    };
  };

  const selectPresetInSheet = (value) => {
    const newFilter = getDateRange(value);

    if (!newFilter) {
      return;
    }

    setSelected(value);
    setTempFilter(newFilter);
    setActivePicker(null);
  };

  const getAnalytics = useCallback(async () => {

    setLoading(true);
    try {
      const token = getItem('token');
      const res = await AxiosInstance.get(`rider/getRiderDashboardStats`,
        {
          params: {
            start_date: filter.start_date,
            end_date: filter.end_date,
          },
        }
      );
      setAnalytics(res?.data?.data);
    } catch (err) {

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response.data.message,
        position: 'right',
      });
      return
    } finally {
      setLoading(false);
    }
  }, [filter.end_date, filter.start_date]);

  const applyCustomFilter = () => {
    setFilter({
      start_date: tempFilter.start_date,
      end_date: tempFilter.end_date,
    });
    closeFilterSheet();
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setActivePicker(null);
    }

    if (event?.type === 'dismissed' || !selectedDate || !activePicker) {
      return;
    }

    const selectedValue = formatDate(selectedDate);

    setTempFilter((prev) => {
      if (activePicker === 'start') {
        return {
          start_date: selectedValue,
          end_date: prev.end_date < selectedValue ? selectedValue : prev.end_date,
        };
      }

      return {
        start_date: prev.start_date > selectedValue ? selectedValue : prev.start_date,
        end_date: selectedValue,
      };
    });
  };

  useEffect(() => {
    getAnalytics();
  }, [getAnalytics]);

  // Calculate performance percentage safely
  const performancePercent = analytics?.performance?.performance_percent || 0;
  const performanceRatio = analytics?.performance?.performance_ratio || 0;



  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
        <AnalyticsSkeleton />
      </View>
    );
  }

  return (
    <CustomSafeAreaView
    >
      <RiderTracking/>
      <Header title="Home" showBack={false} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode='on-drag'
        contentContainerStyle={styles.scrollContent}
      >
        <View className="p-0">
          {/* Date Filter Card */}
          <View className="bg-[#0446DB] shadow-sm  border-gray-100 p-4 mb-3">
            <View className="space-y-4">

              {/* Quick Actions Row */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl items-center justify-center">
                    <FontAwesome5 name="calendar-alt" size={18} color="white" />
                  </View>
                  <View>
                    <Text className=' font-bold text-white'>Daily Analytics</Text>
                    <Text className=" font-regular text-white">Track your delivery performance</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={openFilterSheet}
                  className='bg-white w-10 h-10 rounded-xl items-center justify-center'
                >
                  <Feather name="filter" size={20} color="#0446DB" />
                </TouchableOpacity>

              </View>
            </View>
          </View>


          {/* Stats Cards Grid - 2x2 Layout */}
          <View className="flex-row flex-wrap mb-6 px-2">
            {/* Assigned Orders Card */}
            <View className="w-1/2 p-1">
              <View className="bg-purple-500 rounded-2xl shadow-lg p-4">
                <View className="flex-row justify-between">
                  <View>
                    <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mb-2">
                      <Feather name="list" size={18} color="white" />
                    </View>
                    <Text className="text-xs font-medium text-white/90">Assigned</Text>
                    <Text className="text-2xl font-bold text-white mt-1">{analytics?.assigned_orders_count || 0}</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-white/80">Current</Text>
                  </View>
                </View>
              </View>
            </View>
            {/* Total Delivered Card */}
            <View className="w-1/2 p-1">
              <View className="bg-[#0446DB] rounded-2xl shadow-lg p-4">
                <View className="flex-row justify-between">
                  <View>
                    <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mb-2">
                      <Feather name="check-circle" size={18} color="white" />
                    </View>
                    <Text className="text-xs font-medium text-white/90">Total Delivered</Text>
                    <Text className="text-2xl font-bold text-white mt-1">{analytics?.totalDelivered || 0}</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-white/80">Orders</Text>
                  </View>
                </View>
              </View>
            </View>



            {/* Pending COD Card */}
            <View className="w-1/2 p-1">
              <View className="bg-amber-500 rounded-2xl shadow-lg p-4">
                <View className="flex-row justify-between">
                  <View>
                    <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mb-2">
                      <FontAwesome5 name="money-bill-wave" size={16} color="white" />
                    </View>
                    <Text className="text-xs font-medium text-white/90">COD Pending  Submission</Text>
                    <Text className="text-2xl font-bold text-white mt-1">{analytics?.pending_cod_remittance_count || 0}</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-white/80">Pending</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Performance Card */}
            <View className="w-1/2 p-1">
              <View className={`rounded-2xl shadow-lg p-4 ${performancePercent >= 90 ? 'bg-emerald-500' :
                performancePercent >= 70 ? 'bg-green-500' :
                  performancePercent >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                }`}>
                <View className="flex-row justify-between">
                  <View>
                    <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mb-2">
                      <MaterialCommunityIcons name="speedometer" size={18} color="white" />
                    </View>
                    <Text className="text-xs font-medium text-white/90">Performance</Text>
                    <Text className="text-2xl font-bold text-white mt-1">{performancePercent}%</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-white/80">Score</Text>
                  </View>
                </View>

              </View>
            </View>
          </View>

          {/* Performance Details Card */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <View className="flex-row items-center gap-3 mb-5">
              <View className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl items-center justify-center">
                <FontAwesome5 name="chart-line" size={20} color="#9333ea" />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">Performance Breakdown</Text>
                <Text className="0446DB text-gray-500">Detailed delivery metrics</Text>
              </View>
            </View>

            <View className="space-y-4">

              {/* Completion Ratio */}
              <View className="bg-gradient-to-r mt-2 from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-700">Completion Ratio</Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      Higher ratio indicates better delivery efficiency
                    </Text>
                  </View>
                  <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center">
                    <Text className="0446DB font-bold text-blue-600">{performanceRatio}</Text>
                  </View>
                </View>
              </View>

              {/* Summary Stats */}
              {/* <View className="flex-row bg-gray-50 rounded-xl p-4">
                <View className="flex-1 items-center border-r border-gray-200">
                  <Text className="text-xs text-gray-500 mb-1">Success Rate</Text>
                  <Text className="text-lg font-bold text-green-600">
                    {totalAssigned > 0 ? ((completedOnly / totalAssigned) * 100).toFixed(1) : 0}%
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-xs text-gray-500 mb-1">Avg. Per Day</Text>
                  <Text className="text-lg font-bold text-[#564ec1]">
                    {analytics?.totalDelivered ? Math.ceil(analytics?.totalDelivered / 7) : 0}
                  </Text>
                </View>
              </View> */}
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        isVisible={showCustomRange}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={300}
        animationOutTiming={300}
        style={styles.modal}
        onBackdropPress={closeFilterSheet}
        onBackButtonPress={closeFilterSheet}
        onSwipeComplete={closeFilterSheet}
        swipeDirection="down"
        propagateSwipe={true}
        scrollOffsetMax={400}
        panResponderThreshold={4}
        swipeThreshold={120}
        avoidKeyboard={true}
        backdropOpacity={0.5}
        useNativeDriver={false}
        useNativeDriverForBackdrop={true}
        hideModalContentWhileAnimating={true}
      >
        <View style={styles.bottomSheet}>
          <View className="items-center pb-4">
            <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </View>

          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-lg font-bold text-gray-900">Filter Analytics</Text>
              <Text className="text-xs text-gray-500 mt-1">Choose a date range</Text>
            </View>
            <TouchableOpacity
              onPress={closeFilterSheet}
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
            >
              <Feather name="x" size={20} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <View className='flex-row gap-2'>
            {["Today", "Yesterday", "Last 7 Days", "Last 30 Days"].map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => selectPresetInSheet(period)}
                className={`flex-1 py-3 px-1 rounded-lg ${selected === period
                  ? "bg-[#0446DB] shadow-sm"
                  : "bg-gray-100"
                  }`}
              >
                <Text className={`font-medium text-center ${selected === period ? "text-white" : "text-gray-600"
                  }`}>
                  {period === "Last 7 Days" ? "7D" :
                    period === "Last 30 Days" ? "30D" :
                      period === "Yesterday" ? "Yest" : period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              onPress={() => setActivePicker('start')}
              className={`flex-1 px-4 py-3 border rounded-xl bg-gray-50 ${activePicker === 'start' ? 'border-[#0446DB]' : 'border-gray-300'}`}
            >
              <Text className="font-medium text-gray-700 mb-1">From Date</Text>
              <View className="flex-row items-center gap-2">
                <Feather name="calendar" size={16} color="#0446DB" />
                <Text className="font-bold text-gray-900">{tempFilter.start_date}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActivePicker('end')}
              className={`flex-1 px-4 py-3 border rounded-xl bg-gray-50 ${activePicker === 'end' ? 'border-[#0446DB]' : 'border-gray-300'}`}
            >
              <Text className="font-medium text-gray-700 mb-1">To Date</Text>
              <View className="flex-row items-center gap-2">
                <Feather name="calendar" size={16} color="#0446DB" />
                <Text className="font-bold text-gray-900">{tempFilter.end_date}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {activePicker && (
            <View className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden mt-4">
              <DateTimePicker
                value={parseDate(activePicker === 'start' ? tempFilter.start_date : tempFilter.end_date)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                minimumDate={activePicker === 'end' ? parseDate(tempFilter.start_date) : undefined}
                onChange={handleDateChange}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  onPress={() => setActivePicker(null)}
                  className="mx-3 mb-3 py-3 bg-[#0446DB] rounded-xl"
                >
                  <Text className="text-white font-medium text-center">Done</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <TouchableOpacity
            onPress={applyCustomFilter}
            className="w-full py-3 mt-5 bg-[#0446DB] rounded-xl active:opacity-80"
          >
            <Text className="text-white font-medium text-center">Apply Filter</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </CustomSafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
});
