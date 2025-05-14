export type Meal = {
  id: string;
  ime: string;
  ime_en: string;
  opis: string;
  opis_en: string;
  popularity: number;
  image: string;
  portions: {
    size: string | null;
    size_en: string | null;
    price: number;
    extras: string | null;
  }[];
};
