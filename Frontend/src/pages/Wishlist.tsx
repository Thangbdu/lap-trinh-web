import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Wishlist() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?returnUrl=/wishlist');
      return;
    }
    fetchWishlist();
    fetchCartCount();
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get<any[]>('/wishlist');
      if (res.success && res.data) setWishlist(res.data);
    } catch { }
    finally { setLoading(false); }
  };

  const fetchCartCount = async () => {
    try {
      const res = await api.get('/cart');
      if (res.success && res.data?.items) setCartCount(res.data.items.length);
    } catch { }
  };

  const removeFromWishlist = async (id: number) => {
    try {
      await api.delete(`/wishlist/${id}`);
      setWishlist(prev => prev.filter(p => p.product_id !== id));
      setToast('Đã xóa khỏi yêu thích');
      setTimeout(() => setToast(null), 2000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const addToCart = async (id: number) => {
    try {
      await api.post('/cart', { product_id: id, quantity: 1 });
      setToast('Đã thêm vào giỏ hàng!');
      fetchCartCount();
      setTimeout(() => setToast(null), 2000);
    } catch (err: any) {
      setToast(err.message || 'Lỗi khi thêm vào giỏ');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + '₫';

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      {toast && (
        <div className="fixed top-6 right-6 z-[100] bg-primary text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-[fadeSlideDown_0.3s_ease-out]">
          <span className="material-symbols-outlined">check_circle</span>
          {toast}
        </div>
      )}

      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          {/* Navigation Bar */}
          <header className="flex items-center justify-between border-b border-primary/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 md:px-20 py-4 sticky top-0 z-50">
            <div className="flex items-center gap-10">
              <Link to="/" className="flex items-center gap-3 text-primary">
                <div className="size-8 galaxy-gradient rounded-lg flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">rocket_launch</span>
                </div>
                <h2 className="text-xl font-bold leading-tight tracking-tight dark:text-white">MobileStore</h2>
              </Link>
            </div>
            <div className="flex flex-1 justify-end gap-4 md:gap-6 items-center">
              <div className="flex gap-2">
                <Link to="/wishlist" className="relative flex size-10 items-center justify-center rounded-xl bg-primary text-white transition-all shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined">favorite</span>
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">{wishlist.length}</span>
                  )}
                </Link>
                <Link to="/cart" className="relative flex size-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all">
                  <span className="material-symbols-outlined">shopping_cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">{cartCount}</span>
                  )}
                </Link>
              </div>
              <Link to="/profile" className="size-10 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">person</span>
              </Link>
            </div>
          </header>

          <main className="max-w-[1200px] mx-auto w-full px-6 py-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-10">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  <span className="text-sm font-bold uppercase tracking-widest">Của riêng bạn</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight dark:text-white">Danh sách yêu thích</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg">Nơi lưu trữ những siêu phẩm công nghệ mà bạn đang khao khát sở hữu tại MobileStore.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500">Đang tải danh sách...</p>
              </div>
            ) : wishlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-300">
                  <span className="material-symbols-outlined text-5xl">heart_broken</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Chưa có sản phẩm nào</h3>
                <p className="text-slate-500 mb-8 max-w-xs">Hãy dạo quanh cửa hàng và chọn cho mình những sản phẩm ưng ý nhé!</p>
                <Link to="/" className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all">
                  Tiếp tục mua sắm
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {wishlist.map((item) => (
                  <div key={item.product_id} className="group relative flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all shadow-sm">
                    <div className="w-full md:w-48 aspect-square rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        alt={item.product_name}
                        className="object-contain w-full h-full p-4 group-hover:scale-110 transition-transform duration-500"
                        src={getImageUrl(item.thumbnail_url) || getImageUrl(item.primary_image) || ''}
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 w-full min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          {item.brand_name && <span className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/10 rounded uppercase">{item.brand_name}</span>}
                          <Link to={`/product/${item.product_id}`} className="text-xl font-bold mt-2 dark:text-white block hover:text-primary transition-colors truncate">
                            {item.product_name}
                          </Link>
                          <p className="text-slate-500 text-sm mt-1">{item.category_name}</p>
                        </div>
                        <button
                          onClick={() => removeFromWishlist(item.product_id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-2 shrink-0"
                          title="Xóa khỏi danh sách"
                        >
                          <span className="material-symbols-outlined">delete_forever</span>
                        </button>
                      </div>
                      <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="text-2xl font-black text-primary">{formatPrice(item.price)}</p>
                          {item.old_price && <p className="text-sm text-slate-400 line-through">{formatPrice(item.old_price)}</p>}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => addToCart(item.product_id)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all whitespace-nowrap"
                          >
                            <span className="material-symbols-outlined text-sm">shopping_cart</span>
                            Thêm vào giỏ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          <footer className="bg-slate-50 dark:bg-slate-900/50 mt-20 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-[1200px] mx-auto px-6 py-8 text-center text-xs text-slate-500">
              <p>© 2024 MobileStore. Trải nghiệm công nghệ đỉnh cao.</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
