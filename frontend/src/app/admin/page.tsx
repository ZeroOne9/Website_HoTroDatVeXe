"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminService } from "@/services/adminService";
import { formatMoney } from "@/lib/format";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        setStats(res.data.stats);
      } catch (error) {
        console.error("Lỗi lấy thống kê", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Đang tải dữ liệu tổng hợp...</div>;
  }

  if (!stats) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--red)" }}>Không thể tải thống kê</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Dashboard Thống Kê</h1>
      
      {/* 1. Doanh thu & Booking */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
        <div className="card" style={{ padding: 24, background: "linear-gradient(135deg, #007bff, #0056b3)", color: "white" }}>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Tổng Doanh Thu (Confirmed)</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{formatMoney(stats.revenue)}</div>
        </div>
        
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 8 }}>Tổng Booking</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)" }}>{stats.bookings.total}</div>
        </div>
        
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12 }}>Phân bố trạng thái Booking</div>
          <div style={{ display: "flex", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Chờ thanh toán</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#f59e0b" }}>{stats.bookings.pending}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Thành công</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "var(--green)" }}>{stats.bookings.confirmed}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Đã hủy</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "var(--red)" }}>{stats.bookings.cancelled}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Đối tác & Tài nguyên */}
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Tài nguyên & Đối tác</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🏢</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.busCompanies}</div>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>Nhà xe</div>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🚐</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.vehicles}</div>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>Tổng xe</div>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🚌</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.trips}</div>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>Chuyến xe</div>
        </div>
      </div>

      {/* 3. Booking mới nhất */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Giao dịch gần đây (Mới nhất)</h2>
        <Link href="/admin/bookings" style={{ fontSize: 14, color: "var(--primary)", fontWeight: 500 }}>
          Xem tất cả →
        </Link>
      </div>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã Vé</th>
              <th>Khách Hàng</th>
              <th>Chuyến</th>
              <th>Giá Trị</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentBookings.map((b: any) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600 }}>{b.bookingCode}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{b.passenger?.fullName || "Khách"}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{b.passenger?.phone}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>
                    {b.trip?.route?.departureLocation?.name} → {b.trip?.route?.destinationLocation?.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{b.trip?.vehicle?.busCompany?.name}</div>
                </td>
                <td style={{ fontWeight: 600, color: "var(--primary)" }}>{formatMoney(b.totalPriceVnd)}</td>
                <td>
                  <span style={{ 
                    padding: "4px 8px", 
                    borderRadius: 4, 
                    fontSize: 12, 
                    fontWeight: 500,
                    background: b.status === "confirmed" ? "#d4edda" : b.status === "pending" ? "#fff3cd" : "#f8d7da",
                    color: b.status === "confirmed" ? "#155724" : b.status === "pending" ? "#856404" : "#721c24"
                  }}>
                    {b.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {stats.recentBookings.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>Chưa có giao dịch nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
