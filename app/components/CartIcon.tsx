import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { Badge } from 'react-native-elements';
import { useCart } from  '../cartContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CartIcon = ({ navigation }: { navigation: any }) => {
  const { getCartLength } = useCart();
  const cartLength = getCartLength();

  return (
      <>
        <Ionicons name="cart-outline" size={36} color="black" />
        {cartLength > 0 && (
          <Badge
            status="error"
            containerStyle={{ position: 'absolute', top: 8, right: 4 }}
            value={cartLength}
          />
        )}
      </>
  );
};

export default CartIcon;
