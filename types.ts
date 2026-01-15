
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  PASTOR = 'pastor',
  DEPT_HEAD = 'dept_head',
  FINANCE_OFFICER = 'finance_officer',
  MEMBER = 'member'
}

export enum FinanceCategory {
  TITHE = 'Tithe',
  OFFERING = 'Offering',
  THANKSGIVING = 'Thanksgiving',
  SEED = 'Seed',
  WELFARE = 'Welfare',
  BUILDING_FUND = 'Building Fund',
  OTHER = 'Other'
}

export enum ServiceType {
  SUNDAY = 'Sunday Service',
  MIDWEEK = 'Midweek Service',
  PRAYER = 'Prayer Meeting',
  REVIVAL = 'Revival',
  CONFERENCE = 'Conference'
}

export interface Member {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  photo_url?: string;
  department?: string;
  role: UserRole;
  join_date: string;
  is_active: boolean;
  deleted_at?: string | null;
}

export interface AttendanceRecord {
  id: string;
  service_date: string;
  service_name: ServiceType;
  member_id?: string;
  is_visitor: boolean;
  visitor_name?: string;
  visitor_phone?: string;
  notes?: string;
  created_at: string;
  deleted_at?: string | null;
}

export interface FinanceRecord {
  id: string;
  category: FinanceCategory;
  amount: number;
  currency: 'LRD' | 'USD';
  member_id?: string;
  donor_name?: string;
  recorded_at: string;
  description?: string;
  deleted_at?: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  scheduled_for: string;
  created_at: string;
  deleted_at?: string | null;
}
