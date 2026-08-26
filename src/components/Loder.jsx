import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  Animated,
  Easing,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import daakitIcon from '../assets/DaaKit.png'

const Loader = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000, // slow premium spin
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <View className="items-center justify-center">
        <Animated.Image
          source={daakitIcon}
          style={{
            width: 120,
            height: 120,
            transform: [{ rotate }],
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Loader;
