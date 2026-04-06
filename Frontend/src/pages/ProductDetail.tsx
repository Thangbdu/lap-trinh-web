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

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get<Product>(`/products/${id}`);
        if (res.success && res.data) {
          setProduct(res.data);
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
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

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + '₫';

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`material-symbols-outlined text-sm ${i <= rating ? 'fill-1 text-yellow-400' : 'text-slate-300'}`}>star</span>
      );
    }
    return stars;
  };

  const discount = product?.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  const avgRating = product?.reviews?.length
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : '0';

  // Parse specs if JSON
  let specs: Record<string, string> = {};
  if (product?.specifications) {
    try {
      specs = JSON.parse(product.specifications);
    } catch {
      specs = { 'Mô tả': product.specifications };
    }
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] bg-green-500 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          {toast}
        </div>
      )}
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          {/* Header */}
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 px-6 md:px-20 py-4 sticky top-0 z-50 bg-[#4c0099] text-white">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl">phone_iphone</span>
                <h2 className="text-xl font-bold leading-tight tracking-tight">MobileStore</h2>
              </Link>
              <nav className="hidden md:flex items-center gap-8">
                <Link className="text-sm font-medium text-white/90 hover:text-white transition-colors" to="/">Trang chủ</Link>
                <a className="text-sm font-medium text-white/90 hover:text-white transition-colors" href="#">Điện thoại</a>
                <a className="text-sm font-medium text-white/90 hover:text-white transition-colors" href="#">Phụ kiện</a>
              </nav>
            </div>
            <div className="flex flex-1 justify-end gap-4 items-center">
              <Link to="/cart" className="p-2 hover:bg-white/10 rounded-lg relative text-white">
                <span className="material-symbols-outlined">shopping_cart</span>
              </Link>
              {isAuthenticated ? (
                <Link to="/profile" className="p-2 hover:bg-white/10 rounded-lg text-white">
                  <span className="material-symbols-outlined">person</span>
                </Link>
              ) : (
                <Link to="/login" className="px-4 py-2 bg-white text-[#4c0099] rounded-lg font-bold text-sm">Đăng nhập</Link>
              )}
            </div>
          </header>

          <main className="max-w-7xl mx-auto w-full px-4 md:px-10 py-6">
            {/* Loading */}
            {loading && (
              <div className="text-center py-20">
                <svg className="animate-spin h-10 w-10 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <p className="text-slate-500">Đang tải sản phẩm...</p>
              </div>
            )}

            {/* Not found */}
            {!loading && !product && (
              <div className="text-center py-20 space-y-4">
                <span className="material-symbols-outlined text-6xl text-slate-300">search_off</span>
                <h2 className="text-xl font-bold">Không tìm thấy sản phẩm</h2>
                <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold">
                  <span className="material-symbols-outlined">arrow_back</span> Về trang chủ
                </Link>
              </div>
            )}

            {/* Product content */}
            {!loading && product && (
              <>
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                  <Link className="hover:text-primary" to="/">Trang chủ</Link>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <span className="hover:text-primary">{product.category_name || 'Sản phẩm'}</span>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <span className="text-slate-900 dark:text-white font-medium">{product.product_name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                  {/* Image */}
                  <div className="flex flex-col gap-4">
                    <div className="aspect-square bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 p-8 flex items-center justify-center">
                      {getImageUrl(product.thumbnail_url) ? (
                        <img className="w-full h-full object-contain" src={getImageUrl(product.thumbnail_url)!} alt={product.product_name} />
                      ) : (
                        <span className="material-symbols-outlined text-8xl text-slate-300">smartphone</span>
                      )}
                    </div>
                    {product.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-4">
                        {product.images.map((img) => (
                          <div key={img.image_id} className={`aspect-square bg-white dark:bg-slate-800 rounded-lg border ${img.is_primary ? 'border-2 border-primary' : 'border-slate-200 dark:border-slate-700'} overflow-hidden p-2`}>
                            <img className="w-full h-full object-contain" src={getImageUrl(img.image_url) || ''} alt="" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col">
                    <div className="mb-6">
                      {product.brand_name && (
                        <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">{product.brand_name}</span>
                      )}
                      <h1 className="text-4xl font-bold mb-2">{product.product_name}</h1>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex text-yellow-400">
                          {renderStars(Math.round(Number(avgRating)))}
                        </div>
                        <span className="text-sm text-slate-500">{avgRating} ({product.reviews.length} đánh giá)</span>
                        <span className="text-sm text-slate-500">| Kho: {product.stock_quantity}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
                        {product.old_price && (
                          <>
                            <span className="text-xl text-slate-400 line-through">{formatPrice(product.old_price)}</span>
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">-{discount}%</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {product.description && (
                      <div className="mb-8">
                        <p className="text-sm font-bold mb-2">Mô tả</p>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{product.description}</p>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={addToCart}
                        disabled={adding || product.stock_quantity === 0}
                        className="flex-1 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                      >
                        {adding ? (
                          'Đang thêm...'
                        ) : product.stock_quantity === 0 ? (
                          'Hết hàng'
                        ) : (
                          <><span className="material-symbols-outlined">add_shopping_cart</span> THÊM VÀO GIỎ</>
                        )}
                      </button>
                      <Link to="/cart" className="flex-1 bg-white dark:bg-slate-800 border-2 border-primary text-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-all">
                        <span className="material-symbols-outlined">shopping_cart</span>
                        XEM GIỎ HÀNG
                      </Link>
                    </div>

                    <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-4 border border-slate-100 dark:border-slate-700">
                      <span className="material-symbols-outlined text-primary">verified_user</span>
                      <div className="text-sm">
                        <p className="font-bold">Chính sách bảo hành</p>
                        <p className="text-slate-500">Bảo hành 12 tháng chính hãng</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specs */}
                {Object.keys(specs).length > 0 && (
                  <div className="mb-16">
                    <h3 className="text-2xl font-bold mb-6">Thông số kỹ thuật</h3>
                    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        {Object.entries(specs).map(([key, value], i) => (
                          <div key={i} className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between">
                            <span className="text-slate-500">{key}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews */}
                <div className="mb-16">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Đánh giá khách hàng</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-5xl font-bold">{avgRating}</span>
                        <div>
                          <div className="flex text-yellow-400">{renderStars(Math.round(Number(avgRating)))}</div>
                          <p className="text-sm text-slate-500">Dựa trên {product.reviews.length} đánh giá</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {product.reviews.length === 0 && (
                    <p className="text-slate-500 py-4">Chưa có đánh giá nào.</p>
                  )}
                  <div className="space-y-6">
                    {product.reviews.map((review) => (
                      <div key={review.review_id} className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                              {review.full_name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold">{review.full_name}</p>
                              <div className="flex text-yellow-400 text-xs">{renderStars(review.rating)}</div>
                            </div>
                          </div>
                          <span className="text-sm text-slate-500">{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </main>

          {/* Footer */}
          <footer className="bg-white dark:bg-slate-900 border-t border-primary/10 py-12 px-6 md:px-20 mt-auto">
            <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
              © 2024 MobileStore. All rights reserved.
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
