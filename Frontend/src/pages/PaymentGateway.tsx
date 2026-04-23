import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import api, { getImageUrl } from '../utils/api';

interface OrderItem {
  order_item_id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
  thumbnail_url: string;
}

interface Order {
  order_id: number;
  final_amount: number;
  payment_method: string;
  items: OrderItem[];
}

export default function PaymentGateway() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const urlMethod = searchParams.get('method');
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const method = urlMethod || order?.payment_method;

  useEffect(() => {
    const fetchOrder = () => {
      api.get<any>(`/orders/${id}`)
        .then(res => {
          if (res.success && res.data) {
            setOrder(res.data);
            // Nếu admin đã duyệt thì thành công
            if (res.data.payment_status === 'Đã thanh toán') {
               navigate('/order-success', { state: { orderId: res.data.order_id, items: res.data.items } });
            }
            // Nếu admin từ chối
            if (res.data.payment_status === 'Thanh toán thất bại' || res.data.status === 'Đã hủy') {
               setError('Thanh toán của bạn không được phê duyệt hoặc đơn hàng đã bị hủy.');
               setSuccess(false);
            }
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    };

    fetchOrder();

    // Polling mỗi 3 giây nếu đang ở trạng thái chờ (đã nhấn xác nhận)
    let interval: any;
    if (success && !error) {
       interval = setInterval(fetchOrder, 3000);
    }

    return () => clearInterval(interval);
  }, [id, success, error, navigate]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await api.put(`/orders/${id}/notify-payment`, {});
      if (res.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi thông báo thanh toán.');
    } finally {
      setConfirming(false);
    }
  };

  const getQRImage = () => {
    if (method === 'Momo') return '/qr-momo.png';
    if (method === 'ZaloPay') return '/qr-zalopay.png';
    return '/qr-bank.png'; // Chuyển khoản
  };

  const getMethodName = () => {
    if (method === 'Momo') return 'Ví MoMo';
    if (method === 'ZaloPay') return 'ZaloPay';
    if (method === 'Chuyển khoản') return 'Chuyển khoản Ngân hàng';
    return method;
  };

  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + '₫';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h2>
      <Link to="/" className="text-primary hover:underline">Quay lại trang chủ</Link>
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center font-display">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-primary/20 animate-fadeIn">
          <div className="size-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <span className="material-symbols-outlined text-4xl">inventory</span>
          </div>
          <h2 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">Đã gửi yêu cầu thanh toán</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Hệ thống đã ghi nhận thông báo chuyển khoản của bạn cho đơn hàng <b>#{order.order_id}</b>. Vui lòng chờ <b>Admin</b> phê duyệt giao dịch.
          </p>
          <div className="space-y-3">
            <Link 
              to="/order-history" 
              className="w-full h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-xl shadow-primary/20"
            >
              <span className="material-symbols-outlined">history</span> Xem lịch sử đơn hàng
            </Link>
            <Link 
              to="/" 
              className="w-full h-12 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center font-display">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-red-500/20 animate-fadeIn">
          <div className="size-20 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
            <span className="material-symbols-outlined text-4xl">error</span>
          </div>
          <h2 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">Thanh toán thất bại</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            {error}
          </p>
          <div className="space-y-3">
             <button 
              onClick={() => { setError(null); setSuccess(false); }}
              className="w-full h-14 bg-red-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-xl shadow-red-500/20"
            >
              Thử thanh toán lại
            </button>
            <Link 
              to="/" 
              className="w-full h-12 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-display text-slate-900 dark:text-slate-100 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-primary/10 sticky top-0 z-50 py-4 px-6 md:px-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <Link to="/" className="flex items-center gap-3">
              <div className="size-8 text-primary">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold uppercase tracking-tight text-primary">Cổng Thanh Toán</h2>
           </Link>
           <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đơn hàng #{order.order_id}</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Product Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-primary/10 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">shopping_basket</span>
                Thông tin sản phẩm
              </h3>
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.order_item_id} className="flex gap-4 items-center">
                    <div className="size-24 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0">
                      <img src={getImageUrl(item.thumbnail_url) || ''} alt={item.product_name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                       <h4 className="font-bold text-lg mb-1">{item.product_name}</h4>
                       <p className="text-sm text-slate-500">Số lượng: <span className="font-bold text-slate-800 dark:text-slate-200">{item.quantity}</span></p>
                       <p className="text-primary font-bold mt-1">{formatPrice(item.price_at_purchase)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <span className="text-slate-500 font-medium">Tổng số tiền cần thanh toán:</span>
                 <span className="text-3xl font-black text-primary">{formatPrice(order.final_amount)}</span>
              </div>
            </div>

            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4">
               <span className="material-symbols-outlined text-primary mt-0.5">info</span>
               <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Lưu ý: Sau khi quét mã và thanh toán thành công, vui lòng nhấn <b>"Xác nhận thanh toán"</b> để hệ thống ghi nhận đơn hàng của bạn. Đơn hàng sẽ tự động hủy nếu không thanh toán trong vòng 15 phút.
               </div>
            </div>
          </div>

          {/* Right: Payment QR */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border-2 border-primary/20 shadow-2xl shadow-primary/10 flex flex-col items-center">
               <div className="mb-6 text-center">
                  <h3 className="text-xl font-black mb-1">Quét mã QR để thanh toán</h3>
                  <p className="text-sm text-slate-500 font-medium">Thanh toán qua <span className="text-primary font-bold">{getMethodName()}</span></p>
               </div>

               <div className="relative group">
                  <div className="absolute inset-0 bg-primary/10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-white p-6 rounded-[2rem] shadow-inner border border-slate-100">
                    <img src={getQRImage()} alt="Payment QR" className="w-64 h-64 object-contain" />
                  </div>
               </div>

               <div className="mt-8 w-full space-y-4">
                  <button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {confirming ? (
                      <>
                        <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang xác nhận...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">check_circle</span>
                        XÁC NHẬN THANH TOÁN
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate(-1)}
                    className="w-full h-12 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-sm"
                  >
                    Quay lại
                  </button>
               </div>

               <div className="mt-8 flex items-center gap-6 opacity-30">
                  <img src="/qr-momo.png" className="h-6 grayscale object-contain" alt="" />
                  <img src="/qr-zalopay.png" className="h-4 grayscale object-contain" alt="" />
                  <span className="font-bold text-xs uppercase tracking-widest">Global Secure</span>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
