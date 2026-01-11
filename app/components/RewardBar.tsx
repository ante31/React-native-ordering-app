import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Easing } from 'react-native';
import * as Progress from 'react-native-progress';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RewardBar = ({ currentPoints: initialPoints, threshold, onRewardPress }: any) => {
  const [points, setPoints] = useState(initialPoints || 0);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);

  // Resetiranje bodova kada se promijeni initialPoints iz parenta
useEffect(() => {
  setPoints(initialPoints);
  if (initialPoints === 0) {
    fillAnim.setValue(0);
    setProgress(0);
    bounceAnim.stopAnimation();
    bounceAnim.setValue(0);
  }
}, [initialPoints]);

  // Animacija skakutanja
  useEffect(() => {
    if (progress >= 1) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10, // Skoči prema gore
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0, // Vrati se dolje
            duration: 400,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      bounceAnim.setValue(0);
    }
  }, [progress]);

  // Logika punjenja bara
  const fillAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: points / threshold,
      duration: 800,
      useNativeDriver: false,
    }).start();

    const listener = fillAnim.addListener(({ value }) => setProgress(value));
    return () => fillAnim.removeListener(listener);
  }, [points]);

  return (
    <View style={[styles.container, {marginTop: 10}]}>
      <TouchableOpacity 
        style={styles.row} 
        onPress={() => {
          if (progress >= 1) {
            // Ako je pun, okinuti konfete u Parentu
            onRewardPress(); 
          } else {
            // Samo za testiranje: puni bar ako nije pun
            setPoints((prev: number) => Math.min(prev + 100, threshold));
          }
        }}
      >
        <View style={styles.barContainer}>
          <Progress.Bar 
            progress={progress} 
            width={null} 
            height={14}
            color={progress >= 1 ? "#4CAF50" : "#FFD700"} 
            unfilledColor="#E0E0E0"
            borderWidth={0}
            borderRadius={10}
          />
        </View>

        <Animated.View style={[
          styles.statusCircle, 
          progress >= 1 && styles.completedCircle,
          { transform: [{ translateY: bounceAnim }] } // Primjena skakutanja
        ]}>
          <MaterialCommunityIcons 
            name="gift" 
            size={22} 
            color="white" 
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 20, elevation: 2 },
  barContainer: { flex: 1, marginRight: 15 },
  statusCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffd400', justifyContent: 'center', alignItems: 'center' },
  completedCircle: { backgroundColor: '#4CAF50' }
});

export default RewardBar;