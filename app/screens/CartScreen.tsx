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


const { width, height } = Dimensions.get('screen');

const getModalHeight = (meal: any | null) => {
  if (!meal) return height * 0.7;
  return meal.portionsOptions[0].extras === "null" ? "20%" : "80%";
};


const CartScreen = ({ navigation, route, meals  }: { navigation: any, route: any, meals: Meal[] }) => {
  useLayoutEffect(() => {
    const handleHeaderBack = () => {
      console.log("Header back button pressed, navigating to Home");
      navigation.popToTop();
      return true;
    };
  
    
      
  }, [navigation]);
  const isCroatianLanguage = isCroatian();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState("");
  const { storageOrder } = route.params || {}; // Default empty object if params are not available
  const {general} = useGeneral();
  const [showMealDetailsModal, setShowMealDetailsModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null);
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
    new Map(cartState.items.map((item: any) => [item.id, new Animated.Value(50)]))
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
        animatedWidths.set(item.id, new Animated.Value(50)); // initial closed width
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
    // Find the item in the cart
    const item = cartState.items.find((item: any) => item.id === id);
    if (item) {
      // Dispatch the action to increment the quantity
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
      // Dispatch the action to decrement the quantity
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
  
    // Close previously selected item
    cartState.items.forEach((item: any) => {
      const animatedWidth = animatedWidths.get(item.id);
      if (animatedWidth && item.id !== id) {
        Animated.timing(animatedWidth, {
          toValue: 50,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    });
  
    // Open the selected item
    const animatedWidth = animatedWidths.get(id);
    if (animatedWidth) {
      Animated.timing(animatedWidth, {
        toValue: isSameItem ? 50 : 100,
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
          toValue: 50,
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
        <Text style={styles.boldText}>{isCroatianLanguage? "Tvoja narudžba je prazna": "Your cart is empty"}</Text>
        <Text style={styles.lightText}>{isCroatianLanguage? "Dodaj nešto po želji!": "Add something you like!"}</Text>
        <View style={{position: 'absolute', bottom: 20, width: '100%', alignItems: 'center'}}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{isCroatianLanguage? "Natrag": "Back"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  console.log("Cart items:", cartState.items);

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* <View style={styles.addMoreView}>
        <MaterialIcons name="add" size={26} color="black" /> 
        <Text style={styles.addMoreText}>{isCroatianLanguage? "Dodajte još artikala": "+ Add more items"}</Text>
        </View> */}
        {cartState.items.map((item: any, index: number) => (
          <View key={index} style={{ width: '100%' }}>
            <TouchableOpacity onPress={() => handleMealClick(item)} style={styles.itemWrapper}>
              <TouchableOpacity onPress={() => handleQuantityPress(item.id)}>
                <Animated.View
                  style={[
                    styles.quantityContainer,
                    { width: animatedWidths.get(item.id) || 50 },
                  ]}
                >
                  {selectedItem === item.id ? (
                    <View style={styles.quantityContent}>
                      <TouchableOpacity
                        onPress={() => handleDecrement(item.id)}
                        style={styles.quantityButtonremove}
                      >
                        <MaterialIcons name="remove" size={26} color="#FFC72C" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => handleIncrement(item.id)}
                        style={styles.quantityButtonadd}
                      >
                        <MaterialIcons name="add" size={26} color="#FFC72C" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                  )}
                </Animated.View>
              </TouchableOpacity>
              <View style={styles.infoContainer}>
                <Text style={styles.boldText}>{isCroatianLanguage ? item.name.split("|")[0] : item.name.split("|")[1]}{item.size !== "null" ? ` (${item.size})` : ''}</Text>
                {Object.keys(item.selectedExtras).length > 0 && <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={styles.lightText}>
                    {Object.keys(item.selectedExtras).map(key => key.split('|')[isCroatianLanguage? 0: 1]).join(', ')}
                  </Text>
                </View>}
              </View>
              <TouchableOpacity
                onPress={() => {
                  setItemToDelete(item.id);
                  setShowDeleteModal(true);
                }}
              >
                <MaterialIcons name="delete" size={30} color="red" />
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
        disabled={appButtonsDisabled(general?.workTime[dayofWeek], general?.holidays)}
        style={[styles.button, {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, appButtonsDisabled(general?.workTime[dayofWeek], general?.holidays) && styles.disabledButton]}
      >
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{marginRight: 15, width: 30, height: 30, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center'}}>
            <Text allowFontScaling={false} style={[{color: '#FFC72C', fontSize: 18,}, appButtonsDisabled(general?.workTime[dayofWeek], general?.holidays) && styles.disabledText ]}>{cartState.items.reduce((sum, item) => sum + item.quantity, 0)}</Text>
          </View>
          <Text allowFontScaling={false} style={[styles.buttonText, appButtonsDisabled(general?.workTime[dayofWeek], general?.holidays) && styles.disabledText]}>{isCroatianLanguage? "Idite na narudžbu!": "Go to checkout!"}</Text>
        </View>
        <Text style={[{color: '#fff', fontSize: 20}, appButtonsDisabled(general?.workTime[dayofWeek], general?.holidays) && styles.disabledText ]}>{totalPrice.toFixed(2)} €</Text>

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
                style={{ borderRadius: 5, backgroundColor: 'red', height: 60, justifyContent: 'center' }}
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
          contentContainerStyle={[styles.modalContainer, { height: getModalHeight(selectedMeal) }]}
        >
          {selectedMeal ? (
            <CartMealDetails
              visible={showMealDetailsModal}
              meal={selectedMeal}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollViewContent: {
    padding: 20,
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  boldText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  lightText: {
    fontSize: 16,
    color: "#666",
  },
  button: {
    height: 60,
    marginBottom: 20,
    backgroundColor: "#FFC72C",
    padding: 15,
    borderRadius: 5,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 4, 
  },  
  itemWrapper: {
    width: "100%",
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  quantityContainer: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffcc00",
    marginRight: 10,
  },
  quantityContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButtonadd: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginLeft:10
  },
  quantityButtonremove: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  infoContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  divider: {
    marginBottom: 20,
    height: 1,
    backgroundColor: "grey",
    opacity: 1, /* was 0 */
  },
  dividerWrapper: {
    width: '100%',
    position: 'relative', // Allow absolute positioning of the text
    marginBottom: 20, // Adjust as needed
  },
  overlayText: {
    position: 'absolute',
    right: 10, 
    top: -15, 
    fontSize: 16,
    color: 'red', 
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 5, 
    borderRadius: 50, 
    borderWidth: 1, 
    borderColor: 'gray', 
  },
  disabledButton: {
    backgroundColor: '#B0BEC5', // Disabled background color
    opacity: 0.6, // Reduce opacity for disabled state
  },
  disabledText: {
    color: '#fff', // Light grey text when disabled
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
    marginHorizontal: 20,
    height: height * 0.7,
  },
  backButtonContainer: {
    position: 'relative',
    width: 50, // or whatever size your HeaderBackButton takes
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
