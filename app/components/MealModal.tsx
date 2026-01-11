// components/MealModal.tsx
import React from 'react';
import { Portal, Modal } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import MealDetails from './MealDetails';
import { CenteredLoading } from './CenteredLoading';
import { getModalHeight } from '../services/getModalHeight';

export const MealModal = ({ visible, meal, drinks, scale, onClose, navigation }: any) => (
  <Portal>
    <Modal
      visible={visible}
      onDismiss={onClose}
      contentContainerStyle={{
        backgroundColor: 'white',
        borderRadius: 10,
        height: getModalHeight(meal),
        margin: scale.heavy(16)
      }}
    >
      {meal ? (
        <MealDetails 
          visible={visible} 
          globalMeal={meal} 
          drinks={drinks} 
          scale={scale} 
          onClose={onClose} 
          navigation={navigation} 
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center' }}><CenteredLoading /></View>
      )}
    </Modal>
  </Portal>
);