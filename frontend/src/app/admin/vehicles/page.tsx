"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminService } from "@/services/adminService";

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const res = await adminService.getVehicles();
      setVehicles(res.data.vehicles || []);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Lỗi tải danh sách xe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleStatusChange = async (vehicleId: number, status: string) => {
    if (!confirm(`Bạn có chắc muốn đổi trạng thái thành ${status}?`)) return;
    try {
      await adminService.updateVehicleStatus(vehicleId, status);
      alert("Cập nhật thành công");
      loadVehicles();
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật trạng thái");
    }
  };

  const statusOptions = [
    { value: "active", label: "Đang hoạt động" },
    { value: "inactive", label: "Ngừng hoạt động" },
    { value: "maintenance", label: "Đang bảo trì" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>Quản lý Xe</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="button outline" onClick={loadVehicles}>Làm mới</button>
          <Link href="/admin/vehicles/create" className="button">
            + Thêm xe mới
          </Link>
        </div>
      </div>

      <div className="admin-table-container">
        {loading && vehicles.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Xe</th>
                <th>Biển Số</th>
                <th>Nhà Xe</th>
                <th>Sức Chứa / Hiện Tại</th>
                <th>Loại Xe</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td style={{ fontWeight: 600 }}>{v.name}</td>
                  <td>{v.licensePlate}</td>
                  <td>{v.busCompany?.name}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: v._count?.seats >= v.capacity ? "var(--red)" : "var(--primary)" }}>
                      {v._count?.seats || 0}
                    </span> / {v.capacity} ghế
                  </td>
                  <td>{v.vehicleType}</td>
                  <td>
                    <select 
                      className="input"
                      style={{ height: 32, padding: "0 8px", fontSize: 13, width: "160px" }}
                      value={v.status}
                      onChange={(e) => handleStatusChange(v.id, e.target.value)}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <Link href={`/admin/vehicles/${v.id}/seats`} className="button outline" style={{ height: 28, fontSize: 12, padding: "0 12px" }}>
                      Quản lý Ghế
                    </Link>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                    Chưa có dữ liệu xe nào
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
