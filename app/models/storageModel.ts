import { CartState } from "./cartStateModel";

export type StorageModel = {
    name: string,
    phone: string,
    address: string,
    zone: string,
    note: string,
    isDelivery: boolean,
    timeOption: string,
    cartItems: CartState,
    time: string,
    deadline: string,
    status: string,
    totalPrice: number
};
  