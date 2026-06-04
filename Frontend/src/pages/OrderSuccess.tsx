import { Link, useLocation } from 'react-router-dom';
import { getImageUrl } from '../utils/api';

export default function OrderSuccess() {
  const location = useLocation();
  const { orderId, items, paymentMethod } = (location.state as any) || { orderId: '?', items: [], paymentMethod: 'COD' };
  const isCOD = paymentMethod === 'COD';

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4 transition-colors">
      <div className="relative flex h-auto max-w-md w-full flex-col bg-white dark:bg-slate-900 overflow-hidden rounded-[2rem] shadow-2xl animate-fadeIn">
        <header className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-8 py-5">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="material-symbols-outlined text-primary font-bold group-hover:scale-110 transition-transform">smartphone</span>
            <h2 className="text-slate-900 dark:text-slate-100 text-lg font-black tracking-tighter">MobileStore</h2>
          </Link>
          <Link to="/" className="flex items-center justify-center rounded-full h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-red-500 hover:text-white transition-all">
            <span className="material-symbols-outlined text-sm">close</span>
          </Link>
        </header>

        <div className="flex flex-col items-center px-8 pt-12 pb-8 text-center">
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative flex items-center justify-center size-24 rounded-[2rem] bg-amber-500 text-white shadow-2xl shadow-amber-500/40 rotate-12 hover:rotate-0 transition-transform duration-500">
              <span className="material-symbols-outlined text-5xl">{isCOD ? 'task_alt' : 'verified'}</span>
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            {isCOD ? 'Đặt hàng thành công!' : 'Thanh toán thành công!'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-[300px] leading-relaxed">
            Đơn hàng <b>#{orderId}</b> đã được ghi nhận. Vui lòng chờ <b>Admin</b> duyệt đơn và xác nhận thông tin đơn hàng của bạn.
          </p>
        </div>

        <div className="px-8 mb-10 max-h-60 overflow-y-auto space-y-3">
          {items && items.length > 0 ? (
             items.map((item: any, idx: number) => (
               <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-colors">
                 <div className="size-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0">
                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={getImageUrl(item.thumbnail_url || item.primary_image) || ''} alt={item.product_name} />
                 </div>
                 <div className="flex flex-col min-w-0">
                   <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">Sản phẩm #{idx + 1}</span>
                   <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.product_name}</span>
                   <span className="text-xs text-slate-500 dark:text-slate-400 italic">Số lượng: {item.quantity}</span>
                 </div>
               </div>
             ))
          ) : (
            <div className="p-4 text-center text-slate-400 text-sm">Thông tin sản phẩm đang được cập nhật...</div>
          )}
        </div>

        <div className="px-8 pb-12 flex flex-col gap-4">
          <Link to="/order-history" className="w-full h-15 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wider">
            <span className="material-symbols-outlined">package_2</span>
            Theo dõi đơn hàng
          </Link>
          <Link to="/" className="w-full h-15 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center">
            Tiếp tục mua sắm
          </Link>
        </div>

        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-center items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          <span>Bảo mật bởi MobileStore Payment</span>
        </div>
      </div>
    </div>
  );
}
