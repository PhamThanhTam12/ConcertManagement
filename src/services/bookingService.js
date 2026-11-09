import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function getBaseUrl() {
  if (!API_URL) throw new Error("Chưa cấu hình VITE_API_URL trong .env.");
  return API_URL.replace(/\/$/, "");
}

export async function getBookings(eventId, signal) {
  const response = await axios.get(getBaseUrl() + "/bookings", { signal });
  if (!Array.isArray(response.data))
    throw new Error("Dữ liệu bookings phải là một mảng.");
  return response.data.filter(
    (booking) => String(booking.eventId) === String(eventId),
  );
}

export async function createBooking(data) {
  const response = await axios.post(getBaseUrl() + "/bookings", data);
  if (!response.data?.id)
    throw new Error(
      "MockAPI chưa trả mã đặt vé. Kiểm tra trường id kiểu Object ID.",
    );
  return response.data;
}

export async function cancelBooking(booking) {
  if (!booking.id) throw new Error("Đơn đặt vé chưa có mã để hủy.");
  const response = await axios.put(
    getBaseUrl() + "/bookings/" + encodeURIComponent(booking.id),
    {
      ...booking,
      status: "cancelled",
      paymentStatus: booking.paymentStatus === "paid" ? "refunded" : "void",
    },
  );
  return response.data;
}
