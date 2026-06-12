import { api } from "@/lib/api/client";

// Doctor authentication. Register signs the new account in immediately; the
// session lives in an httpOnly cookie, so getMe() restores it on page reload.
export const authApi = {
  register: ({ fullName, email, password }) =>
    api.post("/auth/register", { fullName, email, password }),
  login: ({ email, password }) => api.post("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout"),
  getMe: (opts) => api.get("/auth/me", opts),
};
