import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import FormField from "./FormField";
import { getSlotArtist } from "../utils/schedule";

export default function ScheduleForm({
  slot,
  schedule,
  artists,
  onSubmit,
  onCancel,
}) {
  const [error, setError] = useState("");
  const linkedArtist = getSlotArtist(slot, artists);
  const formik = useFormik({
    initialValues: {
      startTime: slot?.startTime || "18:00",
      endTime: slot?.endTime || "18:30",
      title: slot?.title || "",
      performer: slot?.performer || "",
      artistId: linkedArtist?.id || "",
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
      performer: Yup.string().trim(),
      artistId: Yup.string(),
      type: Yup.string()
        .oneOf(["performance", "highlight", "activity"])
        .required(),
    }),
    onSubmit: async (values) => {
      setError("");
      const isActivity = values.type === "activity";
      const artist = artists.find((item) => item.id === values.artistId);
      if (!isActivity && !artist) {
        formik.setFieldError(
          "artistId",
          "Vui lòng chọn nghệ sĩ trong danh sách.",
        );
        return;
      }
      if (isActivity && !values.performer.trim()) {
        formik.setFieldError("performer", "Vui lòng nhập nội dung hoạt động.");
        return;
      }
      if (isActivity && values.performer.trim().length > 150) {
        formik.setFieldError(
          "performer",
          "Nội dung hoạt động tối đa 150 ký tự.",
        );
        return;
      }
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
          artistId: isActivity ? "" : artist.id,
          performer: isActivity ? values.performer.trim() : artist.name,
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
        <Form.Group controlId="slot-type" className="mb-4">
          <Form.Label>Loại tiết mục</Form.Label>
          <Form.Select {...formik.getFieldProps("type")}>
            <option value="performance">Biểu diễn</option>
            <option value="highlight">Đặc biệt</option>
            <option value="activity">Hoạt động</option>
          </Form.Select>
        </Form.Group>
        {formik.values.type === "activity" ? (
          <FormField
            formik={formik}
            name="performer"
            label="Nội dung hoạt động"
            type="text"
            help="Ví dụ: Đón khách tại cổng chính hoặc MC giới thiệu chương trình."
          />
        ) : (
          <>
            <Form.Group controlId="slot-artist" className="mb-4">
              <Form.Label>Nghệ sĩ</Form.Label>
              <Form.Select
                {...formik.getFieldProps("artistId")}
                disabled={artists.length === 0}
                isInvalid={Boolean(
                  formik.touched.artistId && formik.errors.artistId,
                )}
                aria-describedby={
                  formik.touched.artistId && formik.errors.artistId
                    ? "slot-artist-error"
                    : "slot-artist-help"
                }
              >
                <option value="">Chọn nghệ sĩ</option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid" id="slot-artist-error">
                {formik.errors.artistId}
              </Form.Control.Feedback>
              <Form.Text id="slot-artist-help">
                Danh sách lấy từ mục Nghệ sĩ. Thêm nghệ sĩ ở mục đó trước khi
                chọn tại đây.
              </Form.Text>
            </Form.Group>
            {artists.length === 0 ? (
              <Alert variant="info">
                Chưa có nghệ sĩ. Hãy thêm nghệ sĩ trước khi tạo tiết mục biểu
                diễn.
              </Alert>
            ) : slot && !linkedArtist ? (
              <Alert variant="info">
                Tiết mục cũ đang ghi: {slot.performer}. Hãy chọn nghệ sĩ, hoặc
                chuyển loại sang Hoạt động để giữ nội dung này.
              </Alert>
            ) : null}
          </>
        )}
        <div className="d-flex justify-content-end gap-2">
          <Button type="button" variant="outline-light" onClick={onCancel}>
            Quay lại
          </Button>
          <Button
            type="submit"
            disabled={formik.values.type !== "activity" && artists.length === 0}
          >
            {formik.isSubmitting ? "Đang lưu..." : "Lưu tiết mục"}
          </Button>
        </div>
      </fieldset>
    </Form>
  );
}
