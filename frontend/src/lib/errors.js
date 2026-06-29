// Turn an axios error into a single, human-readable message.
export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const data = err?.response?.data;

  if (err?.response?.status === 429) {
    return "You're doing that too fast. Please wait a moment and try again.";
  }
  if (!data) return err?.message || fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;

  if (typeof data === "object") {
    const first = Object.values(data)[0];
    if (Array.isArray(first)) return first[0];
    if (typeof first === "string") return first;
  }
  return fallback;
}
