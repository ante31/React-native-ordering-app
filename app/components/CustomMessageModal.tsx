import React, { useEffect } from 'react';
import { Modal, Portal, Button } from 'react-native-paper';
import { useGeneral } from '../generalContext'; // Import the context hook
import { StyleSheet, Text, View } from 'react-native';

const CustomMessageModal = ({ isCroatianLanguage, scale }: any) => {

  const { general, showCustomMessage, setShowCustomMessage, customMessageAcknowledged, setCustomMessageAcknowledged } = useGeneral();

  return (
    <Portal>
      <Modal 
        style={styles.container} 
        visible={showCustomMessage && !customMessageAcknowledged} 
      >
        <View style={styles.modalContent}>
          <Text style={[styles.modalText, { fontSize: scale.light(16) }]}>
            {isCroatianLanguage ? general?.message.text : general?.message.textEn}
          </Text>
          <Button 
            mode="contained" 
            style={[
              styles.orderButton, 
              { 
                paddingVertical: scale.light(8),
                minHeight: scale.light(40)
              }
            ]}
            onPress={() => { setShowCustomMessage(false); setCustomMessageAcknowledged(true); }}
          >
            <Text style={[
              styles.textPosition, 
              { 
                fontSize: scale.light(16),
                lineHeight: scale.light(16)
              }
            ]}>
              {isCroatianLanguage ? 'U redu' : 'OK'}
            </Text>
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,  // Ensures the container takes up full screen height
    justifyContent: 'center',  // Vertically center the modal
    alignItems: 'center',  // Horizontally center the modal
    padding: 20,  // Optional: Add padding around the screen edges
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,  // Padding inside the modal content
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    padding: 10,
    zIndex: 1,
  },
  modalText: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,  // Space between the text and button
  },
orderButton: {
  backgroundColor: '#ffd400',
  justifyContent: 'center',
  paddingHorizontal: 20,
  borderRadius: 5,
},
textPosition: {
  color: '#fff',
  textAlign: 'center',
},
})

export default CustomMessageModal;
