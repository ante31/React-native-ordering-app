import React, { createContext, useContext, useReducer } from 'react';
import { CartItem } from './models/cartItemModel';
import { CartState } from './models/cartStateModel';

type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'UPDATE_ITEM_QUANTITY'; payload: { id: string; quantity: number } };


const initialState: CartState = {
  items: [],
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  getCartLength: () => number;
}>({
  state: initialState,
  dispatch: () => null,
  getCartLength: () => 0,
});

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const itemExists = state.items.find((item) => item.id === action.payload.id);
      console.log("itemExists ", itemExists)
      if (itemExists) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      console.log("DODANO")
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) };
    case 'UPDATE_ITEM_QUANTITY': {
      // Update the quantity of the specific item by id
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }

};

export const CartProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const getCartLength = () => state.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ state, dispatch, getCartLength }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

export default CartProvider; // Dodaj default export


