import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Container, Dropdown, Nav, Navbar } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useConcert } from "../context/ConcertContext";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { concert } = useConcert();
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (location.pathname === "/" && location.hash)
      document.getElementById(location.hash.slice(1))?.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname, location.hash, concert]);

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView();
  }

  function handleLogout() {
    logout();
    setExpanded(false);
    navigate("/login", { replace: true });
  }

  return (
    <div className="site-shell">
      <a className="visually-hidden-focusable skip-link" href="#main-content">
        Đến nội dung chính
      </a>
      <Navbar
        expand="lg"
        expanded={expanded}
        onToggle={setExpanded}
        className="site-navbar"
      >
        <Container>
          <Navbar.Brand
            as={Link}
            to="/"
            onClick={() => setExpanded(false)}
            className="brand"
          >
            <span className="brand-symbol" aria-hidden="true">
              m<span>l</span>
            </span>
            <span>
              MIDNIGHT<span className="brand-sub">LIVE EXPERIENCE</span>
            </span>
          </Navbar.Brand>
          <Navbar.Toggle
            aria-controls="main-menu"
            aria-expanded={expanded}
            label="Mở hoặc đóng menu"
          />
          <Navbar.Collapse id="main-menu">
            <Nav
              className="ms-auto align-items-lg-center gap-lg-3"
              onSelect={() => setExpanded(false)}
            >
              <Nav.Link
                as={Link}
                to="/"
                active={location.pathname === "/" && !location.hash}
                eventKey="home"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              >
                Trang chủ
              </Nav.Link>
              <Nav.Link
                as={Link}
                to={isAdmin ? "/admin#schedule" : "/#lich-trinh"}
                active={
                  isAdmin
                    ? location.pathname === "/admin" &&
                      location.hash === "#schedule"
                    : location.pathname === "/" &&
                      location.hash === "#lich-trinh"
                }
                eventKey="schedule"
                onClick={() => !isAdmin && scrollToSection("lich-trinh")}
              >
                Lịch trình
              </Nav.Link>
              <Nav.Link
                as={Link}
                to={isAdmin ? "/admin#artists" : "/#nghe-si"}
                active={
                  isAdmin
                    ? location.pathname === "/admin" &&
                      location.hash === "#artists"
                    : location.pathname === "/" && location.hash === "#nghe-si"
                }
                eventKey="artists"
                onClick={() => !isAdmin && scrollToSection("nghe-si")}
              >
                Nghệ sĩ
              </Nav.Link>
            </Nav>
            <div className="nav-actions">
              <Button
                as={Link}
                to={isAdmin ? "/admin#bookings" : "/tickets"}
                className="nav-ticket"
                onClick={() => setExpanded(false)}
              >
                {isAdmin ? "Đơn vé" : "Mua vé"}{" "}
                <span aria-hidden="true">→</span>
              </Button>
              {user ? (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="outline-light" id="account-menu">
                    {user.role === "admin" ? "Admin" : "Tài khoản"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Header>{user.name}</Dropdown.Header>
                    <Dropdown.ItemText className="small text-body-secondary">
                      {user.email}
                    </Dropdown.ItemText>
                    <Dropdown.Item
                      as={Link}
                      to={user.role === "admin" ? "/admin" : "/my-tickets"}
                      onClick={() => setExpanded(false)}
                    >
                      {user.role === "admin" ? "Quản lý concert" : "Vé của tôi"}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      Đăng xuất
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Button
                  as={Link}
                  to="/login"
                  variant="link"
                  className="login-link"
                  state={{ from: location.pathname + location.hash }}
                  onClick={() => setExpanded(false)}
                >
                  Đăng nhập
                </Button>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <Container>
          <div className="footer-top">
            <Link to="/" className="footer-brand">
              MIDNIGHT<span>LIVE.</span>
            </Link>
            <p>Âm nhạc kết nối. Kỷ niệm ở lại.</p>
            <Link
              to={isAdmin ? "/admin#bookings" : "/tickets"}
              className="footer-link"
            >
              {isAdmin
                ? "Kiểm tra đơn vé của khách →"
                : "Hẹn bạn dưới ánh đèn sân khấu →"}
            </Link>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Midnight Live</span>
            <span>POP · INDIE · HIP-HOP · YOU</span>
            <Link to="/#dia-diem">Địa điểm tổ chức</Link>
          </div>
        </Container>
      </footer>
    </div>
  );
}
