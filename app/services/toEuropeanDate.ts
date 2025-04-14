export const formatEuropeanDateTime = (date: Date)  => {
  console.log(date);

  console.log(date);

  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
};

export const formatEuropeanTime = (date: Date) => {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23', 
  }).format(date);
};
