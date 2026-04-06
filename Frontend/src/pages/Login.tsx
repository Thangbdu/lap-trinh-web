import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Lấy returnUrl từ query string (VD: /login?returnUrl=/cart)
  const params = new URLSearchParams(location.search);
  const returnUrl = params.get('returnUrl') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      // Sau khi đăng nhập, redirect về returnUrl hoặc trang phù hợp
      if (returnUrl && returnUrl !== '/') {
        navigate(returnUrl);
      } else if (loggedUser?.role === 'admin') {
        navigate('/admin');
      } else if (loggedUser?.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden font-display">
        <div className="layout-container flex h-full grow flex-col">
          {/* Top Navigation Bar */}
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 lg:px-40 py-4 bg-white dark:bg-slate-900">
            <Link to="/" className="flex items-center gap-3 text-primary">
              <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary text-2xl">rocket_launch</span>
              </div>
              <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">MobileStore</h2>
            </Link>
            <div className="hidden md:flex flex-1 justify-end gap-8">
              <nav className="flex items-center gap-8">
                <a className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="#">Sản phẩm</a>
                <a className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="#">Khuyến mãi</a>
                <a className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="#">Tin tức</a>
                <a className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="#">Hỗ trợ</a>
              </nav>
            </div>
          </header>
          <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
            <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Decorative Banner */}
              <div className="h-32 w-full bg-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-900 opacity-90"></div>
                <div className="absolute -right-10 -top-10 size-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -bottom-10 size-40 bg-purple-400/20 rounded-full blur-3xl"></div>
                <div className="relative h-full flex flex-col items-center justify-center text-white p-4">
                  <span className="material-symbols-outlined text-4xl mb-1">fingerprint</span>
                  <p className="text-xs font-medium tracking-widest uppercase opacity-80">Security Portal</p>
                </div>
              </div>
              <div className="p-8 lg:p-10">
                {/* Header Section */}
                <div className="mb-8 text-center">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Đăng nhập</h1>
                  <p className="text-slate-500 dark:text-slate-400">Chào mừng bạn quay trở lại với MobileStore</p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email hoặc Số điện thoại</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">alternate_email</span>
                      <input
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                        placeholder="example@gmail.com"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mật khẩu</label>
                      <Link className="text-xs font-medium text-primary hover:underline" to="/forgot-password">Quên mật khẩu?</Link>
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                      <input
                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>
                  <button
                    className="w-full bg-primary hover:bg-purple-800 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <span>Truy cập ngay</span>
                        <span className="material-symbols-outlined text-lg">login</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Link */}
                <div className="mt-10 text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Chưa có tài khoản?
                    <Link className="text-primary font-bold hover:underline ml-1" to="/register">Đăng ký ngay</Link>
                  </p>
                </div>
              </div>
            </div>
          </main>
          {/* Footer */}
          <footer className="px-6 lg:px-40 py-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-500 dark:text-slate-400 text-sm">© 2026 MobileStore. Nâng tầm trải nghiệm công nghệ.</p>
              <div className="flex gap-6">
                <a className="text-slate-400 hover:text-primary transition-colors text-sm" href="#">Điều khoản</a>
                <a className="text-slate-400 hover:text-primary transition-colors text-sm" href="#">Bảo mật</a>
                <a className="text-slate-400 hover:text-primary transition-colors text-sm" href="#">Liên hệ</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
