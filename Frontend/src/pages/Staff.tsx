import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../utils/api';

interface Product {
  product_id: number;
  product_name: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  is_active: number;
  category_name?: string;
  brand_name?: string;
  thumbnail_url?: string;
  primary_image?: string;
}

interface Order {
  order_id: number;
  full_name: string;
  email: string;
  total_amount: number;
  final_amount: number;
  discount_amount: number;
  status: string;
  order_date: string;
}

interface User {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  is_active: number;
  created_at: string;
}

interface Category { category_id: number; category_name: string; }
interface Brand { brand_id: number; brand_name: string; }

type Tab = 'products' | 'orders' | 'users' | 'accounts';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const ORDER_STATUSES = ['Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'];

const statusColor: Record<string, string> = {
  'Chờ xác nhận': '#f59e0b', 'Đang xử lý': '#3b82f6',
  'Đang giao': '#8b5cf6', 'Đã giao': '#10b981', 'Đã hủy': '#ef4444',
};

// ─── Modal Product Form ────────────────────────────────────────────────────────
function ProductModal({ product, categories, brands, onClose, onSaved }: {
  product: Product | null;
  categories: Category[];
  brands: Brand[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    product_name: product?.product_name ?? '',
    price: product?.price ?? '',
    old_price: product?.old_price ?? '',
    stock_quantity: product?.stock_quantity ?? 0,
    category_id: '',
    brand_id: '',
    thumbnail_url: product?.thumbnail_url ?? '',
    description: '',
    is_active: product?.is_active ?? 1,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (isEdit) await api.put(`/products/${product!.product_id}`, form);
      else await api.post('/products', form);
      onSaved();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1e293b', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ background: '#0f172a', padding: '16px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#fff' }}>{isEdit ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <form onSubmit={submit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: '#450a0a', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ color: '#cbd5e1', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>Tên sản phẩm *
              <input name="product_name" value={form.product_name} onChange={handle} required style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 13 }} />
            </label>
            <label style={{ color: '#cbd5e1', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>Giá bán (₫) *
              <input name="price" type="number" value={form.price} onChange={handle} required style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 13 }} />
            </label>
            <label style={{ color: '#cbd5e1', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>Giá cũ (₫)
              <input name="old_price" type="number" value={form.old_price} onChange={handle} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 13 }} />
            </label>
            <label style={{ color: '#cbd5e1', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>Kho hàng *
              <input name="stock_quantity" type="number" value={form.stock_quantity} onChange={handle} required style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 13 }} />
            </label>
            <label style={{ color: '#cbd5e1', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>Danh mục
              <select name="category_id" value={form.category_id} onChange={handle} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 13 }}>
                <option value="">-- Chọn --</option>
                {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
              </select>
            </label>
            <label style={{ color: '#cbd5e1', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>Thương hiệu
              <select name="brand_id" value={form.brand_id} onChange={handle} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 13 }}>
                <option value="">-- Chọn --</option>
                {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
              </select>
            </label>
          </div>
          <label style={{ color: '#cbd5e1', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>URL ảnh thumbnail
            <input name="thumbnail_url" value={form.thumbnail_url} onChange={handle} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 13 }} />
          </label>
          {isEdit && (
            <label style={{ color: '#cbd5e1', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>Trạng thái
              <select name="is_active" value={form.is_active} onChange={handle} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 13 }}>
                <option value={1}>Đang bán</option>
                <option value={0}>Ẩn</option>
              </select>
            </label>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, background: '#334155', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontWeight: 600 }}>Hủy</button>
            <button type="submit" disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, background: '#6366f1', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Pagination({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
      <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}
        style={{ padding: '6px 14px', borderRadius: 8, background: page === 1 ? '#1e293b' : '#334155', border: 'none', color: '#cbd5e1', cursor: page === 1 ? 'default' : 'pointer' }}>‹</button>
      {Array.from({ length: Math.min(5, total) }, (_, i) => {
        const p = Math.max(1, Math.min(page - 2, total - 4)) + i;
        return (
          <button key={p} onClick={() => onPage(p)}
            style={{ padding: '6px 12px', borderRadius: 8, background: p === page ? '#6366f1' : '#334155', border: 'none', color: p === page ? '#fff' : '#cbd5e1', cursor: 'pointer', fontWeight: p === page ? 700 : 400 }}>{p}</button>
        );
      })}
      <button onClick={() => onPage(Math.min(total, page + 1))} disabled={page === total}
        style={{ padding: '6px 14px', borderRadius: 8, background: page === total ? '#1e293b' : '#334155', border: 'none', color: '#cbd5e1', cursor: page === total ? 'default' : 'pointer' }}>›</button>
    </div>
  );
}

// ─── Main Staff Page ──────────────────────────────────────────────────────────
export default function Staff() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('products');

  const [products, setProducts] = useState<Product[]>([]);
  const [prodPage, setProdPage] = useState(1);
  const [prodTotal, setProdTotal] = useState(0);
  const [prodSearch, setProdSearch] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderStatus, setOrderStatus] = useState('');

  const [users, setUsers] = useState<User[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userSearch, setUserSearch] = useState('');

  const [loadingData, setLoadingData] = useState(false);
  const [toast, setToast] = useState('');

  // Account management
  const [myPwForm, setMyPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [myPwSaving, setMyPwSaving] = useState(false);
  const [myPwError, setMyPwError] = useState('');
  const [myPwSuccess, setMyPwSuccess] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Auth guard — chỉ staff hoặc admin
  useEffect(() => {
    if (!loading && (!user || (user.role !== 'staff' && user.role !== 'admin'))) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    api.get<Category[]>('/categories').then(r => r.data && setCategories(r.data)).catch(() => {});
    api.get<Brand[]>('/brands').then(r => r.data && setBrands(r.data)).catch(() => {});
  }, []);

  const loadProducts = useCallback(async () => {
    setLoadingData(true);
    try {
      const r = await api.get<any>(`/products?search=${prodSearch}&page=${prodPage}&limit=10`);
      if (r.data) { setProducts(r.data); setProdTotal((r as any).pagination?.total ?? 0); }
    } finally { setLoadingData(false); }
  }, [prodSearch, prodPage]);

  const loadOrders = useCallback(async () => {
    setLoadingData(true);
    try {
      const r = await api.get<any>(`/orders/all?${orderStatus ? `status=${orderStatus}&` : ''}page=${orderPage}&limit=12`);
      if (r.data) { setOrders(r.data); setOrderTotal((r as any).pagination?.total ?? r.data?.length ?? 0); }
    } finally { setLoadingData(false); }
  }, [orderStatus, orderPage]);

  const loadUsers = useCallback(async () => {
    setLoadingData(true);
    try {
      const r = await api.get<any>(`/admin/users?search=${userSearch}&page=${userPage}&limit=12`);
      if (r.data) { setUsers(r.data); setUserTotal((r as any).pagination?.total ?? 0); }
    } finally { setLoadingData(false); }
  }, [userSearch, userPage]);

  useEffect(() => { if (tab === 'products') loadProducts(); }, [tab, loadProducts]);
  useEffect(() => { if (tab === 'orders') loadOrders(); }, [tab, loadOrders]);
  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab, loadUsers]);

  const deleteProduct = async (id: number) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try { await api.delete(`/products/${id}`); showToast('Đã xóa sản phẩm!'); loadProducts(); }
    catch (e: any) { alert(e.message); }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try { await api.put(`/orders/${id}/status`, { status }); showToast('Cập nhật trạng thái thành công!'); loadOrders(); }
    catch (e: any) { alert(e.message); }
  };

  const toggleUserStatus = async (u: User) => {
    try {
      await api.put(`/admin/users/${u.user_id}/status`, { is_active: u.is_active ? 0 : 1 });
      showToast(u.is_active ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      loadUsers();
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#fff' }}>Đang tải...</div>;
  if (!user || (user.role !== 'staff' && user.role !== 'admin')) return null;

  const PROD_PAGES = Math.ceil(prodTotal / 10);
  const ORDER_PAGES = Math.ceil(orderTotal / 12);
  const USER_PAGES = Math.ceil(userTotal / 12);

  const s = {
    page: { display: 'flex', minHeight: '100vh', background: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif', color: '#cbd5e1' } as React.CSSProperties,
    sidebar: { width: 220, background: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', padding: '0 0 16px 0', flexShrink: 0 } as React.CSSProperties,
    logo: { padding: '24px 20px 16px', display: 'flex', alignItems: 'center', gap: 10 } as React.CSSProperties,
    logoTitle: { fontWeight: 800, fontSize: 16, color: '#e2e8f0', letterSpacing: '-0.02em' } as React.CSSProperties,
    nav: { flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 } as React.CSSProperties,
    navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 500, width: '100%', transition: 'all 0.15s' } as React.CSSProperties,
    navActive: { background: '#312e81', color: '#a5b4fc' } as React.CSSProperties,
    main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } as React.CSSProperties,
    topBar: { padding: '20px 28px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e293b' } as React.CSSProperties,
    content: { flex: 1, padding: '24px 28px', overflowY: 'auto' } as React.CSSProperties,
    toolbar: { display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' } as React.CSSProperties,
    searchInput: { flex: 1, padding: '8px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 10, color: '#e2e8f0', fontSize: 13 } as React.CSSProperties,
    btnPrimary: { padding: '8px 18px', background: '#6366f1', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' } as React.CSSProperties,
    tableWrap: { background: '#1e293b', borderRadius: 14, border: '1px solid #334155', overflow: 'hidden' } as React.CSSProperties,
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: { padding: '12px 16px', textAlign: 'left' as const, fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.06em', borderBottom: '1px solid #334155', background: '#0f172a' },
    td: { padding: '12px 16px', fontSize: 13, color: '#94a3b8', borderBottom: '1px solid #1e293b' },
    tr: { transition: 'background 0.1s' } as React.CSSProperties,
    badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 } as React.CSSProperties,
    btnEdit: { padding: '5px 12px', background: '#1e40af', border: 'none', borderRadius: 7, color: '#93c5fd', cursor: 'pointer', fontSize: 12, fontWeight: 600 } as React.CSSProperties,
    btnDanger: { padding: '5px 12px', background: '#450a0a', border: 'none', borderRadius: 7, color: '#fca5a5', cursor: 'pointer', fontSize: 12, fontWeight: 600 } as React.CSSProperties,
    statusSelect: { padding: '4px 10px', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' } as React.CSSProperties,
    toast: { position: 'fixed' as const, top: 24, right: 24, zIndex: 9999, background: '#059669', color: '#fff', padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' },
  };

  const TABS = [
    { key: 'products', icon: '📦', label: 'Sản phẩm' },
    { key: 'orders', icon: '🛒', label: 'Đơn hàng' },
    { key: 'users', icon: '👥', label: 'Người dùng' },
    { key: 'accounts', icon: '🔑', label: 'Tài khoản' },
  ] as { key: Tab; icon: string; label: string }[];

  return (
    <div style={s.page}>
      {toast && <div style={s.toast}>✅ {toast}</div>}

      {showProductModal && (
        <ProductModal
          product={editProduct}
          categories={categories}
          brands={brands}
          onClose={() => { setShowProductModal(false); setEditProduct(null); }}
          onSaved={() => { setShowProductModal(false); setEditProduct(null); loadProducts(); showToast('Lưu thành công!'); }}
        />
      )}

      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <div style={{ width: 36, height: 36, background: '#4f46e5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="1" width="14" height="22" rx="3" stroke="white" strokeWidth="2" /><circle cx="12" cy="4" r="1" fill="white" /><rect x="8" y="18" width="8" height="2" rx="1" fill="white" /></svg>
          </div>
          <div>
            <div style={s.logoTitle}>Staff Panel</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Nhân viên</div>
          </div>
        </div>

        <nav style={s.nav}>
          {TABS.map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              style={{ ...s.navItem, ...(tab === item.key ? s.navActive : {}) }}
            >
              <span style={{ fontSize: 17 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: '0 12px 0' }}>
          <button onClick={() => navigate('/')} style={{ ...s.navItem, color: '#64748b', width: '100%' }}>
            ← Về trang chủ
          </button>
        </div>

        <div style={{ margin: '12px 12px 0', padding: '12px', background: '#0f172a', borderRadius: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{user.full_name}</div>
          <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>🛡️ Nhân viên</div>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <div style={s.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>{TABS.find(t => t.key === tab)?.icon}</span>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#e2e8f0' }}>
              {tab === 'products' && 'Quản lý sản phẩm'}
              {tab === 'orders' && 'Quản lý đơn hàng'}
              {tab === 'users' && 'Quản lý người dùng'}
              {tab === 'accounts' && '🔑 Tài khoản của tôi'}
            </h1>
          </div>
          <span style={{ ...s.badge, background: '#312e81', color: '#a5b4fc', padding: '6px 14px', fontSize: 12 }}>
            🛡️ Staff: {user.full_name}
          </span>
        </div>

        <div style={s.content}>
          {/* ── PRODUCTS ── */}
          {tab === 'products' && (
            <>
              <div style={s.toolbar}>
                <input
                  placeholder="🔍 Tìm sản phẩm..."
                  value={prodSearch}
                  onChange={e => { setProdSearch(e.target.value); setProdPage(1); }}
                  style={s.searchInput}
                />
                <button onClick={() => { setEditProduct(null); setShowProductModal(true); }} style={s.btnPrimary}>
                  + Thêm sản phẩm
                </button>
              </div>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>Ảnh</th>
                      <th style={s.th}>Tên sản phẩm</th>
                      <th style={s.th}>Danh mục</th>
                      <th style={s.th}>Giá</th>
                      <th style={s.th}>Kho</th>
                      <th style={s.th}>Trạng thái</th>
                      <th style={s.th}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingData ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Đang tải...</td></tr>
                    ) : products.map(p => (
                      <tr key={p.product_id} style={s.tr}>
                        <td style={s.td}>
                          {(p.primary_image || p.thumbnail_url) ? (
                            <img src={getImageUrl(p.primary_image || p.thumbnail_url) ?? ''} alt="" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6, background: '#0f172a' }} />
                          ) : <div style={{ width: 48, height: 48, background: '#0f172a', borderRadius: 6 }} />}
                        </td>
                        <td style={{ ...s.td, maxWidth: 200 }}>
                          <div style={{ fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.product_name}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{p.brand_name}</div>
                        </td>
                        <td style={s.td}>{p.category_name ?? '—'}</td>
                        <td style={s.td}><span style={{ color: '#10b981', fontWeight: 600 }}>{fmt(p.price)}</span></td>
                        <td style={s.td}><span style={p.stock_quantity <= 5 ? { color: '#ef4444' } : { color: '#94a3b8' }}>{p.stock_quantity}</span></td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, background: p.is_active ? '#064e3b' : '#450a0a', color: p.is_active ? '#6ee7b7' : '#fca5a5' }}>
                            {p.is_active ? 'Đang bán' : 'Ẩn'}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => { setEditProduct(p); setShowProductModal(true); }} style={s.btnEdit}>Sửa</button>
                            <button onClick={() => deleteProduct(p.product_id)} style={s.btnDanger}>Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={prodPage} total={PROD_PAGES} onPage={setProdPage} />
            </>
          )}

          {/* ── ORDERS ── */}
          {tab === 'orders' && (
            <>
              <div style={s.toolbar}>
                <select value={orderStatus} onChange={e => { setOrderStatus(e.target.value); setOrderPage(1); }} style={s.searchInput}>
                  <option value="">Tất cả trạng thái</option>
                  {ORDER_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>ID</th>
                      <th style={s.th}>Khách hàng</th>
                      <th style={s.th}>Tổng tiền</th>
                      <th style={s.th}>Giảm giá</th>
                      <th style={s.th}>Thanh toán</th>
                      <th style={s.th}>Ngày đặt</th>
                      <th style={s.th}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingData ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Đang tải...</td></tr>
                    ) : orders.map(o => (
                      <tr key={o.order_id} style={s.tr}>
                        <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#818cf8' }}>#{o.order_id}</span></td>
                        <td style={s.td}>
                          <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{o.full_name}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{o.email}</div>
                        </td>
                        <td style={s.td}>{fmt(o.total_amount)}</td>
                        <td style={s.td}><span style={{ color: '#f59e0b' }}>{o.discount_amount > 0 ? `-${fmt(o.discount_amount)}` : '—'}</span></td>
                        <td style={s.td}><span style={{ color: '#10b981', fontWeight: 700 }}>{fmt(o.final_amount)}</span></td>
                        <td style={s.td}><span style={{ fontSize: 12, color: '#64748b' }}>{new Date(o.order_date).toLocaleDateString('vi-VN')}</span></td>
                        <td style={s.td}>
                          <select
                            value={o.status}
                            onChange={e => updateOrderStatus(o.order_id, e.target.value)}
                            style={{ ...s.statusSelect, background: statusColor[o.status] ?? '#374151' }}
                          >
                            {ORDER_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={orderPage} total={ORDER_PAGES} onPage={setOrderPage} />
            </>
          )}

          {/* ── USERS ── */}
          {tab === 'users' && (
            <>
              <div style={s.toolbar}>
                <input
                  placeholder="🔍 Tìm người dùng..."
                  value={userSearch}
                  onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                  style={s.searchInput}
                />
              </div>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>ID</th>
                      <th style={s.th}>Họ tên</th>
                      <th style={s.th}>Email</th>
                      <th style={s.th}>SĐT</th>
                      <th style={s.th}>Vai trò</th>
                      <th style={s.th}>Ngày tạo</th>
                      <th style={s.th}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingData ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Đang tải...</td></tr>
                    ) : users.map(u => (
                      <tr key={u.user_id} style={s.tr}>
                        <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#818cf8' }}>#{u.user_id}</span></td>
                        <td style={s.td}><span style={{ fontWeight: 600, color: '#e2e8f0' }}>{u.full_name}</span></td>
                        <td style={s.td}><span style={{ color: '#94a3b8' }}>{u.email}</span></td>
                        <td style={s.td}>{u.phone ?? '—'}</td>
                        <td style={s.td}>
                          <span style={{
                            ...s.badge,
                            background: u.role === 'admin' ? '#1e1b4b' : u.role === 'staff' ? '#1e3a5f' : '#1e293b',
                            color: u.role === 'admin' ? '#a5b4fc' : u.role === 'staff' ? '#38bdf8' : '#94a3b8'
                          }}>
                            {u.role === 'admin' ? '🛡️ Admin' : u.role === 'staff' ? '👔 Staff' : '👤 Khách'}
                          </span>
                        </td>
                        <td style={s.td}><span style={{ fontSize: 12, color: '#64748b' }}>{new Date(u.created_at).toLocaleDateString('vi-VN')}</span></td>
                        <td style={s.td}>
                          <button onClick={() => toggleUserStatus(u)}
                            style={{ ...s.badge, cursor: 'pointer', border: 'none', background: u.is_active ? '#064e3b' : '#450a0a', color: u.is_active ? '#6ee7b7' : '#fca5a5' }}>
                            {u.is_active ? '✅ Hoạt động' : '🔒 Đã khóa'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={userPage} total={USER_PAGES} onPage={setUserPage} />
            </>
          )}

          {/* ── ACCOUNTS ── */}
          {tab === 'accounts' && (
            <div style={{ maxWidth: 520 }}>
              <div style={{ background: '#1e293b', borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>🔐 Đổi mật khẩu</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {myPwError && <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{myPwError}</div>}
                  {myPwSuccess && <div style={{ background: '#064e3b', border: '1px solid #065f46', color: '#6ee7b7', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{myPwSuccess}</div>}
                  <label style={{ color: '#cbd5e1', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>Mật khẩu hiện tại *
                    <input type="password" value={myPwForm.current_password}
                      onChange={e => setMyPwForm(f => ({ ...f, current_password: e.target.value }))}
                      placeholder="Nhập mật khẩu hiện tại"
                      style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none' }} />
                  </label>
                  <label style={{ color: '#cbd5e1', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>Mật khẩu mới *
                    <input type="password" value={myPwForm.new_password}
                      onChange={e => setMyPwForm(f => ({ ...f, new_password: e.target.value }))}
                      placeholder="Ít nhất 6 ký tự"
                      style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none' }} />
                  </label>
                  <label style={{ color: '#cbd5e1', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>Xác nhận mật khẩu mới *
                    <input type="password" value={myPwForm.confirm_password}
                      onChange={e => setMyPwForm(f => ({ ...f, confirm_password: e.target.value }))}
                      placeholder="Nhập lại mật khẩu mới"
                      style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none' }} />
                  </label>
                  <button
                    disabled={myPwSaving}
                    onClick={async () => {
                      setMyPwError(''); setMyPwSuccess('');
                      if (!myPwForm.current_password || !myPwForm.new_password) { setMyPwError('Vui lòng điền đầy đủ thông tin.'); return; }
                      if (myPwForm.new_password.length < 6) { setMyPwError('Mật khẩu mới phải có ít nhất 6 ký tự.'); return; }
                      if (myPwForm.new_password !== myPwForm.confirm_password) { setMyPwError('Mật khẩu xác nhận không khớp.'); return; }
                      setMyPwSaving(true);
                      try {
                        await api.put('/auth/change-password', { current_password: myPwForm.current_password, new_password: myPwForm.new_password });
                        setMyPwSuccess('✅ Đổi mật khẩu thành công!');
                        setMyPwForm({ current_password: '', new_password: '', confirm_password: '' });
                        showToast('Đổi mật khẩu thành công!');
                      } catch (e: any) { setMyPwError(e.message || 'Lỗi khi đổi mật khẩu.'); }
                      finally { setMyPwSaving(false); }
                    }}
                    style={{ padding: '10px 20px', background: '#6366f1', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 4 }}
                  >
                    {myPwSaving ? 'Đang lưu...' : '💾 Cập nhật mật khẩu'}
                  </button>
                </div>

                {/* Thông tin tài khoản */}
                <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #334155' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>👤 Thông tin tài khoản</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#0f172a', borderRadius: 8 }}>
                      <span style={{ fontSize: 13, color: '#64748b' }}>Họ tên</span>
                      <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{user.full_name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#0f172a', borderRadius: 8 }}>
                      <span style={{ fontSize: 13, color: '#64748b' }}>Email</span>
                      <span style={{ fontSize: 13, color: '#e2e8f0' }}>{user.email}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#0f172a', borderRadius: 8 }}>
                      <span style={{ fontSize: 13, color: '#64748b' }}>Vai trò</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#a5b4fc' }}>👔 Nhân viên</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
