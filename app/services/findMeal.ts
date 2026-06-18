export const findMeal = (priceList: any, productId: string) => {
  for (const category of Object.values(priceList) as any[]) {
    if (category[productId]) {
      return category[productId];
    }
  }
  return null;
};