import { Alert, Button, Modal } from "react-bootstrap";
import { bookingCode } from "../utils/formatters";

export default function CancelBookingModal({
  booking,
  busy,
  error,
  onClose,
  onConfirm,
}) {
  if (!booking) return null;
  return (
    <Modal
      show
      centered
      backdrop="static"
      keyboard={!busy}
      onHide={onClose}
      aria-labelledby="cancel-title"
    >
      <Modal.Header closeButton={!busy} closeLabel="Đóng">
        <Modal.Title id="cancel-title">Hủy đơn đặt vé?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p>
          Bạn muốn hủy đơn <strong>{bookingCode(booking.id)}</strong> với{" "}
          {booking.quantity} vé <strong>{booking.ticketName}</strong>?
        </p>
        <p className="small text-body-secondary mb-0">
          Đơn sẽ được giữ trong lịch sử với trạng thái Đã hủy.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-light" disabled={busy} onClick={onClose}>
          Giữ lại vé
        </Button>
        <Button variant="danger" disabled={busy} onClick={onConfirm}>
          {busy ? "Đang hủy..." : "Xác nhận hủy"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
