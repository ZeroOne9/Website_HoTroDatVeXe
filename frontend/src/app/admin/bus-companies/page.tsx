"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminService } from "@/services/adminService";

export default function AdminBusCompaniesPage() {
  const [busCompanies, setBusCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBusCompanies = async () => {
    try {
      setLoading(true);
      const res = await adminService.getBusCompanies();
      setBusCompanies(res.data.busCompanies || []);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Lỗi tải danh sách nhà xe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusCompanies();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>Quản lý Nhà xe</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="button outline" onClick={loadBusCompanies}>Làm mới</button>
          <Link href="/admin/bus-companies/create" className="button">
            + Thêm nhà xe
          </Link>
        </div>
      </div>

      <div className="admin-table-container">
        {loading && busCompanies.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Nhà Xe</th>
                <th>Số Điện Thoại</th>
                <th>Email</th>
                <th>Địa Chỉ</th>
                <th>Tổng Số Xe</th>
              </tr>
            </thead>
            <tbody>
              {busCompanies.map(bc => (
                <tr key={bc.id}>
                  <td>{bc.id}</td>
                  <td style={{ fontWeight: 600 }}>{bc.name}</td>
                  <td>{bc.phone || "---"}</td>
                  <td>{bc.email || "---"}</td>
                  <td>{bc.address || "---"}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: "var(--primary)" }}>
                      {bc._count?.vehicles || 0}
                    </span> xe
                  </td>
                </tr>
              ))}
              {busCompanies.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                    Chưa có dữ liệu nhà xe nào
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
