import React from "react";

export type BadgeStatus =
  | "success"
  | "pending"
  | "failed"
  | "warning"
  | "info"
  | "neutral";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Semantic status that controls colors */
  status?: BadgeStatus;
  /** Small / medium / large */
  size?: BadgeSize;
  /** Optional leading icon (React node) */
  icon?: React.ReactNode;
  /** Text to show inside the badge */
  children: React.ReactNode;
  /** Whether to show a subtle pulse animation (useful for `pending`) */
  pulse?: boolean;
}

const sizeMap: Record<BadgeSize, string> = {
  sm: "text-xs px-2 py-0.5 rounded-full",
  md: "text-sm px-3 py-1 rounded-full",
  lg: "text-base px-4 py-1.5 rounded-full",
};

const statusStyles: Record<
  BadgeStatus,
  { base: string; ring?: string; iconBg?: string }
> = {
  success: {
    base: "bg-green-50 text-green-800",
    ring: "ring-1 ring-green-100",
    iconBg: "bg-green-100",
  },
  pending: {
    base: "bg-yellow-50 text-yellow-800",
    ring: "ring-1 ring-yellow-100",
    iconBg: "bg-yellow-100",
  },
  failed: {
    base: "bg-red-50 text-red-800",
    ring: "ring-1 ring-red-100",
    iconBg: "bg-red-100",
  },
  warning: {
    base: "bg-amber-50 text-amber-800",
    ring: "ring-1 ring-amber-100",
    iconBg: "bg-amber-100",
  },
  info: {
    base: "bg-sky-50 text-sky-800",
    ring: "ring-1 ring-sky-100",
    iconBg: "bg-sky-100",
  },
  neutral: {
    base: "bg-gray-100 text-gray-800",
    ring: "",
    iconBg: "bg-gray-200",
  },
};

export default function Badge({
  status = "neutral",
  size = "md",
  icon,
  children,
  className = "",
  pulse = false,
  ...rest
}: BadgeProps) {
  const sizeClasses = sizeMap[size];
  const styles = statusStyles[status];

  // accessible text for screen-readers when using pulse
  const pulseAria: React.AriaAttributes = pulse
    ? { "aria-live": "polite" }
    : {};

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 font-semibold ${sizeClasses} ${styles.base} ${
        styles.ring ?? ""
      } ${className}`}
      {...pulseAria}
      {...rest}
    >
      {icon ? (
        <span
          aria-hidden
          className={`flex-shrink-0 h-4 w-4 ${styles.iconBg} rounded-full inline-flex items-center justify-center`}
        >
          {icon}
        </span>
      ) : null}

      <span className="leading-none">{children}</span>

      {/* subtle pulse indicator for pending-style states */}
      {pulse ? (
        <span
          className={`ml-1 inline-block h-2 w-2 rounded-full ${
            status === "failed"
              ? "bg-red-500"
              : status === "success"
                ? "bg-green-500"
                : status === "pending"
                  ? "bg-yellow-500"
                  : "bg-gray-400"
          } animate-pulse`}
          aria-hidden
        />
      ) : null}
    </span>
  );
}
