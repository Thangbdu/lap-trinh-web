import { Link } from 'react-router-dom';

export default function AddressBook() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          {/* Header Navigation */}
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-10 py-3 sticky top-0 z-50">
            <Link to="/" className="flex items-center gap-4 text-primary">
              <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary">smartphone</span>
              </div>
              <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">MobileStore</h2>
            </Link>
            <div className="flex flex-1 justify-end gap-4 md:gap-6 items-center">
              <div className="flex gap-2">
                <Link to="/cart" className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">shopping_cart</span>
                </Link>
                <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">notifications</span>
                </button>
              </div>
              <Link to="/profile" className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20" data-alt="User profile avatar photo" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCza2LqNBsHBH6wtwD26cEnKX6bHQCNWBFYxB3HfLx7vTxb1n3nRBdjnR0u1-J1zrQE99MCnowyrVAmhHoeVAyZOi1u9IY4a_rgaHzp4UsOlwMJ_Cf0ihtgXlum-jLbLez2Za3l_41BcCNrnZqvGy6guQg8uGDQjs8IyEjxA01SM9dYqfHQSxYP4Co6fuj-WyEcHErBZJsd6vSUvJeooh64p04Sr6nagplwWGLw6hgFjCkPoGvtBSXdcQR6eF115g0uVO70irZH2vU")' }}>
              </Link>
            </div>
          </header>
          <main className="flex flex-1 justify-center py-8 px-4 md:px-10 lg:px-20 max-w-[1440px] mx-auto w-full gap-8">
            {/* Sidebar Navigation */}
            <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-6">
              <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex gap-3 items-center mb-4">
                  <div className="bg-primary/10 text-primary rounded-full p-2 flex items-center justify-center">
                    <span className="material-symbols-outlined">account_circle</span>
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <h1 className="text-slate-900 dark:text-white text-base font-bold truncate">Nguyá»…n VÄƒn A</h1>
                    <p className="text-slate-500 text-xs truncate">Galaxy Purple Theme</p>
                  </div>
                </div>
                <nav className="flex flex-col gap-1">
                  <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" to="/profile">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    <span className="text-sm font-medium">ThĂ´ng tin cĂ¡ nhĂ¢n</span>
                  </Link>
                  <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" to="/order-history">
                    <span className="material-symbols-outlined text-[20px]">history</span>
                    <span className="text-sm font-medium">Lá»‹ch sá»­ Ä‘Æ¡n hĂ ng</span>
                  </Link>
                  <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" to="/wishlist">
                    <span className="material-symbols-outlined text-[20px]">favorite</span>
                    <span className="text-sm font-medium">Danh sĂ¡ch yĂªu thĂ­ch</span>
                  </Link>
                  <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary border-r-4 border-primary" to="/address-book">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                    <span className="text-sm font-bold">Sá»• Ä‘á»‹a chá»‰</span>
                  </Link>
                </nav>
              </div>
            </aside>
            {/* Content Area */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">Sá»• Ä‘á»‹a chá»‰</h2>
                  <p className="text-slate-500 text-sm">Quáº£n lĂ½ danh sĂ¡ch Ä‘á»‹a chá»‰ giao hĂ ng cá»§a báº¡n Ä‘á»ƒ thanh toĂ¡n nhanh hÆ¡n.</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined">add</span>
                  <span>ThĂªm Ä‘á»‹a chá»‰ má»›i</span>
                </button>
              </div>
              {/* Address List */}
              <div className="grid grid-cols-1 gap-4">
                {/* Default Address Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-2 border-primary relative overflow-hidden group">
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg">
                    Máº·c Ä‘á»‹nh
                  </div>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="hidden md:block w-32 h-32 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20" data-location="Ho Chi Minh City">
                        <span className="material-symbols-outlined text-primary/40 text-4xl">map</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-slate-900 dark:text-white text-lg font-bold">Nguyá»…n VÄƒn A</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">NhĂ  riĂªng</span>
                        </div>
                        <p className="text-primary font-semibold text-sm mb-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">phone</span>
                          090 123 4567
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                          123 ÄÆ°á»ng TĂ­m, PhÆ°á»ng Galaxy, Quáº­n 1,<br />ThĂ nh phá»‘ Há»“ ChĂ­ Minh, Viá»‡t Nam
                        </p>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          Sá»­a
                        </button>
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:border-red-100 dark:hover:border-red-900/30 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          XoĂ¡
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Secondary Address Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all group">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="hidden md:block w-32 h-32 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700" data-location="Hanoi">
                        <span className="material-symbols-outlined text-slate-400 text-4xl">map</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-slate-900 dark:text-white text-lg font-bold">Tráº§n Thá»‹ B</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">VÄƒn phĂ²ng</span>
                        </div>
                        <p className="text-slate-500 font-semibold text-sm mb-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">phone</span>
                          098 765 4321
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                          ToĂ  nhĂ  MobileStore, 456 ÄÆ°á»ng Galaxy, PhÆ°á»ng Tinh TĂº, Quáº­n Cáº§u Giáº¥y,<br />Thá»§ Ä‘Ă´ HĂ  Ná»™i, Viá»‡t Nam
                        </p>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          Sá»­a
                        </button>
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:border-red-100 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          XoĂ¡
                        </button>
                        <button className="hidden md:block ml-auto text-primary text-sm font-bold hover:underline">
                          Thiáº¿t láº­p máº·c Ä‘á»‹nh
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Empty State Placeholder or Add Button Card */}
                <button className="group border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-3xl">add_location_alt</span>
                  </div>
                  <span className="text-slate-500 font-bold group-hover:text-primary transition-colors">ThĂªm má»™t Ä‘á»‹a chá»‰ má»›i</span>
                </button>
              </div>
            </div>
          </main>
          {/* Bottom Section / Footer-like spacing */}
          <footer className="mt-auto py-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-10">
            <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-500 text-sm">Â© 2024 MobileStore. All rights reserved.</p>
              <div className="flex gap-6 text-sm text-slate-500">
                <a className="hover:text-primary" href="#">ChĂ­nh sĂ¡ch báº£o máº­t</a>
                <a className="hover:text-primary" href="#">Äiá»u khoáº£n sá»­ dá»¥ng</a>
                <a className="hover:text-primary" href="#">Há»— trá»£ khĂ¡ch hĂ ng</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

