import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { isTablet } from '../services/isTablet';

const PreviousOrderIcon = ({ navigation, scale }: { navigation: any, scale: any }) => {

  return (
      <>
        <Image
          source={require('../../assets/images/previousOrdersIcon.png')} 
          style={{
            top: 5,
            width: isTablet() ? 72 : 42,
            height: isTablet() ? 72 : 42,
            resizeMode: 'contain',
          }}
        />
        
      </>
  );
};

export default PreviousOrderIcon;
