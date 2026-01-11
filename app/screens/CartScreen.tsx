import { useState, useRef, useEffect, useLayoutEffect } from "react";
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
import { Button, Divider, Modal, Portal } from "react-native-paper";
import { isCroatian } from "../services/languageChecker";
import { appButtonsDisabled } from "../services/isAppClosed";
import { useGeneral } from "../generalContext";
import { CenteredLoading } from "../components/CenteredLoading";
import { getDayOfTheWeek, getLocalTime } from "../services/getLocalTime";
import CartMealDetails from "../components/CartMealDetails";
import { getModalHeight } from "../services/getModalHeight";
import { useCartActions } from "../../hooks/useCartActions";
import { useCartAnimations } from "../../hooks/useCartAnimations";
import { CartItem } from "../components/CartItem";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');



const CartScreen = ({ navigation, route, drinks={}, scale  }: { navigation: any, route: any, drinks: any, scale: any }) => {

  const styles = getStyles(scale);

  const isCroatianLanguage = isCroatian();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState("");
  const { storageOrder } = route.params || {};
  const {general} = useGeneral();
  const [showMealDetailsModal, setShowMealDetailsModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null);
  console.log("Selected meal in CartScreen:", selectedMeal);

  const { getCartLength, state: cartState, dispatch } = useCart();
  const { totalPrice, handleIncrement, handleDecrement, handleDelete } = useCartActions(cartState, dispatch);
  const { animatedWidths, handleQuantityPress, selectedItem } = useCartAnimations(cartState.items, scale);
  const cartLength = getCartLength();
  const dayofWeek = getDayOfTheWeek(getLocalTime(), general?.holidays);

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

  return (
    <View style={styles.container}>
      <ScrollView style={{ width: "100%" }} contentContainerStyle={styles.scrollViewContent}>
        {cartState.items.map((item: any) => (
          <CartItem 
            key={item.id}
            item={item}
            scale={scale}
            isCroatianLanguage={isCroatianLanguage}
            animation={{ widths: animatedWidths, selectedId: selectedItem }}
            handlers={{
              onSelectMeal: (item: any) => { setSelectedMeal(item); setShowMealDetailsModal(true); },
              onQuantityPress: handleQuantityPress,
              onDecrement: handleDecrement,
              onIncrement: handleIncrement,
              onDeletePress: (id: string) => { setItemToDelete(id); setShowDeleteModal(true); }
            }}
          />
        ))}
      </ScrollView>
      <TouchableOpacity
        onPress={() => navigation.navigate('OrderScreen', { cartState, storageOrder })}
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
  divider: {
    marginBottom: 8,
    height: 1,
    backgroundColor: "grey",
    opacity: 1, 
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
});



export default CartScreen;
