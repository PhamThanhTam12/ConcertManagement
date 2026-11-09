import { Link } from "react-router-dom";
import { Alert, Button, Spinner } from "react-bootstrap";
import { useConcert } from "../context/ConcertContext";
import { useAuth } from "../context/AuthContext";

export default function ConcertState() {
  const { loading, error, reload } = useConcert();
  const { user } = useAuth();
  return (
    <div className="container page-space state-panel">
      {loading ? (
        <div role="status" className="d-flex align-items-center gap-3">
          <Spinner animation="border" size="sm" />
          Đang tải chương trình...
        </div>
      ) : error ? (
        <Alert variant="danger">
          <h1 className="h4">Chưa tải được chương trình</h1>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={reload}>
            Thử lại
          </Button>
        </Alert>
      ) : (
        <div className="text-center py-5">
          <span className="eyebrow">THE NEXT BIG NIGHT</span>
          <h1 className="mt-3">Hẹn bạn ở đêm nhạc tiếp theo.</h1>
          <p className="text-body-secondary">
            Thông tin chương trình đang được chuẩn bị.
          </p>
          <Button
            as={Link}
            to={user?.role === "admin" ? "/admin" : "/login"}
            className="mt-2"
          >
            {user?.role === "admin" ? "Thiết lập chương trình" : "Đăng nhập"}
          </Button>
        </div>
      )}
    </div>
  );
}
