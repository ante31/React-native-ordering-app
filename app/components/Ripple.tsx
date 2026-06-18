import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

const Wave = () => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = () => {
      scale.setValue(0);
      opacity.setValue(0.4);

      Animated.parallel([
        Animated.timing(scale, {
          toValue: 2.6,
          duration: 5200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 5200,
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };

    loop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.wave,
        {
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
};

export const Ripple = ({ status }: { status: string }) => {
  if (status !== "pending") return null;

  return (
    <View style={styles.wrapper}>
      <Wave />

      {/* OUTER RING */}
      <View style={styles.ring} />

      {/* CORE (aligns with image) */}
      <View style={styles.core} />
    </View>
  );
};

const SIZE = 250; // match image size

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    justifyContent: "center",
    alignItems: "center",
  },

  // 🔥 SINGLE CLEAN RIPPLE
  wave: {
    position: "absolute",
    width: SIZE * 0.6,
    height: SIZE * 0.6,
    borderRadius: SIZE * 0.3,
    backgroundColor: "#ffd400",
  },

  // 🔥 CRISP RING (static)
  ring: {
    position: "absolute",
    width: SIZE * 0.55,
    height: SIZE * 0.55,
    borderRadius: (SIZE * 0.55) / 2,
    borderWidth: 4,
    borderColor: "#ffd400",
    backgroundColor: "transparent",
  },

  // 🔥 CORE = EXACT IMAGE ALIGNMENT
  core: {
    position: "absolute",
    width: SIZE * 0.48,
    height: SIZE * 0.48,
    borderRadius: (SIZE * 0.48) / 2,
    backgroundColor: "#ffd400",
    opacity: 0.95,
  },
});