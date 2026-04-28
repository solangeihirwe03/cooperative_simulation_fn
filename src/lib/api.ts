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

export interface AdminMember {
  member_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  member_status: string;
  role: string;
  join_date: string;
  cooperative: {
    cooperative_id: number;
    cooperative_name: string;
  };
}

export interface CreateLoanPayload {
  loan_amount: number;
  interest_rate: number;
  repayment_period: number;
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

export type LoanStatus = "pending" | "approved" | "active" | "completed" | "cancelled";
export type MemberStatus = "active" | "inactive" | "suspended";
export type MemberRole = "admin" | "member";

export const adminApi = {
  getMembers: () => request<AdminMember[]>("/admin/members"),
  getMember: (memberId: number) => request<AdminMember>(`/admin/members/${memberId}`),
  updateMemberRole: (memberId: number, role: MemberRole) =>
    request<AdminMember>(`/admin/members/${memberId}`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),
  updateMemberStatus: (memberId: number, member_status: MemberStatus) =>
    request<AdminMember>(`/admin/members/${memberId}`, {
      method: "PUT",
      body: JSON.stringify({ member_status }),
    }),
  createLoan: (memberId: number, data: CreateLoanPayload) =>
    request<MemberLoan>(`/loans/members/${memberId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAllLoans: () => request<MemberLoan[]>("/loans/members"),
  getMemberLoans: (memberId: number) =>
    request<MemberLoan[]>(`/loans/${memberId}`),
  updateLoanStatus: (loanId: number, loanStatus: LoanStatus) =>
    request<MemberLoan>(`/loans/${loanId}/status`, {
      method: "PUT",
      body: JSON.stringify({ loan_status: loanStatus }),
    }),
  createContribution: (memberId: number, contribution_amount: number) =>
    request<MemberContribution>(`/admin/members/${memberId}/member_contribution`, {
      method: "POST",
      body: JSON.stringify({ contribution_amount }),
    }),
  getAllContributions: () =>
    request<MemberContributionSummary[]>("/member_contribution/members"),
};

export interface MemberContributionSummary {
  member_id: number;
  first_name: string;
  last_name: string;
  total_contribution: number;
}

// ─── Payments ────────────────────────────────────────────────

export interface LoanPayment {
  payment_id: number;
  loan_id: number;
  member_id: number;
  amount_paid: number;
  payment_date: string;
  recorded_by: number;
  created_at: string;
}

export const paymentsApi = {
  create: (loanId: number, memberId: number, amount_paid: number) =>
    request<LoanPayment>(`/payments/loan/${loanId}/member/${memberId}`, {
      method: "POST",
      body: JSON.stringify({ amount_paid }),
    }),
  getAll: () => request<LoanPayment[]>("/payments/"),
  getOne: (paymentId: number) => request<LoanPayment>(`/payments/${paymentId}`),
  getByLoan: (loanId: number) => request<LoanPayment[]>(`/payments/loan/${loanId}`),
  update: (paymentId: number, amount_paid: number) =>
    request<LoanPayment>(`/payments/${paymentId}`, {
      method: "PUT",
      body: JSON.stringify({ amount_paid }),
    }),
};

// ─── Simulation ──────────────────────────────────────────────

export interface SimulationPayload {
  contribution_amount: number;
  min_shares: number;
  max_shares: number;
  loan_multiplier: number;
  interest_rate: number;
  repayment_period: number;
  penalty_rate: number;
}

export type ScenarioStatus = "success" | "fail" | "risky";

export interface ScenarioResult {
  field: string;
  status: ScenarioStatus;
  message: string;
}

export interface SimulationIndicators {
  average_contribution_per_member: number;
  default_rate: number;
  loan_utilization_ratio: number;
}

export interface SimulationResponse {
  summary: string;
  scenarios: ScenarioResult[];
  indicators: SimulationIndicators;
}

export const simulationApi = {
  run: (data: SimulationPayload) =>
    request<SimulationResponse>("/simulation/run", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Policies ────────────────────────────────────────────────

export interface CreatePolicyPayload {
  policy_name: string;
  policy_description: string;
  contribution_amount: number;
  min_shares: number;
  max_shares: number;
  loan_multiplier: number;
  max_loan_amount: number;
  interest_rate: number;
  repayment_period: number;
  penalty_rate: number;
}

export interface Policy extends CreatePolicyPayload {
  policy_id: number;
  cooperative_id: number;
  is_active: boolean;
}

export const policiesApi = {
  create: (data: CreatePolicyPayload) =>
    request<Policy>("/policies/create_policy", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAll: () => request<Policy[]>("/policies/get_policies"),
  getOne: (policyId: number) =>
    request<Policy>(`/policies/policy/${policyId}`),
  update: (policyId: number, data: Partial<CreatePolicyPayload> & { is_active?: boolean }) =>
    request<Policy>(`/policies/update_policy/${policyId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
