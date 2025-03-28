export const getLocalTime = () => {
  const falseTime = new Date(new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Zagreb' }));
  let now = new Date(falseTime);
  now.setHours(now.getHours() + 1);
  // now = setTime("3", "50");
  return now;
};

export const getLocalTimeHours = () => {
  const now = getLocalTime();
  now.setHours(now.getHours() - 1);
  return now.getHours();
};

export const getLocalTimeMinutes = () => {
  const now = getLocalTime();
  return now.getMinutes();
};

export const setTime = (hours: string, minutes: string) => {
  const now = new Date();
  now.setHours(parseInt(hours, 10)+1);
  now.setMinutes(parseInt(minutes, 10));
  now.setSeconds(0);
  return now;
};

export const getYearMonthDay = (input: Date) => {
  const date = new Date(input);
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);

  return `${year}-${month}-${day}`;
}

export const getDayOfTheWeek = (input: Date): string => {
  const daysOfWeek = getDaysOfTheWeek();
  const dayIndex = input.getDay(); // getDay() returns a number (0-6) where 0 is Sunday
  console.log("Day of the week", daysOfWeek[dayIndex]);
  return daysOfWeek[dayIndex];
};

export const getDaysOfTheWeek = () => {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
}

export const getCroDaysOfTheWeek = () => {
  return ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"];
}