import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Bell, Check, CheckCheck, Send, Megaphone, Users, UserCheck, ShieldAlert, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/context/AppContext";
import { useI18n } from "@/lib/i18n";
import { notificationService } from "@/services/notificationService";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — LapGenius" }] }),
  component: NotificationsPage,
});

const LOCALES = {
  ar: {
    title: "الإشعارات",
    allRead: "تعيين الكل كمقروء",
    noNotifications: "لا توجد إشعارات حالياً.",
    sendBroadcast: "إرسال إشعار جديد",
    send: "إرسال الإشعار",
    notificationTitle: "عنوان الإشعار",
    notificationMessage: "محتوى الإشعار",
    targetUsers: "المستهدفين",
    allUsers: "جميع المستخدمين",
    onlyCustomers: "الزبائن فقط",
    onlySellers: "البائعين فقط",
    successSent: "تم إرسال الإشعار بنجاح",
    system: "النظام",
    broadcast: "عام",
    sending: "جاري الإرسال...",
    adminTab: "إرسال إشعارات",
    listTab: "قائمة الإشعارات"
  },
  en: {
    title: "Notifications",
    allRead: "Mark all as read",
    noNotifications: "No notifications at the moment.",
    sendBroadcast: "Send Broadcast",
    send: "Send Notification",
    notificationTitle: "Notification Title",
    notificationMessage: "Notification Message",
    targetUsers: "Target Audience",
    allUsers: "All Users",
    onlyCustomers: "Only Customers",
    onlySellers: "Only Sellers",
    successSent: "Notification sent successfully",
    system: "System",
    broadcast: "Broadcast",
    sending: "Sending...",
    adminTab: "Send Broadcast",
    listTab: "My Notifications"
  }
};

function NotificationsPage() {
  const { user, isUserLoaded, notifications, unreadNotificationsCount, refreshNotifications } = useApp();
  const { locale } = useI18n();
  const tLocal = LOCALES[locale] || LOCALES.en;

  const [activeTab, setActiveTab] = useState("list");
  const navigate = useNavigate();
  
  // Admin form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [userType, setUserType] = useState("all");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      refreshNotifications();
    }
  }, [user]);

  if (!isUserLoaded) return null;
  if (!user) return <Navigate to="/login" />;

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(user.role, id);
      refreshNotifications();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead(user.role);
      toast.success(tLocal.allRead);
      refreshNotifications();
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setSending(true);
    try {
      await notificationService.send({
        title: title.trim(),
        message: message.trim(),
        user_type: userType
      });
      toast.success(tLocal.successSent);
      setTitle("");
      setMessage("");
      setActiveTab("list");
      refreshNotifications();
    } catch (err) {
      toast.error(err.message || "Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              <Bell className="size-8 text-primary animate-pulse" />
              {tLocal.title}
              {unreadNotificationsCount > 0 && (
                <span className="text-sm bg-destructive text-destructive-foreground px-2.5 py-1 rounded-full font-bold">
                  {unreadNotificationsCount}
                </span>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              {locale === "ar" ? "إشعاراتك وتنبيهات النظام في مكان واحد" : "Your notifications and system alerts in one place"}
            </p>
          </div>

          {notifications.length > 0 && activeTab === "list" && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/80 transition"
            >
              <CheckCheck className="size-4" />
              {tLocal.allRead}
            </button>
          )}
        </div>

        {/* Tab Switcher (Only visible to Admin) */}
        {user.role === "admin" && (
          <div className="flex bg-muted/60 p-1.5 rounded-2xl mb-6 w-fit border">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === "list" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tLocal.listTab}
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === "admin" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tLocal.adminTab}
            </button>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "list" ? (
            <motion.div
              key="list-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {notifications.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-3xl border shadow-soft flex flex-col items-center justify-center">
                  <Bell className="size-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-semibold text-lg">{tLocal.noNotifications}</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => {
                        if (!n.is_read) handleMarkAsRead(n.id);
                        if (n.type && n.type.startsWith('product_discount:')) {
                          const productId = n.type.split(':')[1];
                          navigate({ to: `/product/${productId}` });
                        }
                      }}
                      className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer shadow-soft flex gap-4 ${n.is_read ? "bg-card/50 border-muted/50 opacity-75" : "bg-card border-primary/20 hover:border-primary/50"}`}
                    >
                      {/* Left Border for Unread */}
                      {!n.is_read && (
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary rounded-l-2xl" />
                      )}

                      {/* Icon */}
                      <div className={`p-3 rounded-xl h-fit ${n.type === "admin_broadcast" ? "bg-violet-500/10 text-violet-500" : "bg-primary/10 text-primary"}`}>
                        {n.type === "admin_broadcast" ? <Megaphone className="size-5" /> : <Bell className="size-5" />}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className={`font-bold ${n.is_read ? "text-foreground/80" : "text-foreground"}`}>
                            {n.title}
                          </h3>
                          <span className="text-xs text-muted-foreground/80 flex items-center gap-1 shrink-0 font-medium">
                            <Clock className="size-3" />
                            {new Date(n.created_at || n.timestamp).toLocaleDateString(locale, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        
                        {/* Type badge */}
                        <div className="flex gap-2 mt-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${n.type === "admin_broadcast" ? "bg-violet-500/15 text-violet-600" : "bg-primary/15 text-primary"}`}>
                            {n.type === "admin_broadcast" ? tLocal.broadcast : tLocal.system}
                          </span>
                        </div>
                      </div>

                      {/* Read status check */}
                      {!n.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(n.id);
                          }}
                          className="self-center p-2 rounded-xl bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300"
                          title="Mark as read"
                        >
                          <Check className="size-4" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.form
              key="admin-tab"
              onSubmit={handleSendBroadcast}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="p-6 sm:p-8 bg-card border rounded-3xl shadow-soft space-y-6"
            >
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Megaphone className="size-6 text-primary" />
                {tLocal.sendBroadcast}
              </h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">
                    {tLocal.notificationTitle}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition"
                    placeholder={locale === "ar" ? "أدخل عنوان التنبيه" : "e.g. System Maintenance"}
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">
                    {tLocal.targetUsers}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setUserType("all")}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${userType === "all" ? "bg-primary/10 border-primary text-primary font-bold" : "bg-background text-muted-foreground hover:bg-muted"}`}
                    >
                      <Users className="size-5 mb-1" />
                      <span className="text-xs">{tLocal.allUsers}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType("customers")}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${userType === "customers" ? "bg-primary/10 border-primary text-primary font-bold" : "bg-background text-muted-foreground hover:bg-muted"}`}
                    >
                      <UserCheck className="size-5 mb-1" />
                      <span className="text-xs">{tLocal.onlyCustomers}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType("sellers")}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${userType === "sellers" ? "bg-primary/10 border-primary text-primary font-bold" : "bg-background text-muted-foreground hover:bg-muted"}`}
                    >
                      <ShieldAlert className="size-5 mb-1" />
                      <span className="text-xs">{tLocal.onlySellers}</span>
                    </button>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">
                    {tLocal.notificationMessage}
                  </label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full p-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                    placeholder={locale === "ar" ? "اكتب محتوى الإشعار بالتفصيل هنا..." : "e.g. The system will be down for maintenance tonight at 12:00 AM."}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={sending}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-dark transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send className="size-5" />
                {sending ? tLocal.sending : tLocal.send}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
