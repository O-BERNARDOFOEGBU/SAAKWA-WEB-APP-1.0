import type { OrderStatus } from "@/features/marketplace/types";

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["RIDER_ASSIGNED", "CANCELLED"],
  RIDER_ASSIGNED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["AT_LAUNDRY"],
  AT_LAUNDRY: ["PROCESSING"],
  PROCESSING: ["READY"],
  READY: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function isValidTransition(
  fromStatus: OrderStatus,
  toStatus: OrderStatus
): boolean {
  if (fromStatus === toStatus) {
    return true;
  }

  return TRANSITIONS[fromStatus].includes(toStatus);
}

export function getNextValidStatuses(status: OrderStatus): OrderStatus[] {
  return TRANSITIONS[status];
}

export function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDING: "Pending",
    RIDER_ASSIGNED: "Rider Assigned",
    PICKED_UP: "Picked Up",
    AT_LAUNDRY: "Received at Laundry",
    PROCESSING: "Processing",
    READY: "Ready",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };

  return labels[status];
}
