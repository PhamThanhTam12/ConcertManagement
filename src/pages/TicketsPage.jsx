import { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { useConcert } from "../context/ConcertContext";
import ConcertState from "../components/ConcertState";
import TicketCard from "../components/TicketCard";
import { getBookings } from "../services/bookingService";
import { getRemaining, isSalesOpen } from "../utils/booking";
import { formatDate } from "../utils/formatters";

export default function TicketsPage() {
  const { concert, loading, error } = useConcert();
  const [bookings, setBookings] = useState([]);
  const [ticketLoading, setTicketLoading] = useState(true);
  const [ticketError, setTicketError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!concert?.id) return;
    const controller = new AbortController();
    async function load() {
      try {
        const data = await getBookings(concert.id, controller.signal);
        if (!controller.signal.aborted) {
          setBookings(data);
          setTicketError("");
        }
      } catch (error) {
        if (!controller.signal.aborted) setTicketError(error.message);
      } finally {
        if (!controller.signal.aborted) setTicketLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [concert?.id, retry]);

  if (loading || error || !concert) return <ConcertState />;
  return (
    <Container className="page-space">
      <div className="page-heading">
        <span className="eyebrow">YOUR TICKET TO THE NIGHT</span>
        <h1>
          Chọn vị trí.
          <br />
          <span className="text-accent">Giữ cảm xúc.</span>
        </h1>
        <p>
          {concert.title} · {formatDate(concert.startAt)}
        </p>
      </div>
      {!isSalesOpen(concert) && (
        <Alert variant="info">Chương trình đã đóng mở bán.</Alert>
      )}
      {ticketLoading ? (
        <div role="status" className="py-5">
          <Spinner size="sm" /> Đang kiểm tra số lượng vé...
        </div>
      ) : ticketError ? (
        <Alert variant="danger">
          <p>Chưa kiểm tra được số lượng vé: {ticketError}</p>
          <Button
            variant="outline-danger"
            onClick={() => {
              setTicketLoading(true);
              setRetry((current) => current + 1);
            }}
          >
            Thử lại
          </Button>
        </Alert>
      ) : (
        <Row className="g-4">
          {concert.ticketTypes.map((ticket) => (
            <Col lg={4} key={ticket.id}>
              <TicketCard
                ticket={ticket}
                remaining={getRemaining(ticket, bookings)}
                open={isSalesOpen(concert)}
              />
            </Col>
          ))}
        </Row>
      )}
      <div className="purchase-notes">
        <span>01 · Chọn hạng vé</span>
        <span>02 · Điền thông tin</span>
        <span>03 · Nhận mã đặt vé</span>
      </div>
    </Container>
  );
}
