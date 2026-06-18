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

  // (YYYY-MM-DDTHH:mm:ss)
  const isoString = `${partValues.year}-${partValues.month}-${partValues.day}T${partValues.hour}:${partValues.minute}:${partValues.second}`;

  const localDate = new Date(isoString + 'Z'); 

  return new Date(localDate.getTime());
};

export const getLocalTimeString = (): string => {
  const date = getLocalTime();

  const pad = (num: number) => num.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // Mjeseci su 0-11
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  // Vraća format: 2026-03-29T09:28:15
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const getLocalTimeHours = (): number => {
  const now = getLocalTime(); 
  const timeParts = now.toISOString().split('T')[1].split(':'); 
  const hours = parseInt(timeParts[0], 10); 
  return hours;
};

export function setTimeInISOString(isoString: any, hours: any, minutes: any) {
  console.log("YOmo", isoString, hours, minutes)
  // Dodaj višak minuta u sate
  hours = (hours + Math.floor(minutes / 60)) % 24;
  minutes = minutes % 60;

    console.log("YOHO")

  // Formatiraj sate i minute s vodećim nulama
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');

    console.log("YOHOHO")



  // Zamijeni samo HH:MM dio u ISO stringu
  // Pronađi indeks početka T i napravi novi string ručno
  const datePart = isoString.substring(0, 11); // "2025-06-08T"
  const rest = isoString.substring(19); // ".000Z" ili ostatak

      console.log("YOHOHOWOWO")


  return `${datePart}${hh}:${mm}:00${rest}`;}



export const getLocalTimeMinutes = () => {
  const now = getLocalTime();
  return now.getMinutes();
};

export const getYearMonthDay = (input: string) => {
  return input.split("T")[0];
};

export const getDayOfTheWeek = (input: Date, holidays?: Holidays): string => {
  const daysOfWeek = getDaysOfTheWeek();
  console.log("getDayOfTheWeek2", daysOfWeek);
  const dayIndex = input.getUTCDay(); // number (0-6) where 0 is Sunday
  console.log("getDayOfTheWeek3", dayIndex);

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