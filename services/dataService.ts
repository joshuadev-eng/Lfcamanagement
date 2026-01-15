
import { Member, FinanceRecord, AttendanceRecord, Announcement, UserRole, FinanceCategory, ServiceType } from '../types';
import { supabase } from './supabaseClient';

type Listener = () => void;

class DataService {
  private members: Member[] = [];
  private finances: FinanceRecord[] = [];
  private attendance: AttendanceRecord[] = [];
  private listeners: Set<Listener> = new Set();
  private lastDeleted: { type: string; item: any } | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    // Initial fetch
    await Promise.all([
      this.fetchMembers(),
      this.fetchFinances(),
      this.fetchAttendance()
    ]);

    // Setup Realtime Subscriptions
    supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => this.fetchMembers())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_records' }, () => this.fetchFinances())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, () => this.fetchAttendance())
      .subscribe();
  }

  private async fetchMembers() {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .is('deleted_at', null)
      .order('full_name');
    if (data) {
      this.members = data;
      this.notify();
    }
  }

  private async fetchFinances() {
    const { data, error } = await supabase
      .from('finance_records')
      .select('*')
      .is('deleted_at', null)
      .order('recorded_at', { ascending: false });
    if (data) {
      this.finances = data;
      this.notify();
    }
  }

  private async fetchAttendance() {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (data) {
      this.attendance = data;
      this.notify();
    }
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // Members
  getMembers() { return this.members; }
  
  async addMember(m: Omit<Member, 'id' | 'join_date' | 'is_active'>) {
    const { error } = await supabase
      .from('members')
      .insert([{ 
        ...m, 
        join_date: new Date().toISOString(), 
        is_active: true 
      }]);
    if (!error) this.fetchMembers();
  }

  async updateMember(id: string, updates: Partial<Member>) {
    const { error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', id);
    if (!error) this.fetchMembers();
  }

  async deleteMember(id: string) {
    const item = this.members.find(m => m.id === id);
    if (item) {
      this.lastDeleted = { type: 'member', item: { ...item } };
      const { error } = await supabase
        .from('members')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (!error) this.fetchMembers();
    }
  }

  async uploadPhoto(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `member-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Finance
  getFinances() { return this.finances; }
  
  async addFinance(f: Omit<FinanceRecord, 'id' | 'recorded_at'>) {
    const { error } = await supabase
      .from('finance_records')
      .insert([{ ...f, recorded_at: new Date().toISOString() }]);
    if (!error) this.fetchFinances();
  }

  async deleteFinance(id: string) {
    const item = this.finances.find(f => f.id === id);
    if (item) {
      this.lastDeleted = { type: 'finance', item: { ...item } };
      const { error } = await supabase
        .from('finance_records')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (!error) this.fetchFinances();
    }
  }

  // Attendance
  getAttendance() { return this.attendance; }
  
  async addAttendance(a: Omit<AttendanceRecord, 'id' | 'created_at'>) {
    const { error } = await supabase
      .from('attendance_records')
      .insert([{ ...a, created_at: new Date().toISOString() }]);
    if (!error) this.fetchAttendance();
  }

  async deleteAttendance(id: string) {
    const item = this.attendance.find(a => a.id === id);
    if (item) {
      this.lastDeleted = { type: 'attendance', item: { ...item } };
      const { error } = await supabase
        .from('attendance_records')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (!error) this.fetchAttendance();
    }
  }

  async undo() {
    if (!this.lastDeleted) return;
    const { type, item } = this.lastDeleted;
    const tableMap: Record<string, string> = {
      member: 'members',
      finance: 'finance_records',
      attendance: 'attendance_records'
    };
    
    const { error } = await supabase
      .from(tableMap[type])
      .update({ deleted_at: null })
      .eq('id', item.id);

    if (!error) {
      this.lastDeleted = null;
      if (type === 'member') this.fetchMembers();
      if (type === 'finance') this.fetchFinances();
      if (type === 'attendance') this.fetchAttendance();
    }
  }

  getLastDeleted() { return this.lastDeleted; }
}

export const dataService = new DataService();
