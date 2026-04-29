export const Session = {
  cookieName: "white_day_token",
  maxAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required. Please log in.",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
} as const;
