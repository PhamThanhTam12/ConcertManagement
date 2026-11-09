import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Spinner } from "react-bootstrap";
import { useConcert } from "../context/ConcertContext";
import { useAuth } from "../context/AuthContext";

export default function ConcertState() {
  const { loading, error, reload, initialize } = useConcert();
  const { user } = useAuth();
  const [initializing, setInitializing] = useState(false);
  const [setupError, setSetupError] = useState("");

  async function handleInitialize() {
    if (initializing) return;
    setInitializing(true);
    setSetupError("");
    try {
      await initialize();
    } catch (error) {
      setSetupError(error.message);
    } finally {
      setInitializing(false);
    }
  }

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
          <h1 className="mt-3">Chưa có chương trình được công bố.</h1>
          <p className="text-body-secondary">
            {user?.role === "admin"
              ? "Concert chưa được khởi tạo. Hãy thêm dữ liệu mẫu để hiển thị nghệ sĩ, lịch trình và các hạng vé."
              : "Thông tin chương trình đang được chuẩn bị. Vui lòng quay lại sau hoặc kiểm tra lại chương trình."}
          </p>
          {setupError && <Alert variant="danger">{setupError}</Alert>}
          <div className="d-flex flex-wrap justify-content-center gap-3 mt-3">
            {user?.role === "admin" && (
              <Button onClick={handleInitialize} disabled={initializing}>
                {initializing ? "Đang khởi tạo..." : "Khởi tạo dữ liệu mẫu"}
              </Button>
            )}
            {!user && (
              <Button as={Link} to="/login">
                Đăng nhập
              </Button>
            )}
            <Button
              variant="outline-light"
              onClick={reload}
              disabled={initializing}
            >
              Kiểm tra lại chương trình
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
