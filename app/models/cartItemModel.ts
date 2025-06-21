export type CartItem = {
    id: string;
    name: string;
    description: string;
    size: string;
    price: number;
    quantity: number;
    selectedExtras: { [key: string]: number }; 
    selectedDrinks: []; 
    portionsOptions: {
        size: string | null;
        size_en: string | null;
        price: number;
        extras: string | null;
    }[];
  };