"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminService } from "@/services/adminService";

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const res = await adminService.getRoutes();
      setRoutes(res.data.routes || []);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Lỗi tải danh sách tuyến xe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleStatusChange = async (routeId: number, status: string) => {
    if (!confirm(`Bạn có chắc muốn đổi trạng thái thành ${status}?`)) return;
    try {
      await adminService.updateRouteStatus(routeId, status);
      alert("Cập nhật thành công");
      loadRoutes();
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật trạng thái");
    }
  };

  const statusOptions = [
    { value: "active", label: "Đang hoạt động" },
    { value: "inactive", label: "Ngừng hoạt động" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>Quản lý Tuyến xe</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="button outline" onClick={loadRoutes}>Làm mới</button>
          <Link href="/admin/routes/create" className="button">
            + Tạo tuyến mới
          </Link>
        </div>
      </div>

      <div className="admin-table-container">
        {loading && routes.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Điểm Đi</th>
                <th>Điểm Đến</th>
                <th>Khoảng Cách (km)</th>
                <th>TG Dự Kiến (phút)</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {routes.map(route => (
                <tr key={route.id}>
                  <td>{route.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{route.departureLocation?.name}</div>
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>{route.departureLocation?.province}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{route.destinationLocation?.name}</div>
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>{route.destinationLocation?.province}</div>
                  </td>
                  <td>{route.distanceKm || "---"}</td>
                  <td>{route.estimatedMinutes || "---"}</td>
                  <td>
                    <select 
                      className="input"
                      style={{ height: 32, padding: "0 8px", fontSize: 13, width: "160px" }}
                      value={route.status}
                      onChange={(e) => handleStatusChange(route.id, e.target.value)}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                    Chưa có tuyến xe nào
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
