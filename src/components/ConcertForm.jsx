import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import FormField from "./FormField";
import { fromDateInput, toDateInput } from "../utils/formatters";

export default function ConcertForm({ concert, onSubmit }) {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const formik = useFormik({
    initialValues: {
      title: concert.title,
      subtitle: concert.subtitle,
      description: concert.description,
      image: concert.image,
      location: concert.location,
      startAt: toDateInput(concert.startAt),
      endAt: toDateInput(concert.endAt),
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .trim()
        .required("Vui lòng nhập tên concert.")
        .min(3)
        .max(80),
      subtitle: Yup.string()
        .trim()
        .required("Vui lòng nhập lời giới thiệu ngắn.")
        .max(120),
      description: Yup.string()
        .trim()
        .required("Vui lòng nhập mô tả.")
        .min(20, "Mô tả cần ít nhất 20 ký tự.")
        .max(2000),
      image: Yup.string()
        .trim()
        .required("Vui lòng nhập đường dẫn ảnh.")
        .test(
          "image-path",
          "Dùng URL http/https hoặc đường dẫn /images/.",
          (value) =>
            !value ||
            value.startsWith("/images/") ||
            /^https?:\/\//i.test(value),
        ),
      location: Yup.string()
        .trim()
        .required("Vui lòng nhập địa điểm.")
        .min(3)
        .max(200),
      startAt: Yup.string()
        .required("Vui lòng chọn giờ bắt đầu.")
        .test(
          "date",
          "Ngày giờ không hợp lệ.",
          (value) => !value || Boolean(fromDateInput(value)),
        ),
      endAt: Yup.string()
        .required("Vui lòng chọn giờ kết thúc.")
        .test(
          "date",
          "Ngày giờ không hợp lệ.",
          (value) => !value || Boolean(fromDateInput(value)),
        ),
    }),
    onSubmit: async (values) => {
      setError("");
      setNotice("");
      if (values.endAt <= values.startAt) {
        formik.setFieldError("endAt", "Giờ kết thúc phải sau giờ bắt đầu.");
        return;
      }
      try {
        await onSubmit({
          ...concert,
          title: values.title.trim(),
          subtitle: values.subtitle.trim(),
          description: values.description.trim(),
          image: values.image.trim(),
          location: values.location.trim(),
          startAt: fromDateInput(values.startAt),
          endAt: fromDateInput(values.endAt),
        });
        setNotice("Đã cập nhật thông tin chương trình.");
      } catch (error) {
        setError(error.message);
      }
    },
  });
  return (
    <Form noValidate onSubmit={formik.handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      {notice && <Alert variant="success">{notice}</Alert>}
      <fieldset disabled={formik.isSubmitting}>
        <Row>
          <Col md={6}>
            <FormField
              formik={formik}
              name="title"
              label="Tên concert"
              type="text"
              maxLength={80}
            />
          </Col>
          <Col md={6}>
            <FormField
              formik={formik}
              name="subtitle"
              label="Lời giới thiệu ngắn"
              type="text"
              maxLength={120}
            />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <FormField
              formik={formik}
              name="startAt"
              label="Bắt đầu (giờ Việt Nam)"
              type="datetime-local"
            />
          </Col>
          <Col md={6}>
            <FormField
              formik={formik}
              name="endAt"
              label="Kết thúc (giờ Việt Nam)"
              type="datetime-local"
            />
          </Col>
        </Row>
        <FormField
          formik={formik}
          name="location"
          label="Địa điểm"
          type="text"
        />
        <FormField
          formik={formik}
          name="image"
          label="Ảnh nền concert"
          type="text"
          help="URL ảnh trực tiếp hoặc /images/concert-hero.jpg."
        />
        <FormField
          formik={formik}
          name="description"
          label="Mô tả chương trình"
          as="textarea"
          rows={4}
        />
        <Button type="submit">
          {formik.isSubmitting ? "Đang lưu..." : "Lưu thông tin concert"}
        </Button>
      </fieldset>
    </Form>
  );
}
