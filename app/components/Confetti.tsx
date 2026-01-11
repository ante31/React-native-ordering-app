import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const confettieColors = ["#FF5733", "#FFC300", "#DAF7A6", "#C70039", "#900C3F", "#581845", "#33FF57", "#3375FF", "#F033FF"];
const getRandomValue = (min: number, max: number) => Math.random() * (max - min) + min;

const Confetti = ({ anim, item }: any) => {
  const translateY = anim.interpolate({
    // item.startTime sprječava "granata" efekt: konfet miruje na topOffsetu dok ne dođe njegov red
    inputRange: [0, item.startTime, item.stopTime, 1],
    outputRange: [item.topOffset, item.topOffset, screenHeight - item.pileUpFactor, screenHeight - item.pileUpFactor],
  });

  const opacity = anim.interpolate({
    inputRange: [0, item.fadeStartTime, 1],
    outputRange: [1, 1, 0],
  });

  const transform = [
    { rotateX: anim.interpolate({ inputRange: [0, item.stopTime], outputRange: ["0deg", `${item.speedDelta.rotateX * 360}deg`], extrapolate: 'clamp' }) },
    { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${item.speedDelta.rotateZ * 360}deg`] }) },
    { translateX: anim.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: [0, 30 * item.swingDelta, -30 * item.swingDelta, 30 * item.swingDelta, -30 * item.swingDelta, 0] }) }
  ];

  return (
    <Animated.View style={[styles.confetti, { transform: [{ translateX: item.leftDelta * screenWidth }, { translateY }], opacity }]} pointerEvents="none">
      <Animated.View style={[{ width: item.size.w, height: item.size.h, backgroundColor: item.color, transform, borderRadius: item.rounded ? 100 : 0 }]} />
    </Animated.View>
  );
};

export const ConfettiManager = forwardRef((props, ref) => {
  const [confettiItems, setConfettiItems] = useState<any[]>([]);
  const animInitial = useRef(new Animated.Value(0)).current;
  const loopAnims = useRef(Array(12).fill(0).map(() => new Animated.Value(0))).current;
  const timeouts = useRef<any[]>([]);

  const generateWave = (count: number, waveRef: Animated.Value, isInitial: boolean) => 
    Array(count).fill(0).map(() => {
      const startTime = isInitial ? Math.random() * 0.4 : 0; // Prvih 40% trajanja se postepeno uključuju
      const stopTime = getRandomValue(startTime + 0.4, 0.98); 
      
      return {
        wave: waveRef,
        startTime, // Novi parametar za razrjeđivanje
        leftDelta: Math.random(),
        topOffset: isInitial ? getRandomValue(-500, -50) : getRandomValue(-800, -100), 
        swingDelta: getRandomValue(0.2, 1),
        pileUpFactor: getRandomValue(110, 160),
        stopTime,
        fadeStartTime: isInitial ? stopTime + 0.01 : 0.99,
        size: { w: getRandomValue(8, 14), h: getRandomValue(6, 10) },
        rounded: Math.random() > 0.5,
        speedDelta: { rotateX: getRandomValue(5, 12), rotateZ: getRandomValue(2, 4) },
        color: confettieColors[Math.floor(Math.random() * confettieColors.length)],
      };
    });

useImperativeHandle(ref, () => ({
  start: () => {
    // Čistimo stare ako postoje
    timeouts.current.forEach(t => clearTimeout(t));
    timeouts.current = [];

    animInitial.setValue(0);
    Animated.timing(animInitial, { toValue: 1, duration: 16000, useNativeDriver: true }).start();
    
    loopAnims.forEach((anim, i) => {
      const t = setTimeout(() => {
        anim.setValue(0);
        // Animated.timing umjesto Animated.loop unutar stop logike
        Animated.timing(anim, { toValue: 1, duration: 25000, useNativeDriver: true }).start();
      }, i * 5000); 
      timeouts.current.push(t);
    });
  },
  stop: () => {
    // 1. Prekini zakazivanje budućih valova
    timeouts.current.forEach(t => clearTimeout(t));
    timeouts.current = [];

    // 2. Ne diramo trenutne animacije (ne zovemo stopAnimation ili setValue)
    // One će prirodno pasti do kraja (do stopTime/1) i nestati (fadeStartTime/1)
  }
}));

  useEffect(() => {
    setConfettiItems([
      ...generateWave(150, animInitial, true), 
      ...loopAnims.flatMap((anim) => generateWave(15, anim, false)) 
    ]);
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {confettiItems.map((item, index) => <Confetti key={index} anim={item.wave} item={item} />)}
    </View>
  );
});

const styles = StyleSheet.create({
  confetti: { position: "absolute", left: 0, top: 0 },
});