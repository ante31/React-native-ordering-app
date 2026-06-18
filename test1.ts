export const pokreniNarudzbu = async (uuidZaNarudzbu?: string): Promise<void> => {
  // Generiraj ključ samo prvi put, a kod retryja proslijedi isti!
  const trenutniKljuc = uuidZaNarudzbu || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`Generirani ključ za narudžbu: ${trenutniKljuc}`);

  try {
    const res = await fetch("https://servertest-production-dc6f.up.railway.app/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
      idempotencyKey: trenutniKljuc, 
      address: "biskupa Pavla Žanića 26",
      cartItems: [
        {
          description: "Umak od rajčice, šunka, sir, gljive|Pizza sauce, ham, cheese, mushrooms",
          extras: "listaJumboPizza",
          hasFries: null,
          id: "ID40_Fetasir_Gljiveextra_Kapula",
          name: "Pizza Miješana|Pizza Mixed",
          portionsOptions: [],
          price: 16,
          quantity: 1,
          selectedDrinks: [],
          selectedExtras: {},
          selectedFriesExtras: {},
          size: "Jumbo",
          type: null
        }
      ],
      coupon: null,
      deadline: "2026-06-07T02:37:17.000Z",
      isDelivery: false,
      language: "hr",
      name: "Ante test",
      note: "",
      phone: "0958138612",
      status: "pending",
      time: "2026-06-14T02:19:45.000Z",
      timeOption: "standard",
      token: "ExponentPushToken[dGTh_HHfj8MSvv-AQZJnxV]",
      totalPrice: 16,
      zone: ""
    }),
    });

    const data = await res.json();
    console.log("KONAČNI USPJEH U EXPU:", data);
  } catch (err: any) {
    
    console.error("KONAČNA EXPO FETCH GREŠKA:", err);
  }
};

export const testirajFetch = async () => {
  try {
    console.log("Pokrećem test...");
    const res = await fetch("https://servertest-production-dc6f.up.railway.app/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        address: "Test adresa",
        cartItems: [],
        name: "Expo Test",
        phone: "123456",
        status: "pending",
        totalPrice: 0
      }),
    });
    
    const tekst = await res.text();
    console.log("ODGOVOR SERVERA:", tekst);
  } catch (error) {
    console.error("EXPO HVATA GREŠKU:", error);
  }
};