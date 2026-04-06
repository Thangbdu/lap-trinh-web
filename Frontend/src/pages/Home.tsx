// v3 - quick-view modal added
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../utils/api';

interface Product {
  product_id: number;
  product_name: string;
  price: number;
  old_price: number | null;
  thumbnail_url: string | null;
  primary_image: string | null;
  stock_quantity: number;
  brand_name: string;
  category_name: string;
  is_featured?: number;
}

interface ProductDetail extends Product {
  description: string | null;
  specifications: string | null;
  images: { image_id: number; image_url: string; is_primary: boolean }[];
  reviews: { review_id: number; full_name: string; rating: number; comment: string; created_at: string }[];
}

interface ProductCardProps {
  p: Product;
  addingId: number | null;
  addToCart: (id: number) => Promise<void> | void;
  formatPrice: (n: number) => string;
  onQuickView: (id: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ p, addingId, addToCart, formatPrice, onQuickView }) => {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative">
      {/* Image area — click opens quick view */}
      <button
        onClick={() => onQuickView(p.product_id)}
        className="block w-full relative bg-slate-50 dark:bg-slate-900 focus:outline-none"
        style={{ paddingBottom: '100%' }}
        aria-label={`Xem nhanh ${p.product_name}`}
      >
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {getImageUrl(p.thumbnail_url) || getImageUrl(p.primary_image) ? (
            <img
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              src={getImageUrl(p.thumbnail_url) || getImageUrl(p.primary_image) || ''}
              alt={p.product_name}
            />
          ) : (
            <span className="material-symbols-outlined text-5xl text-slate-300">smartphone</span>
          )}
        </div>
        {p.old_price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{Math.round(((p.old_price - p.price) / p.old_price) * 100)}%
          </div>
        )}
        {p.is_featured ? (
          <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">New</div>
        ) : null}
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
            <span className="material-symbols-outlined text-sm">visibility</span> Xem nhanh
          </span>
        </div>
      </button>
      <div className="p-3 space-y-1.5">
        {p.brand_name && (
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{p.brand_name}</span>
        )}
        <button
          onClick={() => onQuickView(p.product_id)}
          className="font-semibold text-sm leading-snug block hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem] text-left w-full"
          title={p.product_name}
        >
          {p.product_name}
        </button>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-primary font-bold text-base">{formatPrice(p.price)}</span>
          {p.old_price && (
            <span className="text-slate-400 line-through text-xs">{formatPrice(p.old_price)}</span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); addToCart(p.product_id); }}
          disabled={addingId === p.product_id || p.stock_quantity === 0}
          className="w-full mt-1 bg-primary/5 group-hover:bg-primary group-hover:text-white text-primary py-2 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {addingId === p.product_id
            ? 'Đang thêm...'
            : p.stock_quantity === 0
              ? 'Hết hàng'
              : <><span className="material-symbols-outlined text-sm">add_shopping_cart</span> Thêm vào giỏ</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── Quick View Modal ───────────────────────────────────────────────────────
interface QuickViewModalProps {
  productId: number | null;
  onClose: () => void;
  addingId: number | null;
  addToCart: (id: number) => Promise<void> | void;
  formatPrice: (n: number) => string;
}

function parseSpecs(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return { 'Mô tả': raw }; }
}

const SPEC_KEY_MAP: Record<string, string> = {
  storage: 'Bộ nhớ trong',
  ram: 'RAM',
  color: 'Màu sắc',
  colour: 'Màu sắc',
  screen: 'Màn hình',
  display: 'Màn hình',
  battery: 'Pin',
  camera: 'Camera',
  os: 'Hệ điều hành',
  cpu: 'Chip xử lý',
  processor: 'Chip xử lý',
  weight: 'Trọng lượng',
  dimensions: 'Kích thước',
  connectivity: 'Kết nối',
  sim: 'SIM',
  bluetooth: 'Bluetooth',
  wifi: 'Wi-Fi',
  nfc: 'NFC',
  charging: 'Sạc',
  'front camera': 'Camera trước',
  'rear camera': 'Camera sau',
};

function normalizeSpecKey(key: string): string {
  const lower = key.toLowerCase();
  return SPEC_KEY_MAP[lower] || key;
}

// Extract GB / storage info from product name
function extractStorage(name: string): string | null {
  const m = name.match(/(\d+)\s*GB/i);
  return m ? m[1] + ' GB' : null;
}

// Extract color from product name
function extractColor(name: string): string | null {
  const colors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Gold', 'Silver', 'Purple', 'Pink', 'Yellow', 'Midnight', 'Starlight', 'Titanium', 'Natural', 'Desert', 'Lavender', 'Graphite', 'Rose', 'Đen', 'Trắng', 'Xanh', 'Đỏ', 'Vàng', 'Bạc', 'Tím', 'Hồng'];
  for (const c of colors) {
    if (name.toLowerCase().includes(c.toLowerCase())) return c;
  }
  return null;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ productId, onClose, addingId, addToCart, formatPrice }) => {
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!productId) { setDetail(null); return; }
    setLoading(true);
    setActiveImg(null);
    api.get<ProductDetail>(`/products/${productId}`)
      .then(res => { if (res.success && res.data) setDetail(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = productId ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [productId]);

  if (!productId) return null;

  const specs = parseSpecs(detail?.specifications ?? null);
  const discount = detail?.old_price
    ? Math.round(((detail.old_price - detail.price) / detail.old_price) * 100) : 0;
  const avgRating = detail?.reviews?.length
    ? (detail.reviews.reduce((s, r) => s + r.rating, 0) / detail.reviews.length).toFixed(1) : '0';

  const mainImg = activeImg
    || getImageUrl(detail?.thumbnail_url)
    || detail?.images?.find(i => i.is_primary)?.image_url && getImageUrl(detail.images.find(i => i.is_primary)!.image_url)
    || (detail?.images?.[0] ? getImageUrl(detail.images[0].image_url) : null);

  // Quick highlights (GB, color from name or specs)
  const storageFromName = detail ? extractStorage(detail.product_name) : null;
  const colorFromName = detail ? extractColor(detail.product_name) : null;
  const storageFromSpec = specs['storage'] || specs['Storage'] || specs['Bộ nhớ trong'] || specs['bộ nhớ trong'];
  const colorFromSpec = specs['color'] || specs['Color'] || specs['colour'] || specs['Colour'] || specs['Màu sắc'] || specs['màu sắc'];
  const storage = storageFromSpec || storageFromName;
  const color = colorFromSpec || colorFromName;
  const ram = specs['ram'] || specs['RAM'] || specs['Ram'];

  const highlights = [
    { icon: 'sd_storage', label: 'Bộ nhớ', value: storage },
    { icon: 'memory', label: 'RAM', value: ram },
    { icon: 'palette', label: 'Màu sắc', value: color },
    { icon: 'category', label: 'Dòng sản phẩm', value: detail?.category_name },
    { icon: 'storefront', label: 'Thương hiệu', value: detail?.brand_name },
  ].filter(h => h.value);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Xem nhanh sản phẩm"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative z-10 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col animate-[fadeSlideUp_0.25s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">info</span>
            Chi tiết sản phẩm
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-slate-500 text-sm">Đang tải thông tin...</p>
            </div>
          ) : detail ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Left: Images */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-4">
                <div className="aspect-square bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center p-6 border border-slate-100 dark:border-slate-700 overflow-hidden">
                  {mainImg ? (
                    <img src={mainImg} alt={detail.product_name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="material-symbols-outlined text-7xl text-slate-300">smartphone</span>
                  )}
                </div>
                {detail.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap justify-center">
                    {detail.images.slice(0, 5).map(img => (
                      <button
                        key={img.image_id}
                        onClick={() => setActiveImg(getImageUrl(img.image_url))}
                        className={`w-14 h-14 rounded-lg border-2 overflow-hidden transition-all bg-white dark:bg-slate-800 p-1 ${activeImg === getImageUrl(img.image_url) ? 'border-primary shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                      >
                        <img src={getImageUrl(img.image_url) || ''} alt="" className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Info */}
              <div className="p-6 flex flex-col gap-5 overflow-y-auto">
                {/* Brand + Name */}
                <div>
                  {detail.brand_name && (
                    <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">
                      {detail.brand_name}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug mt-1">
                    {detail.product_name}
                  </h3>
                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex text-yellow-400">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`material-symbols-outlined text-sm ${i <= Math.round(Number(avgRating)) ? 'fill-1' : 'text-slate-300'}`}>star</span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">{avgRating} ({detail.reviews.length} đánh giá)</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-primary">{formatPrice(detail.price)}</span>
                  {detail.old_price && (
                    <>
                      <span className="text-lg text-slate-400 line-through">{formatPrice(detail.old_price)}</span>
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
                    </>
                  )}
                </div>

                {/* Quick highlights: GB, Color, Dòng SP, etc. */}
                {highlights.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {highlights.map(h => (
                      <div key={h.label} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                        <span className="material-symbols-outlined text-primary text-lg flex-shrink-0">{h.icon}</span>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-none">{h.label}</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white truncate mt-0.5">{h.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Specs table */}
                {Object.keys(specs).length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-primary">table_chart</span>
                      Thông số kỹ thuật
                    </h4>
                    <div className="rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden text-sm">
                      {Object.entries(specs).map(([key, value], i) => (
                        <div
                          key={i}
                          className={`flex justify-between items-start gap-3 px-4 py-2.5 ${i % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/60' : 'bg-white dark:bg-slate-900'}`}
                        >
                          <span className="text-slate-500 flex-shrink-0 font-medium">{normalizeSpecKey(key)}</span>
                          <span className="font-semibold text-right text-slate-800 dark:text-slate-200">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {detail.description && (
                  <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                    {detail.description}
                  </div>
                )}

                {/* Stock */}
                <div className="text-xs text-slate-400">
                  Tình trạng: {detail.stock_quantity > 0
                    ? <span className="text-green-500 font-bold">Còn {detail.stock_quantity} sản phẩm</span>
                    : <span className="text-red-500 font-bold">Hết hàng</span>
                  }
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400">Không thể tải thông tin sản phẩm.</div>
          )}
        </div>

        {/* Footer: action buttons */}
        {detail && (
          <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-900">
            <button
              onClick={() => { addToCart(detail.product_id); }}
              disabled={addingId === detail.product_id || detail.stock_quantity === 0}
              className="flex-1 bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 text-sm"
            >
              {addingId === detail.product_id ? 'Đang thêm...'
                : detail.stock_quantity === 0 ? 'Hết hàng'
                : <><span className="material-symbols-outlined">add_shopping_cart</span> Thêm vào giỏ</>
              }
            </button>
            <Link
              to={`/product/${detail.product_id}`}
              onClick={onClose}
              className="flex-1 border-2 border-primary text-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-all text-sm"
            >
              <span className="material-symbols-outlined">open_in_new</span> Xem đầy đủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Danh mục hiển thị trên trang chủ
const CATEGORIES = [
  { key: 'iphone', label: 'Apple', icon: 'phone_iphone', brand_id: 1, category_id: null, category_ids: null },
  { key: 'samsung', label: 'Samsung', icon: 'smartphone', brand_id: 2, category_id: null, category_ids: null },
  { key: 'xiaomi', label: 'Xiaomi', icon: 'ad_units', brand_id: 3, category_id: null, category_ids: null },
  { key: 'tablet', label: 'Tablet', icon: 'tablet_mac', brand_id: null, category_id: 2, category_ids: null },
  { key: 'laptop', label: 'Laptop', icon: 'laptop_mac', brand_id: null, category_id: 3, category_ids: null },
  // Phụ kiện: Tai nghe(4) + Đồng hồ(5) + Pin dự phòng(8) + Loa Bluetooth(9) + Bàn phím(10)
  { key: 'phuKien', label: 'Phụ kiện', icon: 'headphones', brand_id: null, category_id: null, category_ids: '4,5,8,9,10' },
];

// Danh sách quảng cáo carousel banner
const ADS = [
  {
    id: 1,
    badge: 'Flagship 2025',
    title: 'iPhone 17 Pro Max.',
    subtitle: 'Mỏng nhất. Mạnh nhất.',
    desc: 'Chip A19 Pro thế hệ mới. Camera periscope 48MP. Thiết kế Titanium siêu mỏng đẳng cấp.',
    link: '/product/1',
    bg: 'from-slate-900 via-indigo-950 to-slate-900',
    accent: '#818cf8',
    img: 'http://localhost:5000/uploads/images/products/iPhone 17 Pro Max.jpg',
  },
  {
    id: 2,
    badge: 'Galaxy AI',
    title: 'Samsung Galaxy S24 Ultra.',
    subtitle: 'AI. Tiêu chuẩn mới.',
    desc: 'Camera 200MP. Bút S-Pen tích hợp. Galaxy AI thiên mình cho bạn.',
    link: '/product/2',
    bg: 'from-slate-900 via-blue-950 to-slate-900',
    accent: '#38bdf8',
    img: 'http://localhost:5000/uploads/images/products/s24utral.webp',
  },
  {
    id: 3,
    badge: 'Leica Camera',
    title: 'Xiaomi 14 Pro.',
    subtitle: 'Leica. Đỉnh cao nhiếp ảnh.',
    desc: 'Camera Leica Summilux 50MP. Snapdragon 8 Gen 3. Sạc nhanh 120W.',
    link: '/product/3',
    bg: 'from-slate-900 via-orange-950 to-slate-900',
    accent: '#fb923c',
    img: 'http://localhost:5000/uploads/images/products/Xiaomi_14_Pro_Green.png',
  },
  {
    id: 4,
    badge: 'Apple M3',
    title: 'MacBook Air M3.',
    subtitle: 'Mỏng hơn. Nhanh hơn.',
    desc: 'Chip M3 cực đại. Pin 18 giờ. Màn hình Liquid Retina 13.6 inch siêu nét.',
    link: '/product/5',
    bg: 'from-slate-900 via-emerald-950 to-slate-900',
    accent: '#34d399',
    img: 'http://localhost:5000/uploads/images/products/macbook airm 3 2024.jpg',
  },
];

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const productsRef = useRef<HTMLElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const handleQuickView = useCallback((id: number) => setQuickViewId(id), []);
  const handleCloseModal = useCallback(() => setQuickViewId(null), []);

  // Auto-slide mỗi 4 giưy
  const startSlideTimer = () => {
    if (slideTimer.current) clearInterval(slideTimer.current);
    slideTimer.current = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % ADS.length);
    }, 4000);
  };

  useEffect(() => {
    startSlideTimer();
    return () => { if (slideTimer.current) clearInterval(slideTimer.current); };
  }, []);

  const goToSlide = (idx: number) => {
    setActiveSlide(idx);
    startSlideTimer(); // reset timer khi click
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  // Lấy sản phẩm theo filter
  const fetchProducts = async (brandId?: number | null, categoryId?: number | null, categoryIds?: string | null, search?: string) => {
    setProductsLoading(true);
    try {
      let query = '/products?limit=50';
      if (search) query += `&search=${encodeURIComponent(search)}`;
      else if (brandId) query += `&brand_id=${brandId}`;
      else if (categoryIds) query += `&category_ids=${categoryIds}`;
      else if (categoryId) query += `&category_id=${categoryId}`;
      const res = await api.get(query);
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch {
      // ignore
    } finally {
      setProductsLoading(false);
    }
  };

  // Xử lý tìm kiếm với debounce 400ms
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setSelectedKey(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchProducts(null, null, null, value.trim() || undefined);
      if (value.trim() && productsRef.current) {
        productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 400);
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  // Lấy số lượng giỏ hàng
  const fetchCartCount = async () => {
    try {
      const res = await api.get('/cart');
      if (res.success && res.data?.items) {
        setCartCount(res.data.items.length);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [isAuthenticated]);

  const addToCart = async (productId: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setAddingId(productId);
    try {
      await api.post('/cart', { product_id: productId, quantity: 1 });
      setToast('Đã thêm vào giỏ hàng!');
      await fetchCartCount();
      setTimeout(() => setToast(null), 2000);
    } catch (err: any) {
      setToast(err.message || 'Lỗi khi thêm vào giỏ.');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] bg-green-500 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          {toast}
        </div>
      )}
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-[#4B0082] text-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg text-white bg-white">
              <span className="material-symbols-outlined block text-2xl text-[#4B0082]">smartphone</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">MobileStore</h1>
          </div>
          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white">search</span>
              <input
                className="w-full bg-white/10 border-none rounded-xl pl-10 pr-10 py-2 focus:ring-2 focus:ring-white/50 text-sm transition-all text-white placeholder:text-white/60"
                placeholder="Tìm kiếm điện thoại, phụ kiện..."
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/cart" className="p-2 hover:bg-white/10 rounded-full relative transition-colors">
              <span className="material-symbols-outlined">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-white text-[#4B0082] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Nút bảng quản trị cho Admin/Staff */}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 rounded-full transition-colors text-sm font-bold border border-yellow-400/30">
                    <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                    <span className="hidden sm:block">Admin</span>
                  </Link>
                )}
                {user?.role === 'staff' && (
                  <Link to="/staff" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-400/20 hover:bg-blue-400/30 text-blue-300 rounded-full transition-colors text-sm font-bold border border-blue-400/30">
                    <span className="material-symbols-outlined text-sm">manage_accounts</span>
                    <span className="hidden sm:block">Nhân viên</span>
                  </Link>
                )}

                {/* Nút hồ sơ người dùng — hiển thị cho TẤT CẢ user */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/20 hover:border-white/40 group"
                  title="Hồ sơ của tôi"
                >
                  {/* Avatar chữ tắt */}
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 shadow-md">
                    {user?.full_name
                      ? user.full_name.split(' ').map((w: string) => w[0]).slice(-2).join('').toUpperCase()
                      : <span className="material-symbols-outlined text-sm">person</span>
                    }
                  </span>
                  <div className="hidden sm:block text-left leading-none">
                    <p className="text-xs font-bold text-white leading-tight">{user?.full_name?.split(' ').pop()}</p>
                    <p className="text-[10px] text-white/50 mt-0.5">
                      {user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'staff' ? 'Nhân viên' : 'Thành viên'}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-sm text-white/60 group-hover:text-white transition-colors hidden sm:block">chevron_right</span>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title="Đăng xuất"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-white text-[#4B0082] rounded-full font-bold text-sm hover:bg-white/90 transition-colors">
                <span className="material-symbols-outlined text-lg">login</span>
                <span className="hidden sm:block">Đăng nhập</span>
              </Link>
            )}
          </div>

        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-12">
        {/* Hero Carousel */}
        <section className="relative overflow-hidden rounded-2xl min-h-[420px] md:min-h-[520px]">
          {ADS.map((ad, idx) => (
            <div
              key={ad.id}
              className={`absolute inset-0 bg-gradient-to-r ${ad.bg} transition-all duration-700 ease-in-out ${idx === activeSlide ? 'opacity-100 translate-x-0 z-10' : idx < activeSlide ? 'opacity-0 -translate-x-full z-0' : 'opacity-0 translate-x-full z-0'
                }`}
            >
              {/* Nội dung */}
              <div className="relative z-10 h-full flex items-center px-8 md:px-16">
                <div className="flex-1 max-w-xl space-y-5 text-white">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border"
                    style={{ color: ad.accent, borderColor: ad.accent + '60', background: ad.accent + '20' }}
                  >
                    {ad.badge}
                  </span>
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                    {ad.title}
                    <span className="block text-2xl md:text-3xl font-medium mt-1" style={{ color: ad.accent }}>
                      {ad.subtitle}
                    </span>
                  </h2>
                  <p className="text-slate-400 text-base leading-relaxed">{ad.desc}</p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                      to={ad.link}
                      className="px-7 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-lg"
                      style={{ background: ad.accent }}
                    >
                      Mua ngay
                    </Link>
                    <Link
                      to={ad.link}
                      className="px-7 py-3 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
                {/* Ảnh sản phẩm */}
                <div className="hidden md:flex flex-1 items-center justify-center">
                  <img
                    src={ad.img}
                    alt={ad.title}
                    className="max-h-80 max-w-xs object-contain drop-shadow-2xl transition-all duration-700"
                    style={{ filter: 'drop-shadow(0 0 40px ' + ad.accent + '60)' }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Dot indicators */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {ADS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`rounded-full transition-all duration-300 ${idx === activeSlide ? 'w-8 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                  }`}
              />
            ))}
          </div>

          {/* Prev / Next */}
          <button
            onClick={() => goToSlide((activeSlide - 1 + ADS.length) % ADS.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-all"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={() => goToSlide((activeSlide + 1) % ADS.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-all"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </section>
        {/* Product Categories */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Danh mục sản phẩm</h3>
            <button
              onClick={() => { setSelectedKey(null); fetchProducts(); }}
              className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline"
            >
              Xem tất cả <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setSelectedKey(cat.key);
                  fetchProducts(cat.brand_id, cat.category_id, cat.category_ids);
                  productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`group flex flex-col items-center p-4 rounded-xl border text-center transition-all hover:shadow-lg hover:-translate-y-1 ${selectedKey === cat.key
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white dark:bg-slate-800 border-primary/5 hover:border-primary/30'
                  }`}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-colors ${selectedKey === cat.key
                  ? 'bg-white/20 text-white'
                  : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                  }`}>
                  <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                </div>
                <span className={`font-bold text-sm ${selectedKey === cat.key ? 'text-white' : ''
                  }`}>{cat.label}</span>
              </button>
            ))}
          </div>
        </section>
        {/* ─── Section 1: SP MỚI NHẤT (featured) ─── */}
        {!searchQuery && !selectedKey && (
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <h3 className="text-2xl font-bold">Sản phẩm mới nhất</h3>
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">New</span>
              </div>
              <div className="h-[1px] flex-1 bg-primary/10"></div>
            </div>
            {productsLoading ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <p className="text-slate-500 text-sm">Đang tải sản phẩm...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {products.filter(p => p.is_featured).map((p) => <ProductCard key={p.product_id} p={p} addingId={addingId} addToCart={addToCart} formatPrice={formatPrice} onQuickView={handleQuickView} />)}
              </div>
            )}
          </section>
        )}

        {/* ─── Section 2: TẤT CẢ SẢN PHẨM / kết quả lọc ─── */}
        <section ref={productsRef}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold">
                {searchQuery
                  ? `Kết quả cho "${searchQuery}"`
                  : selectedKey
                    ? CATEGORIES.find(c => c.key === selectedKey)?.label + ' nổi bật'
                    : 'Tất cả sản phẩm'
                }
              </h3>
              {(selectedKey || searchQuery) && (
                <button
                  onClick={() => { setSelectedKey(null); handleSearch(''); }}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary transition-colors border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                  Bỏ lọc
                </button>
              )}
            </div>
            <div className="h-[1px] flex-1 bg-primary/10 ml-4"></div>
          </div>
          {productsLoading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <p className="text-slate-500 text-sm">Đang tải sản phẩm...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {(searchQuery || selectedKey ? products : products.filter(p => !p.is_featured)).map((p) => (
                <ProductCard key={p.product_id} p={p} addingId={addingId} addToCart={addToCart} formatPrice={formatPrice} onQuickView={handleQuickView} />
              ))}
            </div>
          )}
        </section>
        {/* Service Promises */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          <div className="flex items-center gap-4 p-6 bg-white dark:bg-slate-800 rounded-xl border border-primary/10 transition-colors hover:border-primary/40">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-2xl">local_shipping</span>
            </div>
            <div>
              <h5 className="font-bold">Giao hàng nhanh</h5>
              <p className="text-sm text-slate-500">Miễn phí giao hàng trong nội thành 2h</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-white dark:bg-slate-800 rounded-xl border border-primary/10 transition-colors hover:border-primary/40">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <div>
              <h5 className="font-bold">Bảo hành 12 tháng</h5>
              <p className="text-sm text-slate-500">Lỗi 1 đổi 1 trong vòng 30 ngày đầu</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-white dark:bg-slate-800 rounded-xl border border-primary/10 transition-colors hover:border-primary/40">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-2xl">credit_card</span>
            </div>
            <div>
              <h5 className="font-bold">Trả góp 0%</h5>
              <p className="text-sm text-slate-500">Thủ tục nhanh chóng qua thẻ tín dụng</p>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-primary/10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded text-white">
                <span className="material-symbols-outlined block text-xl">smartphone</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-primary uppercase">MobileStore</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">Hệ thống bán lẻ điện thoại di động, máy tính bảng và phụ kiện chính hãng hàng đầu Việt Nam.</p>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
                <span className="material-symbols-outlined text-xl">social_leaderboard</span>
              </a>
              <a className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
                <span className="material-symbols-outlined text-xl">language</span>
              </a>
              <a className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
                <span className="material-symbols-outlined text-xl">mail</span>
              </a>
            </div>
          </div>
          <div>
            <h6 className="font-bold mb-6 text-lg">Thông tin chính sách</h6>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a className="hover:text-primary transition-colors" href="#">Chính sách bảo hành</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Chính sách đổi trả</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Giao hàng &amp; Thanh toán</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Điều khoản dịch vụ</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold mb-6 text-lg">Hỗ trợ khách hàng</h6>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a className="hover:text-primary transition-colors" href="#">Tìm hiểu về mua trả góp</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Tra cứu hóa đơn điện tử</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Trung tâm bảo hành chính hãng</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Quy định về sao lưu dữ liệu</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold mb-6 text-lg">Địa chỉ liên hệ</h6>
            <ul className="space-y-4 text-sm text-slate-500">
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                <span>504 Đại Lộ Bình Dương, P.Phú Lợi, TPHCM</span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-primary text-sm">call</span>
                <span>Hotline: 1900 1234 (8:00 - 22:00)</span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-primary text-sm">mail</span>
                <span>Email: contact@mobilestore.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-primary/5 text-center text-slate-400 text-xs">
          <p>© 2026 MobileStore. Tất cả các quyền được bảo lưu. Thiết kế bởi Mobile Store.</p>
        </div>
      </footer>
      {/* Quick View Modal */}
      <QuickViewModal
        productId={quickViewId}
        onClose={handleCloseModal}
        addingId={addingId}
        addToCart={addToCart}
        formatPrice={formatPrice}
      />
    </div>
  );
}
