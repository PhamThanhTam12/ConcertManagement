import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const concertSlug = "midnight-live-2026";

function getBaseUrl() {
  if (!API_URL) throw new Error("Chưa cấu hình VITE_API_URL trong .env.");
  return API_URL.replace(/\/$/, "");
}

function checkConcert(data) {
  if (!data?.id)
    throw new Error("MockAPI chưa trả ID. Giữ trường id kiểu Object ID.");
  if (![data.artists, data.schedule, data.ticketTypes].every(Array.isArray)) {
    throw new Error(
      "Kiểm tra artists, schedule và ticketTypes trên MockAPI: cả ba phải là Array.",
    );
  }
  if (
    data.ticketTypes.some(
      (ticket) => !ticket?.id || !Array.isArray(ticket.benefits),
    )
  ) {
    throw new Error(
      "Mỗi hạng vé cần id và benefits là mảng. Dùng dữ liệu mẫu trong mockapi/concert.json.",
    );
  }
  if (
    data.schedule.some(
      (slot) =>
        !slot?.id ||
        typeof slot.startTime !== "string" ||
        typeof slot.endTime !== "string",
    )
  ) {
    throw new Error(
      "Mỗi tiết mục cần id, startTime và endTime. Kiểm tra dữ liệu lịch trình.",
    );
  }
  return data;
}

export async function getConcert(signal) {
  const response = await axios.get(getBaseUrl() + "/events", { signal });
  if (!Array.isArray(response.data))
    throw new Error("Dữ liệu events phải là một mảng.");
  const concert = response.data.find((item) => item.slug === concertSlug);
  return concert ? checkConcert(concert) : null;
}

export async function createConcert(data) {
  const response = await axios.post(getBaseUrl() + "/events", data);
  return checkConcert(response.data);
}

export async function updateConcert(concert) {
  const { id, ...data } = concert;
  if (!id) throw new Error("Chương trình chưa có ID để cập nhật.");
  data.capacity = data.ticketTypes.reduce(
    (sum, ticket) => sum + Number(ticket.capacity),
    0,
  );
  data.price = data.ticketTypes.length
    ? Math.min(...data.ticketTypes.map((ticket) => Number(ticket.price)))
    : 0;
  const response = await axios.put(
    getBaseUrl() + "/events/" + encodeURIComponent(id),
    data,
  );
  return checkConcert(response.data);
}

export async function deleteConcert(id) {
  if (!id) throw new Error("Chương trình chưa có ID để xóa.");
  await axios.delete(getBaseUrl() + "/events/" + encodeURIComponent(id));
}
