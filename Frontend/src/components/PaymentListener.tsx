import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';

interface Order {
  order_id: number;
  payment_status: string;
  status: string;
}

export default function PaymentListener() {
  const { isAuthenticated, user } = useAuth();
  const [notification, setNotification] = useState<{ id: number; status: 'success' | 'error'; message: string } | null>(null);
  const prevStatuses = useRef<Record<number, string>>({});
  const initialLoad = useRef(true);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'customer') {
      setNotification(null);
      prevStatuses.current = {};
      initialLoad.current = true;
      return;
    }

    const checkPayments = async () => {
      try {
        const res = await api.get<Order[]>('/orders/my');
        if (res.success && res.data) {
          const currentOrders = res.data;
          
          if (!initialLoad.current) {
            // Check for changes
            for (const order of currentOrders) {
              const prevStatus = prevStatuses.current[order.order_id];
              const currentStatus = order.payment_status;

              if (prevStatus && prevStatus !== currentStatus) {
                if (currentStatus === 'Đã thanh toán') {
                  setNotification({
                    id: order.order_id,
                    status: 'success',
                    message: `Đơn hàng #${order.order_id} của bạn đã được thanh toán thành công!`
                  });
                } else if (currentStatus === 'Thanh toán thất bại') {
                  setNotification({
                    id: order.order_id,
                    status: 'error',
                    message: `Thanh toán cho đơn hàng #${order.order_id} đã bị từ chối.`
                  });
                }
              }
            }
          }

          // Update refs
          const newStatuses: Record<number, string> = {};
          currentOrders.forEach(o => {
            newStatuses[o.order_id] = o.payment_status;
          });
          prevStatuses.current = newStatuses;
          initialLoad.current = false;
        }
      } catch (err) {
        console.error('PaymentListener error:', err);
      }
    };

    const interval = setInterval(checkPayments, 5000); // Check every 5 seconds
    checkPayments(); // Initial check

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  if (!notification) return null;

  return (
    <div className="fixed top-20 right-6 z-[999] animate-slideInRight">
      <div className={`max-w-xs p-5 rounded-2xl shadow-2xl border-2 flex flex-col gap-3 ${
        notification.status === 'success' 
          ? 'bg-white dark:bg-slate-900 border-green-500 shadow-green-500/20' 
          : 'bg-white dark:bg-slate-900 border-red-500 shadow-red-500/20'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
            notification.status === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'
          }`}>
            <span className="material-symbols-outlined font-bold">
              {notification.status === 'success' ? 'check_circle' : 'error'}
            </span>
          </div>
          <div className="flex-1">
            <h4 className={`font-bold text-sm ${notification.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              Thông báo đơn hàng
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {notification.message}
            </p>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/order-history" 
            onClick={() => setNotification(null)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-bold text-center transition-all ${
              notification.status === 'success' 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            XEM CHI TIẾT
          </Link>
          <button 
            onClick={() => setNotification(null)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] font-bold"
          >
             ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
}
