import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const email = sessionStorage.getItem('reset_email') || '';
  const otp = sessionStorage.getItem('reset_otp') || '';

  useEffect(() => {
    if (!email || !otp) navigate('/forgot-password');
  }, [email, otp, navigate]);

  // Tính độ mạnh mật khẩu
  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(newPassword);
  const strengthLabel = ['', 'Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'][strength];
  const strengthColor = ['', '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981'][strength];
  const strengthWidth = `${(strength / 5) * 100}%`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự.'); return; }
    if (newPassword !== confirmPassword) { setError('Mật khẩu xác nhận không khớp.'); return; }

    setLoading(true);
    try {
      await api.post('/email/reset-password', { email, otp, new_password: newPassword });
      setSuccess(true);
      // Xóa session data
      sessionStorage.removeItem('reset_email');
      sessionStorage.removeItem('reset_otp');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-primary/5 via-background-light to-primary/10 dark:from-background-dark dark:via-background-dark dark:to-primary/20">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-primary/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 md:px-20 py-4 sticky top-0 z-50">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-8 flex items-center justify-center bg-primary text-white rounded-lg">
              <span className="material-symbols-outlined text-xl">smartphone</span>
            </div>
            <h1 className="text-slate-900 dark:text-slate-100 text-xl font-bold tracking-tight">MobileStore</h1>
          </Link>
          <Link to="/otp-verification" className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
        </header>

        {/* Main */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white dark:bg-slate-900/50 rounded-xl shadow-2xl shadow-primary/5 border border-primary/10 p-8">
            {success ? (
              <div className="text-center space-y-6 py-8">
                <div className="text-6xl animate-bounce">🎉</div>
                <h2 className="text-2xl font-bold text-green-600">Đặt lại mật khẩu thành công!</h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Mật khẩu của bạn đã được cập nhật. Đang chuyển đến trang đăng nhập...
                </p>
                <Link to="/login" className="inline-block bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                  Đăng nhập ngay
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-slate-900 dark:text-slate-100 text-3xl font-bold leading-tight mb-2">Thiết lập mật khẩu mới</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-base">Nhập mật khẩu mới cho tài khoản <strong>{email}</strong></p>
                </div>

                {error && (
                  <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="block text-slate-800 dark:text-slate-200 text-sm font-semibold">Mật khẩu mới</label>
                    <div className="relative flex items-center">
                      <input
                        className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 pr-12 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                        placeholder="Nhập mật khẩu mới"
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                      <button className="absolute right-4 text-slate-400 hover:text-primary transition-colors" type="button" onClick={() => setShowNew(!showNew)}>
                        <span className="material-symbols-outlined text-xl">{showNew ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="block text-slate-800 dark:text-slate-200 text-sm font-semibold">Xác nhận mật khẩu mới</label>
                    <div className="relative flex items-center">
                      <input
                        className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 pr-12 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                        placeholder="Nhập lại mật khẩu mới"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                      />
                      <button className="absolute right-4 text-slate-400 hover:text-primary transition-colors" type="button" onClick={() => setShowConfirm(!showConfirm)}>
                        <span className="material-symbols-outlined text-xl">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Password Strength */}
                  {newPassword && (
                    <div className="space-y-2 py-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Độ mạnh mật khẩu</span>
                        <span className="font-bold" style={{ color: strengthColor }}>{strengthLabel}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: strengthWidth, backgroundColor: strengthColor }}></div>
                      </div>
                      <ul className="space-y-1 text-xs">
                        <li className={`flex items-center gap-2 ${newPassword.length >= 6 ? 'text-green-500' : 'text-slate-400'}`}>
                          <span className="material-symbols-outlined text-sm">{newPassword.length >= 6 ? 'check_circle' : 'circle'}</span>
                          Ít nhất 6 ký tự
                        </li>
                        <li className={`flex items-center gap-2 ${/[A-Za-z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'text-green-500' : 'text-slate-400'}`}>
                          <span className="material-symbols-outlined text-sm">{/[A-Za-z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'check_circle' : 'circle'}</span>
                          Bao gồm chữ cái và số
                        </li>
                        <li className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-500' : 'text-slate-400'}`}>
                          <span className="material-symbols-outlined text-sm">{/[^A-Za-z0-9]/.test(newPassword) ? 'check_circle' : 'circle'}</span>
                          Ít nhất một ký tự đặc biệt (!@#)
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>Lưu mật khẩu mới <span className="material-symbols-outlined">lock_reset</span></>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
