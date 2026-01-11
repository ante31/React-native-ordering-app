import React from 'react';
import { View, Image, TouchableOpacity, Text, Platform, StatusBar } from 'react-native';
import { HeaderBackButton } from '@react-navigation/elements';
import PreviousOrderIcon from './PreviousOrderIcon';
import CartIcon from './CartIcon';
import { scale } from '../services/scale';

interface Props {
  navigation: any;
  showIcons?: boolean;
  type?: 'home' | 'back';
  onBack?: () => void;
}

const CustomHeader = ({ navigation, showIcons = true, type = 'back', onBack }: Props) => {
  const isAndroid = Platform.OS === 'android';
  const statusBarHeight = isAndroid ? StatusBar.currentHeight || 24 : 0;

  return (
    <View style={{
      backgroundColor: '#ffd400',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: 8,
      paddingLeft: type === 'home' ? 12 : 0,
      height: 60,
      paddingTop: isAndroid ? statusBarHeight / 2 : 0,
      borderBottomWidth: type === 'back' ? 1 : 0,
      borderBottomColor: '#eee',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {type === 'home' ? (
          <Image source={require('../../assets/images/nav-logo.png')} style={{ width: 120, height: 40, resizeMode: 'contain'}} />
        ) : (
          <>
            <HeaderBackButton onPress={onBack ? onBack : () => navigation.goBack()} />
              {!isAndroid && 
              (
                <TouchableOpacity 
                  onPress={onBack ? onBack : () => navigation.goBack()}
                >
                    <Text style={{ fontSize: 18, color: '#007AFF', marginLeft: -6 }}>Gricko</Text>
                </TouchableOpacity>
              )}
          </>
        )}
      </View>

      {showIcons && (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPressOut={() => navigation.navigate('PreviousOrdersScreen')}>
            <PreviousOrderIcon navigation={navigation} scale={scale} />
          </TouchableOpacity>
          <TouchableOpacity onPressOut={() => navigation.navigate('CartScreen')} style={{ marginHorizontal: 4 }}>
            <CartIcon navigation={navigation} scale={scale} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CustomHeader;