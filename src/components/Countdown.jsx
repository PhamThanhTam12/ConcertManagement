import { useEffect, useState } from "react";

function secondsUntil(date) {
  const difference = new Date(date).getTime() - Date.now();
  return Number.isFinite(difference)
    ? Math.max(0, Math.ceil(difference / 1000))
    : 0;
}

export default function Countdown({ startAt, endAt }) {
  const [seconds, setSeconds] = useState(() => secondsUntil(startAt));
  const [ended] = useState(() => Date.now() >= new Date(endAt).getTime());

  useEffect(() => {
    if (seconds === 0) return;
    const timer = setInterval(() => setSeconds(secondsUntil(startAt)), 1000);
    return () => clearInterval(timer);
  }, [seconds, startAt]);

  if (seconds === 0) {
    return (
      <p className="countdown-message mb-0" role="status">
        {ended ? "Hẹn bạn ở đêm nhạc tiếp theo!" : "Đêm nhạc đã bắt đầu!"}
      </p>
    );
  }

  const parts = [
    { label: "NGÀY", value: Math.floor(seconds / 86400) },
    { label: "GIỜ", value: Math.floor((seconds % 86400) / 3600) },
    { label: "PHÚT", value: Math.floor((seconds % 3600) / 60) },
    { label: "GIÂY", value: seconds % 60 },
  ];
  return (
    <div className="countdown" aria-label="Đếm ngược đến chương trình">
      {parts.map((part) => (
        <div className="countdown-part" key={part.label}>
          <strong>{String(part.value).padStart(2, "0")}</strong>
          <span>{part.label}</span>
        </div>
      ))}
    </div>
  );
}
