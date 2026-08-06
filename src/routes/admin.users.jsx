import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Star, Ban, ShieldCheck, Plus, Search, Edit2, UserPlus, X, Mail, Phone, MapPin, Award } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserAvatar } from "@/components/common/UserAvatar";
import { adminService } from "@/services/adminService";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin — LapGenius" }, { name: "robots", content: "noindex" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  const { t, lang } = useI18n();
  const isAr = lang === "ar";

  const [users, setUsers] = useState([]);
  const [favorites, setFavorites] = useState({ customers: [], sellers: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all"); // all, customer, seller
  const [sortBy, setSortBy] = useState("default"); // default, top_spent, top_sales

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Add form state
  const [addForm, setAddForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    role: "customer"
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uData, favData] = await Promise.all([
        adminService.users(),
        adminService.getFavorites()
      ]);
      setUsers(uData);
      setFavorites(favData || { customers: [], sellers: [] });
    } catch (err) {
      toast.error(isAr ? "فشل تحميل البيانات" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRemove = (u) => {
    const confirmMsg = isAr 
      ? `هل أنت متأكد من حذف الحساب "${u.name}"؟` 
      : `Are you sure you want to delete "${u.name}"?`;

    toast(confirmMsg, {
      action: {
        label: isAr ? "حذف" : "Delete",
        onClick: async () => {
          try {
            await adminService.deleteUser(u.id, u.role);
            toast.success(isAr ? "تم حذف المستخدم بنجاح" : "User deleted successfully");
            setUsers((prev) => prev.filter((x) => x.id !== u.id));
          } catch (err) {
            toast.error(err.response?.data?.message || (isAr ? "فشل الحذف. قد يكون لديه معاملات نشطة." : "Delete failed. User might have active orders/products."));
          }
        }
      },
      cancel: {
        label: isAr ? "إلغاء" : "Cancel",
        onClick: () => {}
      }
    });
  };

  const handleToggleBlock = async (u) => {
    try {
      if (u.role === "seller") {
        await adminService.toggleActiveSeller(u.id);
        toast.success(u.isActive ? (isAr ? "تم تعطيل البائع بنجاح" : "Seller deactivated") : (isAr ? "تم تفعيل البائع بنجاح" : "Seller activated"));
      } else {
        await adminService.toggleBlockCustomer(u.id);
        toast.success(u.isActive ? (isAr ? "تم حظر الزبون بنجاح" : "Customer blocked") : (isAr ? "تم إلغاء حظر الزبون" : "Customer unblocked"));
      }
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: !x.isActive } : x));
    } catch (err) {
      toast.error(isAr ? "فشل تغيير حالة الحساب" : "Failed to toggle block status");
    }
  };

  const handleToggleFavorite = async (u) => {
    const roleKey = u.role === "customer" ? "customers" : "sellers";
    const list = favorites[roleKey] || [];
    const isFav = list.some(x => String(x.id) === String(u.id));

    try {
      if (isFav) {
        await adminService.removeFavorite(u.role, u.id);
        toast.success(isAr ? "تمت الإزالة من المفضلة" : "Removed from favorites");
      } else {
        if (u.role === "customer") {
          await adminService.addFavoriteCustomer(u.id);
        } else {
          await adminService.addFavoriteSeller(u.id);
        }
        toast.success(isAr ? "تمت الإضافة إلى المفضلة" : "Added to favorites");
      }
      // Reload favorites
      const favData = await adminService.getFavorites();
      setFavorites(favData);
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? "فشل تحديث المفضلة" : "Failed to update favorites"));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      if (addForm.role === "seller") {
        await adminService.addSeller(addForm);
      } else {
        await adminService.addCustomer(addForm);
      }
      toast.success(isAr ? "تم إضافة المستخدم بنجاح" : "User created successfully");
      setShowAddModal(false);
      setAddForm({ full_name: "", email: "", password: "", phone: "", location: "", role: "customer" });
      fetchData();
    } catch (err) {
      const errs = err.response?.data?.errors;
      const firstErr = errs ? Object.values(errs)[0]?.[0] : null;
      toast.error(firstErr || err.response?.data?.message || (isAr ? "فشل إنشاء المستخدم" : "Failed to create user"));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser.role === "seller") {
        await adminService.updateSeller(selectedUser.id, editForm);
      } else {
        await adminService.updateCustomer(selectedUser.id, editForm);
      }
      toast.success(isAr ? "تم تعديل البيانات بنجاح" : "User details updated successfully");
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      toast.error(isAr ? "فشل تعديل البيانات" : "Failed to update user details");
    }
  };

  const openEdit = (u) => {
    setSelectedUser(u);
    setEditForm({
      full_name: u.name,
      email: u.email,
      phone: u.phone,
      location: u.location
    });
    setShowEditModal(true);
  };

  // Filter & Sort
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchesRole = filterRole === "all" ? true : u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "top_spent") {
      return b.totalSpent - a.totalSpent;
    }
    if (sortBy === "top_sales") {
      return b.totalSales - a.totalSales;
    }
    return 0; // Default order
  });

  return (
    <DashboardLayout kind="admin">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight">{isAr ? "إدارة المستخدمين" : "Users Management"}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isAr 
              ? "إضافة وتعديل وحظر الزبائن والبائعين، وتحديد العناصر المميزة." 
              : "Create, edit, delete, block users, and feature top performers."}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-dark transition inline-flex items-center gap-2 shadow-soft"
        >
          <UserPlus className="size-5" />
          <span>{isAr ? "إضافة مستخدم جديد" : "Add New User"}</span>
        </button>
      </div>

      {/* Highlights / Featured Panel (Requirement 8) */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Featured Customers */}
        <div className="rounded-3xl border bg-card/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Award className="size-5 text-yellow-500" />
              <span>{isAr ? "الزبائن المفضلين (أكثر شراءً)" : "Featured Top Customers"}</span>
            </h3>
            <span className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-bold px-2 py-0.5 rounded-full">
              {favorites.customers?.length || 0}
            </span>
          </div>
          {favorites.customers?.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">{isAr ? "لا يوجد زبائن مفضلين بعد." : "No featured customers yet."}</p>
          ) : (
            <div className="divide-y">
              {favorites.customers.map(c => (
                <div key={c.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <UserAvatar src={c.image} name={c.full_name || c.name} size="sm" />
                    <div className="min-w-0">
                      <Link to="/u/$id" params={{ id: String(c.id) }} className="text-sm font-bold truncate hover:text-primary transition block">
                        {c.full_name || c.name}
                      </Link>
                      <span className="text-[10px] text-muted-foreground">{c.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleFavorite({ id: c.id, role: "customer" })}
                    className="size-8 rounded-lg hover:bg-destructive/15 hover:text-destructive text-muted-foreground grid place-items-center transition"
                    title={isAr ? "إزالة من المفضلة" : "Remove from favorites"}
                  >
                    <Star className="size-4 fill-yellow-500 text-yellow-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Featured Sellers */}
        <div className="rounded-3xl border bg-card/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Award className="size-5 text-primary" />
              <span>{isAr ? "البائعين المتميزين (أكثر بيعاً)" : "Featured Top Sellers"}</span>
            </h3>
            <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
              {favorites.sellers?.length || 0}
            </span>
          </div>
          {favorites.sellers?.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">{isAr ? "لا يوجد بائعين متميزين بعد." : "No featured sellers yet."}</p>
          ) : (
            <div className="divide-y">
              {favorites.sellers.map(s => (
                <div key={s.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <UserAvatar src={s.image} name={s.full_name || s.name} size="sm" />
                    <div className="min-w-0">
                      <Link to="/u/$id" params={{ id: String(s.id) }} className="text-sm font-bold truncate hover:text-primary transition block">
                        {s.full_name || s.name}
                      </Link>
                      <span className="text-[10px] text-muted-foreground">{s.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleFavorite({ id: s.id, role: "seller" })}
                    className="size-8 rounded-lg hover:bg-destructive/15 hover:text-destructive text-muted-foreground grid place-items-center transition"
                    title={isAr ? "إزالة من المفضلة" : "Remove from favorites"}
                  >
                    <Star className="size-4 fill-yellow-500 text-yellow-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "البحث بالاسم، الإيميل أو الجوال..." : "Search by name, email or phone..."}
            className="w-full h-11 ps-10 pe-4 rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
          />
        </div>

        {/* Filter Role */}
        <div className="flex gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="h-11 px-4 rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-ring text-sm transition cursor-pointer"
          >
            <option value="all">{isAr ? "جميع الأدوار" : "All Roles"}</option>
            <option value="customer">{isAr ? "زبائن فقط" : "Customers Only"}</option>
            <option value="seller">{isAr ? "بائعين فقط" : "Sellers Only"}</option>
          </select>

          {/* Sort By Statistics */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-11 px-4 rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-ring text-sm transition cursor-pointer"
          >
            <option value="default">{isAr ? "الترتيب الافتراضي" : "Default Ordering"}</option>
            <option value="top_spent">{isAr ? "الأكثر شراءً (قيمة المشتريات)" : "Top Buyers (Total Spent)"}</option>
            <option value="top_sales">{isAr ? "الأكثر مبيعاً (عدد المبيعات)" : "Top Sellers (Sales Count)"}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="h-64 grid place-items-center">
          <span className="text-muted-foreground text-sm font-semibold">{isAr ? "جاري تحميل البيانات..." : "Loading users..."}</span>
        </div>
      ) : sortedUsers.length === 0 ? (
        <div className="h-48 border border-dashed rounded-3xl grid place-items-center bg-card/20">
          <span className="text-muted-foreground text-sm">{isAr ? "لم يتم العثور على مستخدمين." : "No users found matching search criteria."}</span>
        </div>
      ) : (
        <>
          {/* Desktop view */}
          <div className="hidden md:block rounded-3xl bg-card border shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-section">
                  <tr>
                    <th className="p-4 text-start">{isAr ? "المستخدم" : "User"}</th>
                    <th className="p-4 text-start">{isAr ? "الدور" : "Role"}</th>
                    <th className="p-4 text-start">{isAr ? "إحصائيات النشاط" : "Activity Stats"}</th>
                    <th className="p-4 text-start">{isAr ? "الموقع" : "Location"}</th>
                    <th className="p-4 text-start">{isAr ? "تاريخ التسجيل" : "Joined"}</th>
                    <th className="p-4 text-end">{isAr ? "العمليات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedUsers.map((u) => {
                    const isFav = u.role === "customer"
                      ? favorites.customers?.some(x => String(x.id) === String(u.id))
                      : favorites.sellers?.some(x => String(x.id) === String(u.id));

                    return (
                      <tr key={u.id} className={`hover:bg-accent/10 transition ${!u.isActive ? "opacity-60 bg-destructive/5" : ""}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar name={u.name} src={u.image} size="md" />
                            <div className="min-w-0">
                              <Link
                                to="/u/$id"
                                params={{ id: String(u.id) }}
                                className="font-bold truncate hover:text-primary transition text-foreground"
                              >
                                {u.name}
                              </Link>
                              <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                              {u.phone && <div className="text-[10px] text-muted-foreground/80">{u.phone}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === "admin"
                              ? "bg-destructive/15 text-destructive border border-destructive/20"
                              : u.role === "seller"
                              ? "bg-primary/15 text-primary border border-primary/20"
                              : "bg-success/15 text-success border border-success/20"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          {u.role === "customer" ? (
                            <div className="space-y-0.5 text-xs text-muted-foreground">
                              <div>{isAr ? "إجمالي الإنفاق" : "Total Spent"}: <strong className="text-foreground">${u.totalSpent.toLocaleString()}</strong></div>
                              <div>{isAr ? "عدد الطلبات" : "Orders"}: <strong className="text-foreground">{u.ordersCount}</strong></div>
                            </div>
                          ) : u.role === "seller" ? (
                            <div className="space-y-0.5 text-xs text-muted-foreground">
                              <div>{isAr ? "إجمالي الإيرادات" : "Revenue"}: <strong className="text-foreground">${u.totalRevenue.toLocaleString()}</strong></div>
                              <div>{isAr ? "قطع مباعة" : "Sales"}: <strong className="text-foreground">{u.totalSales}</strong></div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4 truncate max-w-[150px]">{u.location || "—"}</td>
                        <td className="p-4 whitespace-nowrap text-xs text-muted-foreground">{u.joined}</td>
                        <td className="p-4 text-end">
                          <div className="flex items-center justify-end gap-1">
                            {/* Toggle Favorite Star Button */}
                            {u.role !== "admin" && (
                              <button
                                onClick={() => handleToggleFavorite(u)}
                                className={`size-9 rounded-lg grid place-items-center transition ${isFav ? "text-yellow-500 hover:bg-yellow-500/10" : "text-muted-foreground hover:bg-accent"}`}
                                title={isAr ? "تمييز كمستخدم مفضل" : "Feature/Favorite User"}
                              >
                                <Star className={`size-4.5 ${isFav ? "fill-yellow-500" : ""}`} />
                              </button>
                            )}

                            {/* Edit Button */}
                            {u.role !== "admin" && (
                              <button
                                onClick={() => openEdit(u)}
                                className="size-9 rounded-lg text-muted-foreground hover:bg-accent grid place-items-center transition"
                                title={isAr ? "تعديل البيانات" : "Edit User"}
                              >
                                <Edit2 className="size-4" />
                              </button>
                            )}

                            {/* Block Toggle Button */}
                            {u.role !== "admin" && (
                              <button
                                onClick={() => handleToggleBlock(u)}
                                className={`size-9 rounded-lg grid place-items-center transition ${u.isActive ? "text-destructive hover:bg-destructive/10" : "text-success hover:bg-success/10"}`}
                                title={u.isActive ? (isAr ? "حظر المستخدم" : "Block User") : (isAr ? "إلغاء حظر المستخدم" : "Unblock User")}
                              >
                                {u.isActive ? <Ban className="size-4" /> : <ShieldCheck className="size-4" />}
                              </button>
                            )}

                            {/* Delete Button */}
                            {u.role !== "admin" && (
                              <button
                                onClick={() => handleRemove(u)}
                                className="size-9 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive grid place-items-center transition"
                                title={isAr ? "حذف المستخدم" : "Delete User"}
                              >
                                <Trash2 className="size-4" />
                              </button>
                            )}
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
            {sortedUsers.map((u) => {
              const isFav = u.role === "customer"
                ? favorites.customers?.some(x => String(x.id) === String(u.id))
                : favorites.sellers?.some(x => String(x.id) === String(u.id));

              return (
                <div key={u.id} className={`rounded-2xl bg-card border shadow-soft p-4 space-y-4 transition ${!u.isActive ? "opacity-60 bg-destructive/5" : ""}`}>
                  <div className="flex items-center gap-3">
                    <UserAvatar name={u.name} src={u.image} size="lg" />
                    <div className="flex-1 min-w-0">
                      <Link to="/u/$id" params={{ id: String(u.id) }} className="font-bold truncate hover:text-primary transition block text-foreground">
                        {u.name}
                      </Link>
                      <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                      {u.phone && <div className="text-xs text-muted-foreground/80 mt-0.5">{u.phone}</div>}
                    </div>
                  </div>

                  {/* Activity and Location Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs border-y py-2 bg-accent/5 rounded-xl px-3">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">{isAr ? "الموقع" : "Location"}</span>
                      <span className="font-semibold">{u.location || "—"}</span>
                    </div>
                    {u.role === "customer" ? (
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">{isAr ? "الإنفاق" : "Spent"}</span>
                        <span className="font-semibold">${u.totalSpent.toLocaleString()} ({u.ordersCount})</span>
                      </div>
                    ) : u.role === "seller" ? (
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">{isAr ? "المبيعات" : "Sales"}</span>
                        <span className="font-semibold">${u.totalRevenue.toLocaleString()} ({u.totalSales})</span>
                      </div>
                    ) : (
                      <div />
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex justify-between items-center pt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      u.role === "admin"
                        ? "bg-destructive/15 text-destructive"
                        : u.role === "seller"
                        ? "bg-primary/15 text-primary"
                        : "bg-success/15 text-success"
                    }`}>
                      {u.role}
                    </span>

                    {u.role !== "admin" && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleToggleFavorite(u)}
                          className={`size-8 rounded-lg grid place-items-center transition border ${isFav ? "text-yellow-500 border-yellow-500/25 bg-yellow-500/5" : "text-muted-foreground"}`}
                        >
                          <Star className={`size-4 ${isFav ? "fill-yellow-500" : ""}`} />
                        </button>
                        <button
                          onClick={() => openEdit(u)}
                          className="size-8 rounded-lg text-muted-foreground border grid place-items-center transition"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => handleToggleBlock(u)}
                          className={`size-8 rounded-lg grid place-items-center transition border ${u.isActive ? "text-destructive border-destructive/25" : "text-success border-success/25"}`}
                        >
                          {u.isActive ? <Ban className="size-4" /> : <ShieldCheck className="size-4" />}
                        </button>
                        <button
                          onClick={() => handleRemove(u)}
                          className="size-8 rounded-lg text-muted-foreground border hover:text-destructive hover:border-destructive/30 grid place-items-center transition"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ================= ADD USER MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border bg-card shadow-elev overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <UserPlus className="size-5 text-primary" />
                <span>{isAr ? "إضافة مستعمل/بائع جديد" : "Create New Account"}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="size-9 rounded-lg hover:bg-accent grid place-items-center">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto min-h-0 flex-1">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5">{isAr ? "الاسم الكامل" : "Full Name"}</label>
                <input
                  type="text"
                  required
                  value={addForm.full_name}
                  onChange={(e) => setAddForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1.5">{isAr ? "البريد الإلكتروني" : "Email Address"}</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1.5">{isAr ? "كلمة المرور" : "Password"}</label>
                  <input
                    type="password"
                    required
                    value={addForm.password}
                    onChange={(e) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1.5">{isAr ? "رقم الهاتف" : "Phone Number"}</label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
                    placeholder="+963..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1.5">{isAr ? "الموقع / المدينة" : "Location / City"}</label>
                  <input
                    type="text"
                    value={addForm.location}
                    onChange={(e) => setAddForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
                    placeholder="Damascus, Syria"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-2">{isAr ? "نوع الحساب (الدور)" : "Account Type (Role)"}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAddForm(prev => ({ ...prev, role: "customer" }))}
                    className={`h-12 rounded-xl border-2 font-bold text-sm transition flex items-center justify-center gap-2 ${
                      addForm.role === "customer" ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-accent"
                    }`}
                  >
                    <span>{isAr ? "زبون / مستخدم" : "Customer / Client"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddForm(prev => ({ ...prev, role: "seller" }))}
                    className={`h-12 rounded-xl border-2 font-bold text-sm transition flex items-center justify-center gap-2 ${
                      addForm.role === "seller" ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-accent"
                    }`}
                  >
                    <span>{isAr ? "بائع / متجر" : "Seller / Vendor"}</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2 shrink-0">
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
                  {isAr ? "إنشاء الحساب" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT USER MODAL ================= */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border bg-card shadow-elev overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Edit2 className="size-5 text-primary" />
                <span>{isAr ? "تعديل بيانات المستخدم" : "Edit User Profile"}</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="size-9 rounded-lg hover:bg-accent grid place-items-center">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5">{isAr ? "الاسم الكامل" : "Full Name"}</label>
                <input
                  type="text"
                  required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5">{isAr ? "البريد الإلكتروني" : "Email Address"}</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5">{isAr ? "رقم الهاتف" : "Phone Number"}</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1.5">{isAr ? "الموقع" : "Location"}</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm transition"
                />
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
