import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Ban, ShieldCheck, Trash2, SlidersHorizontal, Package, User, Layers, Boxes, Star, MessageSquare } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { adminService } from "@/services/adminService";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { makeAbsoluteUrl } from "@/lib/api";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin — LapGenius" }, { name: "robots", content: "noindex" }] }),
  component: AdminProducts,
});

function AdminProducts() {
  const { t, lang } = useI18n();
  const isAr = lang === "ar";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // all, active, inactive
  const [stockFilter, setStockFilter] = useState("all"); // all, low, out, in

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals / Inputs
  const [reasonInput, setReasonInput] = useState("");
  const [deletingProductId, setDeletingProductId] = useState(null);
  // Disable product modal
  const [disablingProduct, setDisablingProduct] = useState(null);
  const [disableReason, setDisableReason] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const activeParam = activeFilter === "all" ? undefined : activeFilter === "active";
      const params = {
        search: search || undefined,
        category_id: categoryFilter || undefined,
        is_active: activeParam,
        stock_status: stockFilter === "all" ? undefined : stockFilter,
        page
      };
      const res = await adminService.products(params);
      setProducts(res.data?.data || []);
      setTotalPages(res.data?.last_page || 1);
    } catch (err) {
      toast.error(isAr ? "فشل تحميل المنتجات" : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter, activeFilter, stockFilter]);

  useEffect(() => {
    // Load categories for filter select
    adminService.categories()
      .then(res => setCategories(res.flat || []))
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleToggleActive = async (product) => {
    if (product.is_active) {
      // Disabling: open reason modal
      setDisablingProduct(product);
      setDisableReason("");
    } else {
      // Enabling: no reason needed
      try {
        await adminService.toggleProductActive(product.id);
        toast.success(isAr ? "تم تفعيل المنتج بنجاح" : "Product activated");
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: true } : p));
      } catch (err) {
        toast.error(isAr ? "فشل تغيير حالة المنتج" : "Failed to toggle status");
      }
    }
  };

  const confirmDisable = async () => {
    if (!disablingProduct) return;
    const reason = disableReason.trim() || (isAr ? "تم التعطيل بواسطة إدارة الموقع" : "Disabled by administrator");
    try {
      // Send reason along with toggle (backend should handle it)
      await adminService.toggleProductActive(disablingProduct.id, reason);
      toast.success(isAr ? "تم إلغاء تفعيل المنتج" : "Product deactivated");
      setProducts(prev => prev.map(p => p.id === disablingProduct.id ? { ...p, is_active: false } : p));
      setDisablingProduct(null);
    } catch (err) {
      toast.error(isAr ? "فشل تغيير حالة المنتج" : "Failed to toggle status");
    }
  };

  const handleUpdateStock = async (id, currentStock) => {
    const newStockStr = window.prompt(
      isAr ? "أدخل كمية المخزون الجديدة:" : "Enter new stock quantity:", 
      currentStock
    );
    if (newStockStr === null) return;
    const newStock = parseInt(newStockStr);
    if (isNaN(newStock) || newStock < 0) {
      toast.error(isAr ? "يرجى إدخال رقم صحيح" : "Please enter a valid positive number");
      return;
    }

    try {
      await adminService.updateProductStock(id, newStock);
      toast.success(isAr ? "تم تحديث المخزون بنجاح" : "Stock quantity updated");
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_quantity: newStock } : p));
    } catch (err) {
      toast.error(isAr ? "فشل تحديث المخزون" : "Failed to update stock");
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingProductId(id);
    setReasonInput("");
  };

  const handleConfirmDelete = async () => {
    if (!deletingProductId) return;
    const reason = reasonInput.trim() || (isAr ? "تم الحذف بواسطة إدارة الموقع" : "Deleted by administrator");
    try {
      await adminService.deleteProduct(deletingProductId, reason);
      toast.success(isAr ? "تم حذف المنتج بنجاح" : "Product deleted successfully");
      setDeletingProductId(null);
      fetchProducts();
    } catch (err) {
      toast.error(isAr ? "فشل حذف المنتج" : "Failed to delete product");
    }
  };

  return (
    <DashboardLayout kind="admin">
      <div className="mb-6">
        <h2 className="text-3xl font-black tracking-tight">{isAr ? "إدارة المنتجات" : "Products Management"}</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {isAr 
            ? "استعراض والتحكم بجميع المنتجات المرفوعة، تعديل المخزون، أو تعطيل/حذف أي منتج."
            : "Monitor and manage all listed products, update stock quantities, block or delete listings."}
        </p>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} className="bg-card border rounded-3xl p-5 mb-6 space-y-4 shadow-soft">
        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
          <SlidersHorizontal className="size-4 text-primary" />
          <span>{isAr ? "خيارات التصفية والبحث" : "Filter & Search Products"}</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? "اسم المنتج أو الماركة..." : "Search name or brand..."}
              className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
            />
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition cursor-pointer"
          >
            <option value="">{isAr ? "جميع الفئات" : "All Categories"}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
            className="h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition cursor-pointer"
          >
            <option value="all">{isAr ? "جميع الحالات" : "All Statuses"}</option>
            <option value="active">{isAr ? "مفعّل ونشط" : "Active Only"}</option>
            <option value="inactive">{isAr ? "معطل / غير نشط" : "Inactive Only"}</option>
          </select>

          {/* Stock status */}
          <select
            value={stockFilter}
            onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
            className="h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition cursor-pointer"
          >
            <option value="all">{isAr ? "المخزون: الكل" : "Stock: All"}</option>
            <option value="in">{isAr ? "متوفر (أكثر من 10)" : "In Stock (>10)"}</option>
            <option value="low">{isAr ? "مخزون منخفض (1-10)" : "Low Stock (1-10)"}</option>
            <option value="out">{isAr ? "نفذ من المخزون" : "Out of Stock (0)"}</option>
          </select>
        </div>

        <div className="flex justify-end pt-2 border-t">
          <button
            type="submit"
            className="h-10 px-5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-dark text-sm transition shadow-soft"
          >
            {isAr ? "تطبيق البحث" : "Apply Filters"}
          </button>
        </div>
      </form>

      {/* Table / List */}
      {loading ? (
        <div className="h-64 grid place-items-center">
          <span className="text-sm text-muted-foreground">{isAr ? "جاري تحميل المنتجات..." : "Loading products..."}</span>
        </div>
      ) : products.length === 0 ? (
        <div className="h-48 border border-dashed rounded-3xl grid place-items-center bg-card/20">
          <span className="text-muted-foreground text-sm">{isAr ? "لم يتم العثور على أي منتج." : "No products found."}</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop view */}
          <div className="hidden md:block rounded-3xl bg-card border shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-section">
                  <tr>
                    <th className="p-4 text-start">{isAr ? "المنتج" : "Product"}</th>
                    <th className="p-4 text-start">{isAr ? "البائع" : "Seller"}</th>
                    <th className="p-4 text-start">{isAr ? "السعر" : "Price"}</th>
                    <th className="p-4 text-start">{isAr ? "المخزون" : "Stock"}</th>
                    <th className="p-4 text-start">{isAr ? "النشاط" : "Sales/Rating"}</th>
                    <th className="p-4 text-end">{isAr ? "العمليات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((p) => {
                    const priceVal = parseFloat(p.price) || 0;
                    const discountVal = p.discount ? parseFloat(p.discount.discount_percent) : 0;
                    const finalPrice = discountVal > 0 ? priceVal * (1 - discountVal / 100) : priceVal;

                    return (
                      <tr key={p.id} className={`hover:bg-accent/5 transition ${!p.is_active ? "opacity-60 bg-destructive/5" : ""}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="size-12 rounded-xl overflow-hidden bg-accent shrink-0 border">
                              <img 
                                src={
                                  p.product_images?.[0]?.image_path
                                    ? (p.product_images[0].image_path.startsWith("http")
                                        ? p.product_images[0].image_path
                                        : makeAbsoluteUrl(p.product_images[0].image_path))
                                    : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=120&q=60"
                                } 
                                alt="" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <Link 
                                to="/product/$id" 
                                params={{ id: String(p.id) }} 
                                className="font-bold hover:text-primary transition text-sm truncate block"
                              >
                                {p.name}
                              </Link>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                <span>{p.brand}</span>
                                <span>•</span>
                                <span>{p.category?.name || p.category}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-foreground">{p.seller?.full_name || p.seller?.name || "Seller"}</div>
                            <div className="text-[10px] text-muted-foreground">ID: #{p.seller?.id}</div>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {discountVal > 0 ? (
                            <div>
                              <span className="text-[10px] line-through text-muted-foreground block">${priceVal.toLocaleString()}</span>
                              <span className="font-bold text-destructive">${finalPrice.toLocaleString()}</span>
                              <span className="text-[9px] font-extrabold text-destructive bg-destructive/10 px-1 rounded ml-1">-{discountVal}%</span>
                            </div>
                          ) : (
                            <span className="font-bold">${priceVal.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => handleUpdateStock(p.id, p.stock_quantity)}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold transition hover:opacity-85 ${
                              p.stock_quantity === 0
                                ? "bg-destructive/15 text-destructive"
                                : p.stock_quantity <= 5
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                : "bg-success/15 text-success"
                            }`}
                            title={isAr ? "اضغط لتعديل المخزون" : "Click to edit stock"}
                          >
                            {p.stock_quantity}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="size-3 text-yellow-500 fill-yellow-500" />
                              <span className="font-bold text-foreground">{(p.average_rating || 0).toFixed(1)}</span>
                            </div>
                            <div>{isAr ? "مباع" : "Sold"}: <span className="font-semibold text-foreground">{p.total_sold || 0}</span></div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle active state */}
                            <button
                              onClick={() => handleToggleActive(p)}
                              className={`size-9 rounded-lg grid place-items-center transition ${
                                p.is_active ? "text-destructive hover:bg-destructive/10" : "text-success hover:bg-success/10"
                              }`}
                              title={p.is_active ? (isAr ? "تعطيل المنتج" : "Deactivate Product") : (isAr ? "تفعيل المنتج" : "Activate Product")}
                            >
                              {p.is_active ? <Ban className="size-4" /> : <ShieldCheck className="size-4" />}
                            </button>

                            {/* Delete Product */}
                            <button
                              onClick={() => handleDeleteClick(p.id)}
                              className="size-9 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive grid place-items-center transition"
                              title={isAr ? "حذف المنتج" : "Delete Product"}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile view cards */}
          <div className="md:hidden space-y-3">
            {products.map((p) => {
              const priceVal = parseFloat(p.price) || 0;
              const discountVal = p.discount ? parseFloat(p.discount.discount_percent) : 0;
              const finalPrice = discountVal > 0 ? priceVal * (1 - discountVal / 100) : priceVal;

              return (
                <div key={p.id} className={`rounded-2xl border bg-card p-4 space-y-3 transition ${!p.is_active ? "opacity-60 bg-destructive/5" : ""}`}>
                  <div className="flex gap-3">
                    <div className="size-16 rounded-xl overflow-hidden bg-accent shrink-0 border">
                      <img 
                        src={
                          p.product_images?.[0]?.image_path
                            ? makeAbsoluteUrl(p.product_images[0].image_path)
                            : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=120&q=60"
                        } 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to="/product/$id" params={{ id: String(p.id) }} className="font-bold text-sm hover:text-primary transition truncate block">
                        {p.name}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-0.5">{p.brand} • {p.category?.name || p.category}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{isAr ? "البائع" : "Seller"}: {p.seller?.full_name || p.seller?.name}</div>
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-3 gap-2 border-y py-2 bg-accent/5 rounded-xl px-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-bold">{isAr ? "السعر" : "Price"}</span>
                      <span className="font-bold">${finalPrice.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-bold">{isAr ? "المخزون" : "Stock"}</span>
                      <button 
                        onClick={() => handleUpdateStock(p.id, p.stock_quantity)}
                        className="font-bold underline text-primary"
                      >
                        {p.stock_quantity}
                      </button>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-bold">{isAr ? "المبيعات" : "Sales"}</span>
                      <span className="font-semibold">{p.total_sold || 0} {isAr ? "قطع" : "sold"}</span>
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      p.is_active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                    }`}>
                      {p.is_active ? (isAr ? "نشط" : "Active") : (isAr ? "معطل" : "Inactive")}
                    </span>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`size-8 rounded-lg grid place-items-center border ${p.is_active ? "text-destructive" : "text-success"}`}
                      >
                        {p.is_active ? <Ban className="size-3.5" /> : <ShieldCheck className="size-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(p.id)}
                        className="size-8 rounded-lg text-muted-foreground border hover:text-destructive hover:border-destructive/30 grid place-items-center"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simple Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="h-9 px-4 rounded-xl border text-sm font-semibold hover:bg-accent disabled:opacity-50 transition"
              >
                {isAr ? "السابق" : "Prev"}
              </button>
              <span className="text-xs font-bold text-muted-foreground">
                {isAr ? "صفحة" : "Page"} {page} {isAr ? "من" : "of"} {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="h-9 px-4 rounded-xl border text-sm font-semibold hover:bg-accent disabled:opacity-50 transition"
              >
                {isAr ? "التالي" : "Next"}
              </button>
            </div>
          )}
        </div>
      )}

      {deletingProductId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border bg-card shadow-elev overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-destructive flex items-center gap-2">
                <Trash2 className="size-5" />
                <span>{isAr ? "سبب حذف المنتج" : "Delete Product Reason"}</span>
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                {isAr 
                  ? "سيتم إرسال إشعار للبائع يوضح سبب الحذف. يرجى توضيح السبب أدناه:" 
                  : "Please provide a reason. A notification will be sent to the seller explaining why their product listing was removed:"}
              </p>
              <textarea
                rows={3}
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder={isAr ? "مثال: منتج مخالف لشروط الاستخدام، أو محتوى غير لائق" : "e.g. Inappropriate images, terms of service violation..."}
                className="w-full p-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
              />
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  onClick={() => setDeletingProductId(null)}
                  className="h-10 px-4 rounded-xl border font-bold text-sm hover:bg-accent transition"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="h-10 px-5 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm hover:opacity-90 transition"
                >
                  {isAr ? "تأكيد الحذف" : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== DISABLE PRODUCT REASON MODAL ===== */}
      {disablingProduct && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border bg-card shadow-elev overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-amber-600 flex items-center gap-2">
                <Ban className="size-5" />
                <span>{isAr ? "سبب تعطيل المنتج" : "Disable Product Reason"}</span>
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                {isAr 
                  ? "سيتم إرسال إشعار للبائع يوضح سبب التعطيل. يرجى توضيح السبب أدناه:" 
                  : "A notification will be sent to the seller. Please provide the reason for disabling this product:"}
              </p>
              <textarea
                rows={3}
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
                placeholder={isAr ? "مثال: محتوى مخالف، سعر غير مناسب، معلومات ناقصة..." : "e.g. Misleading information, policy violation..."}
                className="w-full p-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
              />
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  onClick={() => setDisablingProduct(null)}
                  className="h-10 px-4 rounded-xl border font-bold text-sm hover:bg-accent transition"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={confirmDisable}
                  className="h-10 px-5 rounded-xl bg-amber-600 text-white font-bold text-sm hover:opacity-90 transition"
                >
                  {isAr ? "تأكيد التعطيل" : "Confirm Disable"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
