import { useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Globe, ShoppingCart, Heart, User, Menu, X, LogOut, LayoutDashboard, Home, Store, Sparkles, Calculator, Bell, MessageCircle } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useApp } from "@/context/AppContext";
import { useI18n } from "@/lib/i18n";

export function Navbar() {
  const { theme, toggleTheme, cartCount, wishlist, user, logout, unreadNotificationsCount, unreadChatCount } = useApp();
  const { lang, setLang, t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [openMenu, setOpenMenu] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const navigate = useNavigate();

  const links = [
    { to: "/", label: t("nav.home"), icon: Home },
    { to: "/shop", label: t("nav.shop"), icon: Store },
    { to: "/ai-recommend", label: t("nav.recommend"), icon: Sparkles },
    { to: "/ai-estimate", label: t("nav.estimate"), icon: Calculator }
  ];

  const handleNavClick = () => {
    setOpenMenu(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass-strong border-b" suppressHydrationWarning>
        {/* ===== NAVBAR CONTAINER ===== */}
        <div className="container mx-auto px-2 sm:px-4 h-16 flex items-center justify-between gap-2">
          {/* ===== LEFT SECTION: Logo ===== */}
          <Link to="/" className="shrink-0" aria-label="LapGenius home">
            <Logo responsive />
          </Link>

          {/* ===== CENTER SECTION: Desktop Links (Hidden on mobile) ===== */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 px-4" suppressHydrationWarning>
            {links.map((l) => {
              const Icon = l.icon;
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`inline-flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                    active ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-accent"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span suppressHydrationWarning>{l.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ===== RIGHT SECTION: Controls ===== */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Language Button */}
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              aria-label="Language"
              className="size-9 grid place-items-center rounded-lg hover:bg-accent transition"
            >
              <Globe className="size-4" />
            </button>

            {/* Theme Button */}
            <button
              onClick={toggleTheme}
              aria-label="Theme"
              className="size-9 grid place-items-center rounded-lg hover:bg-accent transition"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>

            {/* Notifications Link */}
            {user && (
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="grid size-9 place-items-center rounded-lg hover:bg-accent relative transition"
              >
                <Bell className="size-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -end-1 size-4 rounded-full bg-destructive text-white text-[10px] font-bold grid place-items-center animate-bounce">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Link>
            )}

            {/* Chat Link — customer or seller */}
            {user && (user.role === "customer" || user.role === "seller") && (
              <Link
                to={user.role === "seller" ? "/seller/chat" : "/chat"}
                aria-label="Chat"
                className="grid size-9 place-items-center rounded-lg hover:bg-accent relative transition"
              >
                <MessageCircle className="size-4" />
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1 -end-1 size-4 rounded-full bg-primary text-white text-[10px] font-bold grid place-items-center animate-bounce">
                    {unreadChatCount}
                  </span>
                )}
              </Link>
            )}

            {/* Wishlist Link */}
            {(!user || user.role === "customer") && (
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="hidden sm:grid size-9 place-items-center rounded-lg hover:bg-accent relative transition"
              >
                <Heart className="size-4" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -end-1 size-4 rounded-full bg-destructive text-white text-[10px] font-bold grid place-items-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            )}

            {/* Cart Link */}
            {(!user || user.role === "customer") && (
              <Link
                to="/cart"
                aria-label="Cart"
                className="hidden sm:grid size-9 place-items-center rounded-lg hover:bg-accent relative transition"
              >
                <ShoppingCart className="size-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -end-1 size-4 rounded-full bg-primary text-white text-[10px] font-bold grid place-items-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu (Desktop only) */}
            {user && (
              <div className="hidden sm:block relative">
                <button
                  onClick={() => setOpenUserMenu((m) => !m)}
                  aria-label="Account"
                  className="size-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-primary transition"
                >
                  <UserAvatar src={user.image} name={user.name} size="md" />
                </button>
                <AnimatePresence>
                  {openUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute end-0 top-12 w-56 rounded-2xl glass-strong border shadow-elev p-2 z-50"
                    >
                      {/* User Info */}
                      <div className="px-3 py-2 flex items-center gap-3">
                        <UserAvatar src={user.image} name={user.name} size="md" />
                        <div className="min-w-0">
                          <div className="font-bold text-sm truncate">{user.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                          <div className="text-[10px] text-muted-foreground/70 font-mono">#{user.id}</div>
                        </div>
                      </div>
                      <hr className="my-1" />
                      <MenuLink to="/profile" icon={User} label={t("nav.profile")} onClick={() => setOpenUserMenu(false)} />
                      {user.role === "seller" && (
                        <MenuLink to="/seller" icon={LayoutDashboard} label={t("nav.seller")} onClick={() => setOpenUserMenu(false)} />
                      )}
                      {user.role === "admin" && (
                        <MenuLink to="/admin" icon={LayoutDashboard} label={t("nav.admin")} onClick={() => setOpenUserMenu(false)} />
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setOpenUserMenu(false);
                          navigate({ to: "/" });
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent text-destructive transition"
                      >
                        <LogOut className="size-4" />
                        {t("nav.logout")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Login Link (Desktop only) */}
            {!user && (
              <Link
                to="/login"
                className="hidden sm:inline-flex h-9 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm items-center hover:bg-primary-dark transition"
              >
                {t("nav.login")}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setOpenMenu(true)}
              aria-label={t("nav.menu")}
              className="lg:hidden size-9 grid place-items-center rounded-lg hover:bg-accent transition"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ===== MOBILE DRAWER — خارج الـ header تمامًا ===== */}
      <AnimatePresence>
        {openMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenMenu(false)}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: lang === 'ar' ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: lang === 'ar' ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 end-0 bottom-0 z-[70] w-full max-w-xs bg-card shadow-elev border-s flex flex-col lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
                <h2 className="text-lg font-bold">{t("nav.menu")}</h2>
                <button
                  onClick={() => setOpenMenu(false)}
                  aria-label={t("close")}
                  className="size-10 grid place-items-center rounded-lg hover:bg-accent transition"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <nav className="p-4 space-y-1">
                  {/* Main Navigation Links */}
                  <div className="mb-4">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-3">
                      {t("nav.pages")}
                    </div>
                    {links.map((l) => {
                      const Icon = l.icon;
                      const active = pathname === l.to;
                      return (
                        <Link
                          key={l.to}
                          to={l.to}
                          onClick={handleNavClick}
                          className={`flex items-center gap-3 min-h-12 px-4 py-3 rounded-lg text-base font-semibold transition ${
                            active
                              ? "bg-primary text-primary-foreground shadow-soft"
                              : "text-foreground hover:bg-accent active:bg-accent/70"
                          }`}
                        >
                          <Icon className="size-5 shrink-0" />
                          <span>{l.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  <hr className="my-2 border-border/60" />

                  {/* Shopping Links */}
                  {(!user || user.role === "customer") && (
                    <>
                      <div className="mb-4">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-3">
                          {t("nav.my")}
                        </div>
                        <Link
                          to="/wishlist"
                          onClick={handleNavClick}
                          className={`flex items-center gap-3 min-h-12 px-4 py-3 rounded-lg text-base font-semibold transition ${
                            pathname === "/wishlist"
                              ? "bg-primary text-primary-foreground shadow-soft"
                              : "text-foreground hover:bg-accent active:bg-accent/70"
                          }`}
                        >
                          <Heart className="size-5 shrink-0" />
                          <span className="flex-1">{t("nav.wishlist")}</span>
                          {wishlist.length > 0 && (
                            <span className="size-6 grid place-items-center rounded-full text-xs font-bold bg-destructive text-white">
                              {wishlist.length}
                            </span>
                          )}
                        </Link>

                        <Link
                          to="/cart"
                          onClick={handleNavClick}
                          className={`flex items-center gap-3 min-h-12 px-4 py-3 rounded-lg text-base font-semibold transition ${
                            pathname === "/cart"
                              ? "bg-primary text-primary-foreground shadow-soft"
                              : "text-foreground hover:bg-accent active:bg-accent/70"
                          }`}
                        >
                          <ShoppingCart className="size-5 shrink-0" />
                          <span className="flex-1">{t("nav.cart")}</span>
                          {cartCount > 0 && (
                            <span className="size-6 grid place-items-center rounded-full text-xs font-bold bg-primary text-primary-foreground">
                              {cartCount}
                            </span>
                          )}
                        </Link>
                      </div>
                      <hr className="my-2 border-border/60" />
                    </>
                  )}

                  <hr className="my-2 border-border/60" />

                  {/* User Section */}
                  <div>
                    {!user && (
                      <Link
                        to="/login"
                        onClick={handleNavClick}
                        className="flex items-center justify-center min-h-12 px-4 py-3 rounded-lg text-base font-bold bg-primary text-primary-foreground hover:bg-primary-dark transition"
                      >
                        {t("nav.login")}
                      </Link>
                    )}

                    {user && (
                      <>
                        {/* User Card */}
                        <div className="px-4 py-3 mb-2 rounded-xl bg-accent/50 flex items-center gap-3">
                          <UserAvatar src={user.image} name={user.name} size="md" />
                          <div className="min-w-0">
                            <div className="font-bold text-sm truncate">{user.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                            <div className="text-[10px] font-mono text-muted-foreground/70">#{user.id}</div>
                          </div>
                        </div>

                        {/* Notifications */}
                        <Link
                          to="/notifications"
                          onClick={handleNavClick}
                          className={`flex items-center gap-3 min-h-12 px-4 py-3 rounded-lg text-base font-semibold transition ${
                            pathname === "/notifications"
                              ? "bg-primary text-primary-foreground shadow-soft"
                              : "text-foreground hover:bg-accent active:bg-accent/70"
                          }`}
                        >
                          <Bell className="size-5 shrink-0" />
                          <span className="flex-1">{t("nav.notifications") || "Notifications"}</span>
                          {unreadNotificationsCount > 0 && (
                            <span className="size-6 grid place-items-center rounded-full text-xs font-bold bg-destructive text-white animate-pulse">
                              {unreadNotificationsCount}
                            </span>
                          )}
                        </Link>

                        {/* Mobile Chat Link */}
                        {(user.role === "customer" || user.role === "seller") && (
                          <Link
                            to={user.role === "seller" ? "/seller/chat" : "/chat"}
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 min-h-12 px-4 py-3 rounded-lg text-base font-semibold transition ${
                              (pathname === "/chat" || pathname === "/seller/chat")
                                ? "bg-primary text-primary-foreground shadow-soft"
                                : "text-foreground hover:bg-accent active:bg-accent/70"
                            }`}
                          >
                            <MessageCircle className="size-5 shrink-0" />
                            <span className="flex-1">Messages</span>
                            {unreadChatCount > 0 && (
                              <span className="size-6 grid place-items-center rounded-full text-xs font-bold bg-primary text-primary-foreground">
                                {unreadChatCount}
                              </span>
                            )}
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          onClick={handleNavClick}
                          className={`flex items-center gap-3 min-h-12 px-4 py-3 rounded-lg text-base font-semibold transition ${
                            pathname === "/profile"
                              ? "bg-primary text-primary-foreground shadow-soft"
                              : "text-foreground hover:bg-accent active:bg-accent/70"
                          }`}
                        >
                          <User className="size-5 shrink-0" />
                          <span>{t("nav.profile")}</span>
                        </Link>

                        {user.role === "seller" && (
                          <Link
                            to="/seller"
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 min-h-12 px-4 py-3 rounded-lg text-base font-semibold transition ${
                              pathname === "/seller"
                                ? "bg-primary text-primary-foreground shadow-soft"
                                : "text-foreground hover:bg-accent active:bg-accent/70"
                            }`}
                          >
                            <LayoutDashboard className="size-5 shrink-0" />
                            <span>{t("nav.seller")}</span>
                          </Link>
                        )}

                        {user.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={handleNavClick}
                            className={`flex items-center gap-3 min-h-12 px-4 py-3 rounded-lg text-base font-semibold transition ${
                              pathname === "/admin"
                                ? "bg-primary text-primary-foreground shadow-soft"
                                : "text-foreground hover:bg-accent active:bg-accent/70"
                            }`}
                          >
                            <LayoutDashboard className="size-5 shrink-0" />
                            <span>{t("nav.admin")}</span>
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            logout();
                            setOpenMenu(false);
                            navigate({ to: "/" });
                          }}
                          className="w-full flex items-center gap-3 min-h-12 px-4 py-3 rounded-lg text-base font-semibold text-destructive hover:bg-destructive/10 transition mt-2"
                        >
                          <LogOut className="size-5 shrink-0" />
                          <span>{t("nav.logout")}</span>
                        </button>
                      </>
                    )}
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuLink({ to, icon: Icon, label, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition">
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
