import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../utils/api';
import AdminAIChat from '../components/AdminAIChat';
import AIChatAssistant from '../components/AIChatAssistant';

// ─── Types ────────────────────────────────────────────────────────────────────
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

type Tab = 'products' | 'orders' | 'users' | 'accounts' | 'ai_assistant';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const ORDER_STATUSES = ['Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'];

const statusColor: Record<string, string> = {
  'Chờ xác nhận': '#f59e0b', 'Đang xử lý': '#3b82f6',
  'Đang giao': '#8b5cf6', 'Đã giao': '#10b981', 'Đã hủy': '#ef4444',
};

// ─── Modal Product Form ────────────────────────────────────────────────────────
function ProductModal({
  product, categories, brands, onClose, onSaved,
}: {
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
      if (isEdit) {
        await api.put(`/products/${product!.product_id}`, form);
      } else {
        await api.post('/products', form);
      }
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, color: '#fff' }}>{isEdit ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm'}</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <form onSubmit={submit} style={styles.modalBody}>
          {error && <div style={styles.errorBox}>{error}</div>}
          <div style={styles.formGrid}>
            <label style={styles.label}>Tên sản phẩm *
              <input name="product_name" value={form.product_name} onChange={handle} required style={styles.input} />
            </label>
            <label style={styles.label}>Giá bán (₫) *
              <input name="price" type="number" value={form.price} onChange={handle} required style={styles.input} />
            </label>
            <label style={styles.label}>Giá cũ (₫)
              <input name="old_price" type="number" value={form.old_price} onChange={handle} style={styles.input} />
            </label>
            <label style={styles.label}>Kho hàng *
              <input name="stock_quantity" type="number" value={form.stock_quantity} onChange={handle} required style={styles.input} />
            </label>
            <label style={styles.label}>Danh mục
              <select name="category_id" value={form.category_id} onChange={handle} style={styles.input}>
                <option value="">-- Chọn --</option>
                {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
              </select>
            </label>
            <label style={styles.label}>Thương hiệu
              <select name="brand_id" value={form.brand_id} onChange={handle} style={styles.input}>
                <option value="">-- Chọn --</option>
                {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
              </select>
            </label>
          </div>
          <label style={styles.label}>URL ảnh thumbnail
            <input name="thumbnail_url" value={form.thumbnail_url} onChange={handle} style={styles.input} />
          </label>
          {isEdit && (
            <label style={styles.label}>Trạng thái
              <select name="is_active" value={form.is_active} onChange={handle} style={styles.input}>
                <option value={1}>Đang bán</option>
                <option value={0}>Ẩn</option>
              </select>
            </label>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" onClick={onClose} style={styles.btnSecondary}>Hủy</button>
            <button type="submit" disabled={saving} style={styles.btnPrimary}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Staff Page ──────────────────────────────────────────────────────────
export default function Staff() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('products');

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [prodPage, setProdPage] = useState(1);
  const [prodTotal, setProdTotal] = useState(0);
  const [prodSearch, setProdSearch] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderStatus, setOrderStatus] = useState('');

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userSearch, setUserSearch] = useState('');

  // Accounts management
  const [myPwForm, setMyPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [myPwSaving, setMyPwSaving] = useState(false);
  const [myPwError, setMyPwError] = useState('');
  const [myPwSuccess, setMyPwSuccess] = useState('');

  const [loadingData, setLoadingData] = useState(false);
  const [toast, setToast] = useState('');

  const [aiConfig, setAiConfig] = useState<any>(null);

  useEffect(() => {
    const loadAiConfig = () => {
      const saved = localStorage.getItem('ai_assistant_config');
      if (saved) setAiConfig(JSON.parse(saved));
    };
    loadAiConfig();
    window.addEventListener('ai_config_updated', loadAiConfig);
    return () => window.removeEventListener('ai_config_updated', loadAiConfig);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Auth guard — chỉ staff hoặc admin
  useEffect(() => {
    if (!loading && (!user || (user.role !== 'staff' && user.role !== 'admin'))) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Load meta
  useEffect(() => {
    api.get<Category[]>('/categories').then(r => r.data && setCategories(r.data)).catch(() => {});
    api.get<Brand[]>('/brands').then(r => r.data && setBrands(r.data)).catch(() => {});
  }, []);

  // Load products
  const loadProducts = useCallback(async () => {
    setLoadingData(true);
    try {
      const r = await api.get<any>(`/products?search=${prodSearch}&page=${prodPage}&limit=10`);
      if (r.data) {
        setProducts(Array.isArray(r.data) ? r.data : []);
        setProdTotal((r as any).pagination?.total ?? (Array.isArray(r.data) ? r.data.length : 0));
      }
    } catch (err) {
      console.error('Products load error:', err);
    } finally { setLoadingData(false); }
  }, [prodSearch, prodPage]);

  // Load orders
  const loadOrders = useCallback(async () => {
    setLoadingData(true);
    try {
      const r = await api.get<any>(`/orders/all?${orderStatus ? `status=${orderStatus}&` : ''}page=${orderPage}&limit=12`);
      if (r.data) {
        setOrders(Array.isArray(r.data) ? r.data : []);
        setOrderTotal((r as any).pagination?.total ?? (Array.isArray(r.data) ? r.data.length : 0));
      }
    } catch (err) {
      console.error('Orders load error:', err);
    } finally { setLoadingData(false); }
  }, [orderStatus, orderPage]);

  // Load users
  const loadUsers = useCallback(async () => {
    setLoadingData(true);
    try {
      const r = await api.get<any>(`/admin/users?search=${userSearch}&page=${userPage}&limit=12`);
      if (r.data) {
        setUsers(Array.isArray(r.data) ? r.data : []);
        setUserTotal((r as any).pagination?.total ?? (Array.isArray(r.data) ? r.data.length : 0));
      }
    } catch (err) {
      console.error('Users load error:', err);
    } finally { setLoadingData(false); }
  }, [userSearch, userPage]);

  useEffect(() => { if (tab === 'products') loadProducts(); }, [tab, loadProducts]);
  useEffect(() => { if (tab === 'orders') loadOrders(); }, [tab, loadOrders]);
  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab, loadUsers]);

  const deleteProduct = async (id: number) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try {
      await api.delete(`/products/${id}`);
      showToast('Đã xóa sản phẩm!');
      loadProducts();
    } catch (e: any) { alert(e.message); }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      showToast('Cập nhật trạng thái thành công!');
      loadOrders();
    } catch (e: any) { alert(e.message); }
  };

  const toggleUserStatus = async (u: User) => {
    try {
      await api.put(`/admin/users/${u.user_id}/status`, { is_active: u.is_active ? 0 : 1 });
      showToast(u.is_active ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      loadUsers();
    } catch (e: any) { alert(e.message); }
  };

  // Staff typically cannot change roles, but we'll show it as a select if the user wants it to look like Admin
  const updateUserRole = async (userId: number, role: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      showToast('Cập nhật quyền thành công!');
      loadUsers();
    } catch (e: any) { 
      alert('Bạn không có quyền thực hiện thao tác này (Yêu cầu Admin).');
      loadUsers();
    }
  };

  if (loading) return <div style={styles.loading}>Đang tải...</div>;
  if (!user || (user.role !== 'staff' && user.role !== 'admin')) return null;

  const PROD_PAGES = Math.ceil(prodTotal / 10);
  const ORDER_PAGES = Math.ceil(orderTotal / 12);
  const USER_PAGES = Math.ceil(userTotal / 12);

  return (
    <div style={styles.page}>
      {/* Toast */}
      {toast && <div style={styles.toast}>✅ {toast}</div>}

      {/* Product Modal */}
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
      <aside style={styles.sidebar}>
        <div onClick={() => navigate('/')} style={{ ...styles.sidebarLogo, cursor: 'pointer' }}>
          <div style={{ width: 38, height: 38, background: '#4f46e5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="1" width="14" height="22" rx="3" stroke="white" strokeWidth="2"/>
              <circle cx="12" cy="4" r="1" fill="white"/>
              <rect x="8" y="18" width="8" height="2" rx="1" fill="white"/>
            </svg>
          </div>
          <span style={styles.sidebarTitle}>Staff Panel</span>
        </div>
        <nav style={styles.nav}>
          {([
            { key: 'products', icon: '📦', label: 'Sản phẩm' },
            { key: 'orders', icon: '🛒', label: 'Đơn hàng' },
            { key: 'users', icon: '👥', label: 'Người dùng' },
            { key: 'accounts', icon: '🔑', label: 'Tài khoản' },
            { key: 'ai_assistant', icon: '🤖', label: 'Trợ lý AI' },
          ] as { key: Tab; icon: string; label: string }[]).map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              style={{ ...styles.navItem, ...(tab === item.key ? styles.navItemActive : {}) }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          ← Về trang chủ
        </button>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <div style={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: '#4f46e5', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="1" width="14" height="22" rx="3" stroke="white" strokeWidth="2"/>
                <circle cx="12" cy="4" r="1" fill="white"/>
                <rect x="8" y="18" width="8" height="2" rx="1" fill="white"/>
              </svg>
            </div>
            <h1 style={styles.pageTitle}>
              {tab === 'products' && '📦 Quản lý sản phẩm'}
              {tab === 'orders' && '🛒 Quản lý đơn hàng'}
              {tab === 'users' && '👥 Quản lý người dùng'}
              {tab === 'accounts' && '🔑 Tài khoản của tôi'}
              {tab === 'ai_assistant' && '🤖 Cấu hình trợ lý AI'}
            </h1>
          </div>
          <span style={{ ...styles.adminBadge, borderColor: '#4f46e5', color: '#a5b4fc' }}>👔 Staff: {user.full_name}</span>
        </div>

        {/* ── AI ASSISTANT ── */}
        {tab === 'ai_assistant' && (
          <div className="animate-in fade-in duration-500">
            <AdminAIChat />
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === 'products' && (
          <>
            <div style={styles.toolbar}>
              <input
                placeholder="🔍 Tìm sản phẩm..."
                value={prodSearch}
                onChange={e => { setProdSearch(e.target.value); setProdPage(1); }}
                style={styles.searchInput}
              />
              <button onClick={() => { setEditProduct(null); setShowProductModal(true); }} style={styles.btnPrimary}>
                + Thêm sản phẩm
              </button>
            </div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Ảnh</th>
                    <th style={styles.th}>Tên sản phẩm</th>
                    <th style={styles.th}>Danh mục</th>
                    <th style={styles.th}>Giá</th>
                    <th style={styles.th}>Kho</th>
                    <th style={styles.th}>Trạng thái</th>
                    <th style={styles.th}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingData ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Đang tải...</td></tr>
                  ) : products.map(p => (
                    <tr key={p.product_id} style={styles.tr}>
                      <td style={styles.td}>
                        {(p.primary_image || p.thumbnail_url) ? (
                          <img src={getImageUrl(p.primary_image || p.thumbnail_url) ?? ''} alt="" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6, background: '#1e293b' }} />
                        ) : <div style={{ width: 48, height: 48, background: '#1e293b', borderRadius: 6 }} />}
                      </td>
                      <td style={{ ...styles.td, maxWidth: 200 }}>
                        <div style={{ fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.product_name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{p.brand_name}</div>
                      </td>
                      <td style={styles.td}>{p.category_name ?? '—'}</td>
                      <td style={styles.td}><span style={{ color: '#10b981', fontWeight: 600 }}>{fmt(p.price)}</span></td>
                      <td style={styles.td}>
                        <span style={{ ...(p.stock_quantity <= 5 ? { color: '#ef4444' } : { color: '#94a3b8' }) }}>{p.stock_quantity}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, background: p.is_active ? '#064e3b' : '#450a0a', color: p.is_active ? '#6ee7b7' : '#fca5a5' }}>
                          {p.is_active ? 'Đang bán' : 'Ẩn'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { setEditProduct(p); setShowProductModal(true); }} style={styles.btnEdit}>Sửa</button>
                          <button onClick={() => deleteProduct(p.product_id)} style={styles.btnDanger}>Xóa</button>
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
            <div style={styles.toolbar}>
              <select value={orderStatus} onChange={e => { setOrderStatus(e.target.value); setOrderPage(1); }} style={styles.searchInput}>
                <option value="">Tất cả trạng thái</option>
                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Khách hàng</th>
                    <th style={styles.th}>Tổng tiền</th>
                    <th style={styles.th}>Giảm giá</th>
                    <th style={styles.th}>Thanh toán</th>
                    <th style={styles.th}>Ngày đặt</th>
                    <th style={styles.th}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingData ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Đang tải...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>📭 Chưa có đơn hàng nào</td></tr>
                  ) : orders.map(o => (
                    <tr key={o.order_id} style={styles.tr}>
                      <td style={styles.td}><span style={{ fontFamily: 'monospace', color: '#818cf8' }}>#{o.order_id}</span></td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{o.full_name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{o.email}</div>
                      </td>
                      <td style={styles.td}>{fmt(o.total_amount)}</td>
                      <td style={styles.td}><span style={{ color: '#f59e0b' }}>{o.discount_amount > 0 ? `-${fmt(o.discount_amount)}` : '—'}</span></td>
                      <td style={styles.td}><span style={{ color: '#10b981', fontWeight: 700 }}>{fmt(o.final_amount)}</span></td>
                      <td style={styles.td}><span style={{ fontSize: 12, color: '#64748b' }}>{new Date(o.order_date).toLocaleDateString('vi-VN')}</span></td>
                      <td style={styles.td}>
                        <select
                          value={o.status}
                          onChange={e => updateOrderStatus(o.order_id, e.target.value)}
                          style={{ ...styles.statusSelect, background: statusColor[o.status] ?? '#374151' }}
                        >
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
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
            <div style={styles.toolbar}>
              <input
                placeholder="🔍 Tìm người dùng..."
                value={userSearch}
                onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                style={styles.searchInput}
              />
            </div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Họ tên</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>SĐT</th>
                    <th style={styles.th}>Vai trò</th>
                    <th style={styles.th}>Ngày tạo</th>
                    <th style={styles.th}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingData ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Đang tải...</td></tr>
                  ) : users.map(u => (
                    <tr key={u.user_id} style={styles.tr}>
                      <td style={styles.td}><span style={{ fontFamily: 'monospace', color: '#818cf8' }}>#{u.user_id}</span></td>
                      <td style={styles.td}><span style={{ fontWeight: 600, color: '#e2e8f0' }}>{u.full_name}</span></td>
                      <td style={styles.td}><span style={{ color: '#94a3b8' }}>{u.email}</span></td>
                      <td style={styles.td}>{u.phone ?? '—'}</td>
                      <td style={styles.td}>
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u.user_id, e.target.value)}
                          style={{
                            ...styles.statusSelect,
                            background: u.role === 'admin' ? '#312e81' : u.role === 'staff' ? '#1e3a5f' : '#334155',
                            color: u.role === 'admin' ? '#a5b4fc' : u.role === 'staff' ? '#38bdf8' : '#94a3b8',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="customer">👤 Khách hàng</option>
                          <option value="staff">👔 Nhân viên</option>
                          <option value="admin">🛡️ Admin</option>
                        </select>
                      </td>
                      <td style={styles.td}><span style={{ fontSize: 12, color: '#64748b' }}>{new Date(u.created_at).toLocaleDateString('vi-VN')}</span></td>
                      <td style={styles.td}>
                        <button onClick={() => toggleUserStatus(u)} style={{ ...styles.badge, cursor: 'pointer', border: 'none', background: u.is_active ? '#064e3b' : '#450a0a', color: u.is_active ? '#6ee7b7' : '#fca5a5' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={styles.dashCard}>
              <h3 style={styles.cardTitle}>🔐 Đổi mật khẩu</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myPwError && <div style={styles.errorBox}>{myPwError}</div>}
                {myPwSuccess && <div style={{ background: '#064e3b', border: '1px solid #065f46', color: '#6ee7b7', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{myPwSuccess}</div>}
                <label style={styles.label}>Mật khẩu hiện tại
                  <input type="password" value={myPwForm.current_password} onChange={e => setMyPwForm(f => ({ ...f, current_password: e.target.value }))} style={styles.input} placeholder="Nhập mật khẩu hiện tại" />
                </label>
                <label style={styles.label}>Mật khẩu mới
                  <input type="password" value={myPwForm.new_password} onChange={e => setMyPwForm(f => ({ ...f, new_password: e.target.value }))} style={styles.input} placeholder="Ít nhất 6 ký tự" />
                </label>
                <label style={styles.label}>Xác nhận mật khẩu mới
                  <input type="password" value={myPwForm.confirm_password} onChange={e => setMyPwForm(f => ({ ...f, confirm_password: e.target.value }))} style={styles.input} placeholder="Nhập lại mật khẩu mới" />
                </label>
                <button disabled={myPwSaving} onClick={async () => {
                  setMyPwError(''); setMyPwSuccess('');
                  if (!myPwForm.current_password || !myPwForm.new_password) { setMyPwError('Vui lòng điền đầy đủ thông tin.'); return; }
                  if (myPwForm.new_password.length < 6) { setMyPwError('Mật khẩu mới phải có ít nhất 6 ký tự.'); return; }
                  if (myPwForm.new_password !== myPwForm.confirm_password) { setMyPwError('Mật khẩu xác nhận không khớp.'); return; }
                  setMyPwSaving(true);
                  try {
                    await api.put('/auth/change-password', { current_password: myPwForm.current_password, new_password: myPwForm.new_password });
                    setMyPwSuccess('✅ Đổi mật khẩu thành công!');
                    setMyPwForm({ current_password: '', new_password: '', confirm_password: '' });
                  } catch (e: any) { setMyPwError(e.message || 'Lỗi khi đổi mật khẩu.'); }
                  finally { setMyPwSaving(false); }
                }} style={styles.btnPrimary}>
                  {myPwSaving ? 'Đang lưu...' : '💾 Cập nhật mật khẩu'}
                </button>
              </div>
            </div>

            <div style={styles.dashCard}>
              <h3 style={styles.cardTitle}>👤 Thông tin cá nhân</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Họ tên:</span>
                  <span style={styles.infoValue}>{user.full_name}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Email:</span>
                  <span style={styles.infoValue}>{user.email}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Vai trò:</span>
                  <span style={{ ...styles.badge, background: '#1e3a8a', color: '#93c5fd' }}>👔 Nhân viên</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Ngày gia nhập:</span>
                  <span style={styles.infoValue}>{new Date(user.created_at || Date.now()).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <AIChatAssistant />
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 20 }}>
      <button onClick={() => onPage(page - 1)} disabled={page <= 1} style={styles.pageBtn}>‹</button>
      {[...Array(Math.min(total, 7))].map((_, i) => {
        const p = i + 1;
        return (
          <button key={p} onClick={() => onPage(p)} style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}>{p}</button>
        );
      })}
      <button onClick={() => onPage(page + 1)} disabled={page >= total} style={styles.pageBtn}>›</button>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: '100vh', background: '#0f172a', fontFamily: "'Inter', sans-serif", color: '#e2e8f0' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#94a3b8', fontSize: 18 },
  sidebar: { width: 230, minHeight: '100vh', background: 'linear-gradient(180deg,#1e293b 0%,#0f172a 100%)', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px 24px', borderBottom: '1px solid #1e293b' },
  sidebarTitle: { fontSize: 18, fontWeight: 700, color: '#e2e8f0' },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, padding: '16px 12px', flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'none', border: 'none', color: '#64748b', fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' },
  navItemActive: { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', boxShadow: '0 4px 15px rgba(99,102,241,0.35)' },
  backBtn: { margin: '0 12px', padding: '10px 16px', borderRadius: 10, background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', fontSize: 13 },
  main: { flex: 1, padding: '28px 32px', overflowY: 'auto' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  pageTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9' },
  adminBadge: { background: '#1e293b', border: '1px solid #334155', padding: '6px 14px', borderRadius: 20, fontSize: 13, color: '#94a3b8' },
  dashCard: { background: '#1e293b', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
  cardTitle: { margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#cbd5e1' },
  toolbar: { display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' },
  searchInput: { flex: 1, padding: '10px 16px', borderRadius: 10, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: 14, outline: 'none' },
  tableWrap: { background: '#1e293b', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #0f172a' },
  tr: { borderBottom: '1px solid #0f172a', transition: 'background 0.15s' },
  td: { padding: '12px 16px', fontSize: 13, color: '#94a3b8', verticalAlign: 'middle' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  btnPrimary: { padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  btnSecondary: { padding: '10px 20px', borderRadius: 10, border: '1px solid #334155', background: '#1e293b', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  btnEdit: { padding: '5px 12px', borderRadius: 8, border: 'none', background: '#1d4ed8', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  btnDanger: { padding: '5px 12px', borderRadius: 8, border: 'none', background: '#7f1d1d', color: '#fca5a5', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  statusSelect: { padding: '4px 8px', borderRadius: 8, border: 'none', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' },
  pageBtn: { padding: '6px 12px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#94a3b8', cursor: 'pointer', fontSize: 13 },
  pageBtnActive: { background: '#6366f1', color: '#fff', border: '1px solid #6366f1' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { background: '#1e293b', borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #334155', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  modalBody: { padding: 24 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  label: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: '#94a3b8', fontWeight: 500 },
  input: { padding: '9px 12px', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: 14, outline: 'none', marginTop: 4 },
  errorBox: { background: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13 },
  closeBtn: { background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  toast: { position: 'fixed', bottom: 24, right: 24, background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 600, zIndex: 9999, boxShadow: '0 8px 25px rgba(16,185,129,0.4)', fontSize: 14 },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b' },
  infoLabel: { fontSize: 13, color: '#64748b', fontWeight: 500 },
  infoValue: { fontSize: 13, color: '#e2e8f0', fontWeight: 600 },
};
