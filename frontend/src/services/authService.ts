import { apiClient } from "@/services/apiClient";
import type { AuthResult, UserInfo } from "@/services/types";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
};

export const authService = {
  login(payload: LoginPayload) {
    return apiClient.post<AuthResult>("/api/auth/login", payload);
  },

  register(payload: RegisterPayload) {
    return apiClient.post<AuthResult>("/api/auth/register", payload);
  },

  getMe() {
    return apiClient.get<{ user: UserInfo }>("/api/auth/me");
  },

  logout() {
    return apiClient.post<{ loggedOut: true }>("/api/auth/logout");
  },
};
