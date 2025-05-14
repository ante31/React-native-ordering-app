import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { Badge } from 'react-native-elements';
import { useCart } from  '../cartContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text } from 'react-native-paper';

const CartIcon = ({ navigation }: { navigation: any }) => {
  const { getCartLength } = useCart();
  const cartLength = getCartLength();

  return (
      <>
        <Ionicons name="cart-outline" size={36} color="black" />
        {cartLength > 0 && (
          <Badge
            status="error"
            containerStyle={{ position: 'absolute', top: 0, left: 24 }}
            value={
              <Text allowFontScaling={false} style={{ color: 'white', fontSize: 12 }}>
                {cartLength}
              </Text>
            }
          />
        )}
      </>
  );
};

export default CartIcon;
