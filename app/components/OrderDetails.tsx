import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native"
import { Divider } from "react-native-paper"

export const OrderDetails = ({isCroatianLang, orderPrice, isSlidRight, general, selectedCoupon, scale}: any) => {
  const styles = getStyles(scale);
  const [discount, setDiscount] = useState(0); 

  useEffect(() => {
    if (selectedCoupon) {
      setDiscount(selectedCoupon.value); 
    } else {
      setDiscount(0); 
    }
  }, [selectedCoupon]);
  return (
    <View>
      <Text style={styles.title}>{isCroatianLang ? 'Iznos narudžbe': 'Order amount'}</Text>
      <View style={styles.paddingContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.info}>{isCroatianLang ? 'Narudžba': 'Order'}</Text>
          <Text style={[styles.info, {color: 'red'}]}>{orderPrice.toFixed(2)} €</Text>
        </View>
        <Divider style={styles.divider} />
        {!isSlidRight && <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.info}>{isCroatianLang ? 'Dostava': 'Delivery'}</Text>
          <Text style={[styles.info, {color: 'red'}]}>
            {general ? general.deliveryPrice.toFixed(2) : '0.00'} €
          </Text>    
        </View>}
        {isSlidRight && <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.info}>{isCroatianLang? 'Preuzimanje': 'Pick up'}</Text>
          <Text style={[styles.info, {color: 'red'}]}>0.00 €</Text>
        </View>}
        <Divider style={styles.divider} />
        {discount > 0 && <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.info}>{isCroatianLang? 'Popust': 'Discount'}</Text>
          <Text style={[styles.info, {color: 'red'}]}>- {discount.toFixed(2)} €</Text>
        </View>}
        <Divider style={styles.divider} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.info}>{isCroatianLang? 'Ukupno': 'Total'}</Text>
          <Text style={[styles.info, {color: 'red'}]}>
            {general ? (orderPrice + (!isSlidRight ? general.deliveryPrice : 0) - discount).toFixed(2) : orderPrice} €
          </Text>
        </View>
      <Divider style={styles.divider} />
      </View>
    </View>
  )
}

const getStyles = (scale: any) =>
  StyleSheet.create({
  divider: {
    marginHorizontal: 10,
  },
  info:{
    fontFamily: 'Lexend_400Regular',
    fontSize: scale.light(14),
    color: '#333',
    marginVertical: 10,
  },
  disabledButton: {
    backgroundColor: '#B0BEC5', 
    opacity: 0.6, 
  },
  disabledText: {
    color: '#fff', 
  },
  title: {
    fontFamily: 'Lexend_400Regular',
    fontSize: scale.light(22),
    marginBottom: 0,
    paddingLeft: 20,
    paddingVertical: 10,
  },
  paddingContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
})