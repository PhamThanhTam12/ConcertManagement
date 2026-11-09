export const EMAIL_TICKET_LIMIT = 6;

export function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export function getEmailRemaining(email, bookings) {
  const normalized = normalizeEmail(email);
  const reserved = bookings
    .filter(
      (booking) =>
        normalized &&
        normalizeEmail(booking.email) === normalized &&
        booking.status === "confirmed",
    )
    .reduce((sum, booking) => sum + (Number(booking.quantity) || 0), 0);
  return Math.max(0, EMAIL_TICKET_LIMIT - reserved);
}

export function getSold(ticketId, bookings) {
  return bookings
    .filter(
      (booking) =>
        booking.ticketTypeId === ticketId && booking.status === "confirmed",
    )
    .reduce((sum, booking) => sum + (Number(booking.quantity) || 0), 0);
}

export function getRemaining(ticket, bookings) {
  return Math.max(0, Number(ticket.capacity) - getSold(ticket.id, bookings));
}

export function isSalesOpen(concert) {
  return Boolean(concert) && Date.now() < new Date(concert.startAt).getTime();
}

export function ownsBooking(user, booking) {
  const accountEmail = normalizeEmail(booking.accountEmail);
  // Đơn cũ chưa có accountEmail hợp lệ vẫn thuộc email đã dùng trước đây.
  const ownerEmail = accountEmail.includes("@")
    ? accountEmail
    : normalizeEmail(booking.email);
  return (
    user?.role === "user" &&
    Boolean(ownerEmail) &&
    normalizeEmail(user.email) === ownerEmail
  );
}
