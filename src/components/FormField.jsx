import { Form } from "react-bootstrap";

export default function FormField({ formik, name, label, help, ...props }) {
  const invalid = Boolean(formik.touched[name] && formik.errors[name]);
  const id = "field-" + name;
  return (
    <Form.Group controlId={id} className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        {...props}
        {...formik.getFieldProps(name)}
        isInvalid={invalid}
        aria-describedby={
          invalid ? id + "-error" : help ? id + "-help" : undefined
        }
      />
      <Form.Control.Feedback type="invalid" id={id + "-error"}>
        {formik.errors[name]}
      </Form.Control.Feedback>
      {help && <Form.Text id={id + "-help"}>{help}</Form.Text>}
    </Form.Group>
  );
}
