export const formatEuropeanDateTime = (isoString: string) => {
  const date = new Date(isoString);
  console.log(date);

  date.setHours(date.getHours() - 1);

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
