import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";
import { getLoginDestination } from "../utils/formatters";

export default function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string()
        .trim()
        .required("Vui lòng nhập email.")
        .email("Email không hợp lệ."),
      password: Yup.string().required("Vui lòng nhập mật khẩu."),
    }),
    onSubmit: async (values) => {
      setError("");
      try {
        const profile = login(values.email, values.password);
        navigate(getLoginDestination(location.state?.from, profile), {
          replace: true,
        });
      } catch (error) {
        setError(error.message);
      }
    },
  });
  if (user)
    return (
      <Navigate to={getLoginDestination(location.state?.from, user)} replace />
    );
  return (
    <Container className="page-space">
      <Row className="auth-panel g-0">
        <Col lg={6} className="auth-visual">
          <img
            src="/images/concert-crowd.jpg"
            alt="Khán giả cùng tận hưởng đêm nhạc"
          />
          <div>
            <span className="eyebrow">YOU BELONG HERE</span>
            <h2>
              Gặp nhau
              <br />
              dưới ánh đèn.
            </h2>
            <p>Âm nhạc hay hơn khi chúng ta cùng nhau lắng nghe.</p>
            <Link to="/">Khám phá Midnight Live →</Link>
          </div>
        </Col>
        <Col lg={6}>
          <div className="auth-form">
            <span className="eyebrow">WELCOME BACK</span>
            <h1>Đăng nhập</h1>
            <p className="text-body-secondary mb-4">
              Một tài khoản cho những đêm nhạc đáng nhớ.
            </p>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form noValidate onSubmit={formik.handleSubmit}>
              <fieldset disabled={formik.isSubmitting}>
                <FormField
                  formik={formik}
                  name="email"
                  label="Email"
                  type="email"
                  autoComplete="username"
                  placeholder="Email của bạn"
                />
                <FormField
                  formik={formik}
                  name="password"
                  label="Mật khẩu"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                />
                <Button type="submit" className="w-100 mt-2" size="lg">
                  {formik.isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </fieldset>
            </Form>
            <p className="small text-body-secondary text-center mt-4 mb-0">
              Sẵn sàng cho trải nghiệm tiếp theo của bạn.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
