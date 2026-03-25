const BASE_URL = "http://127.0.0.1:8000";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `Error ${res.status}`);
  }

  return res.json();
}


export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  cooperative: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: MemberProfile;
}

export const authApi = {
  login: (data: LoginPayload) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: RegisterPayload) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () => {
    localStorage.removeItem("access_token");
  },
};

// ─── Member Profile ──────────────────────────────────────────

export interface MemberProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  cooperative?: string;
  role?: string;
}

export const memberApi = {
  getProfile: () => request<MemberProfile>("/members/me"),

  updateProfile: (data: Partial<MemberProfile>) =>
    request<MemberProfile>("/members/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
