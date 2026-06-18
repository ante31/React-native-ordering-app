import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, TouchableWithoutFeedback, Dimensions, BackHandler } from 'react-native';
import { Portal } from 'react-native-paper';
import MealDetails from './MealDetails';
import { getModalHeightInPixels } from '../services/getModalHeight';
import CartMealDetails from './CartMealDetails';

interface MealModalProps {
  visible: boolean;
  isCroatianLang: boolean;
  meal: any;
  menu: any;
  scale: any;
  onClose: () => void;
  handleRemoveFromCart?: any;
  navigation: any;
}

export const MealModal: React.FC<MealModalProps> = ({ visible, isCroatianLang, meal, menu, scale, onClose, handleRemoveFromCart, navigation }) => {
  const backdrop = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const screenHeight = Dimensions.get('window').height;
  const modalHeight = meal ? getModalHeightInPixels(meal) : 0;

  console.log("MealModal rendered with meal:", meal);
  console.log("Calculated modal height:", modalHeight);

  useEffect(() => {
    const backAction = () => {
      if (visible) {
        handleClose();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [visible]);

  useEffect(() => {
    if (visible && meal) {
      // Istovremeno pokretanje backdropa i modala
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(scaleAnim, { 
          toValue: 1, 
          friction: 8, 
          tension: 40, 
          useNativeDriver: true 
        }),
      ]).start();
    }
  }, [visible, meal]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 300, useNativeDriver: true }),
    ]).start(onClose);
  };

  if (!meal) return null;

  return (
    <Portal>
      {visible && (
        <>
          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={handleClose}>
            <Animated.View style={[styles.backdrop, { opacity: backdrop }]} />
          </TouchableWithoutFeedback>

          {/* Modal Center Container */}
          <Animated.View
            style={[
              styles.modalContainer,
              { 
                height: modalHeight, 
                opacity: fadeAnim, 
                transform: [{ scale: scaleAnim }],
                top: (screenHeight - modalHeight) / 2 - 20
              },
            ]}
          >
            {!handleRemoveFromCart ? (
              <MealDetails
                visible={visible}
                globalMeal={meal}
                menu={menu}
                scale={scale}
                onClose={handleClose}
                navigation={navigation}
                isCroatianLang={isCroatianLang}
              />
            ) : (
              <CartMealDetails
                visible={visible}
                isCroatianLang={isCroatianLang}
                meal={meal}
                menu={menu}
                scale={scale}
                onClose={handleClose}
                handleRemoveFromCart={handleRemoveFromCart}
                navigation={navigation}
              />
            )}
          </Animated.View>
        </>
      )}
    </Portal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1,
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20, 
    overflow: 'hidden',
    elevation: 10,
    zIndex: 2,
    alignSelf: 'center',
    position: 'absolute',
  },
});