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
  return (
    user?.role === "user" &&
    Boolean(booking.email) &&
    user.email.toLowerCase() === String(booking.email).trim().toLowerCase()
  );
}
