import React from 'react';
import { View, Text, Animated, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const PARALLAX_HEIGHT = 250;
const HEADER_HEIGHT = 50;

export const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerText}>Naslov</Text>
  </View>
);

export const Background = ({ animatedValue }: any) => {
  const translateY = animatedValue.interpolate({
    inputRange: [0, PARALLAX_HEIGHT],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  return (
    <Animated.Image
      source={{ uri: 'https://picsum.photos/600/400' }}
      style={[
        styles.background,
        {
          transform: [{ translateY }]
        }
      ]}
      resizeMode="cover"
    />
  );
};

export const StickyForeground = ({ animatedValue }: any) => {
  const opacity = animatedValue.interpolate({
    inputRange: [PARALLAX_HEIGHT - 50, PARALLAX_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.stickyForeground, { opacity }]}>
      <Text style={styles.foregroundText}>Dobrodošli</Text>
    </Animated.View>
  );
};

export const Foreground = () => (
  <View style={styles.floatingForeground}>
    <Text style={styles.foregroundText}>Dobrodošli</Text>
  </View>
);

const Welcome = () => (
  <View style={styles.content}>
    <Text style={styles.contentText}>Ovo je sadržaj stranice ispod parallaxa.</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    height: 50,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold'
  },
  background: {
    height: 250,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0
  },
  foreground: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center'
  },
  foregroundText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5
  },
  content: {
    padding: 20
  },
  contentText: {
    fontSize: 16
  },floatingForeground: {
  height: 250,
  justifyContent: 'center',
  alignItems: 'center',
},

stickyForeground: {
  position: 'absolute',
  top: 50, // ako ti je headerHeight 50
  left: 0,
  right: 0,
  height: 150,
  backgroundColor: 'white', // ili transparentno
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
},
});
