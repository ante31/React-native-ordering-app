import { View, Text, Platform, TouchableOpacity, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { isTablet } from '../services/isTablet';
import { Category } from '../models/categoryModel';

const CARD_MARGIN = 16;
const SPECIAL_OFFER_POSITION = -5;
const SPECIAL_OFFER_TABLET_POSITION = -8;
const SPECIAL_OFFER_TABLET_SIZE = 170;
const SPECIAL_OFFER_SIZE = 110;

interface Props {
  item: Category;
  isCroatianLanguage: boolean;
  scale: any;
  handlePress: (title: string, titleEn: string, image: string, category: boolean, id: string) => void;
}

const CategoryCard = ({ item, isCroatianLanguage, scale, handlePress }: Props) => {
  const onPress = () => handlePress(item.title, item.titleEn, item.image, item.category, item.id);

  return (
    <View
      style={{
        width: item.title === 'Pizza' || item.title === 'Meso' ? '100%' : '50%',
        paddingRight: CARD_MARGIN,
        paddingTop: CARD_MARGIN,
      }}
    >
      <View style={{ flex: 1, minHeight: 200 }}>
        {item.specialOffer && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={onPress}
            style={{
              opacity: 1,
              position: 'absolute',
              top: isTablet() ? SPECIAL_OFFER_TABLET_POSITION : SPECIAL_OFFER_POSITION,
              right: isTablet() ? SPECIAL_OFFER_TABLET_POSITION : SPECIAL_OFFER_POSITION,
              zIndex: 1,
            }}
          >
            <Image
              source={isCroatianLanguage ? require('../../assets/images/posebna ponuda-cro.png') : require('../../assets/images/posebna ponuda-eng.png')}
              style={{
                width: isTablet() ? SPECIAL_OFFER_TABLET_SIZE : SPECIAL_OFFER_SIZE,
                height: isTablet() ? SPECIAL_OFFER_TABLET_SIZE : SPECIAL_OFFER_SIZE,
                resizeMode: 'cover',
                borderRadius: 10,
              }}
            />
          </TouchableOpacity>
        )}

        <Card
          onPress={onPress}
          style={{
            flex: 1,
            ...(Platform.OS === 'ios' && { overflow: 'hidden' }),
          }}
        >
          <Card.Cover
            source={{ uri: item.image }}
            style={{
              backgroundColor: 'white',
              width: '100%',
              height: scale.isTablet() ? 400 : 200,
              borderRadius: 10,
            }}
          />
          <Card.Content style={{ flexGrow: 1, justifyContent: 'flex-end' }}>
            <Text style={{
              color: 'black',
              fontSize: scale.light(19),
              paddingTop: 16,
              fontFamily: 'Lexend_700Bold',
            }}>
              {isCroatianLanguage ? item.title : item.titleEn}
            </Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
};

export default CategoryCard;