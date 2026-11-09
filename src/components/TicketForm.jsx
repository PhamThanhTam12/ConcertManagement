import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import FormField from "./FormField";

export default function TicketForm({ ticket, onSubmit, onCancel }) {
  const [error, setError] = useState("");
  const formik = useFormik({
    initialValues: {
      name: ticket?.name || "",
      price: ticket?.price ?? 590000,
      capacity: ticket?.capacity ?? 100,
      description: ticket?.description || "",
      benefits: ticket?.benefits.join("\n") || "",
      featured: ticket?.featured || false,
      active: ticket?.active ?? true,
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Nhập tên hạng vé.").min(2).max(80),
      price: Yup.number()
        .typeError("Giá phải là số.")
        .required()
        .integer("Giá phải là số nguyên.")
        .min(0, "Giá không được âm."),
      capacity: Yup.number()
        .typeError("Sức chứa phải là số.")
        .required()
        .integer()
        .min(1, "Cần ít nhất 1 vé."),
      description: Yup.string().trim().required("Nhập mô tả.").min(10).max(300),
      benefits: Yup.string()
        .trim()
        .required("Nhập ít nhất một quyền lợi.")
        .max(1000),
      featured: Yup.boolean(),
      active: Yup.boolean(),
    }),
    onSubmit: async (values) => {
      setError("");
      const benefits = values.benefits
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
      if (!benefits.length) {
        formik.setFieldError("benefits", "Nhập ít nhất một quyền lợi.");
        return;
      }
      try {
        await onSubmit({
          ...values,
          name: values.name.trim(),
          description: values.description.trim(),
          price: Number(values.price),
          capacity: Number(values.capacity),
          benefits,
        });
      } catch (error) {
        setError(error.message);
      }
    },
  });
  return (
    <Form noValidate onSubmit={formik.handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      <fieldset disabled={formik.isSubmitting}>
        <FormField
          formik={formik}
          name="name"
          label="Tên hạng vé"
          type="text"
        />
        <Row>
          <Col md={6}>
            <FormField
              formik={formik}
              name="price"
              label="Giá vé (VNĐ)"
              type="number"
              min={0}
              step={1}
            />
          </Col>
          <Col md={6}>
            <FormField
              formik={formik}
              name="capacity"
              label="Tổng số vé"
              type="number"
              min={1}
              step={1}
            />
          </Col>
        </Row>
        <FormField
          formik={formik}
          name="description"
          label="Mô tả hạng vé"
          as="textarea"
          rows={2}
        />
        <FormField
          formik={formik}
          name="benefits"
          label="Quyền lợi"
          as="textarea"
          rows={4}
          help="Mỗi quyền lợi viết trên một dòng."
        />
        <Form.Check
          id="ticket-featured"
          name="featured"
          label="Làm nổi bật hạng vé"
          checked={formik.values.featured}
          onChange={formik.handleChange}
          className="mb-2"
        />
        <Form.Check
          id="ticket-active"
          name="active"
          label="Cho phép mở bán"
          checked={formik.values.active}
          onChange={formik.handleChange}
          className="mb-4"
        />
        <div className="d-flex justify-content-end gap-2">
          <Button type="button" variant="outline-light" onClick={onCancel}>
            Quay lại
          </Button>
          <Button type="submit">
            {formik.isSubmitting ? "Đang lưu..." : "Lưu hạng vé"}
          </Button>
        </div>
      </fieldset>
    </Form>
  );
}
