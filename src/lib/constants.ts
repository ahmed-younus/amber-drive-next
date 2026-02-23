export const CAR_CATEGORIES = [
  "Cabrio",
  "Coupe",
  "SUV",
  "Sedan",
  "Van",
] as const;

export const CAR_STATUSES = ["active", "inactive", "archived"] as const;

export const QUOTE_STATUSES = ["draft", "sent", "confirmed", "cancelled"] as const;

export const QUOTE_STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  sent: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@amberdrive.fr";
export const SITE_URL = process.env.SITE_URL || "https://amberdrive.aytips.com";
