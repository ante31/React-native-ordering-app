import { TouchableOpacity, Image } from 'react-native';
import { isTablet } from '../services/isTablet';

interface Props {
  isCroatian: boolean;
  onPress: () => void;
}

const SPECIAL_OFFER_POS = -5;
const SPECIAL_OFFER_TABLET_POS = -8;
const SIZE = 110;
const TABLET_SIZE = 170;

export const SpecialOfferBadge = ({ isCroatian, onPress }: Props) => {
  const pos = isTablet() ? SPECIAL_OFFER_TABLET_POS : SPECIAL_OFFER_POS;
  const size = isTablet() ? TABLET_SIZE : SIZE;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={{
        position: 'absolute',
        top: pos,
        right: pos,
        zIndex: 1,
      }}
    >
      <Image
        source={isCroatian 
          ? require('../../assets/images/posebna ponuda-cro.png') 
          : require('../../assets/images/posebna ponuda-eng.png')
        }
        style={{ width: size, height: size, resizeMode: 'cover', borderRadius: 10 }}
      />
    </TouchableOpacity>
  );
};