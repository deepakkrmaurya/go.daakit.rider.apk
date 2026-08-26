
import React from "react";
import { View, Text} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
const NoInternetScreen = () => {
    return (
        <View className="flex-1 bg-[#0446DB] items-center justify-center px-6">
            <View className="bg-red-100 p-6 rounded-full mb-6">
                <Icon name="wifi-outline" size={60} color="#EF4444" />
            </View>
            <Text className="text-2xl font-bold text-white mb-3">
                No Internet Connection
            </Text>
            <Text className="text-gray-100 text-center mb-8">
                Please check your connection and try again.
            </Text>
        </View>
    );
};

export default NoInternetScreen;

