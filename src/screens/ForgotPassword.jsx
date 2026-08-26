import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/Feather";
import Header from '../components/Header'
import axios from 'axios';

import Toast from 'react-native-toast-message';
const baseURL = 'https://go-admin.daakit.com'
import { navigate,resetAndNavigate } from '@utils/NavigationUtils';
const ForgotPasswordScreen = ({ navigation }) => {
  // States for different steps
  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP, 3: New Password
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']); // 4 digit OTP
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Refs for OTP inputs
  const otpInputs = useRef([]);

  // Handle mobile number submission
  const handleSendOTP = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid mobile number',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${baseURL}/api/check/user`, {
        "phone": mobileNumber.replace(/\D/g, ''),
        "user_type": "rider"
      }, {
        headers: { "Content-Type": "application/json" },
      });



      if (!res?.data?.exists) {
        Toast.show({
          type: 'error',
          text1: 'Mobile number not registered',
          position: 'top',
          visibilityTime: 4000,
          autoHide: true,
        });
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${baseURL}/api/otp/sendpasswordchangeotp`,
        { phone: mobileNumber.replace(/\D/g, '') },
        { headers: { "Content-Type": "application/json" } }
      );

      Toast.show({
        type: 'success',
        text1: 'OTP sent successfully',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
      });
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep(2);
      startTimer();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.response.data.message || 'Failed to send OTP. Please try again.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Timer for resend OTP
  const startTimer = () => {
    setTimer(30);
    setCanResend(false);
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length < 4) {
      Toast.show({
        type: 'error',
        text1: 'Please enter complete OTP',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${baseURL}/api/otp/verifypasswordchangeotp`,
        {
          phone: mobileNumber.replace(/\D/g, ''),
          otp: otpString
        }
      );

      if (!response?.data?.success) {
        Toast.show({
          type: 'error',
          text1: response?.data?.message || 'Invalid OTP',
          position: 'top',
          visibilityTime: 4000,
          autoHide: true,
        });
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep(3);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || 'Invalid OTP. Please try again.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Please fill all fields',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
      });
      return;
    }

    if (newPassword.length < 4) {
      Toast.show({
        type: 'error',
        text1: 'Password must be at least 4 characters',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Passwords do not match',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
      });
      return;
    }

    setLoading(true);
    try {
      console.log({
          phone: mobileNumber.replace(/\D/g, ''),
          otp: otp.join(''),
          new_password: newPassword
        })
      const response = await axios.post(`${baseURL}/api/rider/resetRiderPassword`,
        {
          phone: mobileNumber.replace(/\D/g, ''),
          otp: otp.join(''),
          new_password: newPassword
        }
      );

      console.log(response.data)

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: response.data.message || 'Password changed successfully!',
          position: 'top',
          visibilityTime: 4000,
          autoHide: true,
        });
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
      resetAndNavigate('Login');
    } catch (error) {
      console.log(error.response.data.message);
      Toast.show({
        type: 'error',
        text1: error.response.data.message ||  'Failed to change password. Please try again.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next input
    if (text && index < 3) {
      otpInputs.current[index + 1].focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Header showBack={true} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            className="px-6 pt-10"
          >
            <View className='flex-1 justify-center'>
              {/* Header Info */}
              <View className="items-center mb-8">
                <Image source={require('../assets/DaakitGOLogo.png')} className="w-24 h-24 mb-4" resizeMode="contain" />
                <Text className="text-2xl font-bold text-gray-800 mb-2">
                  {step === 1 && "Forgot Password?"}
                  {step === 2 && "Verify OTP"}
                  {step === 3 && "Create New Password"}
                </Text>
                <Text className="text-base text-gray-500 font-medium text-center px-4">
                  {step === 1 && "Enter your registered mobile number."}
                  {step === 2 && `Enter the 4-digit OTP sent to +91 ${mobileNumber}`}
                  {step === 3 && "Your new password must be different from previous passwords"}
                </Text>
              </View>

              {/* Form */}
              <View className="bg-gray-100 rounded-xl p-5 mb-5">

                {/* Step 1: Mobile Number */}
                {step === 1 && (
                  <View className="mb-6">
                    <Text className="text-base font-semibold text-gray-800 mb-2">Mobile Number</Text>
                    <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-4 h-[52px]">
                      <View className="mr-3 border-r border-gray-300 pr-3">
                        <Text className="text-base font-medium text-gray-800">+91</Text>
                      </View>
                      <TextInput
                        className="flex-1 text-base text-gray-800"
                        placeholder="Enter mobile number"
                        placeholderTextColor="#999"
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={mobileNumber}
                        onChangeText={setMobileNumber}
                        editable={!loading}
                      />
                    </View>
                  </View>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                  <View className="mb-6">
                    <View className="flex-row justify-center gap-4 mb-6">
                      {otp.map((digit, index) => (
                        <TextInput
                          key={index}
                          ref={(ref) => (otpInputs.current[index] = ref)}
                          className="w-14 h-14 bg-white border border-gray-300 rounded-lg text-center text-xl font-bold text-gray-800"
                          maxLength={1}
                          keyboardType="numeric"
                          value={digit}
                          onChangeText={(text) => handleOtpChange(text, index)}
                          onKeyPress={(e) => handleOtpKeyPress(e, index)}
                          editable={!loading}
                        />
                      ))}
                    </View>
                    <View className="flex-row justify-center items-center">
                      <Text className="text-sm text-gray-600">{"Didn't receive OTP? "}</Text>
                      {canResend ? (
                        <TouchableOpacity onPress={handleSendOTP} disabled={loading}>
                          <Text className="text-sm text-[#0446DB] font-semibold">Resend</Text>
                        </TouchableOpacity>
                      ) : (
                        <Text className="text-sm text-gray-500 font-medium">Resend in {timer}s</Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                  <>
                    <View className="mb-6">
                      <Text className="text-base font-semibold text-gray-800 mb-2">New Password</Text>
                      <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-4 h-[52px]">
                        <TextInput
                          className="flex-1 text-base text-gray-800"
                          placeholder="Enter new password"
                          placeholderTextColor="#999"
                          secureTextEntry={!showNewPassword}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          editable={!loading}
                        />
                        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} className="p-2">
                          <Icon name={showNewPassword ? "eye" : "eye-off"} size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View className="mb-6">
                      <Text className="text-base font-semibold text-gray-800 mb-2">Confirm Password</Text>
                      <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-4 h-[52px]">
                        <TextInput
                          className="flex-1 text-base text-gray-800"
                          placeholder="Confirm new password"
                          placeholderTextColor="#999"
                          secureTextEntry={!showConfirmPassword}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          editable={!loading}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-2">
                          <Icon name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}

                {/* Action Button */}
                <TouchableOpacity
                  onPress={
                    step === 1 ? handleSendOTP :
                      step === 2 ? handleVerifyOTP :
                        handleChangePassword
                  }
                  disabled={loading}
                  className={`rounded-lg h-[52px] items-center justify-center mt-2 ${loading ? "bg-[#0446DB]/60" : "bg-[#0446DB]"
                    }`}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-lg text-white font-semibold flex-row justify-center">
                      {step === 1 ? 'Send OTP' : step === 2 ? 'Verify OTP' : 'Change Password'}
                    </Text>
                  )}
                </TouchableOpacity>

              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ForgotPasswordScreen;