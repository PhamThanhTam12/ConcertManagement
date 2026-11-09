import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, Button, Form } from "react-bootstrap";
import FormField from "./FormField";

export default function ArtistForm({ artist, onSubmit, onCancel }) {
  const [error, setError] = useState("");
  const formik = useFormik({
    initialValues: {
      name: artist?.name || "",
      genre: artist?.genre || "",
      image: artist?.image || "",
      description: artist?.description || "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .required("Vui lòng nhập tên nghệ sĩ.")
        .min(2)
        .max(80),
      genre: Yup.string().trim().required("Vui lòng nhập thể loại.").max(60),
      image: Yup.string()
        .trim()
        .required("Vui lòng nhập ảnh.")
        .test(
          "image-path",
          "Dùng URL http/https hoặc /images/.",
          (value) =>
            !value ||
            value.startsWith("/images/") ||
            /^https?:\/\//i.test(value),
        ),
      description: Yup.string()
        .trim()
        .required("Vui lòng nhập giới thiệu.")
        .min(10)
        .max(500),
    }),
    onSubmit: async (values) => {
      setError("");
      try {
        await onSubmit({
          name: values.name.trim(),
          genre: values.genre.trim(),
          image: values.image.trim(),
          description: values.description.trim(),
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
          label="Tên nghệ sĩ"
          type="text"
        />
        <FormField
          formik={formik}
          name="genre"
          label="Thể loại âm nhạc"
          type="text"
          placeholder="POP / R&B"
        />
        <FormField
          formik={formik}
          name="image"
          label="Ảnh nghệ sĩ"
          type="text"
          placeholder="/images/artist-1.jpg"
        />
        <FormField
          formik={formik}
          name="description"
          label="Giới thiệu nghệ sĩ"
          as="textarea"
          rows={3}
        />
        <div className="d-flex justify-content-end gap-2">
          <Button type="button" variant="outline-light" onClick={onCancel}>
            Quay lại
          </Button>
          <Button type="submit">
            {formik.isSubmitting ? "Đang lưu..." : "Lưu nghệ sĩ"}
          </Button>
        </div>
      </fieldset>
    </Form>
  );
}
