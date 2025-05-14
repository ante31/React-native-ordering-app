import { getUpdatedTime } from "./getUpdatedTime";

export const checkTimeValidity = (
  pickedDuration: { hours: number; minutes: number; },
  setTimeString: any,
  setDisplayMessage: any,
  setDisplayWorkTimeMessage: any,
  setShowPicker: any,
  isSlidRight: any,
  general: any
) =>{
  const offset = general? isSlidRight ? general.deliveryTime : general.pickUpTime: 45;
  const { hours, minutes } = getUpdatedTime(offset);

  const closingTime = isSlidRight ? general?.workingHours.deliveryClosingTime : general?.workingHours.closingTime;
  const openingTime = isSlidRight ? general?.workingHours.deliveryOpeningTime : general?.workingHours.openingTime;

  const [closingHour, closingMinutes] = (closingTime || "23:00").split(":").map(Number);
  const [openingHour, openingMinutes] = (openingTime || "09:00").split(":").map(Number);

  const formatTime = ({ hours, minutes }: { hours?: number; minutes?: number; }) => {
    console.log("Shrek", hours, minutes);
    return `${hours?.toString().padStart(2, "0")}:${minutes?.toString().padStart(2, "0")}`;
};

console.log("pickedDurationinsidecheckvalidity", pickedDuration);

  //"before offset" correction
  if (
    pickedDuration.hours < hours || 
    (pickedDuration.hours === hours && pickedDuration.minutes < minutes)
  ) {
      setTimeString(formatTime({ hours, minutes }));
      setDisplayMessage(true); // Trigger the message display
  }
  //before opening correction
  else if (
      pickedDuration.hours < openingHour ||
      (pickedDuration.hours === openingHour && pickedDuration.minutes < openingMinutes)
  ) {
      setTimeString(formatTime({ hours: openingHour, minutes: openingMinutes }));
      setDisplayWorkTimeMessage(true); // Trigger the message display
  }
  // "after closing" correction 
  else if (
      pickedDuration.hours > closingHour ||
      pickedDuration.hours === closingHour && pickedDuration.minutes > closingMinutes
  ){
    setTimeString(formatTime({ hours: closingHour, minutes: closingMinutes }));
    setDisplayWorkTimeMessage(true); // Trigger the message display
  } 
  else {
    setDisplayWorkTimeMessage(false);
      setTimeString(formatTime(pickedDuration));
  }

  setShowPicker(false);

};