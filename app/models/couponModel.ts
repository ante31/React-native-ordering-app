export type Coupon = {
  id: string;
  value: number;         
  isUsed: boolean;
  createdAt: Date;
  usedAt: Date | null;
}