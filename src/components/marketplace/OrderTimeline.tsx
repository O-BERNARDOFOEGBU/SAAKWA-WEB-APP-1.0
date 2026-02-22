import { CheckCircle2, Circle } from "lucide-react";
import type {
  OrderStatus,
  OrderStatusHistory,
} from "@/features/marketplace/types";
import { getStatusLabel } from "@/utils/orderStateMachine";

const ORDER_FLOW: OrderStatus[] = [
  "PENDING",
  "RIDER_ASSIGNED",
  "PICKED_UP",
  "AT_LAUNDRY",
  "PROCESSING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

interface OrderTimelineProps {
  history: OrderStatusHistory[];
  currentStatus: OrderStatus;
}

export default function OrderTimeline({
  history,
  currentStatus,
}: OrderTimelineProps) {
  const completedStatuses = new Set(history.map((item) => item.status));

  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Timeline</h2>
      <div className="space-y-4">
        {ORDER_FLOW.map((status, index) => {
          const isComplete = completedStatuses.has(status);
          const isCurrent = status === currentStatus;

          return (
            <div key={status} className="flex items-start gap-3">
              <div className="pt-0.5">
                {isComplete || isCurrent ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className={`font-medium ${
                      isCurrent ? "text-blue-700" : "text-gray-800"
                    }`}
                  >
                    {getStatusLabel(status)}
                  </p>
                  {index === ORDER_FLOW.length - 1 &&
                  currentStatus === "DELIVERED" ? (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                      Complete
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-gray-500">State: {status}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
