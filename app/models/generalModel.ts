export type WorkTime = {
  [day: string]: {
    openingTime: string;
    deliveryOpeningTime: string;
    deliveryClosingTime: string;
    closingTime: string;
  };
};

export type MinOrder = {
  [location: string]: number;
};

export type Extras = {
  penalty: number;
  freeMax: number;
}

export type General = {
  deliveryPrice: number;
  deliveryTime: number;
  displayCurrency: string;
  holidays: Holidays;
  enabled: boolean;
  minOrder: MinOrder;
  minVersionAndroid: number;
  minVersionIOS: number;
  msg: string;
  pickUpTime: number;
  sourceCurrency: string;
  workTime: WorkTime;
  updateUrlAndroid: string;
  updateUrlIOS: string;
  extras: Extras
};

export type Holidays = {
  non_working_days: string[];
  shortened_days: string[];
};
