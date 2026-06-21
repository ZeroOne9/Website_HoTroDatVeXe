"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Dashboard Thống Kê</h1>
      <div className="card" style={{ padding: 40, textAlign: "center" }}>
        <h2 style={{ marginBottom: 16 }}>Chào mừng đến với Admin Panel</h2>
        <p className="muted" style={{ marginBottom: 24 }}>
          Tính năng Dashboard Thống Kê (Doanh thu, vé bán, chuyến xe) sẽ được phát triển sau. Hiện tại bạn có thể trải nghiệm tính năng Quản lý Booking.
        </p>
        <Link href="/admin/bookings" className="button">Đi tới Quản lý Booking</Link>
      </div>
    </div>
  );
}
