import React, { useEffect } from 'react';
import { Modal, Portal, Button } from 'react-native-paper';
import { useGeneral } from '../generalContext'; 
import { StyleSheet, Text, View } from 'react-native';
import { Linking } from 'react-native';

const ForceUpdateModal = ({ isCroatianLanguage, scale }: any) => {
  const {
    general,
    showForceUpdate,
    setShowForceUpdate,
    forceUpdateAcknowledged,
    setForceUpdateAcknowledged,
  } = useGeneral();

  console.log("ForceUpdateModal");
  console.log("showForceUpdate", showForceUpdate);
  console.log("infoAcknowledged", forceUpdateAcknowledged);

  return (
    <Portal>
      <Modal 
        style={styles.container} 
        visible={showForceUpdate} 
      >
        {general && <View style={styles.modalContent}>
          <Text style={[styles.modalText, { fontSize: scale.light(16) }]}>
            {isCroatianLanguage ? 'Dostupna je novija verzija aplikacije. Potrebno je ažuriranje za ispravan rad aplikacije.' : 'Your app version is outdated. An update is required to ensure proper functionality.'}
          </Text>
          {general && <Button 
            mode="contained" 
            style={[
              styles.orderButton, 
              { 
                paddingVertical: scale.light(8),
                minHeight: scale.light(40)
              }
            ]}
            onPress={() => Linking.openURL(general.updateUrlAndroid)}
          >
            <Text style={[
              styles.textPosition, 
              { 
                fontSize: scale.light(16),
                lineHeight: scale.light(16)
              }
            ]}>
              {isCroatianLanguage ? 'Ažuriraj' : 'Update'}
            </Text>
          </Button>}
        </View>}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,  
    justifyContent: 'center',  
    alignItems: 'center',  
    padding: 20,  
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,  
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
    marginBottom: 10,  
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

export default ForceUpdateModal;
