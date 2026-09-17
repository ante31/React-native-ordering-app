import React from 'react';
import { Modal, Portal, Button } from 'react-native-paper';
import { StyleSheet, Text, View, Platform, Linking } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const NotificationsBlockedModal = ({ visible, isCroatianLanguage, scale }: any) => {

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <Portal>
      <Modal
        style={styles.container}
        visible={visible}
        dismissable={false}
      >
        <View style={styles.modalContent}>
          <MaterialIcons name="notifications-off" size={48} color="#ffd400" style={styles.icon} />

          <Text style={[styles.title, { fontSize: scale.light(18) }]}>
            {isCroatianLanguage
              ? 'Obavijesti su onemogućene'
              : 'Notifications are disabled'}
          </Text>

          <Text style={[styles.body, { fontSize: scale.light(14) }]}>
            {isCroatianLanguage
              ? 'Aplikacija za narudžbe zahtijeva dozvolu za obavijesti kako bi te mogli obavijestiti o statusu tvoje narudžbe.\n\nOtvori Postavke → Gricko → Obavijesti i omogući ih.'
              : 'The ordering app requires notification permission to keep you updated on your order status.\n\nOpen Settings → Gricko → Notifications and enable them.'}
          </Text>

          <Button
            mode="contained"
            style={styles.button}
            onPress={openSettings}
          >
            <Text style={[styles.buttonText, { fontSize: scale.light(15) }]}>
              {isCroatianLanguage ? 'Otvori postavke' : 'Open settings'}
            </Text>
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Lexend_700Bold',
    textAlign: 'center',
    color: '#222',
    marginBottom: 12,
  },
  body: {
    fontFamily: 'Lexend_400Regular',
    textAlign: 'center',
    color: '#555',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#ffd400',
    borderRadius: 5,
    width: '100%',
  },
  buttonText: {
    fontFamily: 'Lexend_700Bold',
    color: '#fff',
    lineHeight: 24,
  },
});

export default NotificationsBlockedModal;
