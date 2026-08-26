// AnalyticsSkeleton.js - Skeleton Component (No Expo)
import React, { useEffect, useRef } from 'react';
import { View, Text, Dimensions, ScrollView, Animated, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

// Shimmer effect component using React Native Animated
const Shimmer = ({ width, height, borderRadius = 12, style = {} }) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, []);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View
      style={[
        {
          width: width,
          height: height,
          borderRadius: borderRadius,
          backgroundColor: '#e0e0e0',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#f5f5f5',
          transform: [{ translateX: translateX }],
          opacity: 0.5,
        }}
      />
    </View>
  );
};

// Alternative Shimmer using opacity (simpler)
export const SimpleShimmer = ({ width, height, borderRadius = 12, style = {} }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width,
          height: height,
          borderRadius: borderRadius,
          backgroundColor: '#e0e0e0',
          opacity: opacity,
        },
        style,
      ]}
    />
  );
};

// Skeleton for Stat Card
const StatCardSkeleton = () => (
  <View className="w-1/2 p-1">
    <View className="bg-gray-200 rounded-2xl p-4 h-32">
      <View className="flex-row justify-between">
        <View>
          <View className="w-10 h-10 bg-gray-300 rounded-xl mb-2" />
          <SimpleShimmer width={60} height={12} style={{ marginTop: 4 }} />
          <SimpleShimmer width={50} height={24} style={{ marginTop: 8 }} />
        </View>
        <SimpleShimmer width={40} height={12} />
      </View>
    </View>
  </View>
);

// Skeleton for Performance Breakdown Card
const PerformanceBreakdownSkeleton = () => (
  <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
    <View className="flex-row items-center gap-3 mb-5">
      <SimpleShimmer width={48} height={48} />
      <View>
        <SimpleShimmer width={180} height={20} />
        <SimpleShimmer width={140} height={14} style={{ marginTop: 4 }} />
      </View>
    </View>

    <View className="space-y-4">
      {/* Completion Rate Skeleton */}
      <View className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-xl border border-purple-100">
        <View className="flex-row justify-between items-center mb-2">
          <SimpleShimmer width={120} height={16} />
          <SimpleShimmer width={40} height={20} />
        </View>
        <SimpleShimmer width="100%" height={12} />
        <SimpleShimmer width={200} height={12} style={{ marginTop: 8 }} />
      </View>

      {/* Completion Ratio Skeleton */}
      <View className="bg-gradient-to-r mt-2 from-blue-50 to-white p-4 rounded-xl border border-blue-100">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <SimpleShimmer width={140} height={16} />
            <SimpleShimmer width={200} height={12} style={{ marginTop: 4 }} />
          </View>
          <SimpleShimmer width={64} height={64} />
        </View>
      </View>
    </View>
  </View>
);

// Skeleton for Date Filter Header
const DateFilterSkeleton = () => (
  <View className=" shadow-sm border-t border-gray-100 p-4 mb-3">
    <View className="space-y-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <SimpleShimmer width={40} height={40} />
          <View>
            <SimpleShimmer width={120} height={20} />
            <SimpleShimmer width={160} height={14} style={{ marginTop: 4 }} />
          </View>
        </View>
        <SimpleShimmer width={60} height={32} />
      </View>
    </View>
  </View>
);

// Main Skeleton Component
export const AnalyticsSkeleton = () => {
  return (
    <View className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header Skeleton */}
      <View className="bg-white shadow-sm px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <SimpleShimmer width={32} height={32} style={{ marginRight: 12 }} />
          <SimpleShimmer width={100} height={24} />
        </View>
        <SimpleShimmer width={40} height={40} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-0">
          <DateFilterSkeleton />
          
          {/* Stats Cards Grid - 2x2 Layout */}
          <View className="flex-row flex-wrap mb-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </View>

          <PerformanceBreakdownSkeleton />
        </View>
      </ScrollView>
    </View>
  );
};

// Alternative: Single Skeleton Loader with Shimmer Text
export const ShimmerLoader = () => (
  <View className="flex-1 items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
    <View className="items-center">
      <SimpleShimmer width={80} height={80} />
      <SimpleShimmer width={150} height={20} style={{ marginTop: 16 }} />
      <SimpleShimmer width={200} height={14} style={{ marginTop: 8 }} />
    </View>
  </View>
);

// Skeleton for List Items
export const ListItemSkeleton = ({ count = 3 }) => {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <View key={index} className="flex-row items-center p-4 bg-white border-b border-gray-100">
          <SimpleShimmer width={50} height={50} />
          <View className="ml-3 flex-1">
            <SimpleShimmer width="70%" height={16} />
            <SimpleShimmer width="50%" height={12} style={{ marginTop: 8 }} />
          </View>
          <SimpleShimmer width={24} height={24} />
        </View>
      ))}
    </>
  );
};

// Skeleton for Charts
export const ChartSkeleton = () => (
  <View className="bg-white rounded-2xl p-5 mb-6">
    <View className="flex-row justify-between items-center mb-4">
      <SimpleShimmer width={120} height={20} />
      <SimpleShimmer width={80} height={32} />
    </View>
    <View className="h-48 justify-end">
      <View className="flex-row justify-between items-end h-40">
        {[...Array(7)].map((_, index) => (
          <View key={index} className="items-center flex-1">
            <SimpleShimmer 
              width={30} 
              height={Math.random() * 100 + 40}
              style={{ marginBottom: 8 }}
            />
            <SimpleShimmer width={30} height={12} />
          </View>
        ))}
      </View>
    </View>
  </View>
);

// Skeleton with Pull to Refresh Animation
export const RefreshableSkeleton = () => {
  return (
    <View className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <ScrollView
        refreshControl={
          <View className="py-2">
            <SimpleShimmer width={40} height={40} />
          </View>
        }
      >
        <View className="p-0">
          <DateFilterSkeleton />
          
          <View className="flex-row flex-wrap mb-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </View>

          <PerformanceBreakdownSkeleton />
          
          {/* Additional skeleton sections */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mx-4 mb-6">
            <View className="flex-row items-center gap-3 mb-5">
              <SimpleShimmer width={48} height={48} />
              <SimpleShimmer width={160} height={20} />
            </View>
            <View className="space-y-3">
              <SimpleShimmer width="100%" height={60} />
              <SimpleShimmer width="100%" height={60} />
              <SimpleShimmer width="100%" height={60} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Ultra-light skeleton without animations (static)
export const StaticSkeleton = () => (
  <View className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50/30">
    <View className="bg-white shadow-sm px-4 py-3">
      <View className="w-32 h-6 bg-gray-200 rounded" />
    </View>
    <View className="p-4">
      <View className="bg-gray-200 h-40 rounded-xl mb-4" />
      <View className="flex-row flex-wrap">
        {[1, 2, 3, 4].map((i) => (
          <View key={i} className="w-1/2 p-1">
            <View className="bg-gray-200 h-32 rounded-xl" />
          </View>
        ))}
      </View>
      <View className="bg-gray-200 h-64 rounded-xl mt-4" />
    </View>
  </View>
);

export default AnalyticsSkeleton;