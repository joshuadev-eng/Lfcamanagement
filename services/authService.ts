
import { UserRole } from '../types';
import { supabase } from './supabaseClient';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

type AuthListener = (session: UserSession | null, loading: boolean) => void;

class AuthService {
  private session: UserSession | null = null;
  private loading: boolean = true;
  private listeners: Set<AuthListener> = new Set();

  constructor() {
    this.init();
  }

  private async init() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        this.setSessionFromSupabase(session.user);
      }
    } catch (e) {
      console.error("Auth init error:", e);
    } finally {
      this.loading = false;
      this.notify();
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        this.setSessionFromSupabase(session.user);
      } else {
        this.session = null;
      }
      this.loading = false;
      this.notify();
    });
  }

  private setSessionFromSupabase(user: any) {
    const role = user.user_metadata?.role || UserRole.MEMBER;
    this.session = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      role: role as UserRole
    };
  }

  subscribe(listener: AuthListener) {
    this.listeners.add(listener);
    listener(this.session, this.loading);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l(this.session, this.loading));
  }

  async login(email: string, password: string): Promise<boolean> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return true;
  }

  async signup(email: string, password: string, name: string): Promise<boolean> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: UserRole.MEMBER
        }
      }
    });
    if (error) throw error;
    return true;
  }

  async logout() {
    await supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<boolean> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return true;
  }

  getSession() {
    return this.session;
  }
  
  isLoading() {
    return this.loading;
  }
}

export const authService = new AuthService();
