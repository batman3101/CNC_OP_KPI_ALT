// User types
export interface User {
  id: number;
  이메일: string;
  비밀번호: string;
  이름: string;
  권한: '관리자' | '사용자';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
}

// Worker types
export interface Worker {
  id: number;
  사번: string;
  이름: string;
  부서: string;
  라인번호: string;
}

// Production types
export interface Production {
  id: number;
  날짜: string;
  작업자: string;
  라인번호: string;
  모델차수: string;
  목표수량: number;
  생산수량: number;
  불량수량: number;
  특이사항?: string;
}

// Model types
export interface Model {
  id: number;
  model: string;
  process: string;
}

// KPI types
export interface KPIData {
  totalTarget: number;
  totalProduction: number;
  totalDefects: number;
  achievementRate: number;
  defectRate: number;
  efficiencyRate: number;
}

export interface WorkerStats {
  worker: string;
  line: string;
  totalTarget: number;
  totalProduction: number;
  totalDefects: number;
  achievementRate: number;
  defectRate: number;
  efficiencyRate: number;
}

// Filter types
export interface ProductionFilter {
  startDate?: string;
  endDate?: string;
  worker?: string;
  line?: string;
  model?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Theme types
export type ThemeMode = 'light' | 'dark';

// Language types
export type Language = 'ko' | 'vi';
