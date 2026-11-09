import { useState } from "react";
import { Link } from "react-router-dom";
import { Accordion, Button, Col, Container, Row } from "react-bootstrap";
import { useConcert } from "../context/ConcertContext";
import { useAuth } from "../context/AuthContext";
import ConcertState from "../components/ConcertState";
import ConcertImage from "../components/ConcertImage";
import Countdown from "../components/Countdown";
import TicketCard from "../components/TicketCard";
import { formatDate, toDateInput } from "../utils/formatters";
import { isSalesOpen } from "../utils/booking";

export default function HomePage() {
  const { concert, loading, error } = useConcert();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [scheduleFilter, setScheduleFilter] = useState("all");
  if (loading || error || !concert) return <ConcertState />;

  const year = toDateInput(concert.startAt).slice(0, 4);
  const titleWords = concert.title.split(" ");
  const schedule = [...concert.schedule]
    .sort((first, second) => first.startTime.localeCompare(second.startTime))
    .filter(
      (item) =>
        scheduleFilter === "all" ||
        (scheduleFilter === "highlight"
          ? item.type === "highlight"
          : item.type === "performance"),
    );

  return (
    <>
      <section className="hero">
        <ConcertImage
          src={concert.image}
          alt="Không khí khán giả tại đêm nhạc"
          className="hero-photo"
        />
        <div className="hero-shade" />
        <Container className="hero-content">
          <div className="hero-kicker">
            <span className="live-dot" />
            THE CITY. THE MUSIC. THE NIGHT.
          </div>
          <h1>
            {titleWords[0]}
            <span>
              {titleWords.slice(1).join(" ") || "LIVE"}
              <sup>’{year.slice(-2)}</sup>
            </span>
          </h1>
          <p className="hero-subtitle">{concert.subtitle}</p>
          <p className="hero-copy">
            Một sân khấu. Những nghệ sĩ bạn yêu.
            <br />
            Một đêm để cùng nhau sống hết mình.
          </p>
          <div className="d-flex flex-wrap gap-3 mt-4">
            <Button as={Link} to={isAdmin ? "/admin" : "/tickets"} size="lg">
              {isAdmin ? "Quản lý concert" : "Giữ chỗ cho bạn"}{" "}
              <span aria-hidden="true">→</span>
            </Button>
            <Button
              as={Link}
              to="/#lich-trinh"
              variant="outline-light"
              size="lg"
            >
              Khám phá đêm nhạc
            </Button>
          </div>
          <div className="hero-date">
            <span>{formatDate(concert.startAt)}</span>
            <span className="hero-date-dot" />
            <span>{concert.location}</span>
          </div>
          <div className="hero-edition" aria-hidden="true">
            LIVE
            <br />
            <span>TOGETHER</span>
          </div>
        </Container>
      </section>

      <section className="countdown-strip">
        <Container>
          <div className="countdown-layout">
            <div>
              <span className="eyebrow">ĐẾM TỪNG KHOẢNH KHẮC</span>
              <h2>
                Đêm của chúng ta
                <br />
                đang đến gần.
              </h2>
            </div>
            <Countdown
              key={concert.startAt + concert.endAt}
              startAt={concert.startAt}
              endAt={concert.endAt}
            />
          </div>
        </Container>
      </section>

      <section className="section-space" id="nghe-si">
        <Container>
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE LINEUP / {year}</span>
              <h2>
                Những thanh âm
                <br />
                <span className="text-accent">làm nên đêm diễn.</span>
              </h2>
            </div>
            <p>
              Từ giai điệu nhẹ nhàng đến những nhịp beat bùng nổ.
              <br />
              Cùng gặp những gương mặt sẽ thắp sáng sân khấu.
            </p>
          </div>
          <Row className="g-4">
            {concert.artists.map((artist, index) => (
              <Col xs={12} sm={6} lg={3} key={artist.id}>
                <article className="artist-card">
                  <div className="artist-photo">
                    <ConcertImage src={artist.image} alt={artist.name} />
                    <span className="artist-number">0{index + 1}</span>
                    <span className="artist-arrow" aria-hidden="true">
                      →
                    </span>
                  </div>
                  <span className="artist-genre">{artist.genre}</span>
                  <h3>{artist.name}</h3>
                  <p>{artist.description}</p>
                </article>
              </Col>
            ))}
          </Row>
          {concert.artists.length === 0 && (
            <p className="text-body-secondary">
              Danh sách nghệ sĩ sẽ sớm được công bố.
            </p>
          )}
        </Container>
      </section>

      <section className="schedule-section section-space" id="lich-trinh">
        <Container>
          <Row className="g-5">
            <Col lg={4}>
              <span className="eyebrow">THE RUNNING ORDER</span>
              <h2 className="section-title">
                Từng phút giây.
                <br />
                <span className="text-accent">Một kỷ niệm.</span>
              </h2>
              <p className="text-body-secondary">
                Lên lịch cho một đêm đáng nhớ. Đến sớm, gặp bạn bè và sẵn sàng
                cho những sân khấu đặc biệt.
              </p>
              <div className="schedule-date">
                <span className="schedule-star" aria-hidden="true">
                  ✦
                </span>
                <div>
                  <strong>{formatDate(concert.startAt)}</strong>
                  <span>Mở cửa trước giờ diễn 60 phút</span>
                </div>
              </div>
              <p className="small text-body-secondary mt-3">
                Lịch trình có thể được ban tổ chức điều chỉnh.
              </p>
            </Col>
            <Col lg={8}>
              <div
                className="schedule-filters"
                role="group"
                aria-label="Lọc lịch trình"
              >
                {[
                  { value: "all", label: "Tất cả" },
                  { value: "performance", label: "Biểu diễn" },
                  { value: "highlight", label: "Đặc biệt" },
                ].map((item) => (
                  <Button
                    key={item.value}
                    variant={
                      scheduleFilter === item.value
                        ? "primary"
                        : "outline-light"
                    }
                    size="sm"
                    onClick={() => setScheduleFilter(item.value)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
              <div className="timeline">
                {schedule.map((slot) => (
                  <article
                    key={slot.id}
                    className={
                      "timeline-row " +
                      (slot.type === "highlight" ? "timeline-highlight" : "")
                    }
                  >
                    <div className="timeline-time">
                      <time>{slot.startTime}</time>
                      <span>{slot.endTime}</span>
                    </div>
                    <div className="timeline-marker" aria-hidden="true">
                      ✦
                    </div>
                    <div className="timeline-content">
                      <span>
                        {slot.type === "highlight"
                          ? "SPECIAL PERFORMANCE"
                          : slot.type === "activity"
                            ? "WELCOME"
                            : "LIVE PERFORMANCE"}
                      </span>
                      <h3>{slot.performer}</h3>
                      <p>{slot.title}</p>
                    </div>
                  </article>
                ))}
                {schedule.length === 0 && (
                  <p className="text-body-secondary">
                    Chưa có tiết mục trong nhóm này.
                  </p>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section-space" id="hang-ve">
        <Container>
          <div className="section-heading">
            <div>
              <span className="eyebrow">FIND YOUR SPOT</span>
              <h2>
                Một tấm vé.
                <br />
                <span className="text-accent">Vạn cảm xúc.</span>
              </h2>
            </div>
            <p>
              Chọn không gian trải nghiệm phù hợp với bạn.
              <br />
              Mỗi hạng vé là một cách tận hưởng đêm nhạc.
            </p>
          </div>
          <Row className="g-4">
            {concert.ticketTypes.map((ticket) => (
              <Col lg={4} key={ticket.id}>
                <TicketCard ticket={ticket} open={isSalesOpen(concert)} />
              </Col>
            ))}
          </Row>
          <p className="small text-body-secondary text-center mt-4">
            Giá vé tính theo VNĐ. Tối đa 6 vé trong mỗi lần đặt.
          </p>
        </Container>
      </section>

      <section className="venue-section" id="dia-diem">
        <Container>
          <Row className="g-5 align-items-center">
            <Col lg={6}>
              <div className="venue-photo">
                <ConcertImage
                  src="/images/concert-crowd.jpg"
                  alt="Ánh đèn và không khí của một đêm nhạc"
                />
                <span className="venue-sticker">
                  SEE YOU
                  <br />
                  IN THE CROWD →
                </span>
              </div>
            </Col>
            <Col lg={6}>
              <span className="eyebrow">WHERE WE MEET</span>
              <h2 className="section-title">
                Thành phố lên đèn.
                <br />
                Chúng ta <span className="text-accent">lên nhạc.</span>
              </h2>
              <p className="text-body-secondary">{concert.description}</p>
              <div className="venue-info">
                <span>ĐỊA ĐIỂM</span>
                <strong>{concert.location}</strong>
                <span>THỜI GIAN</span>
                <strong>{formatDate(concert.startAt)}</strong>
              </div>
              <Button
                as={Link}
                to={isAdmin ? "/admin#bookings" : "/tickets"}
                className="mt-4"
              >
                {isAdmin
                  ? "Kiểm tra đơn vé của khách →"
                  : "Hẹn bạn tại concert →"}
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section-space">
        <Container>
          <Row className="g-5">
            <Col lg={4}>
              <span className="eyebrow">A LITTLE HELP</span>
              <h2 className="section-title">
                Bạn muốn
                <br />
                biết thêm?
              </h2>
              <p className="text-body-secondary">
                Một vài thông tin trước khi cùng nhau tạo nên đêm nhạc.
              </p>
            </Col>
            <Col lg={8}>
              <Accordion flush>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>
                    Tôi có thể mua tối đa bao nhiêu vé?
                  </Accordion.Header>
                  <Accordion.Body>
                    Mỗi đơn được đặt tối đa 6 vé, tùy số lượng còn lại của hạng
                    vé. Bạn có thể xem các đơn đã đặt trong mục Vé của tôi.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>Tôi nhận mã đặt vé ở đâu?</Accordion.Header>
                  <Accordion.Body>
                    Sau khi xác nhận, mã đặt vé xuất hiện trên màn hình và được
                    lưu trong Vé của tôi. Thông tin email lấy từ tài khoản đang
                    đăng nhập.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header>
                    Tôi có thể hủy đơn đặt vé không?
                  </Accordion.Header>
                  <Accordion.Body>
                    Bạn có thể hủy đơn còn hiệu lực trước khi concert bắt đầu.
                    Mở Vé của tôi và chọn Hủy đặt vé. Bản ghi được giữ lại với
                    trạng thái Đã hủy.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3">
                  <Accordion.Header>Khi nào tôi nên có mặt?</Accordion.Header>
                  <Accordion.Body>
                    Khu vực check-in mở trước giờ diễn 60 phút. Hãy mang theo
                    thông tin đặt vé và đến sớm để có trải nghiệm thoải mái.
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
}
