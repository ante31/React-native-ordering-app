import { backendUrl } from "@/localhostConf";

export async function createCoupon(phoneNumber: string, amount: number = 10) {
  try {
    const response = await fetch(`${backendUrl}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
        amount,
        isUsed: false,
        createdAt: new Date().toISOString(),
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("Greška pri kreiranju kupona:", error);
    return null;
  }
}