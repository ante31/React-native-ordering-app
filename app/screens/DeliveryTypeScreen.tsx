import React, { useState } from 'react';
  import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
  import { Button } from 'react-native-paper';
  import MaterialIcons from '@expo/vector-icons/MaterialIcons';
  import { isCroatian } from '../services/languageChecker';
  import { useGeneral } from '../generalContext';
  import { appButtonsDisabled } from '../services/isAppClosed';
  import { getDayOfTheWeek, getLocalTime } from '../services/getLocalTime';
 
  export default function DeliveryTypeScreen({ route, navigation }: { route: any; navigation: any }) {
    const isCroatianLang = isCroatian();
    const { cartState, storageOrder } = route.params;
    const { general } = useGeneral();
    const dayOfWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);
    const disabled = !general?.workTime || appButtonsDisabled(general?.appStatus, general?.workTime?.[dayOfWeek], general?.holidays);
 
    // null = nothing selected by default
    const [selected, setSelected] = useState<'pickup' | 'delivery' | null>(
      null);
 
    const handleContinue = () => {
      if (!selected) return;
      const isDelivery = selected === 'delivery';
      navigation.navigate('OrderScreen', { cartState, storageOrder, isDelivery });
    };
 
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isCroatianLang ? 'Kako želite primiti narudžbu?' : 'How would you like to receive your order?'}
          </Text>
 
          <View style={styles.cardsRow}>
            {/* Pickup - left */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelected('pickup')}
              style={[styles.card, selected === 'pickup' && styles.cardSelected]}
            >
              <MaterialIcons
                name="storefront"
                size={48}
                color={selected === 'pickup' ? '#FFC72C' : '#333'}
              />
              <Text style={[styles.cardText, selected === 'pickup' && styles.cardTextSelected]}>
                {isCroatianLang ? 'Preuzimanje u objektu' : 'Pickup in store'}
              </Text>
            </TouchableOpacity>
 
            {/* Delivery - right */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelected('delivery')}
              style={[styles.card, selected === 'delivery' && styles.cardSelected]}
            >
              <MaterialIcons
                name="delivery-dining"
                size={48}
                color={selected === 'delivery' ? '#FFC72C' : '#333'}
              />
              <Text style={[styles.cardText, selected === 'delivery' && styles.cardTextSelected]}>
                {isCroatianLang ? 'Dostava na adresu' : 'Delivery to address'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
 
        <Button
          mode="contained"
          style={[styles.continueButton, (!selected || disabled) && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!selected || disabled}
        >
          <Text style={styles.continueText}>
            {isCroatianLang ? 'Pregledaj narudžbu!' : 'Go to checkout!'}
          </Text>
        </Button>
      </View>
    );
  }
 
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      justifyContent: 'space-between',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: 'center',
    },
    title: {
      fontFamily: "Lexend_400Regular",
      fontSize: 28,
      marginBottom: 30,
      textAlign: 'center',
    },
    cardsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    card: {
      width: '48%',
      aspectRatio: 1,
      borderWidth: 2,
      borderColor: '#d4d4d4',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 12,
      backgroundColor: '#fff',
    },
    cardSelected: {
      borderColor: '#FFC72C',
      backgroundColor: '#FFF9E6',
    },
    cardText: {
      fontFamily: "Lexend_400Regular",
      marginTop: 14,
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
    },
    cardTextSelected: {
      color: '#FFC72C',
    },
    continueButton: {
      backgroundColor: '#FFC72C',
      justifyContent: 'center',
      paddingVertical: 10,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 5,
    },
    continueText: {
      color: '#fff',
      fontSize: 22,
      lineHeight: 28,
      textAlignVertical: 'center',
    },
    disabledButton: {
      backgroundColor: '#B0BEC5',
      opacity: 0.6,
    },
  });
 