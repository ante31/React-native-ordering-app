import { useMemo } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export const useCartActions = (cartState: any, dispatch: any) => {
  const totalPrice = useMemo(() => 
    cartState.items.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0)
  , [cartState.items]);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleIncrement = (id: string) => {
    triggerHaptic();
    const item = cartState.items.find((i: any) => i.id === id);
    if (item) dispatch({ type: "UPDATE_ITEM_QUANTITY", payload: { id, quantity: item.quantity + 1 } });
  };

    const handleDelete = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    dispatch({ type: "REMOVE_FROM_CART", payload: id });
  };

  const handleDecrement = (id: string) => {
    triggerHaptic();
    const item = cartState.items.find((i: any) => i.id === id);
    if (item && item.quantity > 1) dispatch({ type: "UPDATE_ITEM_QUANTITY", payload: { id, quantity: item.quantity - 1 } });
  };
  

  return { totalPrice, handleIncrement, handleDecrement, handleDelete };
};