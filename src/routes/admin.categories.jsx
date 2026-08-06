import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X, Folder, ChevronRight, ChevronDown, Layers } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { adminService } from "@/services/adminService";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Categories — Admin — LapGenius" }, { name: "robots", content: "noindex" }] }),
  component: AdminCategories,
});

function AdminCategories() {
  const { t, lang } = useI18n();
  const isAr = lang === "ar";

  const [categoriesTree, setCategoriesTree] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Forms state
  const [addForm, setAddForm] = useState({ name: "", parent_id: "" });
  const [editForm, setEditForm] = useState({ name: "", parent_id: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminService.categories();
      setCategoriesTree(res.data || []);
      setFlatCategories(res.flat || []);
    } catch (err) {
      toast.error(isAr ? "فشل تحميل الفئات" : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;
    try {
      await adminService.addCategory({
        name: addForm.name.trim(),
        parent_id: addForm.parent_id || null
      });
      toast.success(isAr ? "تمت إضافة الفئة بنجاح" : "Category added successfully");
      setShowAddModal(false);
      setAddForm({ name: "", parent_id: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? "فشل إضافة الفئة" : "Failed to add category"));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;
    try {
      await adminService.updateCategory(selectedCategory.id, {
        name: editForm.name.trim(),
        parent_id: editForm.parent_id || null
      });
      toast.success(isAr ? "تم تحديث الفئة بنجاح" : "Category updated successfully");
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? "فشل تحديث الفئة" : "Failed to update category"));
    }
  };

  const handleDelete = async (cat) => {
    const confirmMsg = isAr 
      ? `هل أنت متأكد من حذف الفئة "${cat.name}"؟`
      : `Are you sure you want to delete category "${cat.name}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await adminService.deleteCategory(cat.id);
      toast.success(isAr ? "تم حذف الفئة بنجاح" : "Category deleted successfully");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? "لا يمكن حذف الفئة. تأكد أنها لا تحتوي على منتجات أو فئات فرعية." : "Cannot delete category. Ensure it has no products or subcategories."));
    }
  };

  const openEdit = (cat) => {
    setSelectedCategory(cat);
    setEditForm({
      name: cat.name,
      parent_id: cat.parent_id || ""
    });
    setShowEditModal(true);
  };

  // Recursive tree renderer
  const renderCategoryNode = (node, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expanded[node.id];

    return (
      <div key={node.id} className="space-y-1">
        <div 
          className="flex items-center justify-between p-3 rounded-2xl border bg-card hover:bg-accent/10 transition"
          style={{ marginStart: `${depth * 24}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <button 
                onClick={() => handleToggleExpand(node.id)}
                className="size-7 rounded hover:bg-accent grid place-items-center shrink-0"
              >
                {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              </button>
            ) : (
              <div className="size-7 shrink-0" />
            )}
            <Folder className="size-4.5 text-primary shrink-0" />
            <span className="font-bold text-sm truncate">{node.name}</span>
            <span className="text-[10px] bg-accent px-2 py-0.5 rounded-full font-semibold text-muted-foreground">
              {node.product_count ?? 0} {isAr ? "منتج" : "products"}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => openEdit(node)}
              className="size-8 rounded-lg text-muted-foreground hover:bg-accent grid place-items-center transition"
              title={isAr ? "تعديل الفئة" : "Edit Category"}
            >
              <Edit2 className="size-3.5" />
            </button>
            <button
              onClick={() => handleDelete(node)}
              className="size-8 rounded-lg text-muted-foreground hover:bg-destructive/15 hover:text-destructive grid place-items-center transition"
              title={isAr ? "حذف الفئة" : "Delete Category"}
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children.map(child => renderCategoryNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout kind="admin">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight">{isAr ? "إدارة الفئات" : "Categories Management"}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isAr 
              ? "إضافة وتعديل وحذف فئات المنتجات في الموقع (مثل الألعاب والتصميم)." 
              : "Create, edit, and delete system categories (e.g. Games, Design)."}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-dark transition inline-flex items-center gap-2 shadow-soft"
        >
          <Plus className="size-5" />
          <span>{isAr ? "إضافة فئة جديدة" : "Add New Category"}</span>
        </button>
      </div>

      {loading ? (
        <div className="h-64 grid place-items-center">
          <span className="text-sm text-muted-foreground">{isAr ? "جاري تحميل الفئات..." : "Loading categories..."}</span>
        </div>
      ) : categoriesTree.length === 0 ? (
        <div className="h-48 border border-dashed rounded-3xl grid place-items-center bg-card/20">
          <span className="text-muted-foreground text-sm">{isAr ? "لا توجد فئات حالياً." : "No categories found."}</span>
        </div>
      ) : (
        <div className="space-y-2 max-w-3xl">
          {categoriesTree.map(cat => renderCategoryNode(cat, 0))}
        </div>
      )}

      {/* ================= ADD CATEGORY MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border bg-card shadow-elev overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                <span>{isAr ? "إضافة فئة جديدة" : "Create Category"}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="size-9 rounded-lg hover:bg-accent grid place-items-center">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5">{isAr ? "اسم الفئة" : "Category Name"}</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
                  placeholder={isAr ? "مثال: ألعاب، تصميم، برمجة" : "e.g. Gaming, Design, Office"}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5">{isAr ? "الفئة الأب (اختياري)" : "Parent Category (Optional)"}</label>
                <select
                  value={addForm.parent_id}
                  onChange={(e) => setAddForm(prev => ({ ...prev, parent_id: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition cursor-pointer"
                >
                  <option value="">{isAr ? "بدون (فئة رئيسية)" : "None (Root Category)"}</option>
                  {flatCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-11 px-5 rounded-xl border font-bold text-sm hover:bg-accent transition"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary-dark transition"
                >
                  {isAr ? "إضافة" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT CATEGORY MODAL ================= */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border bg-card shadow-elev overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Edit2 className="size-5 text-primary" />
                <span>{isAr ? "تعديل الفئة" : "Edit Category"}</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="size-9 rounded-lg hover:bg-accent grid place-items-center">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5">{isAr ? "اسم الفئة" : "Category Name"}</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5">{isAr ? "الفئة الأب" : "Parent Category"}</label>
                <select
                  value={editForm.parent_id}
                  onChange={(e) => setEditForm(prev => ({ ...prev, parent_id: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition cursor-pointer"
                >
                  <option value="">{isAr ? "بدون (فئة رئيسية)" : "None (Root Category)"}</option>
                  {flatCategories
                    .filter(cat => String(cat.id) !== String(selectedCategory.id))
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="h-11 px-5 rounded-xl border font-bold text-sm hover:bg-accent transition"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary-dark transition"
                >
                  {isAr ? "حفظ التغييرات" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
