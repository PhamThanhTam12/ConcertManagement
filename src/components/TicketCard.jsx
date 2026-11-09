import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { formatMoney } from "../utils/formatters";

export default function TicketCard({ ticket, remaining, open = true }) {
  const { user } = useAuth();
  const disabled = !open || !ticket.active || remaining === 0;
  return (
    <article
      className={"ticket-card " + (ticket.featured ? "ticket-featured" : "")}
    >
      <div className="ticket-card-top">
        <span className="eyebrow">
          {ticket.featured ? "TRẢI NGHIỆM NỔI BẬT" : "YOUR NIGHT, YOUR WAY"}
        </span>
        <span aria-hidden="true">→</span>
      </div>
      <h3>{ticket.name}</h3>
      <p className="text-body-secondary ticket-description">
        {ticket.description}
      </p>
      <div className="ticket-price">
        {formatMoney(ticket.price)}
        <span>/ vé</span>
      </div>
      <ul className="ticket-benefits">
        {ticket.benefits.map((benefit) => (
          <li key={benefit}>
            <span aria-hidden="true">✓</span>
            {benefit}
          </li>
        ))}
      </ul>
      <div className="ticket-availability">
        {remaining === undefined
          ? "Chọn hạng vé để xem chi tiết"
          : "Còn " + remaining + " vé"}
      </div>
      {user?.role === "admin" ? (
        <Button as={Link} to="/admin" variant="outline-light" className="w-100">
          Quản lý hạng vé
        </Button>
      ) : disabled ? (
        <Button disabled className="w-100">
          {!open
            ? "Đã đóng mở bán"
            : !ticket.active
              ? "Tạm ngừng bán"
              : "Đã hết vé"}
        </Button>
      ) : (
        <Button
          as={Link}
          to={"/checkout/" + ticket.id}
          variant={ticket.featured ? "primary" : "outline-light"}
          className="w-100"
        >
          Chọn vé này <span aria-hidden="true">→</span>
        </Button>
      )}
    </article>
  );
}
