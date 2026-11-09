import { Badge, Button, Table } from "react-bootstrap";
import { bookingCode, formatMoney } from "../utils/formatters";
import { normalizeEmail } from "../utils/booking";

const paymentLabels = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán (mô phỏng)",
  refunded: "Đã hoàn (mô phỏng)",
  void: "Đã ngừng thanh toán",
};

export default function BookingTable({ bookings, onCancel, canCancel }) {
  return (
    <div className="table-panel">
      <Table responsive hover className="align-middle mb-0">
        <caption className="visually-hidden">Danh sách đơn đặt vé</caption>
        <thead>
          <tr>
            <th>Mã đặt vé</th>
            <th>Người đặt</th>
            <th>Hạng vé</th>
            <th>Số lượng</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <tr key={booking.id || "missing-" + index}>
              <td className="fw-semibold text-accent">
                {booking.id ? bookingCode(booking.id) : "Thiếu mã"}
              </td>
              <td>
                <strong>{booking.fullName}</strong>
                <span className="table-detail">{booking.email}</span>
                {normalizeEmail(booking.accountEmail).includes("@") &&
                  normalizeEmail(booking.accountEmail) !==
                    normalizeEmail(booking.email) && (
                    <span className="table-detail">
                      Tài khoản đặt: {booking.accountEmail}
                    </span>
                  )}
              </td>
              <td>{booking.ticketName}</td>
              <td>{booking.quantity}</td>
              <td className="text-nowrap">{formatMoney(booking.totalPrice)}</td>
              <td>
                <Badge
                  bg={booking.status === "confirmed" ? "success" : "secondary"}
                >
                  {booking.status === "confirmed"
                    ? "Đã xác nhận"
                    : booking.status === "cancelled"
                      ? "Đã hủy"
                      : "Chưa xác định"}
                </Badge>
                <span className="table-detail">
                  {paymentLabels[booking.paymentStatus] || "Chưa cập nhật"}
                </span>
              </td>
              <td>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="text-nowrap"
                  disabled={
                    !booking.id ||
                    booking.status !== "confirmed" ||
                    !canCancel(booking)
                  }
                  onClick={() => onCancel(booking)}
                >
                  Hủy đặt vé
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
