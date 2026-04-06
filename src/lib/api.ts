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
  phone_number: string;
  cooperative_name: string;
}

export interface AuthResponse {
  token: string;
  token_type: string;
  user: MemberProfile;
  role: string;
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
  member_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  cooperative?: {
    cooperative_id: number;
    cooperative_name: string;
  };
  member_status?: string;
  role?: string;
  join_date?: string;
}

export interface MemberContribution {
  member_contribution_id: number;
  member_id: number;
  contribution_amount: number;
  contribution_date: string;
}

export interface MemberLoan {
  member_id: number;
  loan_amount: number;
  interest_rate: number;
  repayment_period: number;
  loan_id: number;
  issue_date: string;
  loan_status: string;
  interest_payable: number;
  repayment_amount: number;
  amount_paid: number;
  loan_balance: number;
}

export const memberApi = {
  getProfile: () => request<MemberProfile>("/members/member_profile"),

  updateProfile: (data: Partial<MemberProfile>) =>
    request<MemberProfile>("/members/update_member_profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getContributions: () => request<MemberContribution[]>("/members/my_contributions"),
  getLoans: () => request<MemberLoan[]>("/loans/me"),
};
