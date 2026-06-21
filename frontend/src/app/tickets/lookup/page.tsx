"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { formatMoney } from "@/lib/format";
import { bookingService } from "@/services/bookingService";
import type { BookingDetail } from "@/services/types";

function LookupContent() {
  const searchParams = useSearchParams();
  const initCode = searchParams.get("bookingCode") || "";

  const [bookingCode, setBookingCode] = useState(initCode);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBooking = async (code: string) => {
    setLoading(true);
    setError("");
    setBooking(null);
    try {
      const res = await bookingService.getBooking(code);
      setBooking(res.data.booking);
    } catch (err: any) {
      setError(err.message || "Không tìm thấy thông tin đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initCode) fetchBooking(initCode);
  }, [initCode]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (bookingCode) fetchBooking(bookingCode);
  }

  async function handleConfirm() {
    if (!booking) return;
    if (!confirm("Xác nhận thanh toán mô phỏng cho vé này?")) return;
    try {
      await bookingService.confirmBooking(booking.bookingCode);
      alert("Thanh toán thành công! Vé đã được phát hành.");
      fetchBooking(booking.bookingCode);
    } catch (err) {
      alert("Lỗi thanh toán.");
    }
  }

  const statusMap = {
    pending: { text: "Chờ thanh toán", class: "status warning" },
    confirmed: { text: "Đã thanh toán", class: "status" },
    cancelled: { text: "Đã hủy", class: "status danger" },
    expired: { text: "Hết hạn", class: "status danger" }
  };

  return (
    <div className="page-shell">
      <div style={{maxWidth: 800, margin: '0 auto'}}>
        <h1 style={{fontSize: 24, marginBottom: 24, textAlign: 'center'}}>Tra cứu thông tin đặt vé</h1>
        
        <form onSubmit={handleSearch} style={{display: 'flex', gap: 12, marginBottom: 32}}>
          <div className="field-input-wrapper" style={{flexGrow: 1}}>
            <input 
              value={bookingCode} 
              onChange={e => setBookingCode(e.target.value)} 
              placeholder="Nhập mã đặt vé (VD: BK...)" 
              required
            />
          </div>
          <button type="submit" className="button" disabled={loading}>
            Tra cứu
          </button>
        </form>

        {loading && <div className="text-center">Đang tra cứu...</div>}
        {error && <div className="message error">{error}</div>}

        {booking && (
          <div className="card" style={{padding: 0, overflow: 'hidden'}}>
            <div style={{background: 'var(--primary)', color: 'white', padding: 20, textAlign: 'center'}}>
              <div style={{fontSize: 14, opacity: 0.9}}>Mã đơn hàng</div>
              <div style={{fontSize: 28, fontWeight: 800, letterSpacing: 2, marginTop: 4}}>{booking.bookingCode}</div>
              <div style={{marginTop: 12}}>
                <span className={statusMap[booking.status].class} style={{background: 'white'}}>
                  {statusMap[booking.status].text}
                </span>
              </div>
            </div>

            <div style={{padding: 24}}>
              <div className="checkout-layout" style={{gridTemplateColumns: '1fr 1fr'}}>
                <div>
                  <h3 style={{fontSize: 16, marginBottom: 16, color: 'var(--muted)'}}>Thông tin chuyến đi</h3>
                  <div className="summary-row">
                    <span>Tuyến xe</span>
                    <strong>{booking.bookingSeats[0].trip.route.departureLocation.name} - {booking.bookingSeats[0].trip.route.destinationLocation.name}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Ngày giờ</span>
                    <strong>{new Date(booking.bookingSeats[0].trip.departureTime).toLocaleString("vi-VN")}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Nhà xe</span>
                    <strong>{booking.bookingSeats[0].trip.vehicle.busCompany.name}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Ghế ({booking.bookingSeats.length})</span>
                    <strong style={{color: 'var(--primary)'}}>{booking.bookingSeats.map(s => s.seat.seatCode).join(", ")}</strong>
                  </div>
                </div>

                <div>
                  <h3 style={{fontSize: 16, marginBottom: 16, color: 'var(--muted)'}}>Thông tin hành khách</h3>
                  <div className="summary-row">
                    <span>Họ tên</span>
                    <strong>{booking.passengerName}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Số điện thoại</span>
                    <strong>{booking.passengerPhone}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Email</span>
                    <strong>{booking.passengerEmail || '---'}</strong>
                  </div>
                  <div className="summary-row total">
                    <span>Tổng tiền</span>
                    <strong style={{fontSize: 20, color: 'var(--primary)'}}>{formatMoney(booking.totalFareVnd)}</strong>
                  </div>
                </div>
              </div>

              {booking.status === 'pending' && (
                <div style={{marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--line)', textAlign: 'right'}}>
                  <button className="button" style={{height: 48}} onClick={handleConfirm}>
                    Xác nhận thanh toán
                  </button>
                </div>
              )}

              {booking.status === 'confirmed' && (
                <div style={{marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--line)'}}>
                  <h3 style={{fontSize: 16, marginBottom: 16, color: 'var(--text)'}}>Mã vé / QR Code</h3>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {booking.bookingSeats.map(seat => seat.ticket && (
                      <div key={seat.id} style={{ background: "#f8f9fa", padding: 16, borderRadius: 8, border: "1px dashed var(--line)", minWidth: 200 }}>
                        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Ghế {seat.seat.seatCode}</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)", letterSpacing: 1 }}>{seat.ticket.code}</div>
                        <div style={{ fontSize: 12, marginTop: 8, color: seat.ticket.status === 'used' ? 'var(--muted)' : '#00a54f', fontWeight: 600 }}>
                          {seat.ticket.status === 'used' ? 'Đã sử dụng' : 'Hợp lệ'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense fallback={<div className="page-shell"><div className="message">Dang tai...</div></div>}>
      <LookupContent />
    </Suspense>
  );
}
