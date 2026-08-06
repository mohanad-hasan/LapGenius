import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { sellerService } from "@/services/sellerService";
import { productService } from "@/services/productService";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/seller/products")({
  head: () => ({ meta: [{ title: "My Products — Seller — LapGenius" }, { name: "robots", content: "noindex" }] }),
  component: SellerProducts,
});

const EMPTY_FORM = {
  name: "", brand: "", price: "", stock: "",
  condition: "New", category_id: "", description: "",
  cpu: "", gpu: "", igpu: "", ram: "", storage: "",
  screen_size: "", os: "Windows 11", weight: "",
  battery_capacity: "", recommended_usage: "",
};

function SellerProducts() {
  const { t } = useI18n();
  const { user } = useApp();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [imgFiles, setImgFiles] = useState([]);
  const [imgPreviews, setImgPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Discount Modal State
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountProduct, setDiscountProduct] = useState(null);
  const [discountForm, setDiscountForm] = useState({ discount_percent: 10, start_date: "", end_date: "" });
  const [savingDiscount, setSavingDiscount] = useState(false);

  const refresh = () => {
    setLoading(true);
    sellerService.products()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) refresh();
    productService.categories().then(setCategories).catch(() => {});
  }, [user]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setImgFiles([]);
    setImgPreviews([]);
    setOpenForm(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, brand: p.brand, price: String(p.price), stock: String(p.stock),
      condition: p.condition, category_id: String(p.category_id || ""), description: p.description,
      cpu: p.cpu || "", gpu: p.gpu || "", igpu: p.igpu || "", ram: p.ram || "",
      storage: p.storage || "", screen_size: p.screen || "", os: p.os || "Windows 11", weight: "1.5",
      battery_capacity: p.battery || "", recommended_usage: p.recommended_usage || "",
    });
    setEditId(p.id);
    setImgPreviews(p.colors?.[0]?.images || []);
    setImgFiles([]);
    setOpenForm(true);
  };

  const handleImgChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImgFiles(prev => [...prev, ...files]);
    setImgPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeImg = (idx) => {
    setImgFiles(prev => prev.filter((_, i) => i !== idx));
    setImgPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name, brand: form.brand, price: form.price,
        stock_quantity: form.stock, condition: form.condition.toLowerCase(),
        category_id: form.category_id, description: form.description || '',
        cpu_type: form.cpu, gpu_type: form.gpu || '', igpu: form.igpu || '',
        ram_size: form.ram, storage_size: form.storage,
        screen_size: form.screen_size, os: form.os,
        weight: form.weight || '1.5',
        battery_capacity: form.battery_capacity || '',
        recommended_usage: form.recommended_usage || '',
        _imageFiles: imgFiles.length > 0 ? imgFiles : undefined,
      };
      if (editId) {
        await sellerService.updateProduct(editId, payload);
        toast.success(t("seller.productUpdated"));
      } else {
        await sellerService.addProduct(payload);
        toast.success(t("seller.productAdded"));
      }
      setOpenForm(false);
      refresh();
    } catch (err) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm(t("common.confirmDelete"))) return;
    try {
      await sellerService.deleteProduct(id);
      toast.success(t("seller.productDeleted"));
      refresh();
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const openDiscount = (p) => {
    setDiscountProduct(p);
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setDiscountForm({
      discount_percent: 10,
      start_date: now.toISOString().slice(0, 16),
      end_date: nextWeek.toISOString().slice(0, 16)
    });
    setDiscountOpen(true);
  };

  const handleSaveDiscount = async (e) => {
    e.preventDefault();
    setSavingDiscount(true);
    try {
      await sellerService.addDiscount({
        product_id: discountProduct.id,
        ...discountForm
      });
      toast.success("Discount added successfully");
      setDiscountOpen(false);
      refresh();
    } catch (err) {
      toast.error(err.message || "Failed to add discount");
    } finally {
      setSavingDiscount(false);
    }
  };

  return (
    <DashboardLayout kind="seller">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black">{t("seller.products")}</h2>
        <button
          onClick={openAdd}
          className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-sm inline-flex items-center gap-2 hover:bg-primary-dark transition"
        >
          <Plus className="size-4" /> {t("seller.addProduct")}
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-52 rounded-3xl bg-card border animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-3xl bg-card border shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-section">
                  <tr>
                    <th className="p-4 text-start w-16">Img</th>
                    <th className="p-4 text-start">Name</th>
                    <th className="p-4 text-start">Brand</th>
                    <th className="p-4 text-start">GPU</th>
                    <th className="p-4 text-start">Price</th>
                    <th className="p-4 text-start">Stock</th>
                    <th className="p-4 text-start">Condition</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const img = p.colors?.[0]?.images?.[0];
                    return (
                      <tr key={p.id} className="border-t">
                        <td className="p-4">
                          {img ? (
                            <img
                              src={img}
                              alt={p.name}
                              className="size-12 rounded-xl object-cover border"
                              onError={e => { e.target.src = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=120&q=60"; }}
                            />
                          ) : (
                            <div className="size-12 rounded-xl bg-section border grid place-items-center text-[10px] text-muted-foreground">No img</div>
                          )}
                        </td>
                        <td className="p-4 font-semibold max-w-[220px] truncate">{p.name}</td>
                        <td className="p-4">{p.brand}</td>
                        <td className="p-4 text-xs">
                          {p.igpu ? (
                            <span className="px-2 py-0.5 rounded-full bg-accent text-foreground font-mono">{p.igpu}</span>
                          ) : p.gpu ? (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">{p.gpu}</span>
                          ) : "—"}
                        </td>
                        <td className="p-4 font-bold">${p.price}</td>
                        <td className="p-4">
                          <span className={`font-bold ${p.stock === 0 ? "text-destructive" : p.stock < 5 ? "text-amber-500" : "text-success"}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-accent">{p.condition}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              className="size-9 grid place-items-center rounded-lg hover:bg-accent transition"
                              title="Edit"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              onClick={() => openDiscount(p)}
                              className="size-9 grid place-items-center rounded-lg hover:bg-primary/10 hover:text-primary transition"
                              title="Add Discount"
                            >
                              <Tag className="size-4" />
                            </button>
                            <button
                              onClick={() => remove(p.id)}
                              className="size-9 grid place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive transition"
                              title="Delete"
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

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {products.map((p) => {
              const img = p.colors?.[0]?.images?.[0];
              return (
                <div key={p.id} className="rounded-2xl bg-card border shadow-soft p-4 flex gap-4">
                  {img ? (
                    <img
                      src={img}
                      alt={p.name}
                      className="size-16 rounded-2xl object-cover border shrink-0"
                      onError={e => { e.target.src = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=120&q=60"; }}
                    />
                  ) : (
                    <div className="size-16 rounded-2xl bg-section border grid place-items-center text-[10px] text-muted-foreground shrink-0">No img</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.brand}</div>
                    {(p.igpu || p.gpu) && (
                      <div className="text-[11px] font-mono mt-0.5 text-muted-foreground">{p.igpu || p.gpu}</div>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <span className="font-bold">${p.price}</span>
                      <span className={`text-xs font-bold ${p.stock === 0 ? "text-destructive" : p.stock < 5 ? "text-amber-500" : "text-success"}`}>
                        ×{p.stock}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => openEdit(p)} className="size-9 grid place-items-center rounded-lg hover:bg-accent" title="Edit">
                      <Pencil className="size-4" />
                    </button>
                    <button onClick={() => openDiscount(p)} className="size-9 grid place-items-center rounded-lg hover:bg-primary/10 hover:text-primary" title="Add Discount">
                      <Tag className="size-4" />
                    </button>
                    <button onClick={() => remove(p.id)} className="size-9 grid place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive" title="Delete">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? t("seller.editProduct") : t("seller.addProduct")}</DialogTitle>
            <DialogDescription>{t("seller.productFormHint")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4 mt-2">
            {/* Image Upload */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-2">
                {t("seller.productImage")}
              </label>
              <div className="flex flex-wrap items-center gap-4">
                {imgPreviews.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {imgPreviews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img src={src} alt="" className="size-20 rounded-2xl object-cover border" />
                        <button
                          type="button"
                          onClick={() => removeImg(idx)}
                          className="absolute -top-2 -end-2 size-6 rounded-full bg-destructive text-white grid place-items-center opacity-0 group-hover:opacity-100 transition shadow-soft z-10"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="size-20 rounded-2xl border bg-section grid place-items-center text-xs text-muted-foreground">
                    No img
                  </div>
                )}
                <label className="cursor-pointer h-10 px-4 rounded-xl border-2 border-dashed font-semibold text-sm text-muted-foreground hover:border-primary hover:text-primary transition inline-flex items-center gap-2">
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImgChange} />
                  Upload Images
                </label>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <Field label={t("seller.form.name")} value={form.name} onChange={v => setForm({...form, name: v})} required />
              <Field label={t("seller.form.brand")} value={form.brand} onChange={v => setForm({...form, brand: v})} required />
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">{t("seller.form.category") || "Category"} *</label>
                <select
                  value={form.category_id}
                  onChange={e => setForm({...form, category_id: e.target.value})}
                  className="w-full h-11 px-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  required
                >
                  <option value="">{t("seller.form.selectCategory") || "Select Category"}</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label={t("seller.form.price")} type="number" min="0" value={form.price} onChange={v => setForm({...form, price: v})} required />
              <Field label={t("seller.form.stock")} type="number" min="0" value={form.stock} onChange={v => setForm({...form, stock: v})} required />
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">{t("seller.form.condition")}</label>
                <select
                  value={form.condition}
                  onChange={e => setForm({...form, condition: e.target.value})}
                  className="w-full h-11 px-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>New</option>
                  <option>Used</option>
                  <option>Refurbished</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">{t("seller.form.description")}</label>
              <textarea
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
              />
            </div>

            {/* Specs */}
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2">Specifications</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="CPU" value={form.cpu} onChange={v => setForm({...form, cpu: v})} placeholder="Intel Core i7-13700H" required />
              <Field label="GPU (Discrete)" value={form.gpu} onChange={v => setForm({...form, gpu: v})} placeholder="RTX 4060 (optional)" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="iGPU (Integrated)" value={form.igpu} onChange={v => setForm({...form, igpu: v})} placeholder="Intel Iris Xe (optional)" />
              <Field label="RAM" value={form.ram} onChange={v => setForm({...form, ram: v})} placeholder="16GB DDR5" required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Storage" value={form.storage} onChange={v => setForm({...form, storage: v})} placeholder="512GB NVMe SSD" required />
              <Field label="Screen" value={form.screen_size} onChange={v => setForm({...form, screen_size: v})} placeholder='15.6" FHD' required />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="OS" value={form.os} onChange={v => setForm({...form, os: v})} />
              <Field label="Weight (kg)" type="number" step="0.1" min="0" value={form.weight} onChange={v => setForm({...form, weight: v})} />
              <Field label={t("product.battery") || "Battery"} value={form.battery_capacity} onChange={v => setForm({...form, battery_capacity: v})} placeholder="e.g. 70Wh" />
            </div>

            <div className="grid sm:grid-cols-1 gap-4">
              <Field label={t("product.usage") || "Recommended Usage"} value={form.recommended_usage} onChange={v => setForm({...form, recommended_usage: v})} placeholder="e.g. Gaming, Business, Coding" />
            </div>

            <DialogFooter className="mt-4 gap-2">
              <DialogClose className="h-11 px-5 rounded-xl border font-semibold text-sm hover:bg-accent transition">
                {t("cancel")}
              </DialogClose>
              <button
                type="submit"
                disabled={saving}
                className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary-dark transition disabled:opacity-60"
              >
                {saving ? "Saving…" : t("profile.save")}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={discountOpen} onOpenChange={setDiscountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Discount</DialogTitle>
            <DialogDescription>Set a discount for {discountProduct?.name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveDiscount} className="space-y-4 mt-2">
            <Field 
              label="Discount Percent (%)" 
              type="number" 
              min="1" max="100" 
              value={discountForm.discount_percent} 
              onChange={v => setDiscountForm({...discountForm, discount_percent: v})} 
              required 
            />
            <Field 
              label="Start Date" 
              type="datetime-local" 
              value={discountForm.start_date} 
              onChange={v => setDiscountForm({...discountForm, start_date: v})} 
              required 
            />
            <Field 
              label="End Date" 
              type="datetime-local" 
              value={discountForm.end_date} 
              onChange={v => setDiscountForm({...discountForm, end_date: v})} 
              required 
            />
            
            <DialogFooter className="mt-4 gap-2">
              <DialogClose className="h-11 px-5 rounded-xl border font-semibold text-sm hover:bg-accent transition">
                {t("cancel")}
              </DialogClose>
              <button
                type="submit"
                disabled={savingDiscount}
                className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary-dark transition disabled:opacity-60"
              >
                {savingDiscount ? "Saving…" : "Save Discount"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, required, ...rest }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted-foreground block mb-1">{label}{required && " *"}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        {...rest}
        className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
      />
    </label>
  );
}
