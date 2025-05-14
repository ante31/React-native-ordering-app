import { Holidays } from "../models/generalModel";
import { isHoliday } from "./isAppClosed";

export const getLocalTime = (): Date => {
  // Get current time in Zagreb timezone
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Zagreb',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const partValues: Record<string, string> = {};

  parts.forEach(part => {
    if (part.type !== 'literal') {
      partValues[part.type] = part.value;
    }
  });

  // Construct ISO 8601 string (YYYY-MM-DDTHH:mm:ss)
  const isoString = `${partValues.year}-${partValues.month}-${partValues.day}T${partValues.hour}:${partValues.minute}:${partValues.second}`;
  
  // Convert to Date object while preserving local time
  const localDate = new Date(isoString + 'Z'); // Treat it as UTC

  return new Date(localDate.getTime()); // Adjust to local time
};


export const getLocalTimeHours = (): number => {
  const now = getLocalTime(); // Get the formatted ISO string from getLocalTime
  const timeParts = now.toISOString().split('T')[1].split(':'); // Extract time part (HH:mm:ss)
  const hours = parseInt(timeParts[0], 10); // Get the hours as a number
  return hours;
};


export const getLocalTimeMinutes = () => {
  const now = getLocalTime();
  return now.getMinutes();
};

export const getYearMonthDay = (input: Date) => {
  const date = new Date(input);
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);

  return `${year}-${month}-${day}`;
}

export const getDayOfTheWeek = (input: Date, holidays?: Holidays): string => {
  const daysOfWeek = getDaysOfTheWeek();
  const dayIndex = input.getDay(); // getDay() returns a number (0-6) where 0 is Sunday

  const holiday = isHoliday(holidays);
  console.log("isholiday", isHoliday(holidays));
  if (holiday === "shortened") return "Sunday";
  return daysOfWeek[dayIndex];
};

export const getDaysOfTheWeek = () => {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
}

export const getCroDaysOfTheWeek = () => {
  return ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"];
}