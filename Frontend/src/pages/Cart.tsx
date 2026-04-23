import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../utils/api';

interface CartItem {
  cart_item_id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  thumbnail_url: string | null;
  primary_image: string | null;
  stock_quantity: number;
}

interface CartData {
  cart_id: number;
  items: CartItem[];
  total: number;
}

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  // Lấy giỏ hàng
  const fetchCart = async () => {
    try {
      const res = await api.get<CartData>('/cart');
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch {
      // Nếu lỗi auth thì bỏ qua
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Xóa sản phẩm khỏi giỏ
  const handleRemoveItem = async (cartItemId: number) => {
    setRemoving(cartItemId);
    try {
      await api.delete(`/cart/${cartItemId}`);
      await fetchCart();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa sản phẩm.');
    } finally {
      setRemoving(null);
    }
  };

  // Cập nhật số lượng
  const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 0) return;
    setUpdating(cartItemId);
    try {
      if (newQuantity === 0) {
        await api.delete(`/cart/${cartItemId}`);
      } else {
        await api.put(`/cart/${cartItemId}`, { quantity: newQuantity });
      }
      await fetchCart();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật số lượng.');
    } finally {
      setUpdating(null);
    }
  };

  // Format tiền VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const items = cart?.items || [];
  const total = cart?.total || 0;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          {/* Top Navigation Bar */}
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 bg-white dark:bg-background-dark px-6 md:px-20 py-4 sticky top-0 z-50">
            <div className="flex items-center gap-4 text-primary">
              <Link to="/" className="flex items-center gap-3">
                <div className="size-8">
                  <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold leading-tight tracking-tight uppercase">MobileStore</h2>
              </Link>
            </div>
            <div className="hidden md:flex flex-1 justify-center gap-8">
              <a className="text-slate-700 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#">Sản phẩm</a>
              <a className="text-slate-700 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#">Khuyến mãi</a>
              <a className="text-slate-700 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#">Tin tức</a>
              <a className="text-slate-700 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#">Liên hệ</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/cart" className="p-2 text-primary bg-primary/10 rounded-full relative block">
                <span className="material-symbols-outlined">shopping_cart</span>
                {items.length > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{items.length}</span>
                )}
              </Link>
              {isAuthenticated ? (
                <Link to="/profile" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm">
                  <span className="material-symbols-outlined text-sm">person</span>
                  Tài khoản
                </Link>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm">
                  <span className="material-symbols-outlined text-sm">login</span>
                  Đăng nhập
                </Link>
              )}
            </div>
          </header>
          <main className="max-w-7xl mx-auto w-full px-6 md:px-20 py-10">
            {/* Breadcrumbs & Stepper */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Giỏ hàng của bạn</h1>
                <nav className="flex items-center gap-2 text-sm text-slate-500">
                  <Link className="hover:text-primary" to="/">Trang chủ</Link>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <span className="text-primary font-medium">Giỏ hàng</span>
                </nav>
              </div>
              {/* Progress Stepper */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1 px-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Giỏ hàng</span>
                </div>
                <div className="w-12 h-[2px] bg-slate-200 dark:bg-slate-700 mb-5"></div>
                <div className="flex flex-col items-center gap-1 px-4">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center font-bold text-sm">2</div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Thanh toán</span>
                </div>
                <div className="w-12 h-[2px] bg-slate-200 dark:bg-slate-700 mb-5"></div>
                <div className="flex flex-col items-center gap-1 px-4">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center font-bold text-sm">3</div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hoàn tất</span>
                </div>
              </div>
            </div>

            {/* Chưa đăng nhập */}
            {!isAuthenticated && !loading && (
              <div className="text-center py-20 space-y-4">
                <span className="material-symbols-outlined text-6xl text-slate-300">lock</span>
                <h2 className="text-xl font-bold">Vui lòng đăng nhập</h2>
                <p className="text-slate-500">Bạn cần đăng nhập để xem giỏ hàng.</p>
                <Link to="/login?returnUrl=/cart" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold">
                  <span className="material-symbols-outlined">login</span>
                  Đăng nhập ngay
                </Link>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="text-center py-20">
                <svg className="animate-spin h-10 w-10 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <p className="text-slate-500">Đang tải giỏ hàng...</p>
              </div>
            )}

            {/* Giỏ hàng trống */}
            {isAuthenticated && !loading && items.length === 0 && (
              <div className="text-center py-20 space-y-4">
                <span className="material-symbols-outlined text-6xl text-slate-300">shopping_cart</span>
                <h2 className="text-xl font-bold">Giỏ hàng trống</h2>
                <p className="text-slate-500">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
                <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold">
                  <span className="material-symbols-outlined">arrow_back</span>
                  Tiếp tục mua sắm
                </Link>
              </div>
            )}

            {/* Có sản phẩm */}
            {isAuthenticated && !loading && items.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Products List */}
                <div className="lg:col-span-2 space-y-6">
                  {items.map((item) => (
                    <div key={item.cart_item_id} className={`bg-white dark:bg-background-dark p-6 rounded-xl border border-primary/10 flex flex-col sm:flex-row items-center gap-6 transition-all ${removing === item.cart_item_id ? 'opacity-50 scale-95' : ''}`}>
                      <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                        {(getImageUrl(item.primary_image) || getImageUrl(item.thumbnail_url)) ? (
                          <img className="w-full h-full object-cover" src={getImageUrl(item.primary_image) || getImageUrl(item.thumbnail_url) || ''} alt={item.product_name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300">smartphone</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <h3 className="text-lg font-bold">{item.product_name}</h3>
                        <p className="text-primary font-bold text-lg">{formatPrice(item.price)}</p>
                        <p className="text-sm text-slate-400">Thành tiền: <span className="text-slate-900 dark:text-white font-semibold">{formatPrice(item.price * item.quantity)}</span></p>
                      </div>
                      <div className="flex flex-col items-end justify-between self-stretch gap-4">
                        {/* Nút xóa */}
                        <button
                          className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30"
                          onClick={() => handleRemoveItem(item.cart_item_id)}
                          disabled={removing === item.cart_item_id}
                          title="Xóa khỏi giỏ hàng"
                        >
                          {removing === item.cart_item_id ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                          ) : (
                            <span className="material-symbols-outlined">delete</span>
                          )}
                        </button>
                        {/* Nút tăng/giảm số lượng */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                          <button
                            className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded transition-all disabled:opacity-30"
                            onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                            disabled={updating === item.cart_item_id}
                          >-</button>
                          <span className="w-10 text-center font-bold text-sm">{updating === item.cart_item_id ? '...' : item.quantity}</span>
                          <button
                            className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded transition-all disabled:opacity-30"
                            onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                            disabled={updating === item.cart_item_id}
                          >+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 flex justify-start">
                    <Link to="/" className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                      <span className="material-symbols-outlined text-base">arrow_back</span>
                      Tiếp tục mua sắm
                    </Link>
                  </div>
                </div>
                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-background-dark p-8 rounded-xl border border-primary/10 sticky top-28 shadow-sm">
                    <h3 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h3>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Tạm tính ({items.length} sản phẩm)</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{formatPrice(total)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Phí vận chuyển</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">Miễn phí</span>
                      </div>
                      <div className="h-[1px] bg-slate-100 dark:bg-slate-800 w-full my-2"></div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-bold">Tổng cộng</span>
                        <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                      </div>
                    </div>
                    <div className="mb-6">
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">Mã giảm giá</label>
                      <div className="flex gap-2">
                        <input className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary" placeholder="Nhập mã" type="text" />
                        <button className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/20 transition-all">Áp dụng</button>
                      </div>
                    </div>
                    <Link to="/checkout" className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                      Tiến hành thanh toán
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                    <div className="mt-6 flex flex-col gap-3">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="material-symbols-outlined text-primary text-lg">verified_user</span>
                        Thanh toán bảo mật &amp; an toàn
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="material-symbols-outlined text-primary text-lg">local_shipping</span>
                        Giao hàng nhanh toàn quốc (2-4 ngày)
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="material-symbols-outlined text-primary text-lg">assignment_return</span>
                        7 ngày đổi trả dễ dàng
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
          <footer className="bg-white dark:bg-background-dark border-t border-primary/10 py-12 px-6 md:px-20 mt-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
              <div className="col-span-1 md:col-span-1 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <div className="size-6">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold uppercase tracking-tight">MobileStore</h2>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">Hệ thống bán lẻ thiết bị di động hàng đầu Việt Nam.</p>
              </div>
              <div>
                <h4 className="font-bold mb-4 uppercase text-xs tracking-[0.2em] text-slate-400">Sản phẩm</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li><a className="hover:text-primary transition-colors" href="#">iPhone</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">iPad</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">MacBook</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Phụ kiện</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 uppercase text-xs tracking-[0.2em] text-slate-400">Hỗ trợ</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li><a className="hover:text-primary transition-colors" href="#">Chính sách bảo hành</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Phương thức thanh toán</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Giao hàng</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 uppercase text-xs tracking-[0.2em] text-slate-400">Liên hệ</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li>Hotline: 1900 1234</li>
                  <li>Email: contact@mobilestore.com</li>
                </ul>
              </div>
            </div>
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-primary/5 text-center text-xs text-slate-400">
              © 2024 MobileStore. Tất cả các quyền được bảo lưu.
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
