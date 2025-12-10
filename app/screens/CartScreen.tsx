import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  PixelRatio,
} from "react-native";
import { useCart } from "../cartContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Button, Divider, Modal, Portal } from "react-native-paper";
import { isCroatian } from "../services/languageChecker";
import * as Haptics from "expo-haptics"
import { appButtonsDisabled } from "../services/isAppClosed";
import { useGeneral } from "../generalContext";
import { CenteredLoading } from "../components/CenteredLoading";
import { getDayOfTheWeek, getLocalTime } from "../services/getLocalTime";
import { Meal } from "../models/mealModel";
import CartMealDetails from "../components/CartMealDetails";
import { HeaderBackButton } from '@react-navigation/elements';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const fontScale = PixelRatio.getFontScale();
const isLargeFont = fontScale > 1.8;
const isMediumLargeFont = fontScale > 1.6;
const isMediumFont = fontScale > 1.4;
const isSmallFont = fontScale > 1.2;

const isAndroid = Platform.OS === 'android';


const CartScreen = ({ navigation, route, drinks={}, scale  }: { navigation: any, route: any, drinks: any, scale: any }) => {
  const getModalHeight = (meal: any) => {
    console.log("meal in cart", meal);
  const isLargeFont = fontScale > 1.8;
  const isMediumLargeFont = fontScale > 1.6;
  const isMediumFont = fontScale > 1.4;
  const isSmallFont = fontScale > 1.2;
  if (!meal) return SCREEN_HEIGHT * 0.7;//samo egde case koji se nece dogodit
  
  return meal.extras === "null" // prilozi i sokovi (nemaju dodadnih priloga pa ce im modal height bit mal)
    ? (
        isLargeFont ? (isAndroid ? "31%" : 300) :
        isMediumLargeFont ? (isAndroid ? "28%" : 280) :
        isMediumFont ? (isAndroid ? "26%" : 250) :
        isSmallFont ? (isAndroid ? "24%" : 230) :
        (isAndroid ? "20%" : 200)
      )
    : meal.extras === "listaPomfrit"
    ? "45%" // pomfrit ima malu listu priloga
    : "80%"; // najcesci case
};
  const styles = getStyles(scale);
  useLayoutEffect(() => {
  
  }, [navigation]);
  const isCroatianLanguage = isCroatian();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState("");
  const { storageOrder } = route.params || {};
  const {general} = useGeneral();
  const [showMealDetailsModal, setShowMealDetailsModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null);
  console.log("Selected meal in CartScreen:", selectedMeal);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    
  }, [reloadTrigger]);

  const { getCartLength, state: cartState, dispatch } = useCart();
  const cartLength = getCartLength();
  const dayofWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);

    const handleMealClick = (meal: any) => {
      setSelectedMeal(meal);
      setShowMealDetailsModal(true);
    };


  // Store animated widths for each item by id
  const animatedWidths = useRef(
    new Map(cartState.items.map((item: any) => [item.id, new Animated.Value(scale.light(46))]))
  ).current;
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const newTotalPrice = cartState.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    setTotalPrice(newTotalPrice);
  }, [cartState.items]);

  useEffect(() => {
    cartState.items.forEach(item => {
      if (!animatedWidths.has(item.id)) {
        animatedWidths.set(item.id, new Animated.Value(scale.light(46))); // initial closed width
      }
    });
  }, [cartState.items]);
  

  const handlePress = () => {
    navigation.navigate('OrderScreen', { cartState, storageOrder });
  };

  const handleDelete = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    dispatch({ type: "REMOVE_FROM_CART", payload: id });
  };

  const handleIncrement = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const item = cartState.items.find((item: any) => item.id === id);
    if (item) {
      dispatch({
        type: "UPDATE_ITEM_QUANTITY",
        payload: { id, quantity: item.quantity + 1 },
      });
      resetAutoCloseTimeout(id);
    }
  };
  const handleDecrement = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const item = cartState.items.find((item: any) => item.id === id);
    if (item && item.quantity > 1) {
      dispatch({
        type: "UPDATE_ITEM_QUANTITY",
        payload: { id, quantity: item.quantity - 1 },
      });
      resetAutoCloseTimeout(id);
    }
  };

  const handleQuantityPress = (id: string) => {
    const isSameItem = selectedItem === id;
    setSelectedItem(isSameItem ? null : id);
  
    // Zatvarnje svih ostalih stavki
    cartState.items.forEach((item: any) => {
      const animatedWidth = animatedWidths.get(item.id);
      if (animatedWidth && item.id !== id) {
        Animated.timing(animatedWidth, {
          toValue: scale.light(46),
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    });
  
    // Otvaranje ili zatvaranje odabrane stavke
    const animatedWidth = animatedWidths.get(id);
    if (animatedWidth) {
      Animated.timing(animatedWidth, {
        toValue: isSameItem ? scale.light(46) : scale.light(100),
        duration: 300,
        useNativeDriver: false,
      }).start();
  
      if (!isSameItem) {
        resetAutoCloseTimeout(id);
      }
    }
  };
  
  const resetAutoCloseTimeout = (id: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  
    closeTimeoutRef.current = setTimeout(() => {
      const animatedWidth = animatedWidths.get(id);
      if (animatedWidth) {
        Animated.timing(animatedWidth, {
          toValue: scale.light(46),
          duration: 300,
          useNativeDriver: false,
        }).start();
        setSelectedItem(null);
      }
    }, 3500);
  };


  if (cartLength === 0) {
    return (
      <View style={styles.container}>
        <Image
          source={{
            uri: "https://static.lenskart.com/media/owndays/mobile/img/owndays/empty-cart.webp",
          }}
          style={styles.image}
        />
        <Text style={[styles.boldText, { fontSize: scale.light(22), alignItems: 'center'}]}>{isCroatianLanguage? "Vaša narudžba je prazna": "Your cart is empty"}</Text>
        <Text style={[styles.lightText, { fontSize: scale.light(18)}]}>{isCroatianLanguage? "Dodajte nešto po želji!": "Add something you like!"}</Text>
        <View style={{position: 'absolute', bottom: 20, width: '100%', alignItems: 'center'}}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.button]}
          >
            <Text allowFontScaling={false} style={[styles.buttonText, { fontSize: scale.light(18), height: 'auto', }]}>{isCroatianLanguage? "Natrag": "Back"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  console.log("Drinks in cart items:", cartState.items.map((item: any) => item.selectedDrinks).flat());

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={styles.scrollViewContent}
      >
        {cartState.items.map((item: any, index: number) => (
          <View key={index} style={{ width: '100%' }}>
            <TouchableOpacity onPress={() => handleMealClick(item)} style={styles.itemWrapper}>
              <TouchableOpacity onPress={() => handleQuantityPress(item.id)}>
                <Animated.View
                  style={[
                    styles.quantityContainer,
                    { width: animatedWidths.get(item.id) || scale.light(46) },
                  ]}
                >
                  {selectedItem === item.id ? (
                    <View style={styles.quantityContent}>
                      <TouchableOpacity
                        onPress={() => handleDecrement(item.id)}
                        style={styles.quantityButtonremove}
                      >
                        <MaterialIcons name="remove" size={scale.light(26)} color="#ffd400" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => handleIncrement(item.id)}
                        style={styles.quantityButtonadd}
                      >
                        <MaterialIcons name="add" size={scale.light(26)} color="#ffd400" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                  )}
                </Animated.View>
              </TouchableOpacity>
              <View style={styles.infoContainer}>
                <Text style={[styles.boldText, { fontSize: scale.light(20)}]}>{isCroatianLanguage ? item.name.split("|")[0] : item.name.split("|")[1]}{item.size !== "null" ? ` (${item.size})` : ''}</Text>
                {Object.keys(item.selectedExtras).length > 0 && 
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={styles.lightText}>
                    {Object.keys(item.selectedExtras).map(key => key.split('|')[isCroatianLanguage? 0: 1]).join(', ')}
                  </Text>
                </View>}
                {item.selectedDrinks?.length > 0 && 
                  <View style={{flexDirection: 'row', marginTop: 5}}>
                    <Text style={styles.lightText}>
                      {item.selectedDrinks
                        .map((drink: any) =>
                          isCroatianLanguage
                            ? drink.ime
                            : drink.ime_en
                        )
                        .join(', ')
                      }
                    </Text>
                  </View>
                }
              </View>
              <TouchableOpacity
                onPress={() => {
                  setItemToDelete(item.id);
                  setShowDeleteModal(true);
                }}
                style={{ marginRight: scale.isTablet() ? 20 : 0 }}
              >
                <MaterialIcons name="delete" size={scale.light(28)} color="#DA291C" />
              </TouchableOpacity>
            </TouchableOpacity>
            <View style={styles.dividerWrapper}>
              <Divider style={[styles.divider, { width: '100%' }]} />
              <Text style={styles.overlayText}>{(item.price * item.quantity).toFixed(2)} €</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity
        onPress={handlePress}
        disabled={appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays)}
        style={[styles.button, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays) && styles.disabledButton]}
      >
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{ marginLeft: scale.isTablet()? 10 : 0, marginRight: scale.isTablet()? 20 : 15, width: scale.light(30), height: scale.light(30), borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center'}}>
            <Text allowFontScaling={false} style={[{color: '#ffd400', fontFamily: "Lexend_400Regular", fontSize: scale.light(16)}, appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays) && styles.disabledText ]}>{cartState.items.reduce((sum, item) => sum + item.quantity, 0)}</Text>
          </View>
          <Text allowFontScaling={false} style={[styles.buttonText, appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays) && styles.disabledText]}>
            {isCroatianLanguage? "Idite na narudžbu!": "Go to checkout!"}
          </Text>
        </View>
        <Text style={[{fontFamily: "Lexend_400Regular", color: '#fff', fontSize: scale.light(18), marginRight: scale.isTablet()? 10 : 0}, appButtonsDisabled(general?.appStatus, general?.workTime[dayofWeek], general?.holidays) && styles.disabledText ]}>
          {totalPrice.toFixed(2)} €
        </Text>

      </TouchableOpacity>
      <Portal>
        <Modal
          visible={showDeleteModal}
          onDismiss={() => setShowDeleteModal(false)}
          contentContainerStyle={{ padding: 20, backgroundColor: 'white', margin: 20, borderRadius: 5 }}>
          <Text style={{ marginBottom: 10, fontSize: 20 }}>{isCroatianLanguage? "Jeste li sigurni da želite obrisati ovu stavku?": "Are you sure you want to delete this item?"}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <View style={{ flex: 1, marginRight: 5 }}>
              <Button
                mode="contained"
                onPress={() => {
                  handleDelete(itemToDelete)
                  setShowDeleteModal(false)
                }}
                style={{ borderRadius: 5, backgroundColor: '#DA291C', height: 60, justifyContent: 'center' }}
              >
                <Text style={{ color: 'white', fontSize: 17 }}>{isCroatianLanguage? "Obriši": "Delete"}</Text>
              </Button>
            </View>
            <View style={{ flex: 1, marginLeft: 5}}>
              <Button
                mode="outlined"
                onPress={() => setShowDeleteModal(false)}
                style={{ borderRadius: 5, height: 60, justifyContent: 'center' }}
              >
                <Text style={{ color: 'black', fontSize: 17 }}>{isCroatianLanguage? "Odustani": "Cancel"}</Text>
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
      <Portal>
        <Modal
          visible={showMealDetailsModal}
          onDismiss={() => setShowMealDetailsModal(false)}
          contentContainerStyle={[styles.modalContainer, { height: getModalHeight(selectedMeal), margin: scale.heavy(16) }]}
        >
          {selectedMeal ? (
            <CartMealDetails
              visible={showMealDetailsModal}
              meal={selectedMeal}
              drinks={drinks}
              scale={scale}
              onClose={() => setShowMealDetailsModal(false)}
              handleRemoveFromCart={handleDelete}
              setReloadTrigger={setReloadTrigger}
              navigation={navigation}
            />
          ) : (
            <View style={styles.loaderContainer}>
              <CenteredLoading />
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const getStyles = (scale: any) =>
  StyleSheet.create({
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



export default CartScreen;
