import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

interface Address {
  address_id: number;
  recipient_name: string;
  phone_number: string;
  full_address: string;
  is_default: boolean;
}

export default function Checkout() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialPromo = location.state?.promoCode || '';

  const [cart, setCart] = useState<CartData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Form fields
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Chuyển khoản' | 'Momo' | 'ZaloPay' | 'Thẻ Tín Dụng'>('COD');
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState(initialPromo);
  const [discountInfo, setDiscountInfo] = useState<{ promo_code: string; discount_amount: number } | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);

  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + '₫';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    Promise.all([
      api.get<CartData>('/cart'),
      api.get<Address[]>('/addresses'),
    ]).then(([cartRes, addrRes]) => {
      if (cartRes.success && cartRes.data) setCart(cartRes.data);
      if (addrRes.success && addrRes.data) {
        setAddresses(addrRes.data);
        const def = addrRes.data.find((a) => a.is_default);
        if (def) setSelectedAddressId(def.address_id);
        else if (addrRes.data.length > 0) setSelectedAddressId(addrRes.data[0].address_id);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const items = cart?.items || [];
  const subtotal = cart?.total || 0;

  // Tự động kiểm tra mã nếu có từ trang giỏ hàng
  useEffect(() => {
    if (initialPromo && subtotal > 0 && !discountInfo) {
      handleApplyPromo();
    }
  }, [subtotal, initialPromo]);

  // Kiểm tra mã giảm giá
  const handleApplyPromo = async () => {
    if (!promoCode.trim() || checkingPromo) return;
    setCheckingPromo(true);
    try {
      const res = await api.post('/promotions/check', { 
        code: promoCode.trim(), 
        totalAmount: subtotal 
      });
      if (res.success) {
        setDiscountInfo(res.data);
        setToast({ msg: `Đã áp dụng mã ${res.data.promo_code}!`, type: 'success' });
      }
    } catch (err: any) {
      setToast({ msg: err.message || 'Mã không hợp lệ!', type: 'error' });
      setDiscountInfo(null);
    } finally {
      setCheckingPromo(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Gọi API đặt hàng và điều hướng
  const handlePlaceOrder = async () => {
    if (items.length === 0 || placing) return;
    setPlacing(true);
    try {
      const body: any = { payment_method: paymentMethod };
      if (selectedAddressId) body.address_id = selectedAddressId;
      if (promoCode.trim()) body.promo_code = promoCode.trim();

      const res = await api.post('/orders', body);
      if (res.success) {
        setToast({ msg: 'Đang xử lý đơn hàng...', type: 'success' });
        const orderId = res.data.order_id;
        
        // Điều hướng dựa trên phương thức thanh toán
        setTimeout(() => {
          if (paymentMethod === 'COD' || paymentMethod === 'Thẻ Tín Dụng') {
            navigate('/order-success', { state: { orderId, items } });
          } else {
            // MoMo, ZaloPay, Chuyển khoản -> Qua trang Gateway
            navigate(`/payment-gateway/${orderId}?method=${paymentMethod}`);
          }
        }, 1000);
      }
    } catch (err: any) {
      setToast({ msg: err.message || 'Đặt hàng thất bại!', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased min-h-screen">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          <span className="material-symbols-outlined text-lg">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between border-b border-primary/10 bg-white dark:bg-slate-900 px-6 md:px-20 py-4 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3">
          <div className="p-2 bg-[#4B0082] rounded-lg">
            <span className="material-symbols-outlined block text-xl text-white">smartphone</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#4B0082]">MobileStore</h2>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/cart" className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Quay lại giỏ hàng
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-20 py-8 max-w-7xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-0 mb-4">
            <div className="flex flex-col items-center gap-2">
              <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-sm">check</span>
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Giỏ hàng</span>
            </div>
            <div className="flex-1 h-[2px] mx-4 bg-primary mb-6 max-w-[120px]"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center ring-4 ring-primary/20">
                <span className="text-sm font-bold">2</span>
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Thanh toán</span>
            </div>
            <div className="flex-1 h-[2px] mx-4 bg-slate-200 dark:bg-slate-700 mb-6 max-w-[120px]"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <span className="text-sm font-bold">3</span>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hoàn tất</span>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <span className="material-symbols-outlined text-6xl text-slate-300">shopping_cart</span>
            <h2 className="text-xl font-bold">Giỏ hàng trống</h2>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold">
              <span className="material-symbols-outlined">arrow_back</span>
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Forms */}
            <div className="lg:col-span-8 space-y-6">

              {/* Địa chỉ giao hàng */}
              <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <h2 className="text-xl font-bold">Địa chỉ giao hàng</h2>
                </div>
                {addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.address_id}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedAddressId === addr.address_id ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:border-primary/40'}`}
                      >
                        <input
                          type="radio"
                          name="address"
                          className="mt-1 text-primary"
                          checked={selectedAddressId === addr.address_id}
                          onChange={() => setSelectedAddressId(addr.address_id)}
                        />
                        <div className="flex-1">
                          <p className="font-bold">{addr.recipient_name} — {addr.phone_number}</p>
                          <p className="text-sm text-slate-500">{addr.full_address}</p>
                          {addr.is_default && (
                            <span className="inline-block mt-1 text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">Mặc định</span>
                          )}
                        </div>
                      </label>
                    ))}
                    <Link
                      to="/profile"
                      state={{ tab: 'address' }}
                      className="text-sm text-primary font-medium hover:underline flex items-center gap-1 pt-1"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Thêm địa chỉ mới
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <p className="text-slate-500 text-sm">Bạn chưa có địa chỉ nào.</p>
                    <Link
                      to="/profile"
                      state={{ tab: 'address' }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Thêm địa chỉ
                    </Link>
                  </div>
                )}
              </section>

              {/* Phương thức thanh toán */}
              <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                  <h2 className="text-xl font-bold">Phương thức thanh toán</h2>
                </div>
                <div className="space-y-3">
                  {([
                    { value: 'COD', label: 'Thanh toán khi nhận hàng (COD)', sub: 'Thanh toán tiền mặt cho shipper', icon: 'payments' },
                    { value: 'Momo', label: 'Ví MoMo', sub: 'Quét QR thanh toán qua MoMo', icon: 'phone_iphone' },
                    { value: 'ZaloPay', label: 'ZaloPay', sub: 'Quét QR thanh toán qua ZaloPay', icon: 'qr_code_scanner' },
                    { value: 'Chuyển khoản', label: 'Chuyển khoản ngân hàng', sub: 'Quét QR chuyển tiền qua ngân hàng', icon: 'account_balance' },
                    { value: 'Thẻ Tín Dụng', label: 'Thẻ tín dụng / Ghi nợ', sub: 'Visa, Mastercard, JCB, Amex', icon: 'credit_card' },
                  ] as const).map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === opt.value ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:border-primary/40'}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        className="w-5 h-5 text-primary"
                        checked={paymentMethod === opt.value}
                        onChange={() => setPaymentMethod(opt.value)}
                      />
                      <div className="ml-4 flex items-center gap-3">
                        <span className={`material-symbols-outlined ${paymentMethod === opt.value ? 'text-primary' : 'text-slate-400'}`}>{opt.icon}</span>
                        <div>
                          <p className="font-bold text-sm">{opt.label}</p>
                          <p className="text-xs text-slate-500">{opt.sub}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {/* Mã giảm giá - Tối ưu giao diện Premium */}
              <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                
                <div className="flex items-center justify-between mb-6 relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <span className="material-symbols-outlined block text-xl">local_offer</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Mã giảm giá</h2>
                      <p className="text-xs text-slate-500">Áp dụng cho mọi phương thức thanh toán</p>
                    </div>
                  </div>
                  {discountInfo && (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                      ĐÃ ÁP DỤNG
                    </span>
                  )}
                </div>

                <div className="relative">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">confirmation_number</span>
                      <input
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium uppercase tracking-wider"
                        placeholder="NHẬP MÃ GIẢM GIÁ (VÍ DỤ: GIAM10)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      />
                    </div>
                    <button 
                      onClick={handleApplyPromo}
                      disabled={checkingPromo || !promoCode.trim()}
                      className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                      {checkingPromo ? (
                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        'ÁP DỤNG'
                      )}
                    </button>
                  </div>

                  {/* Hiển thị thông tin giảm giá khi đã áp dụng thành công */}
                  {discountInfo && (
                    <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-100 dark:border-green-800/50 flex items-center justify-between animate-fadeIn">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-green-100 dark:border-green-800">
                          <span className="material-symbols-outlined text-green-500">check_circle</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Mã: {discountInfo.promo_code}</p>
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">Bạn được giảm thêm {formatPrice(discountInfo.discount_amount)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setDiscountInfo(null);
                          setPromoCode('');
                          setToast({ msg: 'Đã gỡ mã giảm giá.', type: 'success' });
                          setTimeout(() => setToast(null), 3000);
                        }}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 rounded-lg transition-colors group/del"
                        title="Gỡ bỏ mã"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  )}

                  {/* Một số mã gợi ý (Mockup để trông premium hơn) */}
                  {!discountInfo && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest w-full mb-1">Gợi ý mã:</span>
                      {['CHAOBAN', 'MOBILE2024', 'FREESHIP'].map(code => (
                        <button 
                          key={code}
                          onClick={() => {
                            setPromoCode(code);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 hover:border-primary hover:text-primary transition-all bg-white dark:bg-slate-800 shadow-sm"
                        >
                          #{code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-5">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-primary/5">
                  <h2 className="text-xl font-bold mb-5">Tóm tắt đơn hàng</h2>

                  {/* Danh sách sản phẩm */}
                  <div className="space-y-4 mb-5 max-h-72 overflow-y-auto pr-1">
                    {items.map((item) => {
                      const imgUrl = getImageUrl(item.thumbnail_url) || getImageUrl(item.primary_image);
                      return (
                        <div key={item.cart_item_id} className="flex gap-3 items-center">
                          <div className="size-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                            {imgUrl ? (
                              <img className="w-full h-full object-cover" src={imgUrl} alt={item.product_name} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-slate-300">smartphone</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold truncate">{item.product_name}</h4>
                            <p className="text-xs text-slate-500">SL: {item.quantity}</p>
                            <p className="text-sm font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800 mb-5" />

                  {/* Totals */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Tạm tính ({items.length} sản phẩm)</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Giảm giá</span>
                      <span className="text-red-500 font-medium">-{formatPrice(discountInfo?.discount_amount || 0)}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                      <span className="font-bold text-lg">Tổng cộng</span>
                      <span className="font-bold text-xl text-primary">{formatPrice(subtotal - (discountInfo?.discount_amount || 0))}</span>
                    </div>
                  </div>

                  {/* Đặt hàng */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing || items.length === 0}
                    className="w-full h-14 bg-[#4B0082] text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {placing ? (
                      <>
                        <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ĐANG XỬ LÝ...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">shopping_bag</span>
                        {paymentMethod === 'COD' ? 'ĐẶT HÀNG NGAY' : 'TIẾP TỤC THANH TOÁN'}
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center mt-3 text-slate-400">
                    Bằng cách đặt hàng, bạn đồng ý với Điều khoản &amp; Chính sách của MobileStore.
                  </p>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                    <span className="material-symbols-outlined text-primary text-xl mb-1">verified_user</span>
                    <span className="text-[9px] font-bold uppercase">Bảo mật</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                    <span className="material-symbols-outlined text-primary text-xl mb-1">replay</span>
                    <span className="text-[9px] font-bold uppercase">30 ngày đổi trả</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                    <span className="material-symbols-outlined text-primary text-xl mb-1">support_agent</span>
                    <span className="text-[9px] font-bold uppercase">Hỗ trợ 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 px-6 md:px-20">
        <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
          © 2024 MobileStore. Tất cả các quyền được bảo lưu.
        </div>
      </footer>
    </div>
  );
}
