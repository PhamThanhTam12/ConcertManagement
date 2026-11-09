import { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { getBookings, cancelBooking } from "../services/bookingService";
import BookingTable from "./BookingTable";
import CancelBookingModal from "./CancelBookingModal";
import { bookingCode, formatMoney } from "../utils/formatters";

export default function AdminBookings({ concert }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const data = await getBookings(concert.id, controller.signal);
        if (!controller.signal.aborted) {
          setBookings(data);
          setError("");
        }
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [concert.id, retry]);

  async function handleCancel() {
    if (busy || !selected || user.role !== "admin") return;
    setBusy(true);
    setCancelError("");
    try {
      const saved = await cancelBooking(selected);
      setBookings((current) =>
        current.map((item) => (item.id === saved.id ? saved : item)),
      );
      setSelected(null);
    } catch {
      setCancelError("Chưa hủy được đơn. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <div role="status">
        <Spinner size="sm" /> Đang tải đơn đặt vé...
      </div>
    );
  if (error)
    return (
      <Alert variant="danger">
        <p>{error}</p>
        <Button
          onClick={() => {
            setLoading(true);
            setRetry((current) => current + 1);
          }}
        >
          Thử lại
        </Button>
      </Alert>
    );
  const active = bookings.filter((item) => item.status === "confirmed");
  const visible = bookings.filter(
    (item) =>
      (status === "all" || item.status === status) &&
      (bookingCode(item.id) + " " + item.email + " " + item.fullName)
        .toLowerCase()
        .includes(keyword.trim().toLowerCase()),
  );
  return (
    <>
      <div className="stats-row">
        <div>
          <span>Tổng đơn</span>
          <strong>{bookings.length}</strong>
        </div>
        <div>
          <span>Vé còn hiệu lực</span>
          <strong>
            {active.reduce((sum, item) => sum + Number(item.quantity), 0)}
          </strong>
        </div>
        <div>
          <span>Giá trị đơn còn hiệu lực</span>
          <strong className="money-stat">
            {formatMoney(
              active.reduce((sum, item) => sum + Number(item.totalPrice), 0),
            )}
          </strong>
        </div>
      </div>
      <Row className="g-3 mb-4">
        <Col md={8}>
          <Form.Group controlId="booking-search">
            <Form.Label>Tìm đơn đặt vé</Form.Label>
            <Form.Control
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Nhập mã đơn, email hoặc họ tên..."
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="booking-status">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="cancelled">Đã hủy</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      {visible.length === 0 ? (
        <Alert variant="info">Chưa có đơn đặt vé phù hợp.</Alert>
      ) : (
        <BookingTable
          bookings={visible}
          canCancel={() => user.role === "admin"}
          onCancel={(booking) => {
            setSelected(booking);
            setCancelError("");
          }}
        />
      )}
      <CancelBookingModal
        booking={selected}
        busy={busy}
        error={cancelError}
        onClose={() => {
          if (!busy) setSelected(null);
        }}
        onConfirm={handleCancel}
      />
    </>
  );
}
