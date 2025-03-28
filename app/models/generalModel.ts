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

export type General = {
  deliveryPrice: number;
  deliveryTime: number;
  displayCurrency: string;
  enabled: boolean;
  minOrder: MinOrder;
  minVersionAndroid: number;
  minVersionIOS: number;
  msg: string;
  pickUpTime: number;
  sourceCurrency: string;
  workTime: WorkTime;
};

