import { useGeneral } from "../generalContext";
import { Holidays } from "../models/generalModel";
import { getLocalTime, getLocalTimeHours, getLocalTimeMinutes } from "./getLocalTime";

export const getHolidayGreeting = (isCroatian: boolean) => {
  const date = getLocalTime().toISOString().split('T')[0]; // YYYY-MM-DD
  const [year, month, day] = date.split('-');
  const mmdd = `${month}-${day}`; // MM-DD
  
  const greetings: { [key: string]: { hr: string; en: string } } = {
    '12-25': { hr: "Sretan Božić!", en: "Merry Christmas!" },
    '12-26': { hr: "Sretan Sv. Stjepan!", en: "Happy St. Stephen's Day!" },
    '12-31': { hr: "Sretna Stara godina!", en: "Happy New Year's Eve!" },
    '01-01': { hr: "Sretna Nova godina!", en: "Happy New Year!" },
  };

  const wish = greetings[mmdd];
  // Generička poruka, tipa badnjak 24.12.
  if (wish) return isCroatian ? wish.hr : wish.en;
  return isCroatian ? "Danas ne radimo." : "Closed today.";
};

export const isHoliday = (holidays?: Holidays): 'closed' | 'shortened' | 'normal' => {
  const date = getLocalTime().toISOString().split('T')[0]; // YYYY-MM-DD
  const [yearStr, month, day] = date.split('-');
  const year = Number(yearStr);
  const mmdd = `${month}-${day}`; // MM-DD

  const easterSunday = getEasterDate(year)// MM-DD
  const easterMonday = getEasterMonday(year) // MM-DD

  const isNonWorking =
    holidays?.non_working_days.includes(mmdd) ||
    mmdd === easterSunday ||
    mmdd === easterMonday;

  if (isNonWorking) return 'closed';

  const isShortened = holidays?.shortened_days.includes(mmdd);
  if (isShortened) return 'shortened';

  return 'normal';
};


export const isClosedMessageDisplayed = (appStatus: any, workingHours: any, holidays?: Holidays): boolean => {
  console.log("isClosedMessageDisplayed", appStatus, workingHours, isHoliday(holidays) === "closed", holidays);
  if (appStatus.appClosed || appStatus.forceAppOpen || isHoliday(holidays) === "closed") {
    console.log("appButtonsDisabled", appStatus.appClosed, appStatus.forceAppOpen, isHoliday(holidays) === "closed");
    return appStatus.appClosed || !appStatus.forceAppOpen || isHoliday(holidays) === "closed";
  }
  const hours = getLocalTimeHours();
  const minutes = getLocalTimeMinutes();

  const [openingHours, openingMinutes] = workingHours.openingTime.split(":").map(Number);
  const [closingHours, closingMinutes] = workingHours.closingTime.split(":").map(Number);

  console.log("holidaysY", holidays);

  // Show closed message if current time is before opening or after closing
  return closingAfterMidnight(openingHours, closingHours) ?
    (hours > closingHours && hours < openingHours || 
    hours === closingHours && minutes >= closingMinutes ||
    hours === openingHours && minutes < openingMinutes) 
    :
    hours > closingHours || 
    (hours === closingHours && minutes >= closingMinutes) || 
    hours < openingHours || 
    (hours === openingHours && minutes < openingMinutes)
};



export const appButtonsDisabled = (appStatus: any, workingHours: any, holidays?: Holidays): boolean => {
  if (appStatus.appClosed || appStatus.forceAppOpen) {
    return !(!appStatus.appClosed || appStatus.forceAppOpen);
  }
  
  const [openingHours, openingMinutes] = workingHours.openingTime.split(":").map(Number);
  const [closingHours, closingMinutes] = workingHours.closingTime.split(":").map(Number);


  if (closingAfterMidnight(openingHours, closingHours)) // buttons are never disabled if closing hours are 00:00 and after
    return false;

  else{
    const hours = getLocalTimeHours();
    const minutes = getLocalTimeMinutes();

    // Disable ordering if the current time is past the closing time
    return hours > closingHours || (hours === closingHours && minutes >= closingMinutes) || isHoliday(holidays) === "closed";
  }
};

export const onlyCustomOrders = (workingHours: any): boolean => {
  const hours = getLocalTimeHours();

  const [openingHours, openingMinutes] = workingHours.openingTime.split(":").map(Number);
  const [closingHours, closingMinutes] = workingHours.closingTime.split(":").map(Number);
  
  // Only allow custom orders before opening
  return closingAfterMidnight(openingHours, closingHours)? hours >= closingHours && hours < openingHours: hours < openingHours;
};

export const isDeliveryClosed = (workingHours: any): boolean => {
  const hours = getLocalTimeHours();
  const minutes = getLocalTimeMinutes();

  const [openingHours, openingMinutes] = workingHours.deliveryOpeningTime.split(":").map(Number);
  const [closingHours, closingMinutes] = workingHours.deliveryClosingTime.split(":").map(Number);

  console.log("isDeliveryClosed", hours, minutes, openingHours, openingMinutes, closingHours, closingMinutes);

  // Show closed message if current time is before opening or after closing
  return closingAfterMidnight(openingHours, closingHours)?
    hours > closingHours || // generalno
    hours === closingHours && minutes >= closingMinutes 
    :
    hours > closingHours || 
    (hours === closingHours && minutes >= closingMinutes) 
  };

export const closingAfterMidnight = (openingHours: number, closingHours: number, ) => {
  return closingHours < openingHours;
}

function getEasterDate(year: number): string {
  const f = Math.floor,
    G = year % 19,
    C = f(year / 100),
    H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
    I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
    J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
    L = I - J,
    month = 3 + f((L + 40) / 44),
    day = L + 28 - 31 * f(month / 4);

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${mm}-${dd}`;
}


function getEasterMonday(year: number): string {
  const [month, day] = getEasterDate(year).split('-').map(Number);

  let newDay = day + 1;
  let newMonth = month;

  const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (newDay > daysInMonth[month - 1]) {
    newDay = 1;
    newMonth += 1;
  }

  const mm = String(newMonth).padStart(2, '0');
  const dd = String(newDay).padStart(2, '0');

  return `${mm}-${dd}`;
}
