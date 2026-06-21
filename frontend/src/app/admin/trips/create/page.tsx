"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminService } from "@/services/adminService";

export default function AdminCreateTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [routes, setRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    routeId: "",
    vehicleId: "",
    departureTime: "",
    arrivalTime: "",
    priceVnd: "",
    status: "scheduled",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesRes, vehiclesRes] = await Promise.all([
          adminService.getRoutes(),
          adminService.getVehicles(),
        ]);
        setRoutes(routesRes.data.routes || []);
        setVehicles(vehiclesRes.data.vehicles || []);
      } catch (err) {
        console.error(err);
        alert("Lỗi khi tải dữ liệu Tuyến xe / Xe");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.routeId || !formData.vehicleId || !formData.departureTime || !formData.priceVnd) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        routeId: parseInt(formData.routeId),
        vehicleId: parseInt(formData.vehicleId),
        departureTime: new Date(formData.departureTime).toISOString(),
        arrivalTime: formData.arrivalTime ? new Date(formData.arrivalTime).toISOString() : undefined,
        priceVnd: parseInt(formData.priceVnd),
        status: formData.status
      };

      await adminService.createTrip(payload);
      alert("Tạo chuyến xe thành công!");
      router.push("/admin/trips");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Lỗi khi tạo chuyến xe");
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Đang tải cấu hình...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/admin/trips" className="button outline" style={{ height: 32, padding: "0 12px" }}>
          ← Quay lại
        </Link>
        <h1 style={{ fontSize: 24, margin: 0 }}>Tạo Chuyến Xe Mới</h1>
      </div>

      <div className="card" style={{ padding: 32, maxWidth: 800 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Tuyến đường (Route) *</label>
            <select 
              className="input" 
              name="routeId" 
              value={formData.routeId} 
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn tuyến đường --</option>
              {routes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.departureLocation?.name} → {r.destinationLocation?.name} (ID: {r.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Xe (Vehicle) *</label>
            <select 
              className="input" 
              name="vehicleId" 
              value={formData.vehicleId} 
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn xe --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} - Biển số: {v.licensePlate} ({v.busCompany?.name})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Thời gian xuất phát *</label>
              <input 
                type="datetime-local" 
                className="input" 
                name="departureTime"
                value={formData.departureTime}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Thời gian đến dự kiến</label>
              <input 
                type="datetime-local" 
                className="input" 
                name="arrivalTime"
                value={formData.arrivalTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Giá vé (VNĐ) *</label>
            <input 
              type="number" 
              className="input" 
              name="priceVnd"
              value={formData.priceVnd}
              onChange={handleChange}
              placeholder="VD: 250000"
              required
              min="0"
              step="1000"
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <button type="submit" className="button" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Đang xử lý..." : "Lưu chuyến xe"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
