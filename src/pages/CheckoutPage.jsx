import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import { useConcert } from "../context/ConcertContext";
import ConcertState from "../components/ConcertState";
import FormField from "../components/FormField";
import { getBookings, createBooking } from "../services/bookingService";
import { getConcert } from "../services/concertService";
import { getRemaining, isSalesOpen } from "../utils/booking";
import { formatDate, formatMoney } from "../utils/formatters";

export default function CheckoutPage() {
  const { ticketId } = useParams();
  return <CheckoutContent key={ticketId} ticketId={ticketId} />;
}

function CheckoutContent({ ticketId }) {
  const { user } = useAuth();
  const { concert, loading, error } = useConcert();
  const [bookings, setBookings] = useState([]);
  const [checking, setChecking] = useState(true);
  const [checkError, setCheckError] = useState("");
  const [retry, setRetry] = useState(0);
  const [step, setStep] = useState("form");
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const ticket = concert?.ticketTypes.find((item) => item.id === ticketId);
  const remaining = ticket ? getRemaining(ticket, bookings) : 0;

  useEffect(() => {
    if (!concert?.id) return;
    const controller = new AbortController();
    async function load() {
      try {
        const data = await getBookings(concert.id, controller.signal);
        if (!controller.signal.aborted) {
          setBookings(data);
          setCheckError("");
        }
      } catch (error) {
        if (!controller.signal.aborted) setCheckError(error.message);
      } finally {
        if (!controller.signal.aborted) setChecking(false);
      }
    }
    load();
    return () => controller.abort();
  }, [concert?.id, retry]);

  const formik = useFormik({
    initialValues: {
      fullName: user.name,
      email: user.email,
      phone: "",
      quantity: 1,
      paymentMethod: "counter",
      agree: false,
    },
    validationSchema: Yup.object({
      fullName: Yup.string()
        .trim()
        .required("Vui lòng nhập họ tên.")
        .min(2, "Họ tên cần ít nhất 2 ký tự.")
        .max(100, "Họ tên tối đa 100 ký tự."),
      email: Yup.string()
        .required("Vui lòng nhập email.")
        .email("Email không hợp lệ."),
      phone: Yup.string()
        .required("Vui lòng nhập số điện thoại.")
        .matches(/^0\d{9}$/, "Nhập 10 chữ số, bắt đầu bằng số 0."),
      quantity: Yup.number()
        .typeError("Số lượng phải là số.")
        .required("Vui lòng nhập số lượng.")
        .integer("Số lượng phải là số nguyên.")
        .min(1, "Cần ít nhất 1 vé.")
        .max(
          Math.min(6, remaining),
          "Vượt quá số vé còn lại hoặc giới hạn 6 vé.",
        ),
      paymentMethod: Yup.string().oneOf(["counter", "simulation"]).required(),
      agree: Yup.boolean().oneOf([true], "Bạn cần đồng ý điều kiện đặt vé."),
    }),
    onSubmit: async () => {
      setSubmitError("");
      setStep("review");
      window.scrollTo({ top: 0, behavior: "instant" });
    },
  });

  async function confirmBooking() {
    if (saving || user.role !== "user") return;
    setSaving(true);
    setSubmitError("");
    try {
      // Đọc lại trước POST để bắt trường hợp giá/số lượng đã thay đổi.
      const latest = await getConcert();
      const currentTicket = latest?.ticketTypes.find(
        (item) => item.id === ticketId,
      );
      if (!latest || !currentTicket?.active || !isSalesOpen(latest))
        throw new Error(
          "Hạng vé đã ngừng bán hoặc chương trình đã đóng mở bán.",
        );
      const currentBookings = await getBookings(latest.id);
      const quantity = Number(formik.values.quantity);
      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 6 ||
        quantity > getRemaining(currentTicket, currentBookings)
      ) {
        setBookings(currentBookings);
        setStep("form");
        throw new Error(
          "Số lượng vé vừa thay đổi. Vui lòng chọn lại số lượng.",
        );
      }
      if (Number(currentTicket.price) !== Number(ticket.price))
        throw new Error(
          "Giá vé vừa thay đổi. Vui lòng tải lại trang để xác nhận giá mới.",
        );
      await createBooking({
        eventId: latest.id,
        eventTitle: latest.title,
        eventStartAt: latest.startAt,
        eventLocation: latest.location,
        ticketTypeId: currentTicket.id,
        ticketName: currentTicket.name,
        fullName: formik.values.fullName.trim(),
        email: user.email,
        phone: formik.values.phone.trim(),
        quantity,
        unitPrice: Number(currentTicket.price),
        totalPrice: Number(currentTicket.price) * quantity,
        paymentMethod: formik.values.paymentMethod,
        paymentStatus:
          formik.values.paymentMethod === "simulation" ? "paid" : "pending",
        status: "confirmed",
        createdAt: new Date().toISOString(),
      });
      setBookingSuccess(true);
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (error) {
      setSubmitError(
        error.response
          ? "Chưa lưu được đơn đặt vé. Vui lòng thử lại."
          : error.message,
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading || error || !concert) return <ConcertState />;
  if (!ticket)
    return (
      <Container className="page-space">
        <Alert variant="warning">Hạng vé không tồn tại hoặc đã được gỡ.</Alert>
        <Button as={Link} to="/tickets">
          Chọn hạng vé khác
        </Button>
      </Container>
    );
  if (bookingSuccess)
    return (
      <Container className="page-space success-page">
        <div className="success-symbol" aria-hidden="true">
          ✓
        </div>
        <h1>Đặt vé thành công!</h1>
        <p className="text-body-secondary mb-4">
          Đơn đặt vé đã được xác nhận và lưu trong Vé của tôi.
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-3">
          <Button as={Link} to="/my-tickets">
            Xem vé của tôi →
          </Button>
          <Button as={Link} to="/tickets" variant="outline-light">
            Đặt thêm vé
          </Button>
        </div>
      </Container>
    );

  const total =
    Math.max(0, Number(formik.values.quantity) || 0) * Number(ticket.price);
  return (
    <Container className="page-space">
      <Link to="/tickets" className="back-link">
        ← Chọn hạng vé khác
      </Link>
      <div className="page-heading compact">
        <span className="eyebrow">MAKE IT YOUR NIGHT</span>
        <h1>Hoàn tất đặt vé.</h1>
      </div>
      <div className="checkout-steps">
        <span className={step === "form" ? "active" : ""}>01 / Thông tin</span>
        <span className={step === "review" ? "active" : ""}>02 / Xác nhận</span>
        <span>03 / Hoàn tất</span>
      </div>
      {checking ? (
        <div role="status" className="py-5">
          <Spinner size="sm" /> Đang kiểm tra vé...
        </div>
      ) : checkError ? (
        <Alert variant="danger">
          <p>Chưa kiểm tra được vé: {checkError}</p>
          <Button
            onClick={() => {
              setChecking(true);
              setRetry((current) => current + 1);
            }}
          >
            Thử lại
          </Button>
        </Alert>
      ) : !ticket.active || !isSalesOpen(concert) || remaining === 0 ? (
        <Alert variant="warning">
          Hạng vé đã hết hoặc đã đóng mở bán. Vui lòng chọn hạng vé khác.
        </Alert>
      ) : (
        <Row className="g-4 g-xl-5">
          <Col lg={7}>
            <div className="surface-panel">
              {submitError && <Alert variant="danger">{submitError}</Alert>}
              {step === "form" ? (
                <>
                  <h2 className="h4 mb-4">Thông tin người đặt</h2>
                  <Form noValidate onSubmit={formik.handleSubmit}>
                    <fieldset disabled={formik.isSubmitting}>
                      <Row>
                        <Col md={6}>
                          <FormField
                            formik={formik}
                            name="fullName"
                            label="Họ và tên"
                            type="text"
                            autoComplete="name"
                          />
                        </Col>
                        <Col md={6}>
                          <FormField
                            formik={formik}
                            name="phone"
                            label="Số điện thoại"
                            type="tel"
                            autoComplete="tel"
                          />
                        </Col>
                      </Row>
                      <FormField
                        formik={formik}
                        name="email"
                        label="Email"
                        type="email"
                        readOnly
                        help="Email lấy từ tài khoản đang đăng nhập."
                      />
                      <FormField
                        formik={formik}
                        name="quantity"
                        label="Số lượng vé"
                        type="number"
                        min={1}
                        max={Math.min(6, remaining)}
                        step={1}
                        help={"Còn " + remaining + " vé. Tối đa 6 vé mỗi đơn."}
                      />
                      <h3 className="h6 mt-4 mb-3">Hình thức thanh toán</h3>
                      <div className="payment-options">
                        <Form.Check
                          type="radio"
                          id="payment-counter"
                          name="paymentMethod"
                          label="Thanh toán tại quầy"
                          value="counter"
                          checked={formik.values.paymentMethod === "counter"}
                          onChange={formik.handleChange}
                        />
                        <Form.Check
                          type="radio"
                          id="payment-simulation"
                          name="paymentMethod"
                          label="Thanh toán mô phỏng"
                          value="simulation"
                          checked={formik.values.paymentMethod === "simulation"}
                          onChange={formik.handleChange}
                        />
                      </div>
                      {formik.values.paymentMethod === "simulation" && (
                        <p className="small text-body-secondary mt-3">
                          Chế độ thực hành: không thu tiền và không yêu cầu
                          thông tin ngân hàng.
                        </p>
                      )}
                      <Form.Check
                        className="my-4"
                        id="booking-agree"
                        name="agree"
                        label="Tôi đồng ý thông tin đặt vé và điều kiện hủy trước giờ diễn."
                        checked={formik.values.agree}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={Boolean(
                          formik.touched.agree && formik.errors.agree,
                        )}
                        feedback={formik.errors.agree}
                        feedbackType="invalid"
                      />
                      <Button type="submit" className="w-100" size="lg">
                        Kiểm tra đơn đặt vé →
                      </Button>
                    </fieldset>
                  </Form>
                </>
              ) : (
                <>
                  <h2 className="h4 mb-4">Kiểm tra trước khi xác nhận</h2>
                  <dl className="order-details">
                    <dt>Người đặt</dt>
                    <dd>{formik.values.fullName.trim()}</dd>
                    <dt>Email</dt>
                    <dd>{user.email}</dd>
                    <dt>Số điện thoại</dt>
                    <dd>{formik.values.phone}</dd>
                    <dt>Hạng vé</dt>
                    <dd>{ticket.name}</dd>
                    <dt>Số lượng</dt>
                    <dd>{formik.values.quantity} vé</dd>
                    <dt>Thanh toán</dt>
                    <dd>
                      {formik.values.paymentMethod === "counter"
                        ? "Thanh toán tại quầy"
                        : "Thanh toán mô phỏng — không thu tiền"}
                    </dd>
                  </dl>
                  <p className="small text-body-secondary">
                    Vui lòng kiểm tra thông tin liên hệ trước khi xác nhận.
                  </p>
                  <div className="d-flex flex-wrap gap-3">
                    <Button
                      variant="outline-light"
                      disabled={saving}
                      onClick={() => setStep("form")}
                    >
                      Chỉnh sửa thông tin
                    </Button>
                    <Button disabled={saving} onClick={confirmBooking}>
                      {saving ? "Đang xử lý..." : "Xác nhận đặt vé"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Col>
          <Col lg={5}>
            <aside className="order-summary">
              <span className="eyebrow">YOUR NIGHT STARTS HERE</span>
              <h2>{concert.title}</h2>
              <p className="small text-body-secondary">
                {formatDate(concert.startAt)}
                <br />
                {concert.location}
              </p>
              <div className="summary-ticket">
                <strong>{ticket.name}</strong>
                <span>{formatMoney(ticket.price)} / vé</span>
              </div>
              <ul className="ticket-benefits">
                {ticket.benefits.map((benefit) => (
                  <li key={benefit}>
                    <span aria-hidden="true">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <div className="summary-total">
                <span>Tổng cộng</span>
                <strong>{formatMoney(total)}</strong>
              </div>
              <p className="small text-body-secondary mb-0">
                {formik.values.paymentMethod === "counter"
                  ? "Thanh toán theo hướng dẫn tại quầy của chương trình."
                  : "Thao tác thanh toán được mô phỏng cho bài thực hành."}
              </p>
            </aside>
          </Col>
        </Row>
      )}
    </Container>
  );
}
