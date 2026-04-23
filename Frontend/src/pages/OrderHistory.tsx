import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../utils/api';

interface OrderItem {
  order_item_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
  thumbnail_url: string | null;
}

interface Order {
  order_id: number;
  order_date: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  paid_at?: string;
  items: OrderItem[];
}

export default function OrderHistory() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tất cả');

  const tabs = ['Tất cả', 'Chờ phê duyệt', 'Đã thanh toán', 'Thanh toán thất bại', 'Đã hủy'];

  useEffect(() => {
    if (isAuthenticated) {
      api.get<Order[]>('/orders/my')
        .then(res => {
          if (res.success && res.data) {
            setOrders(res.data);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Chờ xác nhận': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Đã xác nhận': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Đang giao': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Đã giao': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Đã hủy': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    if (status === 'Đã thanh toán') return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20';
    if (status === 'Thanh toán thất bại') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20';
    if (status === 'Chờ phê duyệt') return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 animate-pulse';
    return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20';
  };

  const handleSeedData = async () => {
    setLoading(true);
    try {
      // Gọi API thật để lưu vào DB
      const res = await api.post('/orders/seed-sample', {});
      if (res.success) {
        alert('Đã tạo dữ liệu mẫu thành công! Đang tải lại...');
        const ordersRes = await api.get<Order[]>('/orders/my');
        if (ordersRes.success && ordersRes.data) {
          setOrders(ordersRes.data);
          return;
        }
      }
    } catch (err) {
      console.error(err);
      // Fallback: Nếu API lỗi (có thể do route chưa nhận), ta set dữ liệu ảo để xem UI
      const mockOrders: Order[] = [
        {
          order_id: 999,
          order_date: new Date().toISOString(),
          total_amount: 32990000.0,
          discount_amount: 0,
          final_amount: 32990000.0,
          status: 'Đã giao',
          payment_method: 'Momo',
          payment_status: 'Đã thanh toán',
          transaction_id: 'MOMO_MOCK_123',
          paid_at: new Date().toISOString(),
          items: [
            {
              order_item_id: 1,
              product_id: 1,
              product_name: 'iPhone 15 Pro Max 256GB',
              quantity: 1,
              price_at_purchase: 32990000.0,
              thumbnail_url: '/uploads/images/products/iphone15.jpg'
            }
          ]
        }
      ];
      setOrders(mockOrders);
      alert('Không thể kết nối API, đã hiển thị dữ liệu tạm thời để bạn xem giao diện!');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 text-center">
        <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-primary font-bold">lock</span>
        </div>
        <h2 className="text-2xl font-black mb-2 tracking-tight">Vui lòng đăng nhập</h2>
        <p className="text-slate-500 mb-8 max-w-xs">Bạn cần đăng nhập để xem lịch sử mua hàng và thông tin thanh toán.</p>
        <Link to="/login" className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen pb-20 transition-colors">
      <header className="bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 sticky top-0 z-50 px-6 md:px-20 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="size-8 text-primary group-hover:scale-110 transition-transform">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-primary">MobileStore</h2>
          </Link>
          <Link to="/profile" className="text-sm font-bold bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all">Quay lại Tài khoản</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary text-2xl font-bold">verified_user</span>
              <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Tài khoản cá nhân</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Lịch sử thanh toán</h1>
            <p className="text-slate-500">Xem lại các giao dịch và trạng thái đơn hàng của bạn</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white dark:bg-slate-900 border border-primary/10 rounded-2xl px-6 py-3 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng chi tiêu</p>
              <p className="text-xl font-black text-primary">
                {formatPrice(orders.filter(o => o.payment_status === 'Đã thanh toán').reduce((sum, o) => sum + Number(o.final_amount), 0))}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Filter */}
        <div className="flex gap-2 overflow-x-auto pb-6 mb-2 no-scrollbar">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === t 
                  ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 border border-primary/5 hover:border-primary/20'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-slate-400 animate-pulse">Đang truy xuất dữ liệu...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-primary/10 shadow-xl shadow-primary/5 transition-all animate-fadeIn">
            <div className="size-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <span className="material-symbols-outlined text-5xl text-slate-300">receipt_long</span>
            </div>
            <h2 className="text-2xl font-black mb-3">Chưa có giao dịch nào</h2>
            <p className="text-slate-500 mb-10 max-w-xs mx-auto text-lg leading-relaxed">Khi bạn mua sắm tại MobileStore, lịch sử thanh toán sẽ xuất hiện tại đây.</p>
            <div className="flex flex-col gap-4">
              <Link to="/" className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-2xl shadow-primary/30 hover:translate-y-[-2px] hover:shadow-primary/40 active:translate-y-0 transition-all justify-center">
                <span className="material-symbols-outlined">shopping_cart</span>
                Khám phá sản phẩm ngay
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {orders
              .filter(o => {
                if (activeTab === 'Tất cả') return true;
                if (activeTab === 'Chờ phê duyệt') return o.payment_status === 'Chờ phê duyệt';
                if (activeTab === 'Đã thanh toán') return o.payment_status === 'Đã thanh toán';
                if (activeTab === 'Thanh toán thất bại') return o.payment_status === 'Thanh toán thất bại';
                if (activeTab === 'Đã hủy') return o.status === 'Đã hủy';
                return true;
              })
              .map((order) => (
              <div key={order.order_id} className="group bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-primary/10 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 animate-fadeIn">
                {/* Order Header */}
                <div className="px-8 py-5 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Mã đơn</span>
                      <span className="font-black text-slate-900 dark:text-white">#{order.order_id}</span>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Ngày tạo</span>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{new Date(order.order_date).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  <div className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>

                {/* Items */}
                <div className="p-8">
                  <div className="space-y-5">
                    {order.items.map((item) => (
                      <div key={item.order_item_id} className="flex items-center gap-5">
                        <div className="size-20 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform duration-500">
                          {item.thumbnail_url ? (
                            <img className="w-full h-full object-cover" src={getImageUrl(item.thumbnail_url) || ''} alt={item.product_name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-3xl text-slate-200">smartphone</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate mb-1">{item.product_name}</h4>
                          <div className="flex items-center gap-3">
                            <div className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-500">SL: {item.quantity}</div>
                            <span className="text-sm font-bold text-primary">{formatPrice(item.price_at_purchase)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-800 dark:text-white">{formatPrice(item.price_at_purchase * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Info Card */}
                  <div className="mt-10 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-10">
                      <div className="space-y-3">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Cổng thanh toán</h5>
                        <div className="flex items-center gap-3">
                          <div className="size-10 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined font-bold">account_balance_wallet</span>
                          </div>
                          <div>
                            <p className="text-sm font-black">{order.payment_method}</p>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold mt-1.5 ${getPaymentStatusColor(order.payment_status)}`}>
                              <span className="material-symbols-outlined text-[14px]">
                                {order.payment_status === 'Đã thanh toán' ? 'check_circle' : order.payment_status === 'Thanh toán thất bại' ? 'cancel' : 'info'}
                              </span>
                              {order.payment_status}
                            </div>
                          </div>
                        </div>
                      </div>

                      {order.payment_status === 'Đã thanh toán' && (
                        <div className="space-y-3 border-l border-slate-200 dark:border-slate-700 pl-10 hidden sm:block">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Chi tiết giao dịch</h5>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500">Mã GD: <span className="font-bold text-slate-800 dark:text-slate-200">{order.transaction_id || 'MS-GD-' + order.order_id}</span></p>
                            <p className="text-xs text-slate-500">Ngày thanh toán: <span className="font-bold text-slate-800 dark:text-slate-200">{order.paid_at ? new Date(order.paid_at).toLocaleString('vi-VN') : new Date(order.order_date).toLocaleString('vi-VN')}</span></p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-auto">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thành tiền</p>
                      <p className="text-3xl font-black text-primary tracking-tight">{formatPrice(order.final_amount)}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-5 bg-slate-50/20 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  {(order.payment_status === 'Chờ thanh toán' || order.payment_status === 'Chưa thanh toán' || order.payment_status === 'Thanh toán thất bại') && order.payment_method !== 'COD' && order.status !== 'Đã hủy' && (
                    <Link
                      to={`/payment-gateway/${order.order_id}?method=${order.payment_method}`}
                      className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider hover:scale-[1.05] active:scale-[0.95] transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">payments</span>
                      {order.payment_status === 'Thanh toán thất bại' ? 'Thanh toán lại' : 'Thanh toán ngay'}
                    </Link>
                  )}
                  <button className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-slate-300">print</span>
                    In hóa đơn
                  </button>
                  <button className="px-5 py-2.5 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-all">
                    Xem vận chuyển
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 p-10 rounded-[3rem] bg-gradient-to-br from-[#4B0082] to-indigo-900 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="size-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-4xl">support_agent</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-black mb-2">Mọi thắc mắc về thanh toán?</h3>
              <p className="text-white/60 text-sm leading-relaxed">Nếu bạn gặp bất kỳ vấn đề nào trong quá trình giao dịch hoặc muốn yêu cầu hoàn tiền, vui lòng liên hệ ngay với trung tâm hỗ trợ của MobileStore.</p>
            </div>
            <button className="px-8 py-4 bg-white text-primary rounded-2xl font-black text-sm uppercase tracking-wider hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl">
              Chat với chúng tôi
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

