"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AccountPage() {
  const { user, loading, refresh, logout } = useAuth();

  if (loading) {
    return (
      <section className="page-shell">
        <div className="message">Dang kiem tra phien dang nhap...</div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="page-shell">
        <div className="card panel account-card">
          <h1>Tai khoan</h1>
          <p className="muted">Ban chua dang nhap nen chua the xem thong tin getMe.</p>
          <div className="action-row">
            <Link className="button" href="/login">
              Dang nhap
            </Link>
            <Link className="button secondary" href="/register">
              Dang ky
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="page-title">
        <div>
          <h1>Tai khoan</h1>
          <p>Du lieu hien thi duoc lay tu GET /api/auth/me.</p>
        </div>
        <div className="action-row">
          <button className="button secondary" type="button" onClick={() => void refresh()}>
            Goi lai getMe
          </button>
          <button className="button danger" type="button" onClick={() => void logout()}>
            Dang xuat
          </button>
        </div>
      </div>

      <div className="card panel account-card">
        <div className="meta-grid">
          <div className="meta">
            <span>Ho ten</span>
            <strong>{user.fullName}</strong>
          </div>
          <div className="meta">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div className="meta">
            <span>So dien thoai</span>
            <strong>{user.phone ?? "Chua cap nhat"}</strong>
          </div>
          <div className="meta">
            <span>Vai tro</span>
            <strong>{user.role}</strong>
          </div>
          <div className="meta">
            <span>Trang thai</span>
            <strong>{user.status}</strong>
          </div>
          <div className="meta">
            <span>Ngay tao</span>
            <strong>{formatDate(user.createdAt)}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
