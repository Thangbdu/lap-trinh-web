import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../utils/api';

interface UserProfile {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
}

interface Address {
  address_id: number;
  recipient_name: string;
  phone_number: string;
  full_address: string;
  is_default: number;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login?returnUrl=/profile', { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) return null;

  return <ProfileContent />;
}

function ProfileContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = (location.state as any)?.tab;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Tab state — mở tab từ navigation state nếu có
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'address' | 'wishlist'>(initialTab === 'address' ? 'address' : initialTab === 'wishlist' ? 'wishlist' : 'info');

  const [wishlist, setWishlist] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Form chỉnh sửa thông tin
  const [editForm, setEditForm] = useState({ full_name: '', phone: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');

  // Form đổi mật khẩu
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // Địa chỉ
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrForm, setAddrForm] = useState({ recipient_name: '', phone_number: '', full_address: '' });
  const [editAddr, setEditAddr] = useState<Address | null>(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrMsg, setAddrMsg] = useState('');

  // Load profile
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get<UserProfile>('/auth/profile');
        if (res.success && res.data) {
          setProfile(res.data);
          setEditForm({ full_name: res.data.full_name, phone: res.data.phone || '' });
        }
      } finally { setLoadingProfile(false); }
    };
    fetch();
  }, []);

  // Load addresses
  const loadAddresses = async () => {
    setAddrLoading(true);
    try {
      const res = await api.get<Address[]>('/addresses');
      if (res.success && res.data) setAddresses(res.data);
    } finally { setAddrLoading(false); }
  };

  useEffect(() => { if (activeTab === 'address') loadAddresses(); }, [activeTab]);

  const loadWishlist = async () => {
    setWishlistLoading(true);
    try {
      const res = await api.get<any[]>('/wishlist');
      if (res.success && res.data) setWishlist(res.data);
    } finally { setWishlistLoading(false); }
  };

  useEffect(() => { if (activeTab === 'wishlist') loadWishlist(); }, [activeTab]);

  const handleRemoveWishlist = async (id: number) => {
    try {
      await api.delete(`/wishlist/${id}`);
      setWishlist(prev => prev.filter(p => p.product_id !== id));
    } catch (err: any) { alert(err.message); }
  };

  // Lưu thông tin
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.full_name.trim()) { setEditError('Họ tên không được để trống.'); return; }
    setEditLoading(true); setEditError(''); setEditSuccess('');
    try {
      await api.put('/auth/profile', { full_name: editForm.full_name, phone: editForm.phone });
      setProfile(p => p ? { ...p, full_name: editForm.full_name, phone: editForm.phone } : p);
      setEditSuccess('Cập nhật thông tin thành công!');
      setTimeout(() => setEditSuccess(''), 3000);
    } catch (err: any) {
      setEditError(err.message || 'Cập nhật thất bại.');
    } finally { setEditLoading(false); }
  };

  // Đổi mật khẩu
  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (!pwForm.current_password || !pwForm.new_password || !pwForm.confirm_password) {
      setPwError('Vui lòng điền đầy đủ các trường.'); return;
    }
    if (pwForm.new_password.length < 6) { setPwError('Mật khẩu mới phải có ít nhất 6 ký tự.'); return; }
    if (pwForm.new_password !== pwForm.confirm_password) { setPwError('Mật khẩu xác nhận không khớp.'); return; }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', { current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwSuccess('Đổi mật khẩu thành công! Đang đăng xuất...');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(async () => { await logout(); navigate('/login'); }, 2500);
    } catch (err: any) {
      setPwError(err.message || 'Đổi mật khẩu thất bại.');
    } finally { setPwLoading(false); }
  };

  // Lưu địa chỉ (thêm hoặc sửa)
  const handleSaveAddr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrForm.recipient_name.trim() || !addrForm.phone_number.trim() || !addrForm.full_address.trim()) {
      setAddrMsg('error:Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    setAddrSaving(true); setAddrMsg('');
    try {
      if (editAddr) {
        await api.put(`/addresses/${editAddr.address_id}`, addrForm);
      } else {
        await api.post('/addresses', addrForm);
      }
      setAddrMsg('success:Lưu địa chỉ thành công!');
      setShowAddrForm(false);
      setEditAddr(null);
      setAddrForm({ recipient_name: '', phone_number: '', full_address: '' });
      loadAddresses();
      setTimeout(() => setAddrMsg(''), 3000);
    } catch (err: any) {
      setAddrMsg(`error:${err.message || 'Lưu thất bại.'}`);
    } finally { setAddrSaving(false); }
  };

  const handleDeleteAddr = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    try { await api.delete(`/addresses/${id}`); loadAddresses(); }
    catch (err: any) { alert(err.message); }
  };

  const handleSetDefault = async (id: number) => {
    try { await api.patch(`/addresses/${id}/default`, {}); loadAddresses(); }
    catch (err: any) { alert(err.message); }
  };

  const openEditAddr = (addr: Address) => {
    setEditAddr(addr);
    setAddrForm({ recipient_name: addr.recipient_name, phone_number: addr.phone_number, full_address: addr.full_address });
    setShowAddrForm(true);
  };

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
  const joinDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' }) : '';

  const TABS = [
    { key: 'info', icon: 'person_edit', label: 'Chỉnh sửa hồ sơ' },
    { key: 'password', icon: 'lock_reset', label: 'Đổi mật khẩu' },
    { key: 'address', icon: 'location_on', label: 'Địa chỉ' },
    { key: 'wishlist', icon: 'favorite', label: 'Yêu thích' },
  ] as const;

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-display">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#3a0070] shadow-lg border-b border-purple-900/40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-xl text-[#4B0082]">smartphone</span>
            </div>
            <span className="text-white font-bold tracking-tight">MobileStore</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors px-2 py-1">
              <span className="material-symbols-outlined text-base">home</span>
              <span className="hidden sm:block">Trang chủ</span>
            </Link>
            <button onClick={async () => { await logout(); navigate('/'); }}
              className="flex items-center gap-1 text-sm px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <span className="material-symbols-outlined text-base">logout</span>
              <span className="hidden sm:block">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-5">

        {/* ── Profile Card ── */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800">
          {/* Banner + avatar wrapper dùng relative/absolute */}
          <div className="relative">
            {/* Banner */}
            <div className="h-28 bg-gradient-to-r from-[#4B0082] via-purple-700 to-indigo-600 rounded-t-2xl overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            </div>
            {/* Avatar — absolute, nửa trên / nửa dưới banner */}
            <div className="absolute left-6 bottom-0 translate-y-1/2 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4B0082] to-purple-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-slate-900 shadow-xl">
              {profile ? getInitials(profile.full_name) : '?'}
            </div>
          </div>
          {/* Info row — padding-top để nhường chỗ cho avatar */}
          <div className="px-6 pt-14 pb-5">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">{profile?.full_name || '...'}</h2>
              <p className="text-slate-400 text-sm">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs bg-purple-900/50 text-purple-300 border border-purple-700/50 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified</span>Thành viên
                </span>
                {joinDate && <span className="text-xs text-slate-500 flex items-center gap-1"><span className="material-symbols-outlined text-xs">calendar_month</span>Tham gia {joinDate}</span>}
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: 'mail', label: 'Email', value: profile?.email || '—' },
                { icon: 'call', label: 'Số điện thoại', value: profile?.phone || 'Chưa cập nhật' },
                { icon: 'shopping_bag', label: 'Đơn hàng', value: <Link to="/order-history" className="text-purple-400 font-bold hover:underline">Xem lịch sử →</Link> },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5 p-3 bg-slate-800/60 rounded-xl">
                  <span className="material-symbols-outlined text-purple-500 text-lg flex-shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="text-sm font-semibold truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-800 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${activeTab === tab.key
                  ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {loadingProfile ? (
              <div className="text-center py-10">
                <svg className="animate-spin h-7 w-7 text-purple-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-slate-500 text-sm">Đang tải...</p>
              </div>
            ) : (
              <>
                {/* ─── TAB: Thông tin ─── */}
                {activeTab === 'info' && (
                  <form onSubmit={handleSaveInfo} className="space-y-4 max-w-md">
                    <h3 className="text-base font-bold text-white">Thông tin cá nhân</h3>
                    {editSuccess && <Alert type="success" msg={editSuccess} />}
                    {editError && <Alert type="error" msg={editError} />}
                    <Field label="Họ và tên" required icon="person">
                      <input type="text" value={editForm.full_name}
                        onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                        placeholder="Nhập họ và tên"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-white text-sm" />
                    </Field>
                    <Field label="Email" icon="mail" note="Email không thể thay đổi.">
                      <input type="email" value={profile?.email || ''} disabled
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-700 rounded-xl text-slate-500 text-sm cursor-not-allowed" />
                    </Field>
                    <Field label="Số điện thoại" icon="call">
                      <input type="tel" value={editForm.phone}
                        onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="VD: 0901234567"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-white text-sm" />
                    </Field>
                    <button type="submit" disabled={editLoading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl transition-all disabled:opacity-60 text-sm">
                      {editLoading ? <Spinner /> : <span className="material-symbols-outlined text-base">save</span>}
                      {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </form>
                )}

                {/* ─── TAB: Đổi mật khẩu ─── */}
                {activeTab === 'password' && (
                  <form onSubmit={handleChangePw} className="space-y-4 max-w-md">
                    <div>
                      <h3 className="text-base font-bold text-white">Đổi mật khẩu</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Mật khẩu mới tối thiểu 6 ký tự. Sau khi đổi sẽ đăng xuất tự động.</p>
                    </div>
                    {pwSuccess && <Alert type="success" msg={pwSuccess} />}
                    {pwError && <Alert type="error" msg={pwError} />}
                    {([
                      { fkey: 'current_password', label: 'Mật khẩu hiện tại', showKey: 'current' as const },
                      { fkey: 'new_password', label: 'Mật khẩu mới', showKey: 'new' as const },
                      { fkey: 'confirm_password', label: 'Xác nhận mật khẩu mới', showKey: 'confirm' as const },
                    ] as const).map(field => (
                      <React.Fragment key={field.fkey}>
                        <Field label={field.label} icon="lock">
                          <input
                            type={showPw[field.showKey] ? 'text' : 'password'}
                            value={pwForm[field.fkey]}
                            onChange={e => setPwForm(f => ({ ...f, [field.fkey]: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-white text-sm"
                          />
                          <button type="button" onClick={() => setShowPw(s => ({ ...s, [field.showKey]: !s[field.showKey] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400">
                            <span className="material-symbols-outlined text-lg">{showPw[field.showKey] ? 'visibility_off' : 'visibility'}</span>
                          </button>
                        </Field>
                      </React.Fragment>
                    ))}
                    <button type="submit" disabled={pwLoading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl transition-all disabled:opacity-60 text-sm">
                      {pwLoading ? <Spinner /> : <span className="material-symbols-outlined text-base">lock_reset</span>}
                      {pwLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </button>
                  </form>
                )}

                {/* ─── TAB: Địa chỉ ─── */}
                {activeTab === 'address' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">Sổ địa chỉ</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Quản lý địa chỉ giao hàng của bạn</p>
                      </div>
                      <button
                        onClick={() => { setEditAddr(null); setAddrForm({ recipient_name: '', phone_number: '', full_address: '' }); setShowAddrForm(v => !v); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-sm font-bold rounded-xl transition-all"
                      >
                        <span className="material-symbols-outlined text-base">{showAddrForm && !editAddr ? 'close' : 'add_location'}</span>
                        {showAddrForm && !editAddr ? 'Hủy' : 'Thêm địa chỉ'}
                      </button>
                    </div>

                    {/* Message */}
                    {addrMsg && (
                      <Alert type={addrMsg.startsWith('error:') ? 'error' : 'success'} msg={addrMsg.replace(/^(error|success):/, '')} />
                    )}

                    {/* Form thêm / sửa địa chỉ */}
                    {showAddrForm && (
                      <form onSubmit={handleSaveAddr} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-3">
                        <h4 className="text-sm font-bold text-purple-300">{editAddr ? '✏️ Sửa địa chỉ' : '➕ Thêm địa chỉ mới'}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field label="Họ tên người nhận" required icon="person" compact>
                            <input value={addrForm.recipient_name}
                              onChange={e => setAddrForm(f => ({ ...f, recipient_name: e.target.value }))}
                              placeholder="Họ và tên người nhận"
                              className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-white text-sm" />
                          </Field>
                          <Field label="Số điện thoại" required icon="call" compact>
                            <input value={addrForm.phone_number}
                              onChange={e => setAddrForm(f => ({ ...f, phone_number: e.target.value }))}
                              placeholder="SĐT người nhận"
                              className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-white text-sm" />
                          </Field>
                        </div>
                        <Field label="Địa chỉ đầy đủ" required icon="home" compact>
                          <input value={addrForm.full_address}
                            onChange={e => setAddrForm(f => ({ ...f, full_address: e.target.value }))}
                            placeholder="VD: 12 Nguyễn Huệ, P.Bến Nghé, Q.1, TP.HCM"
                            className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-white text-sm" />
                        </Field>
                        <div className="flex gap-2 pt-1">
                          <button type="submit" disabled={addrSaving}
                            className="flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-60">
                            {addrSaving ? <Spinner /> : <span className="material-symbols-outlined text-base">save</span>}
                            {addrSaving ? 'Đang lưu...' : (editAddr ? 'Cập nhật' : 'Lưu địa chỉ')}
                          </button>
                          <button type="button"
                            onClick={() => { setShowAddrForm(false); setEditAddr(null); }}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-xl text-sm transition-all">
                            Hủy
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Danh sách địa chỉ */}
                    {addrLoading ? (
                      <div className="text-center py-8"><Spinner /><p className="text-slate-500 text-sm mt-2">Đang tải...</p></div>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-2xl">
                        <span className="material-symbols-outlined text-4xl text-slate-600 block mb-2">location_off</span>
                        <p className="text-slate-500 text-sm">Bạn chưa có địa chỉ nào.</p>
                        <p className="text-xs text-slate-600 mt-1">Nhấn "Thêm địa chỉ" để bắt đầu.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {addresses.map(addr => (
                          <div key={addr.address_id}
                            className={`relative p-4 rounded-2xl border transition-all ${addr.is_default ? 'border-purple-600 bg-purple-900/10' : 'border-slate-700 bg-slate-800/40'}`}>
                            {addr.is_default && (
                              <span className="absolute top-3 right-3 text-xs bg-purple-700 text-white px-2 py-0.5 rounded-full font-bold">Mặc định</span>
                            )}
                            <div className="flex items-start gap-3 pr-20">
                              <span className="material-symbols-outlined text-purple-500 mt-0.5">location_on</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-sm">{addr.recipient_name}</p>
                                <p className="text-slate-400 text-xs mt-0.5">{addr.phone_number}</p>
                                <p className="text-slate-400 text-xs mt-1">{addr.full_address}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50">
                              {!addr.is_default && (
                                <button onClick={() => handleSetDefault(addr.address_id)}
                                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors">
                                  <span className="material-symbols-outlined text-xs">star</span>Đặt mặc định
                                </button>
                              )}
                              <button onClick={() => openEditAddr(addr)}
                                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors ml-auto">
                                <span className="material-symbols-outlined text-xs">edit</span>Sửa
                              </button>
                              <button onClick={() => handleDeleteAddr(addr.address_id)}
                                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition-colors">
                                <span className="material-symbols-outlined text-xs">delete</span>Xóa
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── TAB: Yêu thích ─── */}
                {activeTab === 'wishlist' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white">Sản phẩm yêu thích</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Các sản phẩm bạn đã lưu để xem sau</p>
                    </div>

                    {wishlistLoading ? (
                      <div className="text-center py-8"><Spinner /><p className="text-slate-500 text-sm mt-2">Đang tải...</p></div>
                    ) : wishlist.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-2xl">
                        <span className="material-symbols-outlined text-4xl text-slate-600 block mb-2">heart_broken</span>
                        <p className="text-slate-500 text-sm">Danh sách yêu thích trống.</p>
                        <Link to="/" className="text-purple-400 text-xs mt-2 inline-block hover:underline">Quay lại mua sắm ngay!</Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {wishlist.map(p => (
                          <div key={p.product_id} className="flex items-center gap-4 p-3 bg-slate-800/40 border border-slate-700 rounded-2xl group hover:border-purple-500/50 transition-all">
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 shrink-0">
                              <img src={getImageUrl(p.thumbnail_url) || getImageUrl(p.primary_image) || ''} alt={p.product_name} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link to={`/product/${p.product_id}`} className="font-bold text-sm text-white truncate block hover:text-purple-400 transition-colors">{p.product_name}</Link>
                              <p className="text-purple-400 font-bold text-xs mt-0.5">{new Intl.NumberFormat('vi-VN').format(p.price)}đ</p>
                            </div>
                            <button
                              onClick={() => handleRemoveWishlist(p.product_id)}
                              className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                              title="Xóa khỏi yêu thích"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/order-history', icon: 'receipt_long', label: 'Đơn hàng', color: 'text-blue-400' },
            { onClick: () => setActiveTab('wishlist'), icon: 'favorite', label: 'Yêu thích', color: 'text-red-400' },
            { to: '/cart', icon: 'shopping_cart', label: 'Giỏ hàng', color: 'text-purple-400' },
            { to: '/', icon: 'store', label: 'Mua sắm', color: 'text-green-400' },
          ].map((item, idx) => (
            item.to ? (
              <Link key={idx} to={item.to}
                className="flex flex-col items-center gap-2 p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-purple-700/60 hover:bg-slate-800 transition-all group">
                <span className={`material-symbols-outlined text-2xl ${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</span>
                <span className="text-xs font-semibold text-slate-300">{item.label}</span>
              </Link>
            ) : (
              <button key={idx} onClick={item.onClick}
                className="flex flex-col items-center gap-2 p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-purple-700/60 hover:bg-slate-800 transition-all group">
                <span className={`material-symbols-outlined text-2xl ${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</span>
                <span className="text-xs font-semibold text-slate-300">{item.label}</span>
              </button>
            )
          ))}
        </div>
      </main>
    </div>
  );
}

// ── Shared Components ──────────────────────────────────────────────────────────
function Field({ label, icon, required, note, compact, children }: {
  label: string; icon: string; required?: boolean; note?: string; compact?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className={`block text-xs font-semibold text-slate-400 mb-1 ${compact ? '' : 'mb-1.5'}`}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">{icon}</span>
        {children}
      </div>
      {note && <p className="text-xs text-slate-500 mt-1">{note}</p>}
    </div>
  );
}

function Alert({ type, msg }: { type: 'success' | 'error'; msg: string }) {
  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium border ${type === 'success'
      ? 'bg-green-900/20 border-green-700/50 text-green-400'
      : 'bg-red-900/20 border-red-700/50 text-red-400'
      }`}>
      <span className="material-symbols-outlined text-base">{type === 'success' ? 'check_circle' : 'error'}</span>
      {msg}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
