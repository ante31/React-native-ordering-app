import React, { useEffect, useRef, useMemo } from "react";
import { View, StyleSheet, Animated, TouchableOpacity, Easing } from "react-native";
import * as Progress from "react-native-progress";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface RewardBarProps {
  currentPoints: number;
  threshold: number;
  onRewardPress: () => void;
  shakeTrigger?: number;
}

const RewardBar = ({ currentPoints = 0, threshold, onRewardPress, shakeTrigger = 0 }: RewardBarProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const sheenAnim = useRef(new Animated.Value(-1)).current;
  const giftBounce = useRef(new Animated.Value(0)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;

  const progress = useMemo(() => Math.min(currentPoints / threshold, 1), [currentPoints, threshold]);

  // Animacija punjenja bara
  useEffect(() => {
    Animated.spring(fillAnim, {
      toValue: progress,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Surge animacija i Sheen efekt kod promjene bodova
  useEffect(() => {
    if (shakeTrigger > 0) {
      sheenAnim.setValue(-1);
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.03, duration: 150, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
        ]),
        Animated.timing(sheenAnim, {
          toValue: 1.5,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [shakeTrigger]);

  // Loop animacija skakutanja kada je poklon SPREMAN
useEffect(() => {
  // Definiramo tip kao CompositeAnimation ili null
  let loop: Animated.CompositeAnimation | null = null;
  
  if (progress >= 1) {
    loop = Animated.loop(
      Animated.sequence([
        Animated.timing(giftBounce, {
          toValue: -10,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(giftBounce, {
          toValue: 0,
          duration: 500,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.delay(200),
      ])
    );
    loop.start();
  } else {
    // Sada TypeScript zna da loop može imati .stop()
    if (loop) (loop as Animated.CompositeAnimation).stop();
    giftBounce.setValue(0);
  }

  return () => {
    if (loop) (loop as Animated.CompositeAnimation).stop();
    giftBounce.setValue(0);
  };
}, [progress]);

  // Funkcija za "negativni" bounce (kada korisnik klikne prerano)
  const triggerNegativeBounce = () => {
    // Brza sekvenca gore-dolje koja signalizira da akcija nije dostupna
    Animated.sequence([
      Animated.timing(giftBounce, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(giftBounce, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(giftBounce, { toValue: -3, duration: 60, useNativeDriver: true }),
      Animated.spring(giftBounce, { toValue: 0, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const sheenTranslate = sheenAnim.interpolate({
    inputRange: [-1, 1.5],
    outputRange: [-100, 400],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.9}
          onPress={() => {
            if (progress >= 1) {
              onRewardPress();
            } else {
              triggerNegativeBounce();
            }
          }}
        >
          <View style={styles.barContainer}>
            <View style={styles.progressWrapper}>
              <Progress.Bar
                progress={progress}
                width={null}
                height={16}
                color={progress >= 1 ? "#4CAF50" : "#FFD700"}
                unfilledColor="#F0F0F0"
                borderWidth={0}
                borderRadius={10}
              />
              <Animated.View
                style={[
                  styles.sheen,
                  { transform: [{ translateX: sheenTranslate }, { skewX: "-20deg" }] },
                ]}
              />
            </View>
          </View>

          <Animated.View
            style={[
              styles.statusCircle,
              progress >= 1 && styles.completedCircle,
              { transform: [{ translateY: giftBounce }] },
            ]}
          >
            <MaterialCommunityIcons 
              name="gift" 
              size={24} 
              color="white" 
            />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    width: "100%", 
    paddingHorizontal: 16, 
    marginTop: 15 
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  barContainer: { 
    flex: 1, 
    marginRight: 15 
  },
  progressWrapper: { 
    height: 16, 
    borderRadius: 10, 
    overflow: "hidden", 
    backgroundColor: "#F0F0F0" 
  },
  sheen: { 
    position: "absolute", 
    top: 0, 
    left: 0, 
    width: 40, 
    height: "100%", 
    backgroundColor: "rgba(255, 255, 255, 0.5)" 
  },
  statusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  completedCircle: { 
    backgroundColor: "#4CAF50", 
    shadowColor: "#4CAF50" 
  },
});

export default React.memo(RewardBar);