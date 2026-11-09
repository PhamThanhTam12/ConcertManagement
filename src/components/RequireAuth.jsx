import { Navigate, Link, useLocation } from "react-router-dom";
import { Alert, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  if (role && user.role !== role) {
    return (
      <div className="container page-space">
        <Alert variant="warning">
          <h1 className="h4">Không có quyền truy cập</h1>
          <p className="mb-0">Tài khoản của bạn không sử dụng chức năng này.</p>
        </Alert>
        <Button as={Link} to="/">
          Về trang chủ
        </Button>
      </div>
    );
  }
  return children;
}
