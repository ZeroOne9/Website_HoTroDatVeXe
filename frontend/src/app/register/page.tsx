"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/services/apiClient";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(fullName, email, password, phone || undefined);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Khong the ket noi den may chu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="auth-container">
        <div className="card panel">
          <h1 style={{ margin: "0 0 8px", fontSize: 28 }}>Dang ky tai khoan</h1>
          <p className="muted" style={{ margin: "0 0 24px" }}>
            Tao tai khoan moi de dat ve nhanh hon.
          </p>

          {error && <div className="message error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label htmlFor="reg-fullname">Ho va ten</label>
              <input
                id="reg-fullname"
                type="text"
                required
                minLength={2}
                maxLength={120}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyen Van A"
                autoComplete="name"
              />
            </div>

            <div className="field">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="reg-phone">So dien thoai (tuy chon)</label>
              <input
                id="reg-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
                autoComplete="tel"
              />
            </div>

            <div className="field">
              <label htmlFor="reg-password">Mat khau</label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={6}
                maxLength={72}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="It nhat 6 ky tu"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="button" disabled={loading}>
              {loading ? "Dang xu ly..." : "Dang ky"}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: "center" }} className="muted">
            Da co tai khoan?{" "}
            <Link href="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>
              Dang nhap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
