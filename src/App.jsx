import { Link, Route, Routes } from "react-router-dom";
import { Button, Container } from "react-bootstrap";
import MainLayout from "./components/MainLayout";
import RequireAuth from "./components/RequireAuth";
import HomePage from "./pages/HomePage";
import TicketsPage from "./pages/TicketsPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/checkout/:ticketId"
          element={
            <RequireAuth role="user">
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="/my-tickets"
          element={
            <RequireAuth role="user">
              <MyTicketsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <AdminPage />
            </RequireAuth>
          }
        />
        <Route
          path="*"
          element={
            <Container className="page-space text-center">
              <span className="eyebrow">404 / LOST IN THE MUSIC</span>
              <h1 className="mt-3">Bạn đang đi lạc một nhịp.</h1>
              <p className="text-body-secondary">
                Trang bạn tìm không tồn tại.
              </p>
              <Button as={Link} to="/">
                Về trang chủ
              </Button>
            </Container>
          }
        />
      </Route>
    </Routes>
  );
}
