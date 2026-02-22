import type { PriceBreakdown } from "@/features/marketplace/types";

interface PriceInput {
  serviceCost: number;
  commissionRate: number;
  deliveryFee?: number;
}

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export function calculatePriceBreakdown({
  serviceCost,
  commissionRate,
  deliveryFee = 0,
}: PriceInput): PriceBreakdown {
  const commission = roundMoney(serviceCost * (commissionRate / 100));
  const total = roundMoney(serviceCost + commission + deliveryFee);

  return {
    service_cost: roundMoney(serviceCost),
    commission,
    delivery_fee: roundMoney(deliveryFee),
    total,
  };
}
