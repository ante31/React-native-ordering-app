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
  awardThreshold: number;
  deliveryPrice: number;
  deliveryTime: number;
  displayCurrency: string;
  holidays: Holidays;
  enabled: boolean;
  minOrder: MinOrder;
  minVersionAndroid: number;
  minVersionIOS: number;
  pickUpTime: number;
  sourceCurrency: string;
  workTime: WorkTime;
  updateUrlAndroid: string;
  updateUrlIOS: string;
  extras: Extras
  message: {
    text: string;
    textEn: string;
    active: boolean;
  };
  appStatus: {
    appClosed: boolean;
    forceAppOpen: boolean;
  }
};

export type Holidays = {
  non_working_days: string[];
  shortened_days: string[];
};
