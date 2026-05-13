import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../utils/api';
import AdminAIChat from '../components/AdminAIChat';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  ordersByStatus: { status: string; count: number }[];
  revenueByDay: { date: string; revenue: number }[];
  topProducts: { product_name: string; total_sold: number; revenue: number }[];
}

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

type Tab = 'dashboard' | 'products' | 'orders' | 'users' | 'categories' | 'brands' | 'accounts' | 'payments' | 'promotions' | 'ai_assistant';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const ORDER_STATUSES = ['Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'];

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
    specifications: '',
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
          <label style={styles.label}>Mô tả
            <textarea name="description" onChange={handle} style={{ ...styles.input, height: 80 }} />
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

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('dashboard');

  // Dashboard
  const [stats, setStats] = useState<DashboardStats | null>(null);

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

  // Categories
  const [catList, setCatList] = useState<Category[]>([]);
  const [catForm, setCatForm] = useState({ category_name: '', description: '' });
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [catSaving, setCatSaving] = useState(false);

  // Brands
  const [brandList, setBrandList] = useState<Brand[]>([]);
  const [brandForm, setBrandForm] = useState({ brand_name: '', logo_url: '' });
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [brandSaving, setBrandSaving] = useState(false);

  // Accounts management
  const [myPwForm, setMyPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [myPwSaving, setMyPwSaving] = useState(false);
  const [myPwError, setMyPwError] = useState('');
  const [myPwSuccess, setMyPwSuccess] = useState('');

  // Sửa email của admin hiện tại
  const [myEmailForm, setMyEmailForm] = useState({ new_email: '', current_password: '' });
  const [myEmailSaving, setMyEmailSaving] = useState(false);
  const [myEmailError, setMyEmailError] = useState('');
  const [myEmailSuccess, setMyEmailSuccess] = useState('');

  const [newUserForm, setNewUserForm] = useState({ full_name: '', email: '', password: '', phone: '', role: 'customer' });
  const [newUserSaving, setNewUserSaving] = useState(false);
  const [newUserError, setNewUserError] = useState('');

  const [resetPwTarget, setResetPwTarget] = useState<User | null>(null);
  const [resetPwValue, setResetPwValue] = useState('');
  const [resetPwSaving, setResetPwSaving] = useState(false);

  // Sửa email người dùng khác
  const [editEmailTarget, setEditEmailTarget] = useState<User | null>(null);
  const [editEmailValue, setEditEmailValue] = useState('');
  const [editEmailSaving, setEditEmailSaving] = useState(false);

  const [loadingData, setLoadingData] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [promoForm, setPromoForm] = useState({
    promo_code: '',
    discount_percent: '',
    max_discount_amount: '',
    min_order_value: '',
    start_date: '',
    end_date: '',
    is_active: 1
  });
  const [editPromo, setEditPromo] = useState<any | null>(null);
  const [promoSaving, setPromoSaving] = useState(false);
  const [approving, setApproving] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Auth guard
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Load meta
  useEffect(() => {
    api.get<Category[]>('/categories').then(r => r.data && setCategories(r.data)).catch(() => {});
    api.get<Brand[]>('/brands').then(r => r.data && setBrands(r.data)).catch(() => {});
  }, []);

  // Load dashboard
  const loadDashboard = useCallback(async () => {
    setLoadingData(true);
    try {
      const r = await api.get<any>('/admin/dashboard');
      // Backend trả về { success, data: { totalRevenue, ... } }
      if (r.data) setStats(r.data as DashboardStats);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally { setLoadingData(false); }
  }, []);

  // Load products
  const loadProducts = useCallback(async () => {
    setLoadingData(true);
    try {
      const r = await api.get<any>(`/products?search=${prodSearch}&page=${prodPage}&limit=10`);
      // r.data = mảng sản phẩm, r.pagination = info phân trang
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
      // r.data = mảng đơn hàng, r.pagination = info phân trang
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
      // r.data = mảng users, r.pagination = info phân trang
      if (r.data) {
        setUsers(Array.isArray(r.data) ? r.data : []);
        setUserTotal((r as any).pagination?.total ?? (Array.isArray(r.data) ? r.data.length : 0));
      }
    } catch (err) {
      console.error('Users load error:', err);
    } finally { setLoadingData(false); }
  }, [userSearch, userPage]);

  const loadCategories = useCallback(async () => {
    const r = await api.get<any>('/categories');
    if (r.data) setCatList(r.data);
  }, []);

  const loadBrands = useCallback(async () => {
    const r = await api.get<any>('/brands');
    if (r.data) setBrandList(r.data);
  }, []);

  const loadPendingPayments = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await api.get<any>('/orders/admin/payments-pending');
      if (res.success && res.data) {
        setPayments(res.data);
      }
    } catch (err) {
      console.error('Load payments error:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  const loadPromotions = useCallback(async () => {
    setLoadingData(true);
    try {
      const r = await api.get<any>('/promotions');
      if (r.data) setPromotions(r.data);
    } catch (err) {
      console.error('Promotions load error:', err);
    } finally { setLoadingData(false); }
  }, []);

  useEffect(() => { if (tab === 'dashboard') loadDashboard(); }, [tab, loadDashboard]);
  useEffect(() => { if (tab === 'products') loadProducts(); }, [tab, loadProducts]);
  useEffect(() => { if (tab === 'orders') loadOrders(); }, [tab, loadOrders]);
  useEffect(() => { if (tab === 'users' || tab === 'accounts') loadUsers(); }, [tab, loadUsers]);
  useEffect(() => { if (tab === 'categories') loadCategories(); }, [tab, loadCategories]);
  useEffect(() => { if (tab === 'brands') loadBrands(); }, [tab, loadBrands]);
  useEffect(() => { if (tab === 'payments') loadPendingPayments(); }, [tab, loadPendingPayments]);
  useEffect(() => { if (tab === 'promotions') loadPromotions(); }, [tab, loadPromotions]);

  // Category CRUD
  const saveCat = async () => {
    if (!catForm.category_name.trim()) return;
    setCatSaving(true);
    try {
      if (editCat) {
        await api.put(`/categories/${editCat.category_id}`, { ...catForm, is_active: 1 });
        showToast('Cập nhật danh mục thành công!');
      } else {
        await api.post('/categories', catForm);
        showToast('Thêm danh mục thành công!');
      }
      setCatForm({ category_name: '', description: '' });
      setEditCat(null);
      loadCategories();
    } catch (e: any) { alert(e.message); }
    finally { setCatSaving(false); }
  };

  const deleteCat = async (id: number) => {
    if (!confirm('Xóa danh mục này?')) return;
    await api.delete(`/categories/${id}`);
    showToast('Đã xóa danh mục!');
    loadCategories();
  };

  // Brand CRUD
  const saveBrand = async () => {
    if (!brandForm.brand_name.trim()) return;
    setBrandSaving(true);
    try {
      if (editBrand) {
        await api.put(`/brands/${editBrand.brand_id}`, { ...brandForm, is_active: 1 });
        showToast('Cập nhật thương hiệu thành công!');
      } else {
        await api.post('/brands', brandForm);
        showToast('Thêm thương hiệu thành công!');
      }
      setBrandForm({ brand_name: '', logo_url: '' });
      setEditBrand(null);
      loadBrands();
    } catch (e: any) { alert(e.message); }
    finally { setBrandSaving(false); }
  };

  const deleteBrand = async (id: number) => {
    if (!confirm('Xóa thương hiệu này?')) return;
    await api.delete(`/brands/${id}`);
    showToast('Đã xóa thương hiệu!');
    loadBrands();
  };

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

  const deleteUser = async (u: User) => {
    if (!confirm(`Bạn có chắc muốn xóa tài khoản "${u.full_name}" (${u.email})?\nHành động này không thể hoàn tác!`)) return;
    try {
      await api.delete(`/admin/users/${u.user_id}`);
      showToast(`Đã xóa tài khoản ${u.full_name}!`);
      loadUsers();
    } catch (e: any) { alert(e.message); }
  };

  const updateUserRole = async (userId: number, role: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      showToast('Cập nhật quyền thành công!');
      loadUsers();
    } catch (e: any) { alert(e.message); }
  };

  const approveMockPayment = async (paymentId: number) => {
    setApproving(paymentId);
    try {
      const res = await api.put(`/orders/admin/approve-payment/${paymentId}`, {});
      if (res.success) {
        showToast('✅ Đã phê duyệt thanh toán!');
        loadPendingPayments();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi phê duyệt.');
    } finally {
      setApproving(null);
    }
  };

  const rejectMockPayment = async (paymentId: number) => {
    if (!confirm('Bạn có chắc chắn muốn TỪ CHỐI thanh toán này? Đơn hàng sẽ bị hủy.')) return;
    setApproving(paymentId);
    try {
      const res = await api.put(`/orders/admin/reject-payment/${paymentId}`, {});
      if (res.success) {
        showToast('❌ Đã từ chối thanh toán và hủy đơn!');
        loadPendingPayments();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi từ chối.');
    } finally {
      setApproving(null);
    }
  };

  const savePromo = async () => {
    if (!promoForm.promo_code.trim()) return;
    setPromoSaving(true);
    try {
      if (editPromo) {
        await api.put(`/promotions/${editPromo.promo_id}`, promoForm);
        showToast('Cập nhật mã giảm giá thành công!');
      } else {
        await api.post('/promotions', promoForm);
        showToast('Thêm mã giảm giá thành công!');
      }
      setPromoForm({
        promo_code: '',
        discount_percent: '',
        max_discount_amount: '',
        min_order_value: '',
        start_date: '',
        end_date: '',
        is_active: 1
      });
      setEditPromo(null);
      loadPromotions();
    } catch (e: any) { alert(e.message); }
    finally { setPromoSaving(false); }
  };

  const deletePromo = async (id: number) => {
    if (!confirm('Xóa mã giảm giá này?')) return;
    await api.delete(`/promotions/${id}`);
    showToast('Đã xóa mã giảm giá!');
    loadPromotions();
  };

  if (loading) return <div style={styles.loading}>Đang tải...</div>;
  if (!user || user.role !== 'admin') return null;

  const PROD_PAGES = Math.ceil(prodTotal / 10);
  const ORDER_PAGES = Math.ceil(orderTotal / 12);
  const USER_PAGES = Math.ceil(userTotal / 12);

  const statusColor: Record<string, string> = {
    'Chờ xác nhận': '#f59e0b', 'Đang xử lý': '#3b82f6',
    'Đang giao': '#8b5cf6', 'Đã giao': '#10b981', 'Đã hủy': '#ef4444',
  };

  return (
    <div style={styles.page}>
      {/* Toast */}
      {toast && <div style={styles.toast}>{toast}</div>}

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
        <div 
          onClick={() => window.location.href = '/'} 
          style={{ ...styles.sidebarLogo, cursor: 'pointer' }}
          title="Về trang chủ (F5)"
        >
          <div style={{ width: 38, height: 38, background: '#4B0082', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="1" width="14" height="22" rx="3" stroke="white" strokeWidth="2"/>
              <circle cx="12" cy="4" r="1" fill="white"/>
              <rect x="8" y="18" width="8" height="2" rx="1" fill="white"/>
            </svg>
          </div>
          <span style={styles.sidebarTitle}>MobileStore</span>
        </div>
        <nav style={styles.nav}>
          {([
            { key: 'dashboard', icon: '📊', label: 'Tổng quan' },
            { key: 'products', icon: '📦', label: 'Sản phẩm' },
            { key: 'orders', icon: '🛒', label: 'Đơn hàng' },
            { key: 'users', icon: '👥', label: 'Người dùng' },
            { key: 'categories', icon: '🏷️', label: 'Danh mục' },
            { key: 'brands', icon: '🏢', label: 'Thương hiệu' },
            { key: 'promotions', icon: '🎟️', label: 'Mã giảm giá' },
            { key: 'payments', icon: '💳', label: 'Duyệt thanh toán' },
            { key: 'ai_assistant', icon: '🤖', label: 'Trợ lý AI' },
            { key: 'accounts', icon: '🔑', label: 'Tài khoản' },
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
        <button 
          onClick={() => window.location.href = '/'} 
          style={styles.backBtn}
        >
          ← Về trang chủ
        </button>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <div style={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: '#4B0082', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="1" width="14" height="22" rx="3" stroke="white" strokeWidth="2"/>
                <circle cx="12" cy="4" r="1" fill="white"/>
                <rect x="8" y="18" width="8" height="2" rx="1" fill="white"/>
              </svg>
            </div>
            <h1 style={styles.pageTitle}>
              {tab === 'dashboard' && '📊 Tổng quan'}
              {tab === 'products' && '📦 Quản lý sản phẩm'}
              {tab === 'orders' && '🛒 Quản lý đơn hàng'}
              {tab === 'users' && '👥 Quản lý người dùng'}
              {tab === 'categories' && '🏷️ Quản lý danh mục'}
              {tab === 'brands' && '🏢 Quản lý thương hiệu'}
              {tab === 'accounts' && '🔑 Quản lý tài khoản'}
              {tab === 'payments' && '💳 Phê duyệt thanh toán'}
              {tab === 'ai_assistant' && '🤖 Quản lý trợ lý AI'}
            </h1>
          </div>
          <span style={styles.adminBadge}>👤 {user.full_name}</span>
        </div>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <>
            {loadingData ? <div style={styles.skeletonWrap}>{[...Array(4)].map((_, i) => <div key={i} style={styles.skeleton} />)}</div> : stats && (
              <>
                {/* Stat cards */}
                <div style={styles.statsGrid}>
                  {[
                    { label: 'Doanh thu', val: fmt(Number(stats.totalRevenue) || 0), icon: '💰', color: '#10b981' },
                    { label: 'Đơn hàng', val: Number(stats.totalOrders) || 0, icon: '🛒', color: '#3b82f6' },
                    { label: 'Sản phẩm', val: Number(stats.totalProducts) || 0, icon: '📦', color: '#8b5cf6' },
                    { label: 'Khách hàng', val: Number(stats.totalUsers) || 0, icon: '👥', color: '#f59e0b' },
                  ].map(s => (
                    <div key={s.label} style={{ ...styles.statCard, borderTop: `4px solid ${s.color}` }}>
                      <div style={{ fontSize: 32 }}>{s.icon}</div>
                      <div>
                        <div style={{ ...styles.statVal, color: s.color }}>{s.val}</div>
                        <div style={styles.statLabel}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.dashRow}>
                  {/* Orders by status */}
                  <div style={styles.dashCard}>
                    <h3 style={styles.cardTitle}>Đơn hàng theo trạng thái</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(stats.ordersByStatus || []).length === 0
                        ? <div style={{ color: '#64748b', textAlign: 'center', padding: '20px 0', fontSize: 14 }}>Chưa có đơn hàng nào</div>
                        : (stats.ordersByStatus || []).map(o => {
                          const pct = Number(stats.totalOrders) > 0 ? Math.round((Number(o.count) / Number(stats.totalOrders)) * 100) : 0;
                          return (
                            <div key={o.status}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#cbd5e1', fontSize: 13 }}>
                                <span>{o.status}</span><span>{o.count} ({pct}%)</span>
                              </div>
                              <div style={styles.progressBg}>
                                <div style={{ ...styles.progressFill, width: `${pct}%`, background: statusColor[o.status] ?? '#6366f1' }} />
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>

                  {/* Top products */}
                  <div style={styles.dashCard}>
                    <h3 style={styles.cardTitle}>Top sản phẩm bán chạy</h3>
                    {(!stats.topProducts || stats.topProducts.length === 0) ? (
                      <div style={{ color: '#64748b', textAlign: 'center', padding: '20px 0', fontSize: 14 }}>Chưa có sản phẩm nào được bán</div>
                    ) : (
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>#</th>
                            <th style={styles.th}>Sản phẩm</th>
                            <th style={styles.th}>Đã bán</th>
                            <th style={styles.th}>Doanh thu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.topProducts.map((p, i) => (
                            <tr key={i} style={styles.tr}>
                              <td style={styles.td}><span style={styles.rank}>{i + 1}</span></td>
                              <td style={{ ...styles.td, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.product_name}</td>
                              <td style={styles.td}>{p.total_sold}</td>
                              <td style={styles.td}>{fmt(Number(p.revenue))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Revenue by day */}
                <div style={{ ...styles.dashCard, marginTop: 24, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 150, height: 150, background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <h3 style={styles.cardTitle}>Doanh thu 7 ngày gần nhất</h3>
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Biểu đồ tăng trưởng dựa trên doanh số thực tế</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                       <span style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}>
                         <div style={{ width: 8, height: 8, borderRadius: 2, background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }} /> Doanh thu
                       </span>
                    </div>
                  </div>

                  {(!stats.revenueByDay || stats.revenueByDay.length === 0) ? (
                    <div style={{ color: '#64748b', textAlign: 'center', padding: '40px 0', fontSize: 14 }}>Chưa có giao dịch trong 7 ngày qua</div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180, padding: '10px 0 30px 0' }}>
                      {stats.revenueByDay.map((d, i) => {
                        const vals = stats.revenueByDay.map(x => Number(x.revenue));
                        const maxRev = Math.max(...vals);
                        const h = maxRev > 0 ? Math.round((Number(d.revenue) / maxRev) * 100) : 0;
                        const hasOrders = (d as any).order_count > 0;
                        
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%' }}>
                            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
                              {/* Tooltip on hover (CSS is harder in inline styles, so we use title) */}
                              <div 
                                title={`${new Date(d.date).toLocaleDateString('vi-VN')}\nDoanh thu: ${fmt(Number(d.revenue))}\nĐơn hàng: ${(d as any).order_count || 0}`}
                                style={{ 
                                  width: '100%', 
                                  maxWidth: 40,
                                  height: `${Math.max(h, 2)}%`, 
                                  background: hasOrders ? 'linear-gradient(180deg, #6366f1, #a855f7)' : '#334155', 
                                  borderRadius: '6px 6px 2px 2px', 
                                  transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: hasOrders ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  zIndex: 1
                                }} 
                              >
                                {h > 20 && (
                                  <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 'bold', color: '#818cf8', whiteSpace: 'nowrap' }}>
                                    {Number(d.revenue) > 1000000 ? (Number(d.revenue)/1000000).toFixed(1)+'M' : (Number(d.revenue)/1000).toFixed(0)+'K'}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                               <span style={{ fontSize: 10, fontWeight: 'bold', color: hasOrders ? '#f8fafc' : '#475569' }}>
                                 {new Date(d.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                               </span>
                               <span style={{ fontSize: 9, color: '#64748b' }}>
                                 {new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                               </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
            {!loadingData && !stats && (
              <div style={{ color: '#64748b', textAlign: 'center', padding: 60, fontSize: 16 }}>
                ⚠️ Không thể tải dữ liệu dashboard. Vui lòng thử lại.
                <br/><br/>
                <button onClick={loadDashboard} style={styles.btnPrimary}>🔄 Thử lại</button>
              </div>
            )}
          </>
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
                    <th style={styles.th}>Thao tác</th>
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
                      <td style={styles.td}>
                        <button onClick={() => deleteUser(u)} style={styles.btnDanger}>
                          🗑️ Xóa TK
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

        {/* ── CATEGORIES ── */}
        {tab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            {/* Form */}
            <div style={styles.dashCard}>
              <h3 style={styles.cardTitle}>{editCat ? '✏️ Sửa danh mục' : '➕ Thêm danh mục mới'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ ...styles.label, marginBottom: 4 }}>Tên danh mục *</label>
                  <input
                    value={catForm.category_name}
                    onChange={e => setCatForm(f => ({ ...f, category_name: e.target.value }))}
                    placeholder="VD: Điện thoại, Laptop..."
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={{ ...styles.label, marginBottom: 4 }}>Mô tả</label>
                  <input
                    value={catForm.description}
                    onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Mô tả ngắn về danh mục"
                    style={styles.input}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={saveCat} disabled={catSaving} style={styles.btnPrimary}>
                    {catSaving ? 'Đang lưu...' : editCat ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  {editCat && (
                    <button onClick={() => { setEditCat(null); setCatForm({ category_name: '', description: '' }); }} style={styles.btnSecondary}>
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* List */}
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Tên danh mục</th>
                    <th style={styles.th}>Mô tả</th>
                    <th style={styles.th}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {catList.map(c => (
                    <tr key={c.category_id} style={styles.tr}>
                      <td style={styles.td}><span style={{ fontFamily: 'monospace', color: '#818cf8' }}>#{c.category_id}</span></td>
                      <td style={{ ...styles.td, fontWeight: 600, color: '#e2e8f0' }}>{c.category_name}</td>
                      <td style={{ ...styles.td, color: '#64748b', fontSize: 12 }}>{(c as any).description || '—'}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { setEditCat(c); setCatForm({ category_name: c.category_name, description: (c as any).description || '' }); }} style={styles.btnEdit}>Sửa</button>
                          <button onClick={() => deleteCat(c.category_id)} style={styles.btnDanger}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {catList.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>Chưa có danh mục nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BRANDS ── */}
        {tab === 'brands' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            {/* Form */}
            <div style={styles.dashCard}>
              <h3 style={styles.cardTitle}>{editBrand ? '✏️ Sửa thương hiệu' : '➕ Thêm thương hiệu mới'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ ...styles.label, marginBottom: 4 }}>Tên thương hiệu *</label>
                  <input
                    value={brandForm.brand_name}
                    onChange={e => setBrandForm(f => ({ ...f, brand_name: e.target.value }))}
                    placeholder="VD: Apple, Samsung..."
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={{ ...styles.label, marginBottom: 4 }}>URL Logo</label>
                  <input
                    value={brandForm.logo_url}
                    onChange={e => setBrandForm(f => ({ ...f, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                    style={styles.input}
                  />
                  {brandForm.logo_url && (
                    <img src={brandForm.logo_url} alt="preview" style={{ width: 48, height: 48, objectFit: 'contain', marginTop: 8, borderRadius: 8, background: '#0f172a', padding: 4 }} />
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={saveBrand} disabled={brandSaving} style={styles.btnPrimary}>
                    {brandSaving ? 'Đang lưu...' : editBrand ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  {editBrand && (
                    <button onClick={() => { setEditBrand(null); setBrandForm({ brand_name: '', logo_url: '' }); }} style={styles.btnSecondary}>
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* List */}
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Logo</th>
                    <th style={styles.th}>Tên thương hiệu</th>
                    <th style={styles.th}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {brandList.map(b => (
                    <tr key={b.brand_id} style={styles.tr}>
                      <td style={styles.td}>
                        {(b as any).logo_url
                          ? <img src={(b as any).logo_url} alt={b.brand_name} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6, background: '#0f172a', padding: 4 }} />
                          : <div style={{ width: 40, height: 40, background: '#0f172a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏢</div>
                        }
                      </td>
                      <td style={{ ...styles.td, fontWeight: 600, color: '#e2e8f0' }}>{b.brand_name}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { setEditBrand(b); setBrandForm({ brand_name: b.brand_name, logo_url: (b as any).logo_url || '' }); }} style={styles.btnEdit}>Sửa</button>
                          <button onClick={() => deleteBrand(b.brand_id)} style={styles.btnDanger}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {brandList.length === 0 && (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>Chưa có thương hiệu nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ACCOUNTS ── */}
        {tab === 'accounts' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Đổi MK + Sửa email cá nhân */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Card gộp: Sửa Gmail + Đổi MK */}
              <div style={styles.dashCard}>
                <h3 style={styles.cardTitle}>⚙️ Thông tin tài khoản của tôi</h3>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
                  Gmail hiện tại: <span style={{ color: '#818cf8', fontWeight: 600 }}>{user?.email}</span>
                </div>

                {/* ── Phần đổi Gmail ── */}
                <div style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#a5b4fc', marginBottom: 10 }}>✉️ Đổi Gmail</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {myEmailError && <div style={styles.errorBox}>{myEmailError}</div>}
                    {myEmailSuccess && <div style={{ background: '#064e3b', border: '1px solid #065f46', color: '#6ee7b7', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{myEmailSuccess}</div>}
                    <label style={styles.label}>Gmail mới *
                      <input
                        type="email"
                        value={myEmailForm.new_email}
                        onChange={e => setMyEmailForm(f => ({ ...f, new_email: e.target.value }))}
                        style={styles.input}
                        placeholder="admin@gmail.com"
                      />
                    </label>
                    <label style={styles.label}>Xác nhận bằng mật khẩu *
                      <input
                        type="password"
                        value={myEmailForm.current_password}
                        onChange={e => setMyEmailForm(f => ({ ...f, current_password: e.target.value }))}
                        style={styles.input}
                        placeholder="Nhập mật khẩu để xác nhận"
                      />
                    </label>
                    <button disabled={myEmailSaving} onClick={async () => {
                      setMyEmailError(''); setMyEmailSuccess('');
                      if (!myEmailForm.new_email) { setMyEmailError('Vui lòng nhập Gmail mới.'); return; }
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(myEmailForm.new_email)) { setMyEmailError('Gmail không hợp lệ.'); return; }
                      if (!myEmailForm.current_password) { setMyEmailError('Vui lòng nhập mật khẩu để xác nhận.'); return; }
                      setMyEmailSaving(true);
                      try {
                        await api.put('/auth/change-email', { new_email: myEmailForm.new_email, current_password: myEmailForm.current_password });
                        setMyEmailSuccess('✅ Đổi Gmail thành công! Vui lòng đăng nhập lại.');
                        setMyEmailForm({ new_email: '', current_password: '' });
                      } catch (e: any) { setMyEmailError(e.message || 'Lỗi khi đổi Gmail.'); }
                      finally { setMyEmailSaving(false); }
                    }} style={styles.btnPrimary}>
                      {myEmailSaving ? 'Đang lưu...' : '✉️ Cập nhật Gmail'}
                    </button>
                  </div>
                </div>

                {/* Đường ngăn cách */}
                <div style={{ borderTop: '1px solid #1e293b', margin: '20px 0' }} />

                {/* ── Phần đổi mật khẩu ── */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#a5b4fc', marginBottom: 10 }}>🔐 Đổi mật khẩu</div>
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
              </div>

              {/* Form tạo tài khoản mới */}
              <div style={styles.dashCard}>
                <h3 style={styles.cardTitle}>➕ Tạo tài khoản mới</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {newUserError && <div style={styles.errorBox}>{newUserError}</div>}
                  <label style={styles.label}>Họ tên *
                    <input value={newUserForm.full_name} onChange={e => setNewUserForm(f => ({ ...f, full_name: e.target.value }))} style={styles.input} placeholder="Nguyễn Văn A" />
                  </label>
                  <label style={styles.label}>Email *
                    <input type="email" value={newUserForm.email} onChange={e => setNewUserForm(f => ({ ...f, email: e.target.value }))} style={styles.input} placeholder="user@example.com" />
                  </label>
                  <label style={styles.label}>Mật khẩu *
                    <input type="password" value={newUserForm.password} onChange={e => setNewUserForm(f => ({ ...f, password: e.target.value }))} style={styles.input} placeholder="Ít nhất 6 ký tự" />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <label style={styles.label}>Số điện thoại
                      <input value={newUserForm.phone} onChange={e => setNewUserForm(f => ({ ...f, phone: e.target.value }))} style={styles.input} placeholder="0901234567" />
                    </label>
                    <label style={styles.label}>Vai trò
                      <select value={newUserForm.role} onChange={e => setNewUserForm(f => ({ ...f, role: e.target.value }))} style={styles.input}>
                        <option value="customer">👤 Khách hàng</option>
                        <option value="staff">👔 Nhân viên</option>
                        <option value="admin">🛡️ Admin</option>
                      </select>
                    </label>
                  </div>
                  <button disabled={newUserSaving} onClick={async () => {
                    setNewUserError('');
                    if (!newUserForm.full_name || !newUserForm.email || !newUserForm.password) { setNewUserError('Vui lòng điền đầy đủ thông tin bắt buộc.'); return; }
                    setNewUserSaving(true);
                    try {
                      await api.post('/admin/users', newUserForm);
                      showToast('Tạo tài khoản thành công!');
                      setNewUserForm({ full_name: '', email: '', password: '', phone: '', role: 'customer' });
                      loadUsers();
                    } catch (e: any) { setNewUserError(e.message || 'Lỗi khi tạo tài khoản.'); }
                    finally { setNewUserSaving(false); }
                  }} style={styles.btnPrimary}>
                    {newUserSaving ? 'Đang tạo...' : '➕ Tạo tài khoản'}
                  </button>
                </div>
              </div>
            </div>

            {/* Danh sách tài khoản + Reset MK + Sửa Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Card sửa email người dùng */}
              {editEmailTarget && (
                <div style={styles.dashCard}>
                  <h3 style={styles.cardTitle}>✉️ Sửa Gmail cho: <span style={{ color: '#818cf8' }}>{editEmailTarget.full_name}</span></h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Gmail hiện tại: <span style={{ color: '#94a3b8' }}>{editEmailTarget.email}</span></div>
                    <input
                      type="email"
                      value={editEmailValue}
                      onChange={e => setEditEmailValue(e.target.value)}
                      placeholder="Gmail mới (vd: user@gmail.com)"
                      style={styles.input}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button disabled={editEmailSaving} onClick={async () => {
                        if (!editEmailValue) { alert('Vui lòng nhập Gmail mới!'); return; }
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmailValue)) { alert('Gmail không hợp lệ!'); return; }
                        setEditEmailSaving(true);
                        try {
                          await api.put(`/admin/users/${editEmailTarget.user_id}/email`, { email: editEmailValue });
                          showToast(`Đã cập nhật Gmail cho ${editEmailTarget.full_name}!`);
                          setEditEmailTarget(null);
                          setEditEmailValue('');
                          loadUsers();
                        } catch (e: any) { alert(e.message || 'Lỗi khi cập nhật Gmail.'); }
                        finally { setEditEmailSaving(false); }
                      }} style={styles.btnPrimary}>{editEmailSaving ? 'Đang lưu...' : '✉️ Xác nhận sửa Gmail'}</button>
                      <button onClick={() => { setEditEmailTarget(null); setEditEmailValue(''); }} style={styles.btnSecondary}>Hủy</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Card reset mật khẩu */}
              {resetPwTarget && (
                <div style={styles.dashCard}>
                  <h3 style={styles.cardTitle}>🔑 Reset mật khẩu cho: <span style={{ color: '#818cf8' }}>{resetPwTarget.full_name}</span></h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Email: {resetPwTarget.email}</div>
                    <input
                      type="password"
                      value={resetPwValue}
                      onChange={e => setResetPwValue(e.target.value)}
                      placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                      style={styles.input}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button disabled={resetPwSaving} onClick={async () => {
                        if (!resetPwValue || resetPwValue.length < 6) { alert('Mật khẩu mới phải có ít nhất 6 ký tự!'); return; }
                        setResetPwSaving(true);
                        try {
                          await api.post(`/admin/users/${resetPwTarget.user_id}/reset-password`, { new_password: resetPwValue });
                          showToast(`Đặt lại MK cho ${resetPwTarget.full_name} thành công!`);
                          setResetPwTarget(null);
                          setResetPwValue('');
                        } catch (e: any) { alert(e.message || 'Lỗi khi reset mật khẩu.'); }
                        finally { setResetPwSaving(false); }
                      }} style={styles.btnPrimary}>{resetPwSaving ? 'Đang lưu...' : '🔑 Xác nhận reset'}</button>
                      <button onClick={() => { setResetPwTarget(null); setResetPwValue(''); }} style={styles.btnSecondary}>Hủy</button>
                    </div>
                  </div>
                </div>
              )}

              <div style={styles.dashCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ ...styles.cardTitle, margin: 0 }}>👥 Danh sách tài khoản khách hàng</h3>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Tổng: {users.length} người dùng</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 480, overflowY: 'auto' }}>
                  {users.length === 0 && <div style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>Chưa có tài khoản nào</div>}
                  {users.map(u => (
                    <div key={u.user_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: '#0f172a', marginBottom: 4 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: u.role === 'admin' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : u.role === 'staff' ? 'linear-gradient(135deg,#0ea5e9,#38bdf8)' : 'linear-gradient(135deg,#334155,#475569)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                        {u.role === 'admin' ? '🛡️' : u.role === 'staff' ? '👔' : '👤'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name}</div>
                        <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                        {u.phone && <div style={{ fontSize: 11, color: '#475569' }}>📞 {u.phone}</div>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span style={{ ...styles.badge, background: u.is_active ? '#064e3b' : '#450a0a', color: u.is_active ? '#6ee7b7' : '#fca5a5', fontSize: 10 }}>
                          {u.is_active ? '✅ Active' : '🔒 Khóa'}
                        </span>
                        <button
                          onClick={() => { setEditEmailTarget(u); setEditEmailValue(''); setResetPwTarget(null); }}
                          style={{ padding: '3px 8px', borderRadius: 6, border: 'none', background: '#065f46', color: '#6ee7b7', cursor: 'pointer', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                          ✉️ Sửa Gmail
                        </button>
                        <button
                          onClick={() => { setResetPwTarget(u); setResetPwValue(''); setEditEmailTarget(null); }}
                          style={{ padding: '3px 8px', borderRadius: 6, border: 'none', background: '#1d4ed8', color: '#93c5fd', cursor: 'pointer', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                          🔑 Reset MK
                        </button>
                        <button
                          onClick={() => deleteUser(u)}
                          style={{ padding: '3px 8px', borderRadius: 6, border: 'none', background: '#7f1d1d', color: '#fca5a5', cursor: 'pointer', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                          🗑️ Xóa TK
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {tab === 'payments' && (
          <div style={styles.dashCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={styles.cardTitle}>💳 Các giao dịch đang chờ phê duyệt</h3>
              <button 
                onClick={loadPendingPayments}
                style={{ ...styles.btnSecondary, padding: '4px 10px', fontSize: 12 }}
              >
                🔄 Làm mới
              </button>
            </div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Khách hàng</th>
                    <th style={styles.th}>Phương thức</th>
                    <th style={styles.th}>Số tiền</th>
                    <th style={styles.th}>Thời gian</th>
                    <th style={styles.th}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingData ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Đang tải...</td></tr>
                  ) : payments.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>✨ Không có giao dịch nào đang chờ</td></tr>
                  ) : payments.map(p => (
                    <tr key={p.payment_id} style={styles.tr}>
                      <td style={styles.td}><span style={{ fontFamily: 'monospace', color: '#818cf8' }}>#{p.payment_id}</span></td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{p.full_name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{p.email}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                           <span style={{ fontSize: 16 }}>
                             {p.payment_method === 'Momo' ? '📱' : 
                              p.payment_method === 'ZaloPay' ? '💸' : 
                              p.payment_method === 'COD' ? '🚚' : '🏦'}
                           </span>
                           {p.payment_method}
                        </div>
                      </td>
                      <td style={styles.td}><span style={{ color: '#10b981', fontWeight: 700 }}>{fmt(p.amount)}</span></td>
                      <td style={styles.td}><span style={{ fontSize: 12, color: '#64748b' }}>{new Date(p.created_at).toLocaleString('vi-VN')}</span></td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => approveMockPayment(p.payment_id)}
                            disabled={approving === p.payment_id}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              fontSize: 12,
                              background: 'linear-gradient(135deg,#059669,#10b981)',
                              color: '#fff',
                              border: 'none',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {approving === p.payment_id ? '...' : 'Duyệt'}
                          </button>
                          <button
                            onClick={() => rejectMockPayment(p.payment_id)}
                            disabled={approving === p.payment_id}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              fontSize: 12,
                              background: 'linear-gradient(135deg,#b91c1c,#ef4444)',
                              color: '#fff',
                              border: 'none',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {approving === p.payment_id ? '...' : 'Không duyệt'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* ── PROMOTIONS ── */}
        {tab === 'promotions' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
            <div style={styles.dashCard}>
              <h3 style={styles.cardTitle}>🎟️ Danh sách mã giảm giá</h3>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Mã</th>
                      <th style={styles.th}>Giảm (%)</th>
                      <th style={styles.th}>Min Đơn</th>
                      <th style={styles.th}>Thời hạn</th>
                      <th style={styles.th}>Trạng thái</th>
                      <th style={styles.th}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingData ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Đang tải...</td></tr>
                    ) : promotions.map(p => (
                      <tr key={p.promo_id} style={styles.tr}>
                        <td style={styles.td}><span style={{ fontWeight: 700, color: '#818cf8' }}>{p.promo_code}</span></td>
                        <td style={styles.td}>{p.discount_percent}%</td>
                        <td style={styles.td}>{fmt(Number(p.min_order_value))}</td>
                        <td style={styles.td}>
                          <div style={{ fontSize: 11 }}>Từ: {new Date(p.start_date).toLocaleDateString('vi-VN')}</div>
                          <div style={{ fontSize: 11 }}>Đến: {new Date(p.end_date).toLocaleDateString('vi-VN')}</div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, background: p.is_active ? '#064e3b' : '#450a0a', color: p.is_active ? '#6ee7b7' : '#fca5a5' }}>
                            {p.is_active ? 'Kích hoạt' : 'Khóa'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => { 
                              setEditPromo(p); 
                              setPromoForm({
                                promo_code: p.promo_code,
                                discount_percent: p.discount_percent,
                                max_discount_amount: p.max_discount_amount || '',
                                min_order_value: p.min_order_value,
                                start_date: new Date(p.start_date).toISOString().slice(0, 16),
                                end_date: new Date(p.end_date).toISOString().slice(0, 16),
                                is_active: p.is_active
                              });
                            }} style={styles.btnEdit}>Sửa</button>
                            <button onClick={() => deletePromo(p.promo_id)} style={styles.btnDanger}>Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={styles.dashCard}>
              <h3 style={styles.cardTitle}>{editPromo ? '✏️ Sửa mã giảm giá' : '🎟️ Thêm mã mới'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={styles.label}>Mã giảm giá
                  <input 
                    placeholder="VOURCHE5" 
                    value={promoForm.promo_code} 
                    onChange={e => setPromoForm({...promoForm, promo_code: e.target.value})} 
                    style={styles.input} 
                  />
                </label>
                <label style={styles.label}>Phần trăm giảm (%)
                  <select 
                    value={promoForm.discount_percent} 
                    onChange={e => setPromoForm({...promoForm, discount_percent: e.target.value})} 
                    style={styles.input}
                  >
                    <option value="">Chọn % giảm</option>
                    {[5, 10, 15, 20, 25, 30].map(v => <option key={v} value={v}>{v}%</option>)}
                  </select>
                </label>
                <label style={styles.label}>Đơn hàng tối thiểu (₫)
                  <input 
                    type="number" 
                    value={promoForm.min_order_value} 
                    onChange={e => setPromoForm({...promoForm, min_order_value: e.target.value})} 
                    style={styles.input} 
                  />
                </label>
                <label style={styles.label}>Ngày bắt đầu
                  <input 
                    type="datetime-local" 
                    value={promoForm.start_date} 
                    onChange={e => setPromoForm({...promoForm, start_date: e.target.value})} 
                    style={styles.input} 
                  />
                </label>
                <label style={styles.label}>Ngày kết thúc
                  <input 
                    type="datetime-local" 
                    value={promoForm.end_date} 
                    onChange={e => setPromoForm({...promoForm, end_date: e.target.value})} 
                    style={styles.input} 
                  />
                </label>
                <label style={styles.label}>Trạng thái
                  <select 
                    value={promoForm.is_active} 
                    onChange={e => setPromoForm({...promoForm, is_active: Number(e.target.value)})} 
                    style={styles.input}
                  >
                    <option value={1}>Kích hoạt</option>
                    <option value={0}>Khóa</option>
                  </select>
                </label>
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button 
                    onClick={savePromo} 
                    disabled={promoSaving} 
                    style={{ ...styles.btnPrimary, flex: 1 }}
                  >
                    {promoSaving ? 'Đang lưu...' : 'Lưu mã'}
                  </button>
                  {editPromo && (
                    <button 
                      onClick={() => {
                        setEditPromo(null);
                        setPromoForm({
                          promo_code: '',
                          discount_percent: '',
                          max_discount_amount: '',
                          min_order_value: '',
                          start_date: '',
                          end_date: '',
                          is_active: 1
                        });
                      }} 
                      style={{ ...styles.btnSecondary, flex: 1 }}
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === 'ai_assistant' && (
          <div className="animate-in fade-in duration-500">
            <AdminAIChat />
          </div>
        )}
      </main>
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
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#1e293b', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
  statVal: { fontSize: 22, fontWeight: 700 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  dashRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  dashCard: { background: '#1e293b', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
  cardTitle: { margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#cbd5e1' },
  progressBg: { height: 6, background: '#0f172a', borderRadius: 99 },
  progressFill: { height: 6, borderRadius: 99, transition: 'width 0.5s' },
  skeletonWrap: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 },
  skeleton: { height: 100, background: 'linear-gradient(90deg,#1e293b 25%,#334155 50%,#1e293b 75%)', borderRadius: 16, animation: 'pulse 1.5s infinite' },
  toolbar: { display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' },
  searchInput: { flex: 1, padding: '10px 16px', borderRadius: 10, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: 14, outline: 'none' },
  tableWrap: { background: '#1e293b', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #0f172a' },
  tr: { borderBottom: '1px solid #0f172a', transition: 'background 0.15s' },
  td: { padding: '12px 16px', fontSize: 13, color: '#94a3b8', verticalAlign: 'middle' },
  rank: { display: 'inline-flex', width: 24, height: 24, borderRadius: '50%', background: '#6366f1', color: '#fff', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 },
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
};
