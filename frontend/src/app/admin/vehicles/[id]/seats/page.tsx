"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminService } from "@/services/adminService";

export default function AdminVehicleSeatsPage({ params }: { params: { id: string } }) {
  const vehicleId = parseInt(params.id);
  
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    seatCode: "",
    seatType: "standard",
    floor: "1",
  });

  const loadSeats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getVehicleSeats(vehicleId);
      setVehicleInfo(res.data.vehicle);
      setSeats(res.data.vehicle.seats || []);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Lỗi tải thông tin ghế");
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    if (vehicleId) loadSeats();
  }, [loadSeats, vehicleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seatCode) return;

    if (seats.length >= (vehicleInfo?.capacity || 0)) {
      alert(`Xe đã đạt sức chứa tối đa (${vehicleInfo?.capacity} ghế). Không thể thêm nữa.`);
      return;
    }

    try {
      setCreating(true);
      await adminService.createVehicleSeat(vehicleId, {
        seatCode: formData.seatCode.trim(),
        seatType: formData.seatType,
        floor: parseInt(formData.floor),
      });
      
      setFormData(prev => ({ ...prev, seatCode: "" })); // Reset only the code for easy mass adding
      loadSeats();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Lỗi khi tạo ghế");
    } finally {
      setCreating(false);
    }
  };

  if (loading && !vehicleInfo) {
    return <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/admin/vehicles" className="button outline" style={{ height: 32, padding: "0 12px" }}>
          ← Quay lại
        </Link>
        <div>
          <h1 style={{ fontSize: 24, margin: 0 }}>Sơ đồ / Quản lý Ghế</h1>
          {vehicleInfo && (
            <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
              Xe: {vehicleInfo.name} ({vehicleInfo.licensePlate}) - {vehicleInfo.busCompany?.name}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, alignItems: "start" }}>
        
        {/* Form thêm ghế nhanh */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Thêm ghế mới</h3>
          
          <div style={{ padding: 12, background: "#f8f9fa", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            Sức chứa: <strong>{vehicleInfo?.capacity || 0} ghế</strong><br/>
            Đã tạo: <strong style={{ color: seats.length >= vehicleInfo?.capacity ? "var(--red)" : "var(--primary)" }}>{seats.length} ghế</strong>
          </div>

          <form onSubmit={handleCreateSeat} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Mã ghế (VD: A1) *</label>
              <input 
                type="text" 
                className="input" 
                name="seatCode"
                value={formData.seatCode}
                onChange={handleChange}
                required
                autoFocus
                disabled={seats.length >= (vehicleInfo?.capacity || 0)}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Tầng *</label>
              <select className="input" name="floor" value={formData.floor} onChange={handleChange}>
                <option value="1">Tầng 1</option>
                <option value="2">Tầng 2</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Loại ghế *</label>
              <select className="input" name="seatType" value={formData.seatType} onChange={handleChange}>
                <option value="standard">Ghế ngồi thường (Standard)</option>
                <option value="sleeper">Giường nằm (Sleeper)</option>
                <option value="vip">Ghế VIP / Limousine</option>
              </select>
            </div>
            <button 
              type="submit" 
              className="button" 
              disabled={creating || seats.length >= (vehicleInfo?.capacity || 0)}
              style={{ marginTop: 8 }}
            >
              {creating ? "Đang thêm..." : "+ Thêm ghế này"}
            </button>
          </form>
        </div>

        {/* Danh sách ghế */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã Ghế</th>
                <th>Tầng</th>
                <th>Loại Ghế</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {seats.map(seat => (
                <tr key={seat.id}>
                  <td style={{ fontWeight: 600, color: "var(--primary)", fontSize: 16 }}>{seat.seatCode}</td>
                  <td>Tầng {seat.floor}</td>
                  <td>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: 4, 
                      fontSize: 12, 
                      background: seat.seatType === "vip" ? "#fff3cd" : seat.seatType === "sleeper" ? "#d1ecf1" : "#e2e3e5",
                      color: seat.seatType === "vip" ? "#856404" : seat.seatType === "sleeper" ? "#0c5460" : "#383d41"
                    }}>
                      {seat.seatType}
                    </span>
                  </td>
                  <td>
                    {seat.isActive ? (
                      <span style={{ color: "var(--green)" }}>Đang dùng</span>
                    ) : (
                      <span style={{ color: "var(--red)" }}>Đã khóa</span>
                    )}
                  </td>
                </tr>
              ))}
              {seats.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                    Xe này chưa cấu hình ghế nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
