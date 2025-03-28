import { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, TouchableOpacity, Text } from 'react-native';

const Slider = ({ isSlidRight, setIsSlidRight, boxWidth, setBoxWidth, orderData, setOrderData, initialSide = 'left', isCroatianLang }: { isSlidRight: boolean; setIsSlidRight: any; boxWidth: number; setBoxWidth: any; orderData: any; setOrderData: any; initialSide?: 'left' | 'right'; isCroatianLang: boolean }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (initialSide === 'right') {
      Animated.timing(slideAnim, {
        toValue: boxWidth - 4,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setIsSlidRight(true);
    }
  }, [initialSide, boxWidth]);


  const toggleSlide = (side: 'left' | 'right') => {
    if ((isSlidRight && side === 'left') || (!isSlidRight && side === 'right')) {
      Animated.timing(slideAnim, {
        toValue: isSlidRight ? 0 : boxWidth - 4,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setIsSlidRight(!isSlidRight);
      setOrderData({ ...orderData, isDelivery: !isSlidRight });
      console.log('Sliding to the ' + side + ' side');
    }
  };

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.grayBox} onLayout={(event) => setBoxWidth(event.nativeEvent.layout.width * 0.5)}>
        <Animated.View style={[styles.whiteBox, { transform: [{ translateX: slideAnim }] }]} />
        <TouchableOpacity style={[styles.touchableLeft, isSlidRight && { opacity: 0.4 }]} onPress={() => toggleSlide('left')} activeOpacity={1}>
          <Text style={styles.centerText}>{isCroatianLang ? 'Preuzimanje' : 'Pickup'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.touchableRight, !isSlidRight && { opacity: 0.4 }]} onPress={() => toggleSlide('right')} activeOpacity={1}>
          <Text style={styles.centerText}>{isCroatianLang ? 'Dostava' : 'Delivery'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  centerText: {
    paddingTop: 4,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#DA291C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  grayBox: {
    width: '90%',
    height: 46,
    backgroundColor: '#d4d4d4',
    borderRadius: 30,
    position: 'relative',
    justifyContent: 'center',
  },
  whiteBox: {
    width: '50%',
    height: 43,
    backgroundColor: 'white',
    borderRadius: 28,
    position: 'absolute',
    left: 2,
  },
  touchableLeft: {
    position: 'absolute',
    width: '50%',
    height: 30,
    left: 0,
  },
  touchableRight: {
    position: 'absolute',
    width: '50%',
    height: 30,
    right: 0,
  },
});

export default Slider;
