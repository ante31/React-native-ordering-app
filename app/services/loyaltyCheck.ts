import { safeFetch } from "../services/safeFetch";

const LoyaltyCheck = async ({backendUrl, general, loyaltyBarPhone} : any) => {
    const AWARD_THRESHOLD = general?.awardThreshold || 500;

    try {
      console.log("Checking loyalty for phone:", loyaltyBarPhone, backendUrl);
      console.log("Using threshold:", loyaltyBarPhone, backendUrl);
      const checkResponse = await safeFetch(`${backendUrl}/loyalty/${loyaltyBarPhone}`, { 
        method: 'GET' 
      });

      let currentPoints = 0;
      if (checkResponse.ok) {
        const data = await checkResponse.json();
        currentPoints = data?.points || 0;
      }

      console.log("Current points:", currentPoints, "Threshold:", AWARD_THRESHOLD);

      // // Provjera za iskakanje modala
      // if (currentPoints >= AWARD_THRESHOLD) {
      //   setShowRewardModal(true);
      // }

      return currentPoints;

    } catch (error) {
      console.error("Loyalty check error:", error);
    }
  };

export { LoyaltyCheck };