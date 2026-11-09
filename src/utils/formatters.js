export function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value) || 0);
}

export function formatDate(value, full = true) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: full ? "long" : "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

export function toDateInput(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const result = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return (
    result.year +
    "-" +
    result.month +
    "-" +
    result.day +
    "T" +
    result.hour +
    ":" +
    result.minute
  );
}

export function fromDateInput(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value || "")) return "";
  const date = new Date(value + ":00+07:00");
  if (Number.isNaN(date.getTime())) return "";
  const iso = date.toISOString();
  return toDateInput(iso) === value ? iso : "";
}

export function bookingCode(id) {
  return "ML-" + String(id).padStart(5, "0");
}

export function getLoginDestination(from, user) {
  const fallback = user.role === "admin" ? "/admin" : "/tickets";
  if (
    typeof from !== "string" ||
    !from.startsWith("/") ||
    from.startsWith("//") ||
    from.includes("\\")
  )
    return fallback;
  if (Array.from(from).some((character) => character.charCodeAt(0) < 32))
    return fallback;
  const path = from.split(/[?#]/)[0].replace(/\/+$/, "").toLowerCase();
  if (path === "/login" || (path.startsWith("/admin") && user.role !== "admin"))
    return fallback;
  if (path.startsWith("/checkout") && user.role !== "user") return fallback;
  return from;
}
