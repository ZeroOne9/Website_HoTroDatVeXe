const endpoints = [
  "GET /api/locations",
  "GET /api/trips",
  "POST /api/bookings",
  "GET /api/bookings/[bookingCode]",
  "POST /api/bookings/[bookingCode]/confirm",
  "GET /api/auth/me",
];

export default function BackendStatusPage() {
  return (
    <main className="status-page">
      <section className="status-card">
        <span className="status-badge">Backend</span>
        <h1>Đặt Vé Xe API đang chạy</h1>
        <p>
          Giao diện người dùng đã được tách sang thư mục <strong>frontend/</strong>. Trang này chỉ dùng để kiểm tra
          backend root.
        </p>
        <div className="endpoint-list">
          {endpoints.map((endpoint) => (
            <code key={endpoint}>{endpoint}</code>
          ))}
        </div>
      </section>
    </main>
  );
}
