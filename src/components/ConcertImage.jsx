import { useState } from "react";

export default function ConcertImage({ src, alt, ...props }) {
  const [failed, setFailed] = useState(null);
  return (
    <img
      {...props}
      src={!src || failed === src ? "/images/placeholder.svg" : src}
      alt={alt}
      onError={() => setFailed(src)}
    />
  );
}
