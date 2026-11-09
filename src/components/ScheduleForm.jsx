import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import FormField from "./FormField";

export default function ScheduleForm({ slot, schedule, onSubmit, onCancel }) {
  const [error, setError] = useState("");
  const formik = useFormik({
    initialValues: {
      startTime: slot?.startTime || "18:00",
      endTime: slot?.endTime || "18:30",
      title: slot?.title || "",
      performer: slot?.performer || "",
      type: slot?.type || "performance",
    },
    validationSchema: Yup.object({
      startTime: Yup.string()
        .required("Chọn giờ bắt đầu.")
        .matches(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ không hợp lệ."),
      endTime: Yup.string()
        .required("Chọn giờ kết thúc.")
        .matches(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ không hợp lệ."),
      title: Yup.string().trim().required("Nhập tên tiết mục.").min(2).max(120),
      performer: Yup.string()
        .trim()
        .required("Nhập nghệ sĩ hoặc nội dung hoạt động.")
        .max(150),
      type: Yup.string()
        .oneOf(["performance", "highlight", "activity"])
        .required(),
    }),
    onSubmit: async (values) => {
      setError("");
      if (values.endTime <= values.startTime) {
        formik.setFieldError("endTime", "Giờ kết thúc phải sau giờ bắt đầu.");
        return;
      }
      const overlap = schedule.some(
        (item) =>
          item.id !== slot?.id &&
          values.startTime < item.endTime &&
          values.endTime > item.startTime,
      );
      if (overlap) {
        formik.setFieldError(
          "startTime",
          "Khung giờ bị trùng với một tiết mục khác.",
        );
        return;
      }
      try {
        await onSubmit({
          ...values,
          title: values.title.trim(),
          performer: values.performer.trim(),
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
        <Row>
          <Col md={6}>
            <FormField
              formik={formik}
              name="startTime"
              label="Giờ bắt đầu"
              type="time"
            />
          </Col>
          <Col md={6}>
            <FormField
              formik={formik}
              name="endTime"
              label="Giờ kết thúc"
              type="time"
            />
          </Col>
        </Row>
        <FormField
          formik={formik}
          name="title"
          label="Tên tiết mục"
          type="text"
        />
        <FormField
          formik={formik}
          name="performer"
          label="Nghệ sĩ / hoạt động"
          type="text"
        />
        <Form.Group controlId="slot-type" className="mb-4">
          <Form.Label>Loại tiết mục</Form.Label>
          <Form.Select {...formik.getFieldProps("type")}>
            <option value="performance">Biểu diễn</option>
            <option value="highlight">Đặc biệt</option>
            <option value="activity">Hoạt động</option>
          </Form.Select>
        </Form.Group>
        <div className="d-flex justify-content-end gap-2">
          <Button type="button" variant="outline-light" onClick={onCancel}>
            Quay lại
          </Button>
          <Button type="submit">
            {formik.isSubmitting ? "Đang lưu..." : "Lưu tiết mục"}
          </Button>
        </div>
      </fieldset>
    </Form>
  );
}
