// import { useEffect } from "react";
// import { checkTimeValidity } from '../app/services/checkTimeValidity';

// export function useOrderPricing(setOrderData: any, orderPrice: number, isSlidRight: boolean, general: any, timeString: string, setTimeString: any) {

//   useEffect(() => {
//     setOrderData((prev : any) => ({
//       ...prev,
//       totalPrice: orderPrice + (!isSlidRight ? general?.deliveryPrice : 0),
//     }));

//     if (timeString !== "undefined:undefined" && timeString !== "null") {
//       checkTimeValidity({ hours: Number(timeString.split(":")[0]), minutes: Number(timeString.split(":")[1]) }, setTimeString, setDisplayMessage, setDisplayWorkTimeMessage, setShowPicker, isSlidRight, general);
//     }
//   }, [isSlidRight, orderPrice, general]);


// }