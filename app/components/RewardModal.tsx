import { Modal, Portal } from 'react-native-paper';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 
import { getDayOfTheWeek, getLocalTime } from '../services/getLocalTime';

const RewardModal = ({ isCroatianLanguage, general, setCurrentPoints, scale, showRewardModal, setShowRewardModal, confettiRef }: any) => {
  const dayOfWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);

  return (
    <Portal>
      <Modal 
        style={styles.container} 
        visible={showRewardModal} 
        onDismiss={() => { 
          setShowRewardModal(false); 
          setCurrentPoints(0); // Resetira bodove u RewardBaru
          confettiRef.current?.stop(); // Prekida konfete
        }}      >
        {general && (
          <LinearGradient
            colors={['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          >
            <View style={styles.modalContent}>
              <Text style={[styles.modalText, { fontSize: scale.light(16) }]}>
                {isCroatianLanguage
                  ? `Čestitamo! Darujemo vam 10€ na vašu sljedeću narudžbu veću od 10€ kao znak zahvalnosti za vašu vjernost!`
                  : `Congratulations! We're giving you €10 off your next order as a token of our appreciation for your loyalty!`}
              </Text>
            </View>
          </LinearGradient>
        )}
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
  gradientBorder: {
    padding: 3, // Zamjena za borderWidth
    borderRadius: 13, // Malo veći od modalContent radi poravnanja
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    fontFamily: 'Lexend_700Bold',
    textAlign: 'center',
  },
});

export default RewardModal;