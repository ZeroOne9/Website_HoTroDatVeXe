"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminService } from "@/services/adminService";
import { formatMoney } from "@/lib/format";

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const res = await adminService.getTrips();
      setTrips(res.data.trips);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Lỗi tải danh sách chuyến xe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleStatusChange = async (tripId: number, status: string) => {
    if (!confirm(`Bạn có chắc muốn đổi trạng thái thành ${status}?`)) return;
    try {
      await adminService.updateTripStatus(tripId, status);
      alert("Cập nhật thành công");
      loadTrips();
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật trạng thái");
    }
  };

  const statusOptions = [
    { value: "scheduled", label: "Chưa xuất bến" },
    { value: "departed", label: "Đã xuất bến" },
    { value: "completed", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>Quản lý Chuyến xe</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="button outline" onClick={loadTrips}>Làm mới</button>
          <Link href="/admin/trips/create" className="button">
            + Tạo chuyến mới
          </Link>
        </div>
      </div>

      <div className="admin-table-container">
        {loading && trips.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tuyến Đường</th>
                <th>Xe & Nhà Xe</th>
                <th>Khởi Hành</th>
                <th>Giá Vé</th>
                <th>Vé Đã Bán</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(trip => (
                <tr key={trip.id}>
                  <td>{trip.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {trip.route?.departureLocation?.name} → {trip.route?.destinationLocation?.name}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{trip.vehicle?.name} ({trip.vehicle?.licensePlate})</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{trip.vehicle?.busCompany?.name}</div>
                  </td>
                  <td>{new Date(trip.departureTime).toLocaleString("vi-VN")}</td>
                  <td style={{ fontWeight: 600, color: "var(--primary)" }}>{formatMoney(trip.priceVnd)}</td>
                  <td>
                    <span style={{ 
                      padding: "2px 8px", 
                      background: "#e8f0fe", 
                      color: "var(--primary)", 
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 600
                    }}>
                      {trip._count?.bookingSeats || 0} vé
                    </span>
                  </td>
                  <td>
                    <select 
                      className="input"
                      style={{ height: 32, padding: "0 8px", fontSize: 13, width: "130px" }}
                      value={trip.status}
                      onChange={(e) => handleStatusChange(trip.id, e.target.value)}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {trips.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                    Chưa có chuyến xe nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
