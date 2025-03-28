import { ActivityIndicator, StyleSheet, View } from "react-native"

export const CenteredLoading = () => {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#DA291C" />
    </View>
  )
}

const styles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute', // Ensure it overlays everything
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // Ensures it's on top of everything
    transform: [{ scale: 1.5 }],
  },
})
