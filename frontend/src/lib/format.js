// Full set creators can choose from when creating a session.
export const CATEGORIES = [
  { value: "workshop", label: "Workshop" },
  { value: "mentoring", label: "Mentoring" },
  { value: "fitness", label: "Fitness" },
  { value: "photography", label: "Photography" },
  { value: "cooking", label: "Cooking" },
  { value: "consultation", label: "Consultation" },
  { value: "programming", label: "Programming" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finance" },
  { value: "career", label: "Career" },
  { value: "language_learning", label: "Language Learning" },
  { value: "music", label: "Music" },
  { value: "art_crafts", label: "Art & Crafts" },
  { value: "health_wellness", label: "Health & Wellness" },
  { value: "gaming", label: "Gaming" },
  { value: "other", label: "Other" },
];

// Categories shown as filter chips on the catalog. Anything not listed here
// (the newer categories) is reachable via the "Other" chip.
export const FILTER_CATEGORIES = [
  { value: "workshop", label: "Workshop" },
  { value: "mentoring", label: "Mentoring" },
  { value: "fitness", label: "Fitness" },
  { value: "photography", label: "Photography" },
  { value: "cooking", label: "Cooking" },
  { value: "consultation", label: "Consultation" },
  { value: "other", label: "Other" },
];

// Badge color per booking status, shared across the dashboards.
export const BOOKING_STATUS_COLOR = {
  confirmed: "green",
  pending: "yellow",
  cancelled: "red",
};

const CURRENCY_SYMBOLS = { INR: "₹", USD: "$" };

export function formatPrice(price, currency = "INR") {
  const value = Number(price);
  if (!value) return "Free";
  const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;
  return `${symbol}${value.toLocaleString("en-IN")}`;
}

export function formatDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function categoryLabel(value) {
  return CATEGORIES.find((c) => c.value === value)?.label || value;
}

export const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const AGE_RESTRICTIONS = [
  { value: "all_ages", label: "All ages" },
  { value: "13+", label: "13+" },
  { value: "16+", label: "16+" },
  { value: "18+", label: "18+" },
  { value: "21+", label: "21+" },
];

export const LANGUAGES = ["English", "Hindi", "Spanish", "French", "German", "Other"];

export const CANCELLATION_POLICIES = [
  {
    value: "flexible",
    label: "Flexible",
    summary: "Free cancellation up to 24 hours before the session starts.",
  },
  {
    value: "moderate",
    label: "Moderate",
    summary: "Free cancellation up to 5 days before the session starts.",
  },
  {
    value: "strict",
    label: "Strict",
    summary: "Free cancellation only within 48 hours of booking; non-refundable after.",
  },
];

const labelFrom = (list, value) => list.find((x) => x.value === value)?.label || value;

export const skillLevelLabel = (v) => labelFrom(SKILL_LEVELS, v);
export const ageRestrictionLabel = (v) => labelFrom(AGE_RESTRICTIONS, v);
export const cancellationPolicy = (v) =>
  CANCELLATION_POLICIES.find((x) => x.value === v) || CANCELLATION_POLICIES[0];
