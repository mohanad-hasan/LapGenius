import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingBag, BarChart3, Users, Activity, Menu, X, Layers, User, LogOut, Bell, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/common/Logo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useApp } from "@/context/AppContext";
import { useI18n } from "@/lib/i18n";

export function DashboardLayout({ kind, children }) {
  const { user, logout, unreadChatCount } = useApp();
  const { t } = useI18n();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const sellerNav = [
    { to: "/seller", icon: LayoutDashboard, label: t("seller.dashboard") },
    { to: "/seller/products", icon: Package, label: t("seller.products") },
    { to: "/seller/orders", icon: ShoppingBag, label: t("seller.orders") },
    { to: "/seller/analytics", icon: BarChart3, label: t("seller.analytics") },
    { to: "/seller/chat", icon: MessageCircle, label: "Messages", badge: unreadChatCount },
    { to: "/notifications", icon: Bell, label: t("notifications") || "Notifications" }
  ];
  const adminNav = [
    { to: "/admin", icon: LayoutDashboard, label: t("admin.dashboard") },
    { to: "/admin/users", icon: Users, label: t("admin.users") },
    { to: "/admin/products", icon: Package, label: t("seller.products") },
    { to: "/admin/orders", icon: ShoppingBag, label: t("seller.orders") || "Orders" },
    { to: "/admin/categories", icon: Layers, label: t("product.category") },
    { to: "/admin/analytics", icon: Activity, label: t("admin.activity") },
    { to: "/notifications", icon: Bell, label: t("notifications") || "Notifications" }
  ];
  const nav = kind === "admin" ? adminNav : sellerNav;

  const roleLabel = kind === "admin" ? t("profile.typeAdmin") : t("profile.typeSeller");

  const SidebarContent = (
    <>
      <Link to="/" className="mb-8 block"><Logo /></Link>
      <nav className="space-y-1 flex-1">
        {nav.map((l) => {
          const active = pathname === l.to;
          return (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition ${active ? "bg-primary text-primary-foreground shadow-soft" : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
            >
              <l.icon className="size-4 shrink-0" />
              <span className="flex-1">{l.label}</span>
              {l.badge > 0 && (
                <span className="size-5 grid place-items-center rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                  {l.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

    </>
  );

  return (
    <div className="min-h-screen flex bg-section overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-e p-5">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <aside className="lg:hidden fixed top-0 start-0 bottom-0 z-50 w-72 bg-sidebar text-sidebar-foreground border-e p-5 flex flex-col shadow-elev">
            <button
              onClick={() => setOpen(false)}
              className="self-end size-9 grid place-items-center rounded-lg hover:bg-accent mb-2"
            >
              <X className="size-5" />
            </button>
            {SidebarContent}
          </aside>
        </>
      )}

      <div className="flex-1 min-w-0">
        {/* Dashboard Header */}
        <header className="h-16 bg-card border-b flex items-center gap-3 px-4 sm:px-6 sticky top-0 z-30">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden size-9 grid place-items-center rounded-lg hover:bg-accent"
          >
            <Menu className="size-5" />
          </button>
          <Link to="/" className="lg:hidden"><Logo /></Link>

          {/* Title on desktop */}
          <h1 className="hidden lg:block text-xl font-black capitalize">
            {kind} {t("admin.dashboard").split(" ").pop()}
          </h1>

          {/* Spacer */}
          <div className="flex-1" />

          {/* User info in header */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2.5 hover:opacity-80 transition"
              >
                <div className="hidden sm:block text-end">
                  <div className="text-sm font-bold leading-tight">{user.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">#{user.id}</div>
                </div>
                <UserAvatar src={user.image} name={user.name} size="md" className="ring-2 ring-primary/20" />
              </button>

              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute top-full end-0 mt-2 w-64 p-3 rounded-2xl bg-card border shadow-elev z-50 space-y-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar src={user.image} name={user.name} size="md" />
                      <div className="min-w-0 flex-1 text-start">
                        <div className="font-bold text-sm truncate">{user.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono text-muted-foreground/70">#{user.id}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${kind === "admin"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-primary/15 text-primary"
                            }`}>
                            {roleLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-2 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-foreground hover:bg-accent transition"
                      >
                        <User className="size-3.5" />
                        <span>{t("nav.profile")}</span>
                      </Link>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          logout();
                          navigate({ to: "/" });
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition text-start"
                      >
                        <LogOut className="size-3.5" />
                        <span>{t("nav.logout")}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </header>

        <main className="p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, color = "primary" }) {
  const palette = {
    primary: "bg-primary/15 text-primary",
    success: "bg-success/15 text-success",
    destructive: "bg-destructive/15 text-destructive"
  }[color] || "bg-primary/15 text-primary";
  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-card border shadow-soft min-w-0 overflow-hidden">
      <div className={`size-10 sm:size-11 rounded-xl grid place-items-center mb-3 ${palette}`}><Icon className="size-4 sm:size-5" /></div>
      <div className="text-2xl sm:text-3xl font-black break-words">{value}</div>
      <div className="text-sm text-muted-foreground font-semibold mt-1 break-words">{label}</div>
    </div>
  );
}
