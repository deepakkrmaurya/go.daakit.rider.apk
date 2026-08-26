
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Switch,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Feather';
import Header from '../components/Header';
import axios from 'axios';
import { getItem } from "../utils/StorageService"
import Toast from 'react-native-toast-message';
import { useIsFocused } from '@react-navigation/native';
const baseUrl = 'https://go-admin.daakit.com';
const Dashboard = () => {
  const [attendance, setAttendance] = useState(null);
  const [riderActive, setRiderActive] = useState(null);
  const [riderAvailability, setRiderAvailability] = useState(null);
  const [profile, setProfile] = useState(null);
  const [getRiderActiveTime, SetgetRiderActiveTime] = useState({});
  const [loading, setLoading] = useState(true);
  const GetRiderActiveTime = async () => {
    try {
      const token = getItem("token");
      const res = await axios.get(`${baseUrl}/api/rider/getRiderActiveTime`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      SetgetRiderActiveTime(res.data.data || res.data || {})
    } catch (error) {
      // setError('Failed to fetch attendance data');
    } finally {
      // setLoading(false);
    }
  };

 

  const getRiderStatus = async () => {
    const token = getItem("token");
    try {
      const res = await axios.get(`${baseUrl}/api/rider/getRiderStatus`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRiderActive(res.data.data.is_active);
      setRiderAvailability(res.data.data.is_available);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response.data.message,
        position: 'top',
      });
    }
  };

  const changeActive = async () => {

    const token = getItem("token");

    try {
      let newStatus;
      riderActive ? (newStatus = "inactive") : (newStatus = "active");
      const res = await axios.post(
        `${baseUrl}/api/rider/updateActiveStatus`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRiderActive(res.data.is_active == 1);
      setRiderAvailability(res.data.is_available == 1);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `You're now ${newStatus}`,
        position: 'top',
      });

    } catch (err) {


      // toast.error(err.response?.data?.message || err.message || "Error while changing status");
    } finally {
      // setLoading(false);
    }
  };

  const [dateFilter, setdateFilter] = useState('month')
  const [customStartDate, setCustomStartDate] = useState(null)
  const [customEndDate, setCustomEndDate] = useState(null)
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const getDateRange = () => {

    const today = new Date();
    const startDate = new Date();

    switch (dateFilter) {
      case 'today':
        return {
          start_date: formatDateLocal(today),
          end_date: formatDateLocal(today)
        };
      case 'week':
        startDate.setDate(today.getDate() - 7);
        return {
          start_date: formatDateLocal(startDate),
          end_date: formatDateLocal(today)
        };
      case 'month':

        startDate.setDate(today.getDate() - 30);
        return {
          start_date: formatDateLocal(startDate),
          end_date: formatDateLocal(today)
        };
      case 'custom':
        return {
          start_date: customStartDate,
          end_date: customEndDate
        };
      default:
        return {
          start_date: formatDateLocal(today),
          end_date: formatDateLocal(today)
        };
    }
  };
  const [markedDates, setMarkedDates] = useState({
    // '2026-02-20': {
    //   selected: true,
    //   selectedColor: '#22c55e',
    //   dots: [{ color: '#22c55e', key: 'present' }]
    // },
    // '2026-02-21': {
    //   marked: true,
    //   dotColor: '#ef4444',
    //   disabled: true,
    //   disableTouchEvent: true,
    // },
    // '2026-02-22': {
    //   selected: true,
    //   selectedColor: '#22c55e',
    //   dots: [{ color: '#22c55e', key: 'present' }]
    // },
    // '2026-02-23': {
    //   selected: true,
    //   selectedColor: '#3b82f6',
    //   dots: [{ color: '#3b82f6', key: 'half-day' }]
    // },
    // '2026-02-24': {
    //   marked: true,
    //   dotColor: '#22c55e',
    // },
    // '2026-02-25': {
    //   selected: true,
    //   selectedColor: '#22c55e',
    //   dots: [{ color: '#22c55e', key: 'present' }]
    // },
    // '2026-02-26': {
    //   selected: true,
    //   selectedColor: '#ef4444',
    //   dots: [{ color: '#ef4444', key: 'absent' }]
    // },
  });
  const getRiderAttendance = async () => {
    try {
      const dateRange = await getDateRange();

      const token = getItem("token");
      // setLoading(true);
      // const dateRange = getDateRange();

      // if (dateFilter === 'custom' && (!customStartDate || !customEndDate)) {
      //   setError('Please select both start and end dates');
      //   return;
      // }


      const res = await axios.get(`${baseUrl}/api/rider/getRiderAttendance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: dateRange
      });
      setMarkedDates((pre) => {
        let newMarkedDates = { ...pre };

        res?.data?.data?.attendance.forEach((day) => {

          if (day.present) {
            newMarkedDates[day.date] = {
              selected: true,
              selectedColor: '#10B981',
            };
          } else {
            newMarkedDates[day.date] = {
              selected: true,
              selectedColor: '#EF4444',
            };
          }

        });
        return newMarkedDates;
      });

      // setMarkedDates(newMarkedDates);
      setAttendance(res?.data?.data?.attendance);
      // setError(null);
    } catch (error) {


      // setError('Failed to fetch attendance data');
    } finally {
      // setLoading(false);
    }
  };

  const changeAvailability = async () => {
    await getRiderAttendance()
    const token = getItem("token");
    if (!riderActive) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: "Please activate your status first",
        position: 'top',
      });
      return
    }
    try {
      let newStatus;
      riderAvailability ? (newStatus = "unavailable") : (newStatus = "available");
      const res = await axios.post(
        `${baseUrl}/api/rider/updateAvailability`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRiderAvailability(res.data.is_available == 1);


      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `You're now ${newStatus}`,
        position: 'top',
      });
    } catch (err) {




      // toast.error(err.response?.data?.message || err.message || "Error while changing status");
    } finally {
      // setLoading(false);
    }
  };

  const getProfile = async () => {
    const token = getItem("token");
    try {
      const res = await axios.get(`${baseUrl}/api/rider/getRiderProfile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      setProfile(res.data.data);
    } catch (error) {
      // console.error('Error fetching profile:', error);
    }
  };
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([
          GetRiderActiveTime(),
          getRiderStatus(),
          getRiderAttendance(),
          getProfile()
        ]);
        setLoading(false);
      };
      fetchAllData();
    }
  }, [isFocused]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#0446DB" />
      <Header title='Attendance' />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0446DB" />
          <Text className="text-gray-500 font-medium mt-4">Loading Data...</Text>
        </View>
      ) : (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="bg-[#0446DB] px-5 py-6 rounded-b-3xl">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-3">
                {
                  profile?.profile_image ? (
                    <Image
                      source={{ uri: baseUrl + "/" + profile.profile_image }}
                      className="w-full h-full rounded-full" />
                  ) : (

                    <View>
                      <Text className="text-[#0446DB] font-bold text-xl">R</Text>
                    </View>
                  )

                }

              </View>

              <View>
                <Text className="text-white text-xl font-semibold">Hello, {profile?.name || 'Rider'}</Text>
                <Text className="text-white text-opacity-90">Welcome back</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Status Cards Row */}
        <View className="flex-row gap-3 px-5 pt-5">
          {/* First Status Card */}
          <View className={`flex-1 h-44 ${riderActive ? 'bg-[#0446DB]' : 'bg-gray-300'}  rounded-3xl p-5 justify-between`}>
            <View className="flex-row justify-between items-center">
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                <Icon name="power" size={22} color="#ffffff" />
              </View>
              <Switch
                trackColor={{ false: '#9CA3AF', true: '#22c55e' }}
                thumbColor={'#ffffff'}
                ios_backgroundColor="#9CA3AF"
                onValueChange={changeActive}
                value={riderActive}
              />
            </View>
            <View>
              <Text className="text-white/70 text-base">Active Status</Text>
              <Text className="text-white text-xl font-bold mt-1">
                {riderActive ? 'On' : 'Off'}
              </Text>
              {getRiderActiveTime?.total_active_time && (
                <Text className="text-white/90 text-sm font-semibold mt-1">
                  Time: {getRiderActiveTime.total_active_time}
                </Text>
              )}
            </View>
          </View>

          {/* Second Status Card */}
          <View className={`flex-1 h-44 ${riderAvailability ? 'bg-red-500' : 'bg-gray-300'} rounded-3xl p-5 justify-between`}>
            <View className="flex-row justify-between items-center">
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                <Icon name="briefcase" size={22} color="#ffffff" />
              </View>
              <Switch

                trackColor={{ false: '#9CA3AF', true: '#22c55e' }}
                thumbColor={'#ffffff'}
                ios_backgroundColor="#9CA3AF"
                onValueChange={changeAvailability}
                value={riderAvailability}
              />
            </View>
            <View>
              <Text className="text-white/70 text-base">Availability</Text>
              <Text className="text-white text-xl font-bold mt-1">
                {riderAvailability ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>

        {/* Attendance Calendar */}
        <View className="mx-5 mt-6 mb-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <MaterialIcon name="calendar-month" size={20} color="#4b5563" />
              <Text className="text-lg font-bold text-gray-800 ml-2">Attendance Calendar</Text>
            </View>
            <View className="flex-row">
              <View className="flex-row items-center mr-3">
                <View className="w-3 h-3 bg-green-500 rounded-full mr-1" />
                <Text className="text-xs text-gray-600">Present</Text>
              </View>
              <View className="flex-row items-center mr-3">
                <View className="w-3 h-3 bg-red-500 rounded-full mr-1" />
                <Text className="text-xs text-gray-600">Absent</Text>
              </View>
            </View>
          </View>

          <Calendar
            style={{
              borderRadius: 16,
              paddingVertical: 10,
            }}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#6B7280',
              selectedDayBackgroundColor: '#0446DB',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#0446DB',
              dayTextColor: '#111827',
              textDisabledColor: '#D1D5DB',
              dotColor: '#0446DB',
              selectedDotColor: '#ffffff',
              arrowColor: '#0446DB',
              monthTextColor: '#111827',
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 15,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
            markedDates={markedDates}
            enableSwipeMonths={true}
            renderArrow={(direction) => (
              <MaterialIcon 
                name={direction === 'left' ? 'chevron-left' : 'chevron-right'} 
                size={28} 
                color="#0446DB" 
              />
            )}
          />


        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Dashboard;