
export const calculateNewPrice = (selectedExtras: any, selectedFriesExtras: any, selectedSize: any, selectedPortionIndex: any, meal: any, quantity: any, setIsUpdating: any, setPrice: any, setPriceSum: any) => {
      // We calculate the new price
        const extrasPrice = Object.values(selectedExtras).reduce((acc, value) => acc as any + value, 0);
        const friesExtrasPrice = Object.values(selectedFriesExtras).reduce((acc, value) => acc as any + value, 0);
        console.log("Extras price", extrasPrice);
        console.log("Fries extras price", friesExtrasPrice);
        setPrice(meal.portions? meal.portions[selectedPortionIndex].price + extrasPrice + friesExtrasPrice
          : meal.portionsOptions[selectedPortionIndex].price + extrasPrice + friesExtrasPrice);
        setPriceSum(quantity * (meal.portions? meal.portions[selectedPortionIndex].price + extrasPrice + friesExtrasPrice
          : meal.portionsOptions[selectedPortionIndex].price + extrasPrice + friesExtrasPrice));
  
        setIsUpdating(false);
  }