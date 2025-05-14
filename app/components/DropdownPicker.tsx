import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { isCroatian } from '../services/languageChecker';

const data = [
  { label: 'Resnik i Divulje', value: 'Resnik i Divulje' },
  { label: 'Kaštel Štafilić', value: 'Kaštel Štafilić' },
  { label: 'Kaštel Novi', value: 'Kaštel Novi' },
  { label: 'Rudine', value: 'Rudine' },
  { label: 'Kaštel Stari', value: 'Kaštel Stari' },
  { label: 'Radun', value: 'Radun' },
  { label: 'Kaštel Lukšić', value: 'Kaštel Lukšić' },
  { label: 'Kaštel Lukšić poviše magistrale', value: 'Kaštel Lukšić poviše magistrale' },
  { label: 'Kaštel Kambelovac', value: 'Kaštel Kambelovac' },
  { label: 'Kaštel Gomilica', value: 'Kaštel Gomilica' },
  { label: 'Kaštel Sućurac', value: 'Kaštel Sućurac' },
];

const DropdownComponent = ({ orderData, setOrderData, isCroatianLang }: any) => {
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    console.log("AAAAA")
  }, [orderData.zone]);

  const renderLabel = () => {
    if (orderData.zone || isFocus) {
      return (
        <Text style={[styles.label, { color: 'gray' }]}>
          Zona
        </Text>
      );
    }
    return null;
  };

  console.log("Zone", orderData.zone)

  return (
    <View style={styles.container}>
      {renderLabel()}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: 'black', borderWidth: 2  }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        maxHeight={200}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? (isCroatianLang? 'Odaberi područje': 'Select area') : '...'}
        value={orderData.zone}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setOrderData({...orderData, zone: item.value});
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={isFocus ? '#ffcc00' : '#ffcc00'}
            name="Safety"
            size={24}
          />
        )}
      />
    </View>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingTop: 6,
    paddingBottom: 8
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,

  },
  icon: {
    marginRight: 17,
    marginLeft: 7
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 10,
    top: -1,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});