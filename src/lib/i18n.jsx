import { createContext, useContext, useMemo, useState, useEffect } from "react";

const DICT = {
  en: {
    nav: { home: "Home", shop: "Shop", recommend: "AI Recommend", estimate: "AI Price", wishlist: "Wishlist", cart: "Cart", login: "Login", register: "Register", logout: "Logout", profile: "Profile", seller: "Seller", admin: "Admin", menu: "Menu", pages: "Pages", my: "My" },
    home: {
      heroEyebrow: "AI-Powered Laptop Marketplace",
      heroTitle1: "Find the perfect laptop,",
      heroTitle2: "intelligently.",
      heroSub: "Compare prices, get AI recommendations, and shop with confidence on LapGenius.",
      shopNow: "Shop Now", tryAi: "Try AI Recommend",
      browseBy: "Browse by Category", featured: "Featured Laptops", featuredSub: "Hand-picked premium laptops curated by our team",
      stats: "Trusted by thousands",
      statCustomers: "Customers", statOrders: "Orders", statSellers: "Sellers", statProducts: "Products",
      aiRecTitle: "Don't know what to buy?", aiRecSub: "Tell us your budget and use case. Our AI will recommend the right laptop in seconds.", tryNow: "Try Now",
      aiEstTitle: "Selling a laptop?", aiEstSub: "Get an instant AI-powered fair-market price for any laptop configuration.", estimate: "Estimate Price",
      whyTitle: "Why choose LapGenius?", whySub: "Everything you need to buy the right laptop with confidence.",
      why1Title: "Smart selection", why1: "Powerful filtering helps you find the right device fast.",
      why2Title: "Fair prices", why2: "Compare seller prices with a fair market price.",
      why3Title: "Easy shopping", why3: "A clean, fast experience for every user.",
      why4Title: "Huge variety", why4: "New, used, and refurbished devices in one place.",
      why5Title: "Built for devs & students", why5: "Devices suited for every workflow and budget.",
      why6Title: "AI-ready", why6: "Smart recommendations and price estimates that learn."
    },
    shop: {
      title: "Shop Laptops", search: "Search laptops...", filters: "Filters", all: "All", sort: "Sort", featured: "Featured", priceLow: "Price: Low to High", priceHigh: "Price: High to Low", nameAZ: "Name A–Z", category: "Category", brand: "Brand", condition: "Condition", clear: "Clear filters", noResults: "No laptops match your filters", prev: "Previous", next: "Next",
      categories: {
        all: "All",
        Gaming: "Gaming",
        Business: "Business",
        Programming: "Programming",
        Design: "Design",
        Lightweight: "Lightweight",
        Study: "Study",
        General: "General"
      },
      conditions: {
        all: "All",
        New: "New",
        Used: "Used",
        Refurbished: "Refurbished"
      }
    },
    product: { addToCart: "Add to Cart", buyNow: "Buy Now", inStock: "In Stock", outOfStock: "Out of Stock", sellerPrice: "Seller Price", aiPrice: "AI Suggested Price", good: "Good Price", over: "Overpriced", colors: "Colors", specs: "Specifications", seller: "Sold by", quantity: "Quantity",
      type: "Device Type", category: "Category", condition: "Condition", stock: "Stock", usage: "Recommended Usage", screen: "Screen Size", battery: "Battery", os: "Operating System", overview: "Overview", igpu: "Integrated GPU", none: "None"
    },
    priceEvaluation: {
      status: {
        good: "Good price",
        acceptable: "Acceptable price",
        slightlyHigh: "Slightly high price",
        overpriced: "Overpriced"
      },
      reason: {
        good: "The seller price is very close to the expected market price for this configuration.",
        acceptable: "The seller price is slightly above expectations but still acceptable.",
        slightlyHigh: "The seller price is somewhat higher than expected.",
        overpriced: "The seller price is significantly above the expected market price."
      }
    }
    ,
    cart: { title: "Your Cart", empty: "Your cart is empty", continue: "Continue Shopping", subtotal: "Subtotal", total: "Total", checkout: "Proceed to Checkout", remove: "Remove", loginRequired: "Please sign in first to complete your purchase." },
    wishlist: { title: "Your Wishlist", empty: "Your wishlist is empty", browse: "Browse laptops" },
    checkout: { title: "Checkout", shipping: "Delivery Address", payment: "Payment Method", cash: "Cash on Delivery", shamcash: "Sham Cash Deposit", placeOrder: "Place Order", success: "Order Placed!", successMsg: "Thank you. Your order is confirmed and now processing.", backHome: "Back to Home", fullName: "Full Name", phone: "Phone", address: "Address", city: "City",
      shamHeader: "Pay the booking deposit via Sham Cash, then upload the payment receipt to complete your order.",
      shamAccount: "Sham Cash Account Number",
      uploadProof: "Upload Payment Receipt",
      proofHint: "Allowed: JPG, PNG, PDF",
      proofRequired: "Please upload your payment receipt to continue.",
      proofUploaded: "Receipt selected"
    },
    auth: { login: "Welcome back", loginSub: "Sign in to your LapGenius account", register: "Create account", registerSub: "Join LapGenius today", email: "Email", password: "Password", name: "Full name", phone: "Phone Number", role: "Role", customer: "Customer", seller: "Seller", signIn: "Sign in", signUp: "Sign up", forgot: "Forgot password?", noAccount: "Don't have an account?", haveAccount: "Already have an account?", resetTitle: "Reset password", resetSub: "Enter your email to receive a code", sendCode: "Send code", code: "Verification code", verify: "Verify", newPassword: "New password", reset: "Reset password", demo: "Demo accounts",
      vRequired: "This field is required.", vEmail: "Please enter a valid email.", vPhone: "Please enter a valid phone number.", vPassLen: "Password must be at least 8 characters.", vPassUpper: "Password must contain at least 1 uppercase letter.", vPassNum: "Password must contain at least 1 number.", vPassSpec: "Password must contain at least 1 special character.", successCreated: "Account created successfully.", confirmPassword: "Confirm password", passwordsMismatch: "Passwords do not match"
    },
    profile: { title: "My Profile", info: "Account Info", orders: "My Orders", settings: "Settings", changePassword: "Change Password", currentPassword: "Current Password", save: "Save changes", joined: "Joined", editProfile: "Edit Profile", updated: "Profile updated successfully.", passwordUpdated: "Password updated successfully.", uploadPhoto: "Upload Photo",
      publicTitle: "Public Profile", accountType: "Account Type", typeUser: "User", typeSeller: "Seller", typeAdmin: "Admin", notFound: "User not found"
    },
    seller: { dashboard: "Seller Dashboard", products: "Products", orders: "Orders", analytics: "Analytics", addProduct: "Add Product", revenue: "Revenue", totalProducts: "Products", totalOrders: "Orders", pending: "Pending", sales: "Sales Trend", mix: "Product Mix",
      accept: "Accept Order", reject: "Reject Order", accepted: "Order accepted", rejected: "Order rejected",
      viewDetails: "View Details", orderDetails: "Order Details", orderDetailsSubtitle: "Review buyer, payment, and product information.", order: "Order", status: "Status", buyer: "Buyer", paymentMethod: "Payment Method", product: "Product", paymentProof: "Payment Proof"
    },
    admin: { dashboard: "Admin Dashboard", users: "Users", activity: "Activity", totalUsers: "Total Users", sellers: "Sellers", customers: "Customers", products: "Products", growth: "User Growth", weekly: "Weekly Activity", delete: "Delete", role: "Role", joined: "Joined" },
    ai: { recTitle: "AI Recommendation", recSub: "Tell us your budget and use case", budget: "Budget (USD)", budgetHint: "Enter a value between $100 and $2,000", usage: "Primary use", recommend: "Recommend", results: "Recommended for you",
          estTitle: "AI Price Estimator", estSub: "Get a fair market price for any laptop config", cpu: "CPU", gpu: "GPU", igpu: "Integrated GPU (optional)", ram: "RAM", storage: "Storage", screen: "Screen Size", battery: "Battery Condition", os: "Operating System", condition: "Condition", category: "Category", usage2: "Usage Type", estimate: "Estimate Price", estimated: "Estimated Market Price", breakdown: "Breakdown",
          vBudgetMin: "Budget must be at least $100.", vBudgetMax: "Budget cannot exceed $2,000."
    },
    orderStatus: { pending: "Pending", processing: "Processing", confirmed: "Confirmed", accepted: "Confirmed", rejected: "Cancelled", cancelled: "Cancelled", delivered: "Delivered", shipped: "Shipped" },
    footer: { tag: "AI-powered laptop marketplace", links: "Quick Links", contact: "Contact", legal: "Legal", privacy: "Privacy Policy", terms: "Terms of Use", rights: "All rights reserved." },
    common: { close: "Close", loading: "Loading...", back: "Back", save: "Save", optional: "optional", confirmDelete: "Are you sure you want to delete this item?" }
  },
  ar: {
    nav: { home: "الرئيسية", shop: "المتجر", recommend: "ترشيح ذكي", estimate: "تقدير السعر", wishlist: "المفضلة", cart: "السلة", login: "تسجيل الدخول", register: "إنشاء حساب", logout: "تسجيل الخروج", profile: "الملف الشخصي", seller: "البائع", admin: "المشرف", menu: "القائمة", pages: "الصفحات", my: "حسابي" },
    home: {
      heroEyebrow: "سوق لابتوبات مدعوم بالذكاء الاصطناعي",
      heroTitle1: "اعثر على اللابتوب المثالي،",
      heroTitle2: "بذكاء.",
      heroSub: "قارن الأسعار، احصل على ترشيحات ذكية، وتسوّق بثقة على LapGenius.",
      shopNow: "تسوّق الآن", tryAi: "جرّب الترشيح الذكي",
      browseBy: "تصفّح حسب الفئة", featured: "لابتوبات مميزة", featuredSub: "تشكيلة مختارة بعناية من فريقنا",
      stats: "موثوق به من الآلاف",
      statCustomers: "عميل", statOrders: "طلب", statSellers: "بائع", statProducts: "منتج",
      aiRecTitle: "لا تعرف ماذا تشتري؟", aiRecSub: "أخبرنا عن ميزانيتك واستخدامك وسنرشّح لك الأفضل خلال ثوانٍ.", tryNow: "جرّب الآن",
      aiEstTitle: "تبيع لابتوبك؟", aiEstSub: "احصل على تقدير ذكي لسعر السوق المناسب لأي مواصفات.", estimate: "قدّر السعر",
      whyTitle: "لماذا تختار LapGenius؟", whySub: "كل ما تحتاجه لاختيار اللابتوب المناسب بثقة.",
      why1Title: "اختيار ذكي", why1: "أنظمة ترشيح تساعدك على إيجاد الجهاز المناسب بسرعة.",
      why2Title: "أسعار مناسبة", why2: "مقارنة سعر البائع مع سعر السوق المناسب.",
      why3Title: "تجربة شراء سهلة", why3: "واجهة بسيطة وسريعة لجميع المستخدمين.",
      why4Title: "تنوع كبير", why4: "أجهزة جديدة ومستعملة ومجددة.",
      why5Title: "جاهزية للمطورين والطلاب", why5: "أجهزة مناسبة لجميع الاستخدامات.",
      why6Title: "دعم مستقبلي للذكاء الاصطناعي", why6: "توصيات وتقديرات أسعار ذكية."
    },
    shop: {
      title: "تسوّق اللابتوبات", search: "ابحث عن لابتوب...", filters: "الفلاتر", all: "الكل", sort: "ترتيب", featured: "المميز", priceLow: "السعر: من الأقل", priceHigh: "السعر: من الأعلى", nameAZ: "الاسم أ–ي", category: "الفئة", brand: "العلامة", condition: "الحالة", clear: "مسح", noResults: "لا توجد نتائج مطابقة", prev: "السابق", next: "التالي",
      categories: {
        all: "الكل",
        Gaming: "ألعاب (Gaming)",
        Business: "عمل مكتبي (Business)",
        Programming: "برمجة (Programming)",
        Design: "تصميم (Design)",
        Lightweight: "خفيف الوزن (Lightweight)",
        Study: "دراسة (Study)",
        General: "عام (General)"
      },
      conditions: {
        all: "الكل",
        New: "جديد (New)",
        Used: "مستعمل (Used)",
        Refurbished: "مجدد (Refurbished)"
      }
    },
    product: { addToCart: "أضف إلى السلة", buyNow: "اشترِ الآن", inStock: "متوفر", outOfStock: "غير متوفر", sellerPrice: "سعر البائع", aiPrice: "سعر AI المقترح", good: "سعر جيد", over: "سعر مرتفع", colors: "الألوان", specs: "المواصفات", seller: "البائع", quantity: "الكمية",
      type: "نوع الجهاز", category: "الفئة", condition: "الحالة", stock: "المخزون", usage: "الاستخدام المناسب", screen: "حجم الشاشة", battery: "البطارية", os: "نظام التشغيل", overview: "نظرة عامة", igpu: "كرت الشاشة المدمج", none: "لا يوجد"
    },
    priceEvaluation: {
      status: {
        good: "سعر مناسب",
        acceptable: "سعر مقبول",
        slightlyHigh: "سعر مرتفع قليلاً",
        overpriced: "سعر مبالغ فيه"
      },
      reason: {
        good: "سعر البائع قريب جداً من السعر المتوقع حسب مواصفات الجهاز.",
        acceptable: "سعر البائع أعلى قليلاً من المتوقع لكنه لا يزال مقبولاً.",
        slightlyHigh: "سعر البائع أعلى من المتوقع إلى حد ما.",
        overpriced: "سعر البائع أعلى بكثير من السعر المتوقع في السوق."
      }
    }
    ,
    cart: { title: "سلتك", empty: "سلتك فارغة", continue: "متابعة التسوق", subtotal: "المجموع", total: "الإجمالي", checkout: "إتمام الطلب", remove: "إزالة", loginRequired: "يجب تسجيل الدخول أولاً لإتمام عملية الشراء." },
    wishlist: { title: "المفضلة", empty: "قائمة المفضلة فارغة", browse: "تصفّح اللابتوبات" },
    checkout: { title: "إتمام الطلب", shipping: "عنوان التوصيل", payment: "طريقة الدفع", cash: "الدفع عند الاستلام", shamcash: "دفع عربون عبر شام كاش", placeOrder: "تأكيد الطلب", success: "تم تأكيد الطلب!", successMsg: "شكراً لك. طلبك الآن قيد المعالجة.", backHome: "العودة للرئيسية", fullName: "الاسم الكامل", phone: "الهاتف", address: "العنوان", city: "المدينة",
      shamHeader: "ادفع عربون الحجز عبر شام كاش ثم ارفع إشعار الدفع لإكمال الطلب.",
      shamAccount: "رقم حساب شام كاش",
      uploadProof: "ارفع إشعار الدفع",
      proofHint: "المسموح: JPG وPNG وPDF",
      proofRequired: "يرجى رفع إشعار الدفع للمتابعة.",
      proofUploaded: "تم اختيار الإشعار"
    },
    auth: { login: "أهلاً بعودتك", loginSub: "سجّل دخولك إلى حسابك", register: "إنشاء حساب", registerSub: "انضم إلى LapGenius اليوم", email: "البريد الإلكتروني", password: "كلمة المرور", name: "الاسم الكامل", phone: "رقم الهاتف", role: "النوع", customer: "عميل", seller: "بائع", signIn: "دخول", signUp: "تسجيل", forgot: "نسيت كلمة المرور؟", noAccount: "ليس لديك حساب؟", haveAccount: "لديك حساب؟", resetTitle: "استعادة كلمة المرور", resetSub: "أدخل بريدك لاستلام رمز التحقق", sendCode: "إرسال الرمز", code: "رمز التحقق", verify: "تحقق", newPassword: "كلمة المرور الجديدة", reset: "إعادة تعيين", demo: "حسابات تجريبية",
      vRequired: "هذا الحقل مطلوب.", vEmail: "البريد الإلكتروني غير صالح.", vPhone: "رقم الهاتف غير صالح.", vPassLen: "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل.", vPassUpper: "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل.", vPassNum: "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل.", vPassSpec: "يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل.", successCreated: "تم إنشاء الحساب بنجاح.", confirmPassword: "تأكيد كلمة المرور", passwordsMismatch: "كلمتا المرور غير متطابقتين"
    },
    profile: { title: "ملفي الشخصي", info: "معلومات الحساب", orders: "طلباتي", settings: "الإعدادات", changePassword: "تغيير كلمة المرور", currentPassword: "كلمة المرور الحالية", save: "حفظ التغييرات", joined: "انضم في", editProfile: "تعديل الملف الشخصي", updated: "تم تحديث الملف الشخصي بنجاح.", passwordUpdated: "تم تحديث كلمة المرور بنجاح.", uploadPhoto: "تحميل الصورة",
      publicTitle: "الملف الشخصي", accountType: "نوع الحساب", typeUser: "مستخدم", typeSeller: "بائع", typeAdmin: "مشرف", notFound: "المستخدم غير موجود"
    },
    seller: { dashboard: "لوحة البائع", products: "المنتجات", orders: "الطلبات", analytics: "التحليلات", addProduct: "إضافة منتج", revenue: "الإيرادات", totalProducts: "المنتجات", totalOrders: "الطلبات", pending: "قيد المعالجة", sales: "اتجاه المبيعات", mix: "توزيع المنتجات",
      accept: "قبول الطلب", reject: "رفض الطلب", accepted: "تم قبول الطلب", rejected: "تم رفض الطلب",
      viewDetails: "عرض التفاصيل", orderDetails: "تفاصيل الطلب", orderDetailsSubtitle: "راجع معلومات المشتري، الدفع، والمنتج.", order: "الطلب", status: "الحالة", buyer: "المشتري", paymentMethod: "طريقة الدفع", product: "المنتج", paymentProof: "إثبات الدفع"
    },
    admin: { dashboard: "لوحة الإدارة", users: "المستخدمون", activity: "النشاط", totalUsers: "إجمالي المستخدمين", sellers: "البائعون", customers: "العملاء", products: "المنتجات", growth: "نمو المستخدمين", weekly: "النشاط الأسبوعي", delete: "حذف", role: "النوع", joined: "تاريخ الانضمام" },
    ai: { recTitle: "الترشيح الذكي", recSub: "أخبرنا بميزانيتك واستخدامك", budget: "الميزانية (USD)", budgetHint: "أدخل قيمة بين 100$ و 2,000$", usage: "الاستخدام", recommend: "رشّح لي", results: "الترشيحات المناسبة لك",
          estTitle: "تقدير السعر الذكي", estSub: "احصل على سعر السوق المناسب لأي مواصفات", cpu: "المعالج", gpu: "كرت الشاشة", igpu: "كرت الشاشة المدمج (اختياري)", ram: "الذاكرة", storage: "التخزين", screen: "حجم الشاشة", battery: "حالة البطارية", os: "نظام التشغيل", condition: "الحالة", category: "الفئة", usage2: "نوع الاستخدام", estimate: "احسب السعر", estimated: "السعر التقديري", breakdown: "التفاصيل",
          vBudgetMin: "الميزانية يجب أن تكون 100$ على الأقل.", vBudgetMax: "الميزانية لا يمكن أن تتجاوز 2,000$."
    },
    orderStatus: { pending: "معلق", processing: "قيد المعالجة", confirmed: "مؤكد", accepted: "مؤكد", rejected: "ملغى", cancelled: "ملغى", delivered: "تم التسليم", shipped: "تم الشحن" },
    footer: { tag: "سوق لابتوبات مدعوم بالذكاء الاصطناعي", links: "روابط سريعة", contact: "تواصل", legal: "قانوني", privacy: "سياسة الخصوصية", terms: "شروط الاستخدام", rights: "جميع الحقوق محفوظة." },
    common: { close: "إغلاق", loading: "جارٍ التحميل...", back: "رجوع", save: "حفظ", optional: "اختياري", confirmDelete: "هل أنت متأكد أنك تريد حذف هذا العنصر؟" }
  }
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lg_lang");
      if (saved && saved !== "en") {
        setLang(saved);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("lg_lang", lang);
  }, [lang]);

  const value = useMemo(() => {
    const dict = DICT[lang];
    const t = (path) => {
      const keys = path.split(".");
      let v = dict;
      for (const k of keys) v = v?.[k];
      return v ?? path;
    };
    return { lang, setLang, t, isRTL: lang === "ar" };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
}
