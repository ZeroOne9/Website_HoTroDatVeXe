"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { formatMoney } from "@/lib/format";
import { tripService } from "@/services/tripService";
import { bookingService } from "@/services/bookingService";
import type { TripDetailItem, SeatItem } from "@/services/types";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const tripId = Number(searchParams.get("tripId"));
  const seatIdsParam = searchParams.get("seatIds");
  const seatIds = useMemo(() => (seatIdsParam ? seatIdsParam.split(",").map(Number) : []), [seatIdsParam]);

  const [trip, setTrip] = useState<TripDetailItem | null>(null);
  const [seats, setSeats] = useState<SeatItem[]>([]);
  
  const [name, setName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tripId || seatIds.length === 0) {
      setError("Thông tin không hợp lệ.");
      setLoading(false);
      return;
    }

    tripService.getSeats(tripId)
      .then(res => {
        setTrip(res.data.trip);
        const selectedSeats = res.data.seats.filter(x => seatIds.includes(x.id));
        if (selectedSeats.length > 0) setSeats(selectedSeats);
        else setError("Không tìm thấy ghế.");
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [tripId, seatIds]);

  useEffect(() => {
    if (user) {
      if (!name) setName(user.fullName);
      if (!phone && user.phone) setPhone(user.phone);
      if (!email) setEmail(user.email);
    }
  }, [email, name, phone, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await bookingService.createBooking({
        tripId,
        seatIds,
        passengerName: name,
        passengerPhone: phone,
        passengerEmail: email || undefined
      });
      router.push(`/tickets/lookup?bookingCode=${res.data.booking.bookingCode}`);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi tạo đơn hàng.");
      setSubmitting(false);
    }
  }

  if (loading) return <div className="page-shell"><div className="message">Đang tải thông tin đơn hàng...</div></div>;
  if (error || !trip || seats.length === 0) return <div className="page-shell"><div className="message error">{error}</div></div>;

  const totalSeats = seats.length;
  const totalPrice = trip.priceVnd * totalSeats;

  return (
    <div className="page-shell">
      <h1 style={{fontSize: 24, marginBottom: 24}}>Xác nhận thông tin đặt vé</h1>

      <div className="checkout-layout">
        <form onSubmit={handleSubmit}>
          <div className="card">
            <h2 className="card-title">Thông tin hành khách</h2>
            
            {error && <div className="message error mb-4">{error}</div>}

            <div className="form-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
              <div className="field">
                <label>Họ và tên *</label>
                <div className="field-input-wrapper">
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="Tên người đi" />
                </div>
              </div>
              <div className="field">
                <label>Số điện thoại *</label>
                <div className="field-input-wrapper">
                  <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại liên hệ" />
                </div>
              </div>
              <div className="field" style={{gridColumn: '1 / span 2'}}>
                <label>Email (Tùy chọn để nhận vé)</label>
                <div className="field-input-wrapper">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email nhận vé" />
                </div>
              </div>
            </div>

            <div className="message mt-4">
              <strong>Lưu ý:</strong> Quý khách vui lòng kiểm tra kỹ thông tin trước khi tiếp tục. Vexere không chịu trách nhiệm nếu thông tin sai lệch.
            </div>
          </div>
        </form>

        <aside>
          <div className="card" style={{position: 'sticky', top: 90}}>
            <h2 className="card-title">Tóm tắt đơn hàng</h2>
            
            <div style={{marginBottom: 16}}>
              <div style={{fontWeight: 700, marginBottom: 4}}>{trip.route.departureLocation.name} - {trip.route.destinationLocation.name}</div>
              <div style={{fontSize: 13, color: 'var(--muted)'}}>{trip.vehicle.busCompany.name} • {trip.vehicle.vehicleType}</div>
            </div>

            <div className="summary-row">
              <span>Ngày đi</span>
              <strong>{new Date(trip.departureTime).toLocaleDateString("vi-VN")}</strong>
            </div>
            <div className="summary-row">
              <span>Giờ đi</span>
              <strong>{new Date(trip.departureTime).toLocaleTimeString("vi-VN", {hour:'2-digit', minute:'2-digit'})}</strong>
            </div>
            <div className="summary-row">
              <span>Số lượng ghế</span>
              <strong>{totalSeats} Ghế</strong>
            </div>
            <div className="summary-row">
              <span>Vị trí ghế</span>
              <strong style={{color: 'var(--primary)'}}>{seats.map(s => s.seatCode).join(", ")}</strong>
            </div>
            <div className="summary-row total">
              <span>Tổng tiền</span>
              <strong style={{fontSize: 22, color: 'var(--primary)'}}>{formatMoney(totalPrice)}</strong>
            </div>

            <button 
              className="button" 
              style={{width: '100%', marginTop: 24, height: 48}} 
              onClick={handleSubmit} 
              disabled={submitting}
            >
              {submitting ? "Đang xử lý..." : "Thanh toán"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="page-shell"><div className="message">Dang tai...</div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
