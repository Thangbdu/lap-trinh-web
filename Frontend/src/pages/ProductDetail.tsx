import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../utils/api';

interface Product {
  product_id: number;
  product_name: string;
  price: number;
  old_price: number | null;
  thumbnail_url: string | null;
  description: string | null;
  specifications: string | null;
  stock_quantity: number;
  category_name: string;
  brand_name: string;
  images: { image_id: number; image_url: string; is_primary: boolean }[];
  reviews: { review_id: number; full_name: string; rating: number; comment: string; created_at: string }[];
}

// ─── Helpers (giống Quick View) ───────────────────────────────────────────────
function parseSpecs(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return { 'Mô tả': raw }; }
}

function extractStorage(name: string): string | null {
  const m = name.match(/(\d+)\s*GB/i);
  return m ? m[1] + ' GB' : null;
}

function extractColor(name: string): string | null {
  const colors = ['Black','White','Blue','Red','Green','Gold','Silver','Purple','Pink','Yellow',
    'Midnight','Starlight','Titanium','Natural','Desert','Lavender','Graphite','Rose',
    'Đen','Trắng','Xanh','Đỏ','Vàng','Bạc','Tím','Hồng'];
  for (const c of colors) {
    if (name.toLowerCase().includes(c.toLowerCase())) return c;
  }
  return null;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setActiveImg(null);
      try {
        const res = await api.get<Product>(`/products/${id}`);
        if (res.success && res.data) setProduct(res.data);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    try {
      await api.post('/cart', { product_id: product?.product_id, quantity: 1 });
      setToast('Đã thêm vào giỏ hàng!');
      setTimeout(() => setToast(null), 2000);
    } catch (err: any) {
      setToast(err.message || 'Lỗi khi thêm vào giỏ.');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    try {
      await api.post('/cart', { product_id: product?.product_id, quantity: 1 });
      navigate('/checkout');
    } catch (err: any) {
      setToast(err.message || 'Lỗi khi mua sản phẩm.');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setAdding(false);
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const discount = product?.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;

  const avgRating = product?.reviews?.length
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1) : '0';

  const specs = parseSpecs(product?.specifications ?? null);

  // Highlights: GB, RAM, Màu (giống Quick View)
  const storageFromName = product ? extractStorage(product.product_name) : null;
  const colorFromName = product ? extractColor(product.product_name) : null;
  const storageFromSpec = specs['Bộ nhớ trong'] || specs['storage'] || specs['Storage'];
  const colorFromSpec = specs['Màu sắc'] || specs['color'] || specs['Color'];
  const ram = specs['RAM'] || specs['ram'] || specs['Ram'];
  const storage = storageFromSpec || storageFromName;
  const color = colorFromSpec || colorFromName;

  const highlights = [
    { icon: 'sd_storage', label: 'Bộ nhớ', value: storage },
    { icon: 'memory', label: 'RAM', value: ram },
    { icon: 'palette', label: 'Màu sắc', value: color },
    { icon: 'category', label: 'Danh mục', value: product?.category_name },
    { icon: 'storefront', label: 'Thương hiệu', value: product?.brand_name },
  ].filter(h => h.value);

  // Ảnh chính hiển thị
  const mainImg = activeImg
    || getImageUrl(product?.thumbnail_url)
    || (product?.images?.find(i => i.is_primary) ? getImageUrl(product!.images.find(i => i.is_primary)!.image_url) : null)
    || (product?.images?.[0] ? getImageUrl(product.images[0].image_url) : null);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen font-display text-slate-900 dark:text-slate-100">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-green-500 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          {toast}
        </div>
      )}

      {/* Header — giống Quick View header style */}
      <header className="sticky top-0 z-50 bg-[#4B0082] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-white rounded-lg">
                <span className="material-symbols-outlined block text-2xl text-[#4B0082]">smartphone</span>
              </div>
              <span className="text-xl font-bold tracking-tight">MobileStore</span>
            </Link>
            <span className="material-symbols-outlined text-white/40 text-sm">chevron_right</span>
            <span className="text-white/70 text-sm hidden sm:block truncate max-w-[200px]">
              {product?.product_name || 'Chi tiết sản phẩm'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/cart" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <span className="material-symbols-outlined">shopping_cart</span>
            </Link>
            {isAuthenticated ? (
              <Link to="/profile" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                  {user?.full_name?.split(' ').map((w: string) => w[0]).slice(-2).join('').toUpperCase() || '?'}
                </span>
              </Link>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-white text-[#4B0082] rounded-full font-bold text-sm hover:bg-white/90 transition-colors">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link className="hover:text-[#4B0082] transition-colors" to="/">Trang chủ</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          {product?.category_name && (
            <>
              <span className="hover:text-[#4B0082] cursor-pointer">{product.category_name}</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
            </>
          )}
          <span className="text-slate-900 dark:text-white font-medium truncate">{product?.product_name || '...'}</span>
        </nav>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <svg className="animate-spin h-12 w-12 text-[#4B0082]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-slate-500">Đang tải sản phẩm...</p>
          </div>
        )}

        {/* Not found */}
        {!loading && !product && (
          <div className="text-center py-32 space-y-4">
            <span className="material-symbols-outlined text-7xl text-slate-300">search_off</span>
            <h2 className="text-2xl font-bold">Không tìm thấy sản phẩm</h2>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#4B0082] text-white rounded-xl font-bold hover:brightness-110 transition-all">
              <span className="material-symbols-outlined">arrow_back</span>
              Về trang chủ
            </Link>
          </div>
        )}

        {!loading && product && (
          <>
            {/* ── Main product card — giống Quick View layout ── */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

                {/* LEFT: Ảnh — giống Quick View */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-4 border-r border-slate-100 dark:border-slate-800">
                  <div className="aspect-square bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center p-8 border border-slate-100 dark:border-slate-700 overflow-hidden">
                    {mainImg ? (
                      <img
                        src={mainImg}
                        alt={product.product_name}
                        className="w-full h-full object-contain transition-all duration-300"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-8xl text-slate-300">smartphone</span>
                    )}
                  </div>
                  {/* Discount + New badge */}
                  <div className="flex gap-2 flex-wrap">
                    {product.old_price && (
                      <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        -{discount}% GIẢM
                      </span>
                    )}
                    {product.stock_quantity > 0 ? (
                      <span className="bg-green-500/10 text-green-600 text-xs font-bold px-3 py-1 rounded-full border border-green-500/20">
                        ✓ Còn {product.stock_quantity} sản phẩm
                      </span>
                    ) : (
                      <span className="bg-red-500/10 text-red-500 text-xs font-bold px-3 py-1 rounded-full border border-red-500/20">
                        Hết hàng
                      </span>
                    )}
                  </div>
                  {/* Thumbnail gallery */}
                  {product.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap justify-start">
                      {product.images.slice(0, 6).map(img => (
                        <button
                          key={img.image_id}
                          onClick={() => setActiveImg(getImageUrl(img.image_url))}
                          className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition-all bg-white dark:bg-slate-800 p-1.5 ${
                            activeImg === getImageUrl(img.image_url)
                              ? 'border-[#4B0082] shadow-lg shadow-purple-500/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-[#4B0082]/50'
                          }`}
                        >
                          <img src={getImageUrl(img.image_url) || ''} alt="" className="w-full h-full object-contain" />
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Warranty badge */}
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30">
                    <span className="material-symbols-outlined text-[#4B0082] text-2xl">verified_user</span>
                    <div>
                      <p className="font-bold text-sm text-[#4B0082]">Bảo hành 12 tháng chính hãng</p>
                      <p className="text-xs text-slate-500">Hỗ trợ đổi trả trong 30 ngày</p>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Thông tin — giống Quick View */}
                <div className="p-6 flex flex-col gap-5">
                  {/* Brand + Name */}
                  <div>
                    {product.brand_name && (
                      <span className="bg-[#4B0082]/10 text-[#4B0082] text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">
                        {product.brand_name}
                      </span>
                    )}
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-snug mt-1">
                      {product.product_name}
                    </h1>
                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex text-yellow-400">
                        {[1,2,3,4,5].map(i => (
                          <span key={i} className={`material-symbols-outlined text-sm ${i <= Math.round(Number(avgRating)) ? 'fill-1' : 'text-slate-300'}`}>star</span>
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">{avgRating} ({product.reviews.length} đánh giá)</span>
                    </div>
                  </div>

                  {/* Price — giống Quick View */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-3xl font-bold text-[#4B0082]">{formatPrice(product.price)}</span>
                    {product.old_price && (
                      <>
                        <span className="text-lg text-slate-400 line-through">{formatPrice(product.old_price)}</span>
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
                      </>
                    )}
                  </div>

                  {/* Quick highlights (GB, RAM, Color) — giống Quick View */}
                  {highlights.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {highlights.map(h => (
                        <div key={h.label} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                          <span className="material-symbols-outlined text-[#4B0082] text-lg flex-shrink-0">{h.icon}</span>
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-none">{h.label}</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate mt-0.5">{h.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Description — giống Quick View nhưng không bị clamp */}
                  {product.description && (
                    <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                      <p className="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-[#4B0082]">info</span>
                        Mô tả sản phẩm
                      </p>
                      {product.description}
                    </div>
                  )}

                  {/* CTA buttons — giống Quick View footer */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2 mt-auto">
                    <button
                      onClick={handleBuyNow}
                      disabled={adding || product.stock_quantity === 0}
                      className="flex-[2] bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 text-sm shadow-lg shadow-primary/20"
                    >
                      <span className="material-symbols-outlined">bolt</span>
                      MUA NGAY
                    </button>
                    <button
                      onClick={addToCart}
                      disabled={adding || product.stock_quantity === 0}
                      className="flex-1 bg-primary/10 text-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/20 transition-all disabled:opacity-50 text-sm"
                    >
                      {adding ? '...'
                        : product.stock_quantity === 0 ? 'Hết hàng'
                        : <><span className="material-symbols-outlined">add_shopping_cart</span> Giỏ hàng</>
                      }
                    </button>
                    <Link
                      to="/cart"
                      className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-500 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
                    >
                      <span className="material-symbols-outlined">shopping_cart</span>
                      Giỏ hàng
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Specs Table — giống Quick View xen kẽ màu ── */}
            {Object.keys(specs).length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4B0082]">table_chart</span>
                  <h2 className="font-bold text-lg">Thông số kỹ thuật</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {Object.entries(specs).map(([key, value], i) => (
                    <div
                      key={i}
                      className={`flex justify-between items-start gap-3 px-5 py-3 border-b border-slate-50 dark:border-slate-800 ${
                        i % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/60' : 'bg-white dark:bg-slate-900'
                      }`}
                    >
                      <span className="text-slate-500 text-sm flex-shrink-0 font-medium">{key}</span>
                      <span className="font-semibold text-sm text-right text-slate-800 dark:text-slate-200">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Reviews — giữ nguyên nhưng cùng card style ── */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4B0082]">reviews</span>
                  <h2 className="font-bold text-lg">Đánh giá khách hàng</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-[#4B0082]">{avgRating}</span>
                  <div>
                    <div className="flex text-yellow-400">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`material-symbols-outlined text-sm ${i <= Math.round(Number(avgRating)) ? 'fill-1' : 'text-slate-300'}`}>star</span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">{product.reviews.length} đánh giá</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {product.reviews.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-slate-400 gap-2">
                    <span className="material-symbols-outlined text-5xl">chat_bubble_outline</span>
                    <p>Chưa có đánh giá nào.</p>
                  </div>
                ) : (
                  product.reviews.map((review) => (
                    <div key={review.review_id} className={`px-6 py-4 ${product.reviews.indexOf(review) % 2 === 0 ? 'bg-slate-50/40 dark:bg-slate-800/20' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {review.full_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <div>
                              <p className="font-bold text-sm">{review.full_name}</p>
                              <div className="flex text-yellow-400 text-xs">
                                {[1,2,3,4,5].map(i => (
                                  <span key={i} className={`material-symbols-outlined text-xs ${i <= review.rating ? 'fill-1' : 'text-slate-300'}`}>star</span>
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Back button */}
            <div className="flex justify-center pb-4">
              <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#4B0082] text-[#4B0082] rounded-xl font-bold hover:bg-[#4B0082]/5 transition-all text-sm">
                <span className="material-symbols-outlined">arrow_back</span>
                Tiếp tục mua sắm
              </Link>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-[#4B0082]/10 py-8 px-4 mt-4">
        <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
          © 2024 MobileStore. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
