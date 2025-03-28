export type CartItem = {
    id: string;
    name: string;
    size: string;
    price: number;
    quantity: number;
    selectedExtras: { [key: string]: string }; 
  };