import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
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
          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-sm font-medium text-white/90 hover:text-white transition-colors" href="#">iPhone</a>
            <a className="text-sm font-medium text-white/90 hover:text-white transition-colors" href="#">Samsung</a>
            <a className="text-sm font-medium text-white/90 hover:text-white transition-colors" href="#">Xiaomi</a>
            <a className="text-sm font-medium text-white/90 hover:text-white transition-colors" href="#">Phụ kiện</a>
          </nav>
          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white">search</span>
              <input className="w-full bg-white/10 border-none rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-white/50 text-sm transition-all text-white placeholder:text-white/60" placeholder="Tìm kiếm điện thoại, phụ kiện..." type="text" />
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/cart" className="p-2 hover:bg-white/10 rounded-full relative transition-colors">
              <span className="material-symbols-outlined">shopping_cart</span>
              <span className="absolute top-1 right-1 bg-white text-[#4B0082] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-lg">person</span>
                  <span className="text-sm font-medium hidden sm:block">{user?.full_name?.split(' ').pop()}</span>
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
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-xl bg-slate-900 text-white min-h-[400px] md:min-h-[500px] flex items-center">
          <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center" data-alt="Close up of iPhone 15 Pro titanium finish" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBjlmyCPO2qfqRCi4IpVw1e5-gIkVzDvgQpMB4kHzE-6F3A92r71XU8G-RBP9e-Np8w2pTwLbvmfIZXVoPHEU_0zpIBDEbxEaw4NQfGwidukRraYc7rOx3ayLeZci2aTwbrjKQRfPWtmHir3RC86Xuz2EQtcxSvGn5KsqfIxXhbvNEQ9Q0SEee_9kZfg1JtaLzKQhbCeAR49f-vPzN_IkpTDJPVvjZRphsRKlEtH-j4E9unnsE5MXEn0o3DD54nFF4Y5z18N8vgoxQ')" }}></div>
          <div className="relative z-10 px-8 md:px-16 max-w-2xl space-y-6">
            <span className="inline-block px-3 py-1 bg-primary/30 backdrop-blur-md rounded text-primary border border-primary/50 text-xs font-bold uppercase tracking-widest">Mới nhất</span>
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">iPhone 15 Pro.<br />Titan bền bỉ.</h2>
            <p className="text-slate-300 text-lg leading-relaxed">Sức mạnh từ chip A17 Pro. Hệ thống camera chuyên nghiệp 48MP. Thiết kế Titanium đẳng cấp hàng không.</p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/product/iphone-15-pro" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105">Mua ngay</Link>
              <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3 rounded-xl font-bold backdrop-blur-sm transition-all">Khám phá</button>
            </div>
          </div>
        </section>
        {/* Product Categories */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Danh mục sản phẩm</h3>
            <a className="text-primary text-sm font-semibold flex items-center gap-1" href="#">Xem tất cả <span className="material-symbols-outlined text-sm">arrow_forward</span></a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="group cursor-pointer bg-white dark:bg-slate-800 p-6 rounded-xl border border-primary/5 text-center transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">phone_iphone</span>
              </div>
              <span className="font-bold">iPhone</span>
            </div>
            <div className="group cursor-pointer bg-white dark:bg-slate-800 p-6 rounded-xl border border-primary/5 text-center transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">smartphone</span>
              </div>
              <span className="font-bold">Samsung</span>
            </div>
            <div className="group cursor-pointer bg-white dark:bg-slate-800 p-6 rounded-xl border border-primary/5 text-center transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">ad_units</span>
              </div>
              <span className="font-bold">Xiaomi</span>
            </div>
            <div className="group cursor-pointer bg-white dark:bg-slate-800 p-6 rounded-xl border border-primary/5 text-center transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">headphones</span>
              </div>
              <span className="font-bold">Phụ kiện</span>
            </div>
          </div>
        </section>
        {/* Latest Products / Hot Deals */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-2xl font-bold">Sản phẩm mới nhất</h3>
            <div className="h-[1px] flex-1 bg-primary/10"></div>
            <div className="flex gap-2">
              <button className="w-10 h-10 border border-primary/20 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 border border-primary/20 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Product Card 1 */}
            <div className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-primary/5 hover:shadow-xl transition-all">
              <Link to="/product/iphone-15-pro" className="block relative aspect-square overflow-hidden bg-slate-50">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="iPhone 15 Pro Natural Titanium front view" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2XiQGKa5cr_t-64EN1oqIVYBY7mqw1_TDDsjjbIDPoBMwgHe-nLnD7f71i1NzEGchmpFXqHtA8SwdhTaFgRNOtRpym7a4rj_-TLf-1PFzPf6kX6EsSKqYbFACkjYAHTTqCMxo493tSTSMAYvLTtXL_NvRrW_NaljzILTmRBJT7L-Q_J6_SxlgQJlpN7nZLGR6ejgGrtVYoWXoRdIvTfThCVx3wAC0e8aV1USyudVDaYPqIynDz24p2j14wnOAd-sTValoqdFpPYU" />
                <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">HOT</div>
              </Link>
              <div className="p-4 space-y-2">
                <Link to="/product/iphone-15-pro" className="font-bold text-lg leading-tight truncate block hover:text-primary">iPhone 15 Pro 128GB</Link>
                <div className="flex items-center gap-1 text-yellow-500">
                  <span className="material-symbols-outlined text-sm fill-1">star</span>
                  <span className="text-xs font-semibold text-slate-500">4.9 (120 đánh giá)</span>
                </div>
                <div className="pt-2">
                  <span className="text-primary font-bold text-xl">28.990.000đ</span>
                  <span className="text-slate-400 line-through text-sm ml-2">32.990.000đ</span>
                </div>
                <button className="w-full bg-primary/5 group-hover:bg-primary group-hover:text-white text-primary py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span> Thêm vào giỏ
                </button>
              </div>
            </div>
            {/* Product Card 2 */}
            <div className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-primary/5 hover:shadow-xl transition-all">
              <div className="relative aspect-square overflow-hidden bg-slate-50">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Samsung Galaxy S24 Ultra Phantom Black" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMGpPUvJXmdyQ-CLRbaw_S79niovL-d8fUVhOycEIt4gMrL3uLOoJOxilImKZk7MK34dQZykxHI3zxKmcaKWsRqOcBmy6vFLtfBJ_sNCPpiseAB3hTg2T-w9v03TVpAF-CHZOfQPyi9Euc9ScdY9gdn2len5l4r81JqW3MFCaWcofr3RLsxiBmpsIY8pEzblNxgv-4SyMlijH5jDURGj_L5E-CFg3PBwJArFZ-_nGt0SkIh77XsNySY-giTEIXge8Jek0wxrErTYY" />
                <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">TRẢ GÓP 0%</div>
              </div>
              <div className="p-4 space-y-2">
                <h4 className="font-bold text-lg leading-tight truncate">Galaxy S24 Ultra</h4>
                <div className="flex items-center gap-1 text-yellow-500">
                  <span className="material-symbols-outlined text-sm fill-1">star</span>
                  <span className="text-xs font-semibold text-slate-500">4.8 (85 đánh giá)</span>
                </div>
                <div className="pt-2">
                  <span className="text-primary font-bold text-xl">29.490.000đ</span>
                  <span className="text-slate-400 line-through text-sm ml-2">35.990.000đ</span>
                </div>
                <button className="w-full bg-primary/5 group-hover:bg-primary group-hover:text-white text-primary py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span> Thêm vào giỏ
                </button>
              </div>
            </div>
            {/* Product Card 3 */}
            <div className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-primary/5 hover:shadow-xl transition-all">
              <div className="relative aspect-square overflow-hidden bg-slate-50">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Xiaomi 14 Pro white model" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGoSzGTMv6GUEmSq0rDj2Q2MNuklrnvp_GPfnh430d0ugpabURImZSVuGJN30fy4lzdS1OeZec5cXB4zI3qJpA5RIyooLSLKQjp5EGN_Gu0e7DOfc6JehQ1oZG60R68MPdm8ho5BBGeWdxMymY4_eMHXQBZOWWBypM2f4ocNKUjlO2_7dzxFxZ-Hr_l0lMrmaziI9U0E7eUhI59Nuiy8KqiYKR-GqILcqt1riczGGd9t84Nq4FPa2kQH-Olp3lVLhhoA7KVwd60mQ" />
              </div>
              <div className="p-4 space-y-2">
                <h4 className="font-bold text-lg leading-tight truncate">Xiaomi 14 Pro</h4>
                <div className="flex items-center gap-1 text-yellow-500">
                  <span className="material-symbols-outlined text-sm fill-1">star</span>
                  <span className="text-xs font-semibold text-slate-500">4.7 (52 đánh giá)</span>
                </div>
                <div className="pt-2">
                  <span className="text-primary font-bold text-xl">18.290.000đ</span>
                  <span className="text-slate-400 line-through text-sm ml-2">20.990.000đ</span>
                </div>
                <button className="w-full bg-primary/5 group-hover:bg-primary group-hover:text-white text-primary py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span> Thêm vào giỏ
                </button>
              </div>
            </div>
            {/* Product Card 4 */}
            <div className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-primary/5 hover:shadow-xl transition-all">
              <div className="relative aspect-square overflow-hidden bg-slate-50">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="iPad Pro M2 silver" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZ4NZZ8K81DCtm2p6VgNojqchgu6GeLBduYSOdLl1-tRNmpPNvXVflfpnp6C67JXgH0JLnrDbriWrqGZ8Qe1c7SF3OvUZoNYNJL1lZ2i00BgMPYS6h9jit51sZCA8NUTRcbSwtjjARYkEAabF7P0i_XA6hdkUUBYA_ICkk4DVesdaVZNyyimEegjh0ZqwRwh61iZEGbc1rIxd0aklZ_TI3bKVRQSuy933GAieslEHpB06LzEXWKBzFE7gfcsqYpb-iharo2FoBZPU" />
                <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">-15%</div>
              </div>
              <div className="p-4 space-y-2">
                <h4 className="font-bold text-lg leading-tight truncate">iPad Pro M2 11" 256GB</h4>
                <div className="flex items-center gap-1 text-yellow-500">
                  <span className="material-symbols-outlined text-sm fill-1">star</span>
                  <span className="text-xs font-semibold text-slate-500">4.9 (210 đánh giá)</span>
                </div>
                <div className="pt-2">
                  <span className="text-primary font-bold text-xl">22.490.000đ</span>
                  <span className="text-slate-400 line-through text-sm ml-2">26.490.000đ</span>
                </div>
                <button className="w-full bg-primary/5 group-hover:bg-primary group-hover:text-white text-primary py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span> Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
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
                <span>123 Đường Láng, Q. Đống Đa, Hà Nội</span>
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
          <p>© 2024 MobileStore. Tất cả các quyền được bảo lưu. Thiết kế bởi UI Designer.</p>
        </div>
      </footer>
    </div>
  );
}
