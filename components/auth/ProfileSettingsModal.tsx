'use client';

import React, { useState } from 'react';
import { AuthUser, SchoolClass } from '@/types';
import { AuthService } from '@/services/authService';
import { Modal } from '@/components/ui/Modal';
import {
  UserCheck,
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
} from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  classes: SchoolClass[];
  onUpdateClass: (updatedClass: SchoolClass) => void;
  onUpdateCurrentUser: (updatedUser: AuthUser) => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  classes,
  onUpdateClass,
  onUpdateCurrentUser,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';
  const isWaliKelas = currentUser.role === 'WALI_KELAS';

  // Find assigned class if Wali Kelas
  const assignedClassObj = isWaliKelas
    ? classes.find((c) => c.name === currentUser.assignedClassName)
    : null;

  // Form State - Admin
  const [adminName, setAdminName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  
  // Form State - Wali Kelas
  const [teacherName, setTeacherName] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');

  // Password Change State
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state on open transition
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setCurrentPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');

      if (isAdmin) {
        const creds = AuthService.getAdminCredentials();
        setAdminName(creds.name || currentUser.name || 'Panitia Utama Darmawisata');
        setAdminUsername(creds.username || currentUser.username || 'admin');
      } else if (isWaliKelas && assignedClassObj) {
        setTeacherName(assignedClassObj.homeroomTeacher || currentUser.name || '');
        setTeacherPhone(assignedClassObj.teacherPhone || '');
      }
    }
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Password validation if user wants to change password
    if (newPassword || confirmPassword || currentPasswordInput) {
      if (newPassword !== confirmPassword) {
        setErrorMsg('Password Baru dan Konfirmasi Password tidak cocok!');
        return;
      }
      if (newPassword.length < 4) {
        setErrorMsg('Password baru minimal harus 4 karakter!');
        return;
      }

      // Verify current password
      if (isAdmin) {
        const creds = AuthService.getAdminCredentials();
        if (currentPasswordInput !== creds.password) {
          setErrorMsg('Password Lama Admin yang Anda masukkan salah!');
          return;
        }
      } else if (isWaliKelas && assignedClassObj) {
        const expectedPass = assignedClassObj.teacherPassword || 'wali123';
        if (currentPasswordInput !== expectedPass) {
          setErrorMsg('Password Lama Wali Kelas yang Anda masukkan salah!');
          return;
        }
      }
    }

    if (isAdmin) {
      const creds = AuthService.getAdminCredentials();
      const finalPass = newPassword ? newPassword : creds.password;

      // Save admin credentials
      AuthService.updateAdminCredentials({
        name: adminName.trim(),
        username: adminUsername.trim(),
        password: finalPass,
      });

      const updatedUser: AuthUser = {
        ...currentUser,
        name: adminName.trim(),
        username: adminUsername.trim(),
      };

      AuthService.setCurrentUser(updatedUser);
      onUpdateCurrentUser(updatedUser);

      setSuccessMsg('Profil dan Password Admin berhasil diperbarui!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else if (isWaliKelas && assignedClassObj) {
      const finalPass = newPassword ? newPassword : (assignedClassObj.teacherPassword || 'wali123');

      const updatedClassObj: SchoolClass = {
        ...assignedClassObj,
        homeroomTeacher: teacherName.trim(),
        teacherPhone: teacherPhone.trim(),
        teacherPassword: finalPass,
      };

      onUpdateClass(updatedClassObj);

      const updatedUser: AuthUser = {
        ...currentUser,
        name: teacherName.trim(),
      };

      AuthService.setCurrentUser(updatedUser);
      onUpdateCurrentUser(updatedUser);

      setSuccessMsg(`Profil Wali Kelas ${assignedClassObj.name} berhasil diperbarui!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Profil & Password"
      subtitle="Kelola nama akun, data kontak, dan ubah kata sandi akses Anda"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Banner Role */}
        <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-3 border ${
          isAdmin
            ? 'bg-blue-50 border-blue-200 text-blue-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          {isAdmin ? (
            <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
          ) : (
            <UserCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          )}
          <div>
            <p className="font-extrabold text-sm">
              {isAdmin ? 'Akun Admin Panitia Utama' : `Akun Wali Kelas ${assignedClassObj?.name || ''}`}
            </p>
            <p className="text-[11px] opacity-80">
              {isAdmin
                ? 'Perubahan ini berlaku untuk kredensial login Admin Panitia.'
                : `Perubahan ini berlaku untuk akun Wali Kelas yang mengampu kelas ${assignedClassObj?.name || ''}.`}
            </p>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-bold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Section 1: Data Profil */}
        <div className="space-y-3 pt-1">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <User className="w-4 h-4 text-slate-600" /> Profil Pengguna
          </h4>

          {isAdmin ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Admin *
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Panitia Utama Darmawisata"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username Login Admin *
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="admin"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelas Diampu
                  </label>
                  <input
                    type="text"
                    disabled
                    value={assignedClassObj?.name || currentUser.assignedClassName || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kompetensi Keahlian
                  </label>
                  <input
                    type="text"
                    disabled
                    value={assignedClassObj?.department || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Wali Kelas *
                </label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nama Lengkap & Gelar Wali Kelas"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. HP / WhatsApp Aktif
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    placeholder="0812xxxxxxxx"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Section 2: Ubah Password */}
        <div className="space-y-3 pt-3">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <KeyRound className="w-4 h-4 text-amber-600" /> Ubah Password Akun (Opsional)
          </h4>
          <p className="text-[11px] text-slate-500">
            Isi bidang di bawah ini hanya jika Anda ingin mengganti kata sandi login Anda.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password Saat Ini
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showCurrentPass ? 'text' : 'password'}
                value={currentPasswordInput}
                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                placeholder="Masukkan password lama"
                className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password Baru
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password baru"
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
