const validateForm = (orderData: any, isSlidRight: boolean, setErrors: any, minOrder: any, iscroatianLang: boolean) => {
    let valid = true;
    let newErrors = { name: '', phone: '', address: '', zone: '' };

    if (
        !orderData.name ||
        orderData.name.length < 2 ||
        orderData.name.length > 50 ||
        /[^\p{L}\s]/u.test(orderData.name)
      ) 
    {
      newErrors.name = iscroatianLang
        ? "Unesite ispravno ime (2-50 slova, bez brojeva i spec. znakova)"
        : "Enter a valid name (2-50 letters, no numbers or special characters)";
      valid = false;
    }
    
    if (!orderData.phone || !/^\+?[0-9]{7,15}$/.test(orderData.phone)) {
      newErrors.phone = iscroatianLang ? "Unesite ispravan broj telefona (7-15 znamenki)" : "Enter a valid phone number (7-15 digits)";
      valid = false;
    }

    if (isSlidRight && (!orderData.address || orderData.address.length < 5 || orderData.address.length > 100)) {
      newErrors.address = iscroatianLang ? "Adresa mora imati 5-100 znakova" : "Address must be 5-100 characters long";
      valid = false;
    }

    if (isSlidRight && !orderData.zone) {
      newErrors.zone = iscroatianLang ? "Odaberite zonu dostave" : "Choose delivery zone";
      valid = false;
    }

    if (isSlidRight && orderData.totalPrice < minOrder[orderData.zone]) {
      newErrors.zone = iscroatianLang ?
      "Minimalna cijena za " + (orderData.zone === "Kaštel Gomilica"? "Kaštel Gomilicu" : orderData.zone) + " je " + minOrder[orderData.zone].toFixed(2) + " €"
      : "Minimal order for " + orderData.zone + " is " + minOrder[orderData.zone].toFixed(2) + " €";
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  export default validateForm;