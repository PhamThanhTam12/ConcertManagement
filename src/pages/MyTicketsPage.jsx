import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Container, Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useConcert } from "../context/ConcertContext";
import ConcertState from "../components/ConcertState";
import BookingTable from "../components/BookingTable";
import CancelBookingModal from "../components/CancelBookingModal";
import { getBookings, cancelBooking } from "../services/bookingService";
import { ownsBooking, isSalesOpen } from "../utils/booking";

export default function MyTicketsPage() {
  const { user } = useAuth();
  const { concert, loading, error } = useConcert();
  const [bookings, setBookings] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    if (!concert?.id) return;
    const controller = new AbortController();
    async function load() {
      try {
        const data = await getBookings(concert.id, controller.signal);
        if (!controller.signal.aborted) {
          setBookings(data);
          setLoadError("");
        }
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error.message);
      } finally {
        if (!controller.signal.aborted) setFetching(false);
      }
    }
    load();
    return () => controller.abort();
  }, [concert?.id, retry]);

  async function handleCancel() {
    if (
      busy ||
      !selected ||
      !ownsBooking(user, selected) ||
      !isSalesOpen(concert)
    )
      return;
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

  if (loading || error || !concert) return <ConcertState />;
  const mine = bookings.filter((booking) => ownsBooking(user, booking));
  const active = mine.filter((booking) => booking.status === "confirmed");
  return (
    <Container className="page-space">
      <div className="page-heading compact">
        <span className="eyebrow">YOUR NEXT MEMORIES</span>
        <h1>Vé của tôi.</h1>
        <p>Những cuộc hẹn cùng âm nhạc của bạn.</p>
      </div>
      <div className="stats-row">
        <div>
          <span>Đơn đặt vé</span>
          <strong>{mine.length}</strong>
        </div>
        <div>
          <span>Đơn còn hiệu lực</span>
          <strong>{active.length}</strong>
        </div>
        <div>
          <span>Vé còn hiệu lực</span>
          <strong>
            {active.reduce((sum, item) => sum + Number(item.quantity), 0)}
          </strong>
        </div>
      </div>
      {fetching ? (
        <div role="status">
          <Spinner size="sm" /> Đang tải vé...
        </div>
      ) : loadError ? (
        <Alert variant="danger">
          <p>{loadError}</p>
          <Button
            onClick={() => {
              setFetching(true);
              setRetry((current) => current + 1);
            }}
          >
            Thử lại
          </Button>
        </Alert>
      ) : mine.length === 0 ? (
        <div className="empty-panel">
          <span aria-hidden="true">→</span>
          <h2 className="h4">Bạn chưa có đơn đặt vé nào.</h2>
          <p className="text-body-secondary">
            Một đêm nhạc đáng nhớ đang chờ bạn.
          </p>
          <Button as={Link} to="/tickets">
            Khám phá hạng vé
          </Button>
        </div>
      ) : (
        <BookingTable
          bookings={mine}
          onCancel={(booking) => {
            setSelected(booking);
            setCancelError("");
          }}
          canCancel={(booking) =>
            ownsBooking(user, booking) && isSalesOpen(concert)
          }
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
    </Container>
  );
}
