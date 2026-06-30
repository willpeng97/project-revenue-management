"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  setAuth: (user: AuthUser, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    { name: "m122-auth" }
  )
);

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "請求失敗");
  return data;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ user: AuthUser; accessToken: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ user: AuthUser }>("/api/auth/me"),
  dashboard: () => request<DashboardData>("/api/dashboard"),
  customers: () => request<Customer[]>("/api/customers"),
  createCustomer: (data: Partial<Customer>) =>
    request<Customer>("/api/customers", { method: "POST", body: JSON.stringify(data) }),
  pipelines: () => request<Pipeline[]>("/api/pipelines"),
  createPipeline: (data: Record<string, unknown>) =>
    request<Pipeline>("/api/pipelines", { method: "POST", body: JSON.stringify(data) }),
  updatePipeline: (id: string, data: Record<string, unknown>) =>
    request<Pipeline>(`/api/pipelines/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  quotations: () => request<Quotation[]>("/api/quotations"),
  createQuotation: (data: Record<string, unknown>) =>
    request<Quotation>("/api/quotations", { method: "POST", body: JSON.stringify(data) }),
  updateQuotation: (id: string, data: Record<string, unknown>) =>
    request<Quotation>(`/api/quotations/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  projects: () => request<Project[]>("/api/projects"),
  project: (id: string) => request<ProjectDetail>(`/api/projects/${id}`),
  updateProject: (id: string, data: Record<string, unknown>) =>
    request<Project>(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  tasks: (projectId?: string) =>
    request<Task[]>(`/api/tasks${projectId ? `?projectId=${projectId}` : ""}`),
  createTask: (data: Record<string, unknown>) =>
    request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id: string, data: Record<string, unknown>) =>
    request<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  workOrders: (projectId?: string) =>
    request<WorkOrder[]>(`/api/work-orders${projectId ? `?projectId=${projectId}` : ""}`),
  createWorkOrder: (data: Record<string, unknown>) =>
    request<WorkOrder>("/api/work-orders", { method: "POST", body: JSON.stringify(data) }),
  transfers: (projectId?: string) =>
    request<Transfer[]>(`/api/transfers${projectId ? `?projectId=${projectId}` : ""}`),
  createTransfer: (data: Record<string, unknown>) =>
    request<Transfer>("/api/transfers", { method: "POST", body: JSON.stringify(data) }),
  users: () => request<AuthUser[]>("/api/users"),
};

export interface DashboardData {
  pipeline: { count: number; amount: number; winRate: number; expectedRevenue: number };
  revenue: { monthIncome: number; monthCost: number; profit: number };
  transfer: { monthTotal: number; bySales: { name: string; amount: number }[] };
  project: { executing: number; upcoming: number; completed: number };
  task: { todo: number; doing: number; delayed: number };
}

export interface Customer {
  id: string;
  name: string;
  taxId?: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Pipeline {
  id: string;
  title: string;
  type: string;
  cost: string;
  successRate: number;
  expectedRevenue: string;
  status: string;
  customer: Customer;
  owner: { id: string; name: string };
}

export interface Quotation {
  id: string;
  version: number;
  totalPrice: string;
  status: string;
  paymentTerms?: string;
  pipeline: { customer: Customer; title: string };
  items?: { id: string; name: string; amount: string }[];
}

export interface Project {
  id: string;
  status: string;
  income: string;
  cost: string;
  startDate?: string;
  endDate?: string;
  manager: { id: string; name: string };
  quotation: { pipeline: { title: string; customer: Customer } };
}

export interface ProjectDetail extends Project {
  tasks: Task[];
  transfers: Transfer[];
  workOrders: WorkOrder[];
}

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  workHour: string;
  dueDate?: string;
  assignee?: { id: string; name: string };
  project?: { quotation: { pipeline: { title: string } } };
}

export interface WorkOrder {
  id: string;
  serviceDate: string;
  description: string;
  status: string;
  customer: Customer;
  engineer: { name: string };
  project?: { quotation: { pipeline: { title: string } } };
}

export interface Transfer {
  id: string;
  amount: string;
  type: string;
  date: string;
  remark?: string;
  creator: { name: string };
  project?: { quotation: { pipeline: { title: string } } };
}
