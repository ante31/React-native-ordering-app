import { StyleSheet, Text, View } from "react-native"
import { Divider } from "react-native-paper"

export const OrderDetails = ({isCroatianLang, orderPrice, isSlidRight, general}: any) => {
  return (
    <View>
      <Text style={styles.title}>{isCroatianLang ? 'Iznos narudžbe': 'Order amount'}</Text>
      <View style={styles.paddingContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.info}>{isCroatianLang ? 'Narudžba': 'Order'}</Text>
          <Text style={[styles.info, {color: 'red'}]}>{orderPrice.toFixed(2)} €</Text>
        </View>
        <Divider style={styles.divider} />
        {isSlidRight && <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.info}>{isCroatianLang ? 'Dostava': 'Delivery'}</Text>
          <Text style={[styles.info, {color: 'red'}]}>
            {general ? general.deliveryPrice.toFixed(2) : '0.00'} €
          </Text>    
        </View>}
        {isSlidRight && <Divider style={styles.divider} />}
        {!isSlidRight && <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.info}>{isCroatianLang? 'Preuzimanje': 'Pick up'}</Text>
          <Text style={[styles.info, {color: 'red'}]}>0.00 €</Text>
        </View>}
        {!isSlidRight && <Divider style={styles.divider} />}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.info}>{isCroatianLang? 'Ukupno': 'Total'}</Text>
          <Text style={[styles.info, {color: 'red'}]}>
            {general ? (orderPrice + (isSlidRight ? general.deliveryPrice : 0)).toFixed(2) : orderPrice} €
          </Text>
        </View>
      <Divider style={styles.divider} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  divider: {
    marginHorizontal: 10,
  },
  info:{
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
  },
  disabledButton: {
    backgroundColor: '#B0BEC5', // Disabled background color
    opacity: 0.6, // Reduce opacity for disabled state
  },
  disabledText: {
    color: '#fff', // Light grey text when disabled
  },
  title: {
    fontSize: 24,
    marginBottom: 0,
    paddingLeft: 20,
    paddingVertical: 10,
  },
  paddingContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
})