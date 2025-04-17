export const formatEuropeanDateTime = (isoString: string)  => {
    const [datePart, timePart] = isoString.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
  
    return `${day}.${month}.${year} ${hour}:${minute}`;
  }
  
  

export const formatEuropeanTime = (date: Date) => {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23', 
  }).format(date);
};
