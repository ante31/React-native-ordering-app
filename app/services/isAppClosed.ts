import { getLocalTimeHours, getLocalTimeMinutes } from "./getLocalTime";

export const isClosedMessageDisplayed = (workingHours: any): boolean => {
  console.log("workingHoursMK", workingHours);
  const hours = getLocalTimeHours();
  const minutes = getLocalTimeMinutes();

  console.log("hhours", hours);
  console.log("mminutes", minutes);

  const [openingHours, openingMinutes] = workingHours.openingTime.split(":").map(Number);
  const [closingHours, closingMinutes] = workingHours.closingTime.split(":").map(Number);

  console.log("openingHours", openingHours);
  console.log("openingMinutes", openingMinutes);
  console.log("closingHours", closingHours);
  console.log("closingMinutes", closingMinutes);

  // Show closed message if current time is before opening or after closing
  return closingAfterMidnight(openingHours, closingHours) ?
    (hours > closingHours && hours < openingHours || 
    hours === closingHours && minutes >= closingMinutes ||
    hours === openingHours && minutes < openingMinutes) :
    hours > closingHours || 
    (hours === closingHours && minutes >= closingMinutes) || 
    hours < openingHours || 
    (hours === openingHours && minutes < openingMinutes);
};



export const appButtonsDisabled = (workingHours: any): boolean => {
  const [openingHours, openingMinutes] = workingHours.openingTime.split(":").map(Number);
  const [closingHours, closingMinutes] = workingHours.closingTime.split(":").map(Number);

  if (closingAfterMidnight(openingHours, closingHours)) // buttons are never disabled if closing hours are 00:00 and after
    return false;

  else{
    const hours = getLocalTimeHours();
    const minutes = getLocalTimeMinutes();

    // Disable ordering if the current time is past the closing time
    return hours > closingHours || (hours === closingHours && minutes >= closingMinutes);
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

  // Show closed message if current time is before opening or after closing
  return closingAfterMidnight(openingHours, closingHours)?
    hours > closingHours && hours < openingHours || // generalno
    hours === closingHours && minutes >= closingMinutes ||
    hours === openingHours && minutes < openingMinutes
    :
    hours > closingHours || 
    (hours === closingHours && minutes >= closingMinutes) || 
    hours < openingHours || 
    (hours === openingHours && minutes < openingMinutes);
  };

const closingAfterMidnight = (openingHours: number, closingHours: number, ) => {
  return closingHours < openingHours;
}