import { View, Text, TouchableOpacity, Animated, StyleSheet, PixelRatio, Dimensions } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Divider } from "react-native-paper";

export const CartItem = ({ item, scale, isCroatianLanguage, handlers, animation }: any) => {
  const styles = getStyles(scale, {
    isLargeFont: PixelRatio.getFontScale() > 1.8,
    isMediumLargeFont: PixelRatio.getFontScale() > 1.6,
    isMediumFont: PixelRatio.getFontScale() > 1.4,
    isSmallFont: PixelRatio.getFontScale() > 1.2,
  });


  return (
  <View style={{ width: '100%' }}>
    <TouchableOpacity style={styles.itemWrapper} onPress={() => handlers.onSelectMeal(item)}>
      <TouchableOpacity onPress={() => handlers.onQuantityPress(item.id)}>
        <Animated.View style={[styles.quantityContainer, { width: animation.widths.get(item.id) || scale.light(46) }]}>
          {animation.selectedId === item.id ? (
            <View style={styles.quantityContent}>
              <TouchableOpacity onPress={() => handlers.onDecrement(item.id)} style={styles.quantityButtonremove}>
                <MaterialIcons name="remove" size={scale.light(26)} color="#ffd400" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => handlers.onIncrement(item.id)} style={styles.quantityButtonadd}>
                <MaterialIcons name="add" size={scale.light(26)} color="#ffd400" />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.quantityText}>{item.quantity}</Text>
          )}
        </Animated.View>
      </TouchableOpacity>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.boldText, { fontSize: scale.light(20)}]}>
          {isCroatianLanguage ? item.name.split("|")[0] : item.name.split("|")[1]}
          {item.size !== "null" ? ` (${item.size})` : ''}
        </Text>
        {/* Render extras i drinks... */}
      </View>

      <TouchableOpacity onPress={() => handlers.onDeletePress(item.id)}>
        <MaterialIcons name="delete" size={scale.light(28)} color="#DA291C" />
      </TouchableOpacity>
    </TouchableOpacity>
    <View style={styles.dividerWrapper}>
      <Divider style={[styles.divider, { width: '100%' }]} />
      <Text style={styles.overlayText}>{(item.price * item.quantity).toFixed(2)} €</Text>
    </View>
  </View>
  );
};

const getStyles = (scale: any, fontFlags: any) => {
  const { isLargeFont, isMediumLargeFont, isMediumFont, isSmallFont } = fontFlags;
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollViewContent: {
    padding: scale.isTablet()? 50 : 20,
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  boldText: {
    fontFamily: "Lexend_700Bold",
    color: "#333",
    marginBottom: 10,
  },
  lightText: {
    fontFamily: "Lexend_400Regular",
    fontSize: scale.light(14),
    color: "#666",
  },
button: {
  paddingVertical: 15,
  paddingHorizontal: 20,
  marginBottom: 20,
  backgroundColor: "#ffd400",
  borderRadius: 5,
  width: "90%",
  alignItems: "center",
  justifyContent: "center",
},
  buttonText: {
    fontSize: scale.light(17),
    fontFamily: "Lexend_700Bold",
    color: "#fff",
  },  
  itemWrapper: {
    width: "100%",
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  quantityContainer: {
    height: scale.light(46),
    backgroundColor: "#fff",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: scale.light(2),
    borderColor: "#ffd400",
    marginRight: 10,
  },
  quantityContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityButtonadd: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: scale.light(10)
  },
  quantityButtonremove: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale.light(10)
  },
  quantityText: {
    fontSize: scale.light(14),
    fontFamily: "Lexend_700Bold"
  },
  infoContainer: {
    flex: 1,
    marginHorizontal: 10,
    marginLeft: scale.isTablet()? 10 : 0
  },
  divider: {
    marginBottom: 8,
    height: 1,
    backgroundColor: "grey",
    opacity: 1, 
  },
  dividerWrapper: {
    width: '100%',
    position: 'relative',
    marginBottom: 20, 
  },
  overlayText: {
    fontFamily: "Lexend_400Regular",
    position: 'absolute',
    right: scale.isTablet() ? 30 : 10, 
    top: scale.isTablet() ? -22 : isLargeFont ? -24 : isMediumLargeFont ? -20 : isMediumFont ? -20 : isSmallFont ? -18 : -16, 
    fontSize: scale.isTablet() ? 28 : 16,
    color: 'red', 
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 5, 
    borderRadius: 50, 
    borderWidth: 1, 
    borderColor: 'gray', 
  },
  disabledButton: {
    backgroundColor: '#B0BEC5', 
    opacity: 0.6, 
  },
  disabledText: {
    color: '#fff', 
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 0,
    borderRadius: 10,
    height: SCREEN_HEIGHT * 0.7,
  },
  backButtonContainer: {
    position: 'relative',
    width: 50, 
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreText: {
    fontSize: 20,
    color: 'black',
    marginBottom: 10,
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  addMoreView: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',}
  });
};
