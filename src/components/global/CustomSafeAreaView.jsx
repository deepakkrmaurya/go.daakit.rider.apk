import { StyleSheet, SafeAreaView, View } from 'react-native'
import React from 'react'

const CustomSafeAreaView = ({ children, style }) => {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <View style={styles.inner}>{children}</View>
    </SafeAreaView>
  )
}

export default CustomSafeAreaView

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#fff'
  },
  inner: {
    flex: 1,
  },
})