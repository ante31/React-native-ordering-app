import React, { useEffect } from 'react';
import { Modal, Portal, Button } from 'react-native-paper';
import { useGeneral } from '../generalContext'; // Import the context hook
import { StyleSheet, Text, View } from 'react-native';
import { appButtonsDisabled } from '../services/isAppClosed';
import { getDayOfTheWeek, getLocalTime } from '../services/getLocalTime';

const ClosedAppModal = ({ isCroatianLanguage, scale }: any) => {
  const {
    general,
    showClosedAppModal,
    setShowClosedAppModal,
    forceUpdateAcknowledged,
    setForceUpdateAcknowledged,
  } = useGeneral();

  const dayOfWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);

  console.log("Time details log", getLocalTime(), dayOfWeek);

  return (
    <Portal>
      <Modal 
        style={styles.container} 
        visible={showClosedAppModal} 
        onDismiss={() => { setForceUpdateAcknowledged(true); setShowClosedAppModal(false); }}
      >
        {general && <View style={styles.modalContent}>
          <Text style={[styles.modalText, { fontSize: scale.light(16) }]}>
            {general.appStatus.appClosed && !general.appStatus.forceAppOpen ?
              isCroatianLanguage
              ? `Aplikacija je zatvorena.`
              : `Application is closed.`
              :
            appButtonsDisabled(general?.appStatus, general?.workTime[dayOfWeek], general?.holidays) ?
              isCroatianLanguage
              ? `Aplikacija je zatvorena. Radno vrijme je od ${general?.workTime[dayOfWeek].openingTime} do ${general?.workTime[dayOfWeek].closingTime}.`
              : `Application is closed. Working hours are from ${general?.workTime[dayOfWeek].openingTime} to ${general?.workTime[dayOfWeek].closingTime}.`
              :
              isCroatianLanguage
              ? `Gricko se otvara u ${general?.workTime[dayOfWeek].openingTime}. Možete naručiti za kasnije.`
              : `Gricko opens at ${general?.workTime[dayOfWeek].openingTime}. You can place an order for later.`
            }
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
                      onPress={() => { setForceUpdateAcknowledged(true); setShowClosedAppModal(false); }}
          >
            <Text style={[
              styles.textPosition, 
              { 
                fontFamily: 'Lexend_700Bold',
                fontSize: scale.light(16),
                lineHeight: scale.light(16)
              }
            ]}>
              {isCroatianLanguage ? 'U redu' : 'OK'}
            </Text>
          </Button>
        </View>}
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
    fontFamily: 'Lexend_700Bold',
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

export default ClosedAppModal;
