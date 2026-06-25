"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminService } from "@/services/adminService";

export default function AdminCreateVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [busCompanies, setBusCompanies] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    busCompanyId: "",
    licensePlate: "",
    name: "",
    vehicleType: "",
    capacity: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await adminService.getBusCompanies();
        setBusCompanies(res.data.busCompanies || []);
      } catch (err) {
        console.error(err);
        alert("Lỗi khi tải danh sách nhà xe");
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
    if (!formData.busCompanyId || !formData.licensePlate || !formData.name || !formData.capacity) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        busCompanyId: parseInt(formData.busCompanyId),
        licensePlate: formData.licensePlate.trim(),
        name: formData.name.trim(),
        vehicleType: formData.vehicleType.trim(),
        capacity: parseInt(formData.capacity),
        status: "active"
      };

      await adminService.createVehicle(payload);
      alert("Thêm xe thành công!");
      router.push("/admin/vehicles");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Lỗi khi thêm xe");
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Đang tải danh sách nhà xe...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/admin/vehicles" className="button outline" style={{ height: 32, padding: "0 12px" }}>
          ← Quay lại
        </Link>
        <h1 style={{ fontSize: 24, margin: 0 }}>Thêm Xe Mới</h1>
      </div>

      <div className="card" style={{ padding: 32, maxWidth: 600 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Nhà xe quản lý *</label>
            <select 
              className="input" 
              name="busCompanyId" 
              value={formData.busCompanyId} 
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn nhà xe --</option>
              {busCompanies.map(bc => (
                <option key={bc.id} value={bc.id}>
                  {bc.name} {bc.phone ? `- SĐT: ${bc.phone}` : ""}
                </option>
              ))}
            </select>
            {busCompanies.length === 0 && (
              <div style={{ fontSize: 13, color: "var(--red)", marginTop: 4 }}>
                Hiện chưa có nhà xe nào. Tính năng tạo Nhà xe sẽ được xây dựng sau. Bạn có thể sử dụng database seed để thử nghiệm.
              </div>
            )}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Tên xe *</label>
            <input 
              type="text" 
              className="input" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Xe khách Hải Âu 01"
              required
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Biển số xe *</label>
            <input 
              type="text" 
              className="input" 
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              placeholder="VD: 51B-123.45"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Loại xe *</label>
              <input 
                type="text" 
                className="input" 
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                placeholder="VD: Giường nằm 40 chỗ"
                required
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Sức chứa (Tổng số ghế) *</label>
              <input 
                type="number" 
                className="input" 
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="VD: 40"
                min="1"
                required
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <button type="submit" className="button" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Đang xử lý..." : "Lưu thông tin xe"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
