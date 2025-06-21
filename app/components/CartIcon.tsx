import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { Badge } from 'react-native-elements';
import { useCart } from  '../cartContext';
import { isTablet } from '../services/isTablet';
import { Text } from 'react-native-paper';

const CartIcon = ({ navigation, scale }: { navigation: any, scale: any }) => {
  const { getCartLength } = useCart();
  const cartLength = getCartLength();

  return (
      <>
        <Image
          source={require('../../assets/images/cartIcon.png')}
          style={{
            top: 2,
            width: isTablet() ? 80 : 50,
            height: isTablet() ? 80 : 50,
            resizeMode: 'contain',
          }}
        />
        {cartLength > 0 && (
          <Badge
            status="error"
            containerStyle={{ position: 'absolute', top: 5, right: isTablet() ? 45 : -1, transform: [{ scale: isTablet() ? 1.7 : 1.1 }] }}
            value={
              <Text allowFontScaling={false} style={{ color: 'white', fontSize: isTablet() ? 14 : 12 }}>
                {cartLength}
              </Text>
            }
          />
        )}
      </>
  );
};

export default CartIcon;
