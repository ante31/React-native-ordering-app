import { getLocalTime, getLocalTimeHours, getLocalTimeMinutes } from "./getLocalTime";

  export const getUpdatedTime = (offset: number) => {
      const now = getLocalTime();
      const totalMinutes = getLocalTimeMinutes() + offset;
      const adjustedHours = getLocalTimeHours() + Math.floor(totalMinutes / 60); // Add extra hour if minutes surpass 60
      const adjustedMinutes = Math.round(((totalMinutes / 5) * 5) % 60); // Round minutes to the nearest 5
      console.log("Adjusted hours", adjustedHours, "Adjusted minutes", adjustedMinutes);

      return { hours: adjustedHours, minutes: adjustedMinutes };
  };