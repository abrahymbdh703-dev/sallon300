import React, { useState, useEffect } from 'react';

const App = () => {
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [bookings, setBookings] = useState(() => JSON.parse(localStorage.getItem('s300_bookings')) || []);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('s300_history')) || []);
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('s300_expenses')) || []);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [lang, setLang] = useState('ar');
  const [isLight, setIsLight] = useState(false);

  // حالة النافذة التأكيدية
  const [confirmModal, setConfirmModal] = useState({ show: false, type: null });

  const [searchBooking, setSearchBooking] = useState('');
  const [searchHistory, setSearchHistory] = useState('');

  const [selectedBookingServices, setSelectedBookingServices] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const MASTER_PASSWORD = "300";

  const GOLD = "#D4AF37";
  const GREEN = "#2ecc71";
  const RED = "#ff4d4d";

  const bgMain = isLight ? "#f8f9fa" : "#050505";
  const cardBg = isLight ? "#ffffff" : "rgba(20, 20, 20, 0.8)";
  const textColor = isLight ? "#1a1a1a" : "#ffffff";
  const sidebarBg = isLight ? "#ffffff" : "#000000";
  const inputBg = isLight ? "#f0f0f0" : "#0d0d0d";
  const borderColor = isLight ? "#e0e0e0" : "#222222";

  const t = {
    ar: {
      pos: "الكاشير", report: "التقارير", eid: "الحجوزات", finance: "الخزينة",
      services: "الخدمات المتاحة", order: "فاتورة جديدة", namePlace: "اسم العميل (مطلوب)...",
      confirm: "تأكيد الطلب", enterName: "أدخل الاسم أولاً", total: "إجمالي الفاتورة",
      net: "صافي الأرباح", delete: "حذف", done: "تم", add: "إضافة حجز",
      expense: "تسجيل مصروف", reason: "بيان المصروف...", amount: "المبلغ", reserve: "حجز جديد لـ (العيد)",
      lockTitle: "قسم محمي", lockDesc: "أدخل كلمة المرور للدخول", lockBtn: "دخول",
      attended: "تم الحضور", totalBooking: "إجمالي الحجز",
      searchPlace: "ابحث عن اسم العميل...",
      vaultTotal: "إجمالي الحجوزات", vaultCollected: "الخزينة (المحصل)", vaultPending: "المتبقي تحصيله",
      newShift: "بدء وردية جديدة", confirmReset: "هل أنت متأكد من مسح البيانات لبدء وردية جديدة؟",
      cancel: "إلغاء", confirmBtn: "تأكيد المسح"
    },
    en: {
      pos: "POS", report: "Reports", eid: "Bookings", finance: "Finance",
      services: "Services", order: "New Invoice", namePlace: "Customer Name...",
      confirm: "Confirm Order", enterName: "Enter Name First", total: "Order Total",
      net: "Net Profit", delete: "Delete", done: "Done", add: "Add Booking",
      expense: "Add Expense", reason: "Reason...", amount: "Amount", reserve: "New Booking (Eid)",
      lockTitle: "Protected Area", lockDesc: "Enter password to access", lockBtn: "Unlock",
      attended: "Attended", totalBooking: "Booking Total",
      searchPlace: "Search customer name...",
      vaultTotal: "Total Booked", vaultCollected: "Collected", vaultPending: "Pending",
      newShift: "Start New Shift", confirmReset: "Are you sure you want to clear data for a new shift?",
      cancel: "Cancel", confirmBtn: "Confirm Clear"
    }
  }[lang];

  const netProfit = history.reduce((a, b) => a + b.total, 0) - expenses.reduce((a, b) => a + b.amount, 0);
  const currentCartTotal = cart.reduce((a, b) => a + b.price, 0);

  const services = [
    { id: 1, name: lang === 'ar' ? "حلاقة شعر" : "Haircut", price: 100, icon: "💇‍♂️" },
    { id: 2, name: lang === 'ar' ? "حلاقة ذقن" : "Beard", price: 50, icon: "🧔" },
    { id: 3, name: lang === 'ar' ? "صبغة شعر" : "Color", price: 150, icon: "🎨" },
    { id: 4, name: lang === 'ar' ? "تنظيف بشرة" : "Facial", price: 200, icon: "✨" },
    { id: 5, name: lang === 'ar' ? "سشوار" : "seshwar", price: 80, icon: "🧯" }
  ];

  const currentBookingTotal = selectedBookingServices.reduce((acc, serviceName) => {
    const service = services.find(s => s.name === serviceName);
    return acc + (service ? service.price : 0);
  }, 0);

  useEffect(() => {
    localStorage.setItem('s300_bookings', JSON.stringify(bookings));
    localStorage.setItem('s300_history', JSON.stringify(history));
    localStorage.setItem('s300_expenses', JSON.stringify(expenses));
  }, [bookings, history, expenses]);

  useEffect(() => {
    if (activeTab === 'pos' || activeTab === 'finance') {
      setIsAuthenticated(false);
      setPasswordInput('');
    }
  }, [activeTab]);

  const showNotification = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  };

  const checkPassword = () => {
    if (passwordInput === MASTER_PASSWORD) {
      setIsAuthenticated(true);
      showNotification(lang === 'ar' ? "تم الدخول بنجاح" : "Access Granted");
    } else {
      showNotification(lang === 'ar' ? "كلمة المرور خاطئة!" : "Wrong Password!");
    }
  };

  // دالة المسح الشامل للبدء من جديد
  const executeReset = () => {
    setHistory([]);
    setExpenses([]);
    setBookings([]);
    setCart([]);
    setCustomerName('');
    showNotification(lang === 'ar' ? "تم تصفير كافة البيانات لبدء وردية جديدة" : "All data cleared for a new shift");
    setConfirmModal({ show: false, type: null });
  };

  const handleAttended = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking && booking.status !== 'attended') {
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'attended' } : b));
      setHistory([{ 
        id: Date.now(), 
        customer: booking.name, 
        total: booking.total, 
        items: booking.service, 
        time: new Date().toLocaleTimeString() 
      }, ...history]);
      showNotification(lang === 'ar' ? "تم تسجيل الحضور وإضافة المبلغ للأرباح" : "Marked as Attended & Added to Profits");
    }
  };

  const addNewBooking = () => {
    const name = document.getElementById('resName').value;
    const day = document.getElementById('resDay').value;
    const time = document.getElementById('resTime').value;

    if (name && day && time && selectedBookingServices.length > 0) {
      const newBooking = {
        id: Date.now(),
        name: name,
        service: selectedBookingServices.join(', '),
        total: currentBookingTotal,
        day: day,
        time: time,
        status: 'pending'
      };
      setBookings([newBooking, ...bookings]);
      showNotification(lang === 'ar' ? '✅ تم إضافة الحجز بنجاح' : '✅ Booking Saved');
      
      document.getElementById('resName').value = '';
      document.getElementById('resDay').value = '';
      document.getElementById('resTime').value = '';
      setSelectedBookingServices([]);
    } else {
      showNotification(lang === 'ar' ? '❌ أكمل جميع البيانات' : '❌ Fill all fields');
    }
  };

  const filteredBookings = bookings.filter(b => b.name.toLowerCase().includes(searchBooking.toLowerCase()));
  const filteredHistory = history.filter(h => h.customer.toLowerCase().includes(searchHistory.toLowerCase()));

  const bVaultTotal = filteredBookings.reduce((acc, curr) => acc + curr.total, 0);
  const bVaultCollected = filteredBookings.filter(b => b.status === 'attended').reduce((acc, curr) => acc + curr.total, 0);
  const bVaultPending = filteredBookings.filter(b => b.status !== 'attended').reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', background: bgMain, color: textColor,
      direction: lang === 'ar' ? 'rtl' : 'ltr', fontFamily: "'Cairo', sans-serif", transition: 'all 0.5s ease'
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${GOLD}; border-radius: 10px; }
        @keyframes reveal { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .interactive-card { 
            background: ${cardBg}; border: 1px solid ${borderColor}; border-radius: 24px; 
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); backdrop-filter: blur(15px);
        }
        .interactive-card:hover { transform: translateY(-8px); border-color: ${GOLD}; box-shadow: 0 15px 35px ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(212,175,55,0.15)'}; }
        .btn-fancy { transition: all 0.3s ease; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-fancy:hover:not(:disabled) { transform: scale(1.05); filter: brightness(1.2); }
        .btn-fancy:disabled { opacity: 0.3; cursor: not-allowed; }
        .nav-link { padding: 16px 20px; border-radius: 16px; margin-bottom: 8px; color: ${isLight ? '#555' : '#888'}; transition: 0.3s; cursor: pointer; display: flex; align-items: center; gap: 15px; }
        .nav-link.active { background: ${GOLD}; color: #000; font-weight: 900; box-shadow: 0 10px 20px ${GOLD}44; }
        input { background: ${inputBg}; border: 2px solid ${borderColor}; color: ${textColor}; padding: 12px 16px; border-radius: 14px; transition: 0.3s; width: 100%; box-sizing: border-box; font-family: 'Cairo', sans-serif; }
        input:focus { border-color: ${GOLD}; outline: none; box-shadow: 0 0 10px ${GOLD}33; }
        .service-chip { padding: 10px; border-radius: 12px; border: 1.5px solid ${borderColor}; cursor: pointer; transition: 0.3s; display: flex; flex-direction: column; align-items: center; gap: 4px; background: ${inputBg}; }
        .service-chip.selected { background: ${GOLD}; color: #000; border-color: ${GOLD}; transform: scale(1.05); font-weight: bold; }
        .search-bar { margin-bottom: 20px; position: relative; }
        .search-bar::before { content: "🔍"; position: absolute; left: ${lang === 'ar' ? 'auto' : '15px'}; right: ${lang === 'ar' ? '15px' : 'auto'}; top: 50%; transform: translateY(-50%); opacity: 0.5; }
        .search-bar input { padding-${lang === 'ar' ? 'right' : 'left'}: 45px; }
      `}</style>

      {/* نافذة التأكيد المنبثقة المخصصة */}
      {confirmModal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999, animation: 'fadeIn 0.3s ease', backdropFilter: 'blur(5px)'
        }}>
          <div className="interactive-card" style={{ width: '400px', padding: '40px', textAlign: 'center', animation: 'reveal 0.4s ease' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>⚠️</div>
            <h2 style={{ color: GOLD, marginBottom: '15px' }}>{lang === 'ar' ? 'تأكيد الإجراء' : 'Confirm Action'}</h2>
            <p style={{ opacity: 0.8, marginBottom: '30px', lineHeight: '1.6' }}>{t.confirmReset}</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn-fancy" onClick={() => setConfirmModal({ show: false, type: null })} style={{ flex: 1, background: '#333', color: '#fff', padding: '15px', borderRadius: '15px', fontWeight: 'bold' }}>
                {t.cancel}
              </button>
              <button className="btn-fancy" onClick={executeReset} style={{ flex: 1, background: RED, color: '#fff', padding: '15px', borderRadius: '15px', fontWeight: 'bold' }}>
                {t.confirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside style={{ width: '280px', background: sidebarBg, padding: '40px 20px', borderRight: `1px solid ${borderColor}`, zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h1 style={{ fontSize: '50px', color: GOLD, fontWeight: '900', margin: 0 }}>300</h1>
            <small style={{ opacity: 0.5, letterSpacing: '4px' }}>BARBER SHOP</small>
        </div>
        <nav>
          {['pos', 'sales_report', 'eid', 'finance'].map((tab) => (
            <div key={tab} onClick={() => setActiveTab(tab)} className={`nav-link ${activeTab === tab ? 'active' : ''}`}>
              <span style={{ fontSize: '20px' }}>{tab === 'pos' ? '🛒' : tab === 'sales_report' ? '📈' : tab === 'eid' ? '📅' : '💰'}</span>
              {t[tab === 'sales_report' ? 'report' : tab]}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '30px 50px', overflowY: 'auto' }}>
        <div style={{ position: 'sticky', top: '0', display: 'flex', justifyContent: 'flex-end', gap: '20px', paddingBottom: '30px', zIndex: 100 }}>
          <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="btn-fancy" style={{ background: cardBg, border: `1px solid ${borderColor}`, color: textColor, padding: '10px 20px', borderRadius: '50px' }}>
            {lang === 'ar' ? 'EN' : 'AR'}
          </button>
          <button onClick={() => setIsLight(!isLight)} className="btn-fancy" style={{ background: cardBg, border: `1px solid ${borderColor}`, width: '45px', height: '45px', borderRadius: '50%' }}>
            {isLight ? '🌙' : '☀️'}
          </button>
          <div style={{ background: GOLD, padding: '10px 25px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '10px', color: '#000' }}>
            <span style={{ fontWeight: 'bold' }}>{t.net}:</span>
            <b style={{ fontSize: '20px' }}>{netProfit}</b>
          </div>
        </div>

        {((activeTab === 'sales_report' || activeTab === 'eid') && !isAuthenticated) ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
            <div className="interactive-card" style={{ width: '350px', textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>🔐</div>
              <h2 style={{ color: GOLD, marginBottom: '10px' }}>{t.lockTitle}</h2>
              <input type="password" placeholder="••••" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && checkPassword()} style={{ textAlign: 'center', fontSize: '20px', marginBottom: '20px' }} />
              <button className="btn-fancy" onClick={checkPassword} style={{ width: '100%', background: GOLD, color: '#000', padding: '15px', borderRadius: '12px', fontWeight: '900' }}>{t.lockBtn}</button>
            </div>
          </div>
        ) : (
          <div style={{ animation: 'reveal 0.6s ease' }}>
            {activeTab === 'pos' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px' }}>
                <section>
                  <h2 style={{ marginBottom: '30px', color: GOLD }}>{t.services}</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                    {services.map((s) => (
                      <div key={s.id} className="interactive-card" style={{ padding: '25px 15px', textAlign: 'center', cursor: 'pointer' }}
                        onClick={() => { setCart([...cart, { ...s, cartId: Date.now() }]); showNotification(lang === 'ar' ? 'أضيف للحقيبة' : 'Added'); }}>
                        <div style={{ fontSize: '45px', marginBottom: '10px' }}>{s.icon}</div>
                        <div style={{ fontWeight: 'bold' }}>{s.name}</div>
                        <div style={{ color: GOLD, fontWeight: '900' }}>{s.price} ج.م</div>
                      </div>
                    ))}
                  </div>
                </section>
                
                <aside className="interactive-card" style={{ height: 'fit-content', padding: '25px', position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ marginBottom: '20px' }}>{t.order}</h3>
                  <input placeholder={t.namePlace} value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ marginBottom: '20px' }} />
                  
                  <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '10px' }}>
                    {cart.map(i => (
                      <div key={i.cartId} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: isLight ? '#f9f9f9' : '#111', borderRadius: '10px', marginBottom: '8px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '14px' }}>{i.name}</span>
                            <span style={{ fontSize: '11px', color: GOLD }}>{i.price} ج.م</span>
                        </div>
                        <button className="btn-fancy" onClick={() => setCart(cart.filter(x => x.cartId !== i.cartId))} style={{ color: RED, padding: '5px' }}>✕</button>
                      </div>
                    ))}
                  </div>

                  {cart.length > 0 && (
                    <div style={{ 
                        margin: '10px 0 20px 0', 
                        padding: '15px', 
                        borderTop: `2px dashed ${borderColor}`, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                    }}>
                        <span style={{ fontWeight: 'bold', opacity: 0.8 }}>{t.total}:</span>
                        <span style={{ fontSize: '22px', fontWeight: '900', color: GOLD }}>{currentCartTotal} ج.م</span>
                    </div>
                  )}

                  <button className="btn-fancy" disabled={!customerName.trim() || cart.length === 0} 
                    onClick={() => {
                        setHistory([{ id: Date.now(), customer: customerName, total: currentCartTotal, items: cart.map(i => i.name).join(', '), time: new Date().toLocaleTimeString() }, ...history]);
                        setCart([]); setCustomerName(''); showNotification('✅ Success');
                    }} 
                    style={{ width: '100%', background: (!customerName.trim() || cart.length === 0) ? '#444' : GOLD, color: '#000', padding: '18px', borderRadius: '15px', fontWeight: '900' }}>
                    {customerName.trim() ? t.confirm : t.enterName}
                  </button>
                </aside>
              </div>
            )}

            {activeTab === 'eid' && (
              <div style={{ animation: 'reveal 0.6s ease' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
                  <div className="interactive-card" style={{ padding: '15px', textAlign: 'center', borderBottom: `3px solid ${GOLD}` }}>
                    <small style={{ opacity: 0.6 }}>{t.vaultTotal}</small>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: GOLD }}>{bVaultTotal} <small>ج.م</small></div>
                  </div>
                  <div className="interactive-card" style={{ padding: '15px', textAlign: 'center', borderBottom: `3px solid ${GREEN}` }}>
                    <small style={{ opacity: 0.6 }}>{t.vaultCollected}</small>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: GREEN }}>{bVaultCollected} <small>ج.م</small></div>
                  </div>
                  <div className="interactive-card" style={{ padding: '15px', textAlign: 'center', borderBottom: `3px solid ${RED}` }}>
                    <small style={{ opacity: 0.6 }}>{t.vaultPending}</small>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: RED }}>{bVaultPending} <small>ج.م</small></div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
                  <div className="interactive-card" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h2 style={{ color: GOLD, margin: 0 }}>{lang === 'ar' ? 'جدول مواعيد العيد' : 'Eid Schedule'}</h2>
                        <button className="btn-fancy" onClick={() => setConfirmModal({ show: true, type: 'all' })} style={{ background: `${RED}15`, color: RED, padding: '8px 15px', borderRadius: '10px', fontSize: '13px', border: `1px solid ${RED}33` }}>
                            🔄 {t.newShift}
                        </button>
                    </div>
                    
                    <div className="search-bar">
                      <input 
                        type="text" 
                        placeholder={t.searchPlace} 
                        value={searchBooking} 
                        onChange={(e) => setSearchBooking(e.target.value)} 
                      />
                    </div>

                    <div style={{ display: 'grid', gap: '12px' }}>
                      {filteredBookings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px', opacity: 0.2 }}>📅 {lang === 'ar' ? 'لا توجد نتائج' : 'No results'}</div>
                      ) : (
                        filteredBookings.map((b) => (
                          <div key={b.id} className="interactive-card" style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', borderLeft: `5px solid ${b.status === 'attended' ? GREEN : GOLD}`, opacity: b.status === 'attended' ? 0.6 : 1 }}>
                            <div>
                              <div style={{ fontSize: '18px', fontWeight: 'bold', textDecoration: b.status === 'attended' ? 'line-through' : 'none' }}>{b.name}</div>
                              <div style={{ opacity: 0.6, fontSize: '12px' }}>{b.service}</div>
                              <div style={{ color: GOLD, fontSize: '14px', fontWeight: 'bold' }}>{b.day} | {b.time} | {b.total} ج.م</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button className="btn-fancy" disabled={b.status === 'attended'} onClick={() => handleAttended(b.id)} style={{ background: b.status === 'attended' ? '#333' : `${GREEN}22`, color: b.status === 'attended' ? '#777' : GREEN, width: '40px', height: '40px', borderRadius: '10px' }}>{b.status === 'attended' ? '✔' : '✓'}</button>
                              <button className="btn-fancy" onClick={() => setBookings(bookings.filter(x => x.id !== b.id))} style={{ background: `${RED}22`, color: RED, width: '40px', height: '40px', borderRadius: '10px' }}>🗑</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="interactive-card" style={{ padding: '30px', height: 'fit-content', position: 'sticky', top: '100px' }}>
                    <h3 style={{ marginBottom: '20px', color: GOLD }}>{t.reserve}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input id="resName" placeholder={t.namePlace} />
                      <label style={{ fontSize: '12px', opacity: 0.7 }}>{lang === 'ar' ? 'اختر الخدمات:' : 'Select Services:'}</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {services.map(s => (
                          <div key={s.id} className={`service-chip ${selectedBookingServices.includes(s.name) ? 'selected' : ''}`}
                            onClick={() => selectedBookingServices.includes(s.name) ? setSelectedBookingServices(selectedBookingServices.filter(n => n !== s.name)) : setSelectedBookingServices([...selectedBookingServices, s.name])}>
                            <span>{s.icon}</span>
                            <span style={{ fontSize: '11px' }}>{s.name}</span>
                            <span style={{ fontSize: '10px', opacity: 0.8 }}>{s.price}ج</span>
                          </div>
                        ))}
                      </div>

                      {selectedBookingServices.length > 0 && (
                        <div style={{ padding: '10px', border: `1px dashed ${GOLD}`, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', background: `${GOLD}11` }}>
                          <small>{t.totalBooking}:</small>
                          <b style={{ color: GOLD }}>{currentBookingTotal} ج.م</b>
                        </div>
                      )}

                      <input id="resDay" placeholder="اليوم (مثلاً: الوقفة)" />
                      <input id="resTime" type="time" />
                      <button className="btn-fancy" onClick={addNewBooking} style={{ background: GOLD, color: '#000', padding: '15px', borderRadius: '12px', fontWeight: '900', marginTop: '10px' }}>
                        {t.add}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sales_report' && (
              <div className="interactive-card" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 style={{ color: GOLD, margin: 0 }}>{t.report}</h2>
                    <button className="btn-fancy" onClick={() => setConfirmModal({ show: true, type: 'all' })} style={{ background: `${RED}15`, color: RED, padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', border: `1px solid ${RED}33` }}>
                        🧹 {t.newShift}
                    </button>
                </div>
                
                <div className="search-bar">
                    <input 
                      type="text" 
                      placeholder={t.searchPlace} 
                      value={searchHistory} 
                      onChange={(e) => setSearchHistory(e.target.value)} 
                    />
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {filteredHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px', opacity: 0.2 }}>📊 {lang === 'ar' ? 'لا توجد نتائج' : 'No results'}</div>
                  ) : (
                    filteredHistory.map((s) => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: isLight ? '#f9f9f9' : '#0a0a0a', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
                        <div>
                          <b>{s.customer}</b>
                          <div style={{ opacity: 0.5, fontSize: '12px' }}>{s.items} | {s.time}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <span style={{ color: GREEN, fontWeight: '900' }}>+{s.total}</span>
                          <button className="btn-fancy" onClick={() => setHistory(history.filter(h => h.id !== s.id))} style={{ color: RED }}>🗑</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'finance' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="interactive-card" style={{ padding: '30px' }}>
                  <h3 style={{ color: RED, marginBottom: '20px' }}>{t.expense}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input id="exR" placeholder={t.reason} />
                    <input id="exA" type="number" placeholder={t.amount} />
                    <button className="btn-fancy" onClick={() => {
                      const r = document.getElementById('exR').value;
                      const a = document.getElementById('exA').value;
                      if (r && a) {
                        setExpenses([{ id: Date.now(), reason: r, amount: parseFloat(a), time: new Date().toLocaleTimeString() }, ...expenses]);
                        showNotification('✔️ Saved');
                        document.getElementById('exR').value = ''; document.getElementById('exA').value = '';
                      }
                    }} style={{ background: RED, color: '#fff', padding: '15px', borderRadius: '12px' }}>{lang === 'ar' ? 'إضافة' : 'Add'}</button>
                  </div>
                </div>
                <div className="interactive-card" style={{ padding: '30px' }}>
                  <h3 style={{ marginBottom: '20px' }}>{lang === 'ar' ? 'سجل المصاريف' : 'Expenses Log'}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {expenses.map((e) => (
                      <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: isLight ? '#fff' : '#0a0a0a', borderRadius: '10px', borderRight: `4px solid ${RED}` }}>
                        <div><b>{e.reason}</b><br /><small style={{ opacity: 0.5 }}>{e.time}</small></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: RED, fontWeight: 'bold' }}>-{e.amount}</span>
                          <button className="btn-fancy" onClick={() => setExpenses(expenses.filter(x => x.id !== e.id))} style={{ color: RED }}>🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {toast.show && (
        <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: GOLD, color: '#000', padding: '12px 35px', borderRadius: '50px', fontWeight: '900', boxShadow: `0 10px 30px rgba(0,0,0,0.3)`, zIndex: 2000, animation: 'reveal 0.4s ease-out forwards' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default App;