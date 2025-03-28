export const formatTime = ({ hours, minutes }: { hours?: number; minutes?: number; }) => {
  return `${hours?.toString().padStart(2, "0")}:${minutes?.toString().padStart(2, "0")}`;
};