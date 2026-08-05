import { AuthUser, UserRole } from '@/types';

const AUTH_SESSION_KEY = 'smk_pgri_2_auth_session';
const ADMIN_CREDS_KEY = 'smk_pgri_2_admin_creds';

export interface AdminCredentials {
  username: string;
  password: string;
  name: string;
}

export const DEFAULT_PUBLIC_USER: AuthUser = {
  role: 'PUBLIC_SISWA',
  name: 'Tamu / Siswa',
};

export class AuthService {
  /**
   * Get custom admin credentials or default
   */
  static getAdminCredentials(): AdminCredentials {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(ADMIN_CREDS_KEY);
        if (stored) {
          return JSON.parse(stored) as AdminCredentials;
        }
      } catch (e) {
        console.warn('Failed to parse admin creds:', e);
      }
    }
    return {
      username: 'admin',
      password: 'admin123',
      name: 'Panitia Utama Darmawisata',
    };
  }

  /**
   * Update admin credentials
   */
  static updateAdminCredentials(newCreds: AdminCredentials): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ADMIN_CREDS_KEY, JSON.stringify(newCreds));
      } catch (e) {
        console.warn('Failed to save admin creds:', e);
      }
    }
  }

  /**
   * Get current authenticated user session from sessionStorage
   */
  static getCurrentUser(): AuthUser {
    if (typeof window === 'undefined') return DEFAULT_PUBLIC_USER;
    try {
      const stored = sessionStorage.getItem(AUTH_SESSION_KEY);
      if (stored) {
        return JSON.parse(stored) as AuthUser;
      }
    } catch {
      // fallback
    }
    return DEFAULT_PUBLIC_USER;
  }

  /**
   * Save authenticated user session
   */
  static setCurrentUser(user: AuthUser): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
    } catch (err) {
      console.warn('SessionStorage save failed:', err);
    }
  }

  /**
   * Logout user and return to PUBLIC_SISWA
   */
  static logout(): AuthUser {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(AUTH_SESSION_KEY);
      } catch {
        // ignore
      }
    }
    return DEFAULT_PUBLIC_USER;
  }

  /**
   * Verify Admin Login
   */
  static loginAdmin(username: string, pass: string): { success: boolean; user?: AuthUser; message?: string } {
    const creds = this.getAdminCredentials();
    const isUsernameMatch = username.trim().toLowerCase() === creds.username.trim().toLowerCase();
    const isPassMatch = pass === creds.password || (creds.password === 'admin123' && pass === 'admin');

    if (isUsernameMatch && isPassMatch) {
      const user: AuthUser = {
        role: 'ADMIN',
        name: creds.name || 'Panitia Utama Darmawisata',
        username: creds.username,
      };
      this.setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: 'Username/Password Admin salah!' };
  }

  /**
   * Verify Wali Kelas Login
   */
  static loginWaliKelas(
    className: string,
    pass: string,
    teacherName: string,
    customPassword?: string
  ): { success: boolean; user?: AuthUser; message?: string } {
    const isValid = customPassword
      ? pass === customPassword
      : (pass === 'wali123' || pass === '123456' || pass === '');

    if (isValid) {
      const user: AuthUser = {
        role: 'WALI_KELAS',
        name: teacherName || `Wali Kelas ${className}`,
        username: `wali_${className.replace(/\s+/g, '_').toLowerCase()}`,
        assignedClassName: className,
      };
      this.setCurrentUser(user);
      return { success: true, user };
    }
    return { 
      success: false, 
      message: customPassword 
        ? 'Password Wali Kelas salah!' 
        : 'Password Wali Kelas salah! (Default: wali123)' 
    };
  }

  /**
   * Quick Login Helper
   */
  static quickLogin(role: UserRole, className?: string, teacherName?: string): AuthUser {
    let user: AuthUser;
    if (role === 'ADMIN') {
      user = {
        role: 'ADMIN',
        name: 'Panitia Utama (Admin)',
        username: 'admin',
      };
    } else if (role === 'WALI_KELAS') {
      const clsName = className || 'XII TKR 1';
      user = {
        role: 'WALI_KELAS',
        name: teacherName || `Wali Kelas ${clsName}`,
        username: `wali_${clsName.toLowerCase()}`,
        assignedClassName: clsName,
      };
    } else {
      user = DEFAULT_PUBLIC_USER;
    }
    this.setCurrentUser(user);
    return user;
  }
}
