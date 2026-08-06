import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { authService } from "@/services/authService";
import { cartService } from "@/services/cartService";
import { wishlistService } from "@/services/wishlistService";
import { orderService } from "@/services/orderService";
import { notificationService } from "@/services/notificationService";
import { chatService } from "@/services/chatService";
import { toast } from "sonner";
import { WS_URL } from "@/lib/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Theme
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lg_theme");
      if (saved && saved !== "light") {
        setTheme(saved);
      }
    }
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("lg_theme", theme);
  }, [theme]);

  // Auth
  const [user, setUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Unread chat messages badge count
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Helper: refresh chat badge from server
  const refreshChatBadge = useCallback(async () => {
    if (!user) return;
    try {
      const endpoint = user.role === 'seller'
        ? () => chatService.getSellerConversations()
        : () => chatService.getCustomerConversations();
      const convs = await endpoint();
      const total = (convs || []).reduce((s, c) => s + (c.unread_count || 0), 0);
      setUnreadChatCount(total);
    } catch {}
  }, [user]);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { notifications, unreadCount } = await notificationService.list(user.role);
      setNotifications(notifications);
      setUnreadNotificationsCount(unreadCount);
    } catch {}
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshNotifications();
      refreshChatBadge();
    } else {
      setNotifications([]);
      setUnreadNotificationsCount(0);
      setUnreadChatCount(0);
    }
  }, [user, refreshNotifications, refreshChatBadge]);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!user) return;
    let ws;
    let reconnectTimeout;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;

    function connect() {
      try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          // Identify so the server can track this user's presence
          ws.send(JSON.stringify({ type: "identify", user_id: user.id }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (String(data.user_id) === String(user.id)) {
              if (data.event === 'new_message' || data.type === 'chat_message') {
                // Chat message notification — only show toast, bump badge
                toast(data.title || 'New message', {
                  description: data.message || data.body,
                  duration: 5000,
                });
                setUnreadChatCount((c) => c + 1);
              } else {
                // Regular system notification
                toast(data.title, {
                  description: data.message,
                  duration: 5000,
                });
                refreshNotifications();
              }
            }
          } catch (err) {
            console.error('Error parsing WS message:', err);
          }
        };

        ws.onclose = () => {
          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            reconnectTimeout = setTimeout(connect, 5000);
          } else {
            console.warn("WebSocket reconnection limit reached. Stopping retries.");
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (e) {
        console.error("WebSocket connection failed:", e);
      }
    }

    connect();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [user, refreshNotifications]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lg_user");
        if (saved && saved !== "null") setUser(JSON.parse(saved));
      } catch {}
      setIsUserLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isUserLoaded) return;
    if (user) localStorage.setItem("lg_user", JSON.stringify(user));
    else localStorage.removeItem("lg_user");
  }, [user, isUserLoaded]);

  const login = useCallback(async (email, password) => {
    const { user, token } = await authService.login(email, password);
    if (token) localStorage.setItem("lg_token", token);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (payload) => {
    const { user, token } = await authService.register(payload);
    if (token) localStorage.setItem("lg_token", token);
    setUser(user);
    return user;
  }, []);



  // Cart
  const [cart, setCart] = useState([]);

  // Load and sync cart on user state ready/change
  useEffect(() => {
    async function syncCart() {
      if (user?.role === "customer") {
        try {
          const localCart = cartService.load();
          if (localCart.length > 0) {
            for (const item of localCart) {
              await cartService.add(item.id, item.qty).catch(() => {});
            }
            cartService.save([]); // Clear local storage after merging
          }
          const backendCart = await cartService.getCart();
          setCart(backendCart);
        } catch (err) {
          console.error("Failed to sync cart:", err);
        }
      } else {
        setCart(cartService.load());
      }
    }

    if (isUserLoaded) {
      syncCart();
    }
  }, [user, isUserLoaded]);

  // Persist guest cart to local storage when it changes
  useEffect(() => {
    if (isUserLoaded && (!user || user.role !== "customer")) {
      cartService.save(cart);
    }
  }, [cart, user, isUserLoaded]);

  const addToCart = useCallback(async (product, qty = 1, color = null) => {
    if (user?.role === "customer") {
      try {
        await cartService.add(product.id, qty);
        const freshCart = await cartService.getCart();
        setCart(freshCart);
        toast.success("Added to cart");
      } catch (err) {
        toast.error(err.message || "Failed to add to cart");
      }
    } else {
      setCart((prev) => {
        const idx = prev.findIndex((i) => i.id === product.id && i.color === (color?.name || null));
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + qty };
          return next;
        }
        return [...prev, {
          id: product.id,
          name: product.name,
          price: product.price,
          aiPrice: product.aiPrice,
          image: (color || product.colors?.[0] || {}).images?.[0] || product.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
          color: color?.name || product.colors?.[0]?.name || "Default",
          qty
        }];
      });
      toast.success("Added to cart");
    }
  }, [user]);

  const updateQty = useCallback(async (id, color, qty) => {
    if (user?.role === "customer") {
      const item = cart.find((i) => i.id === id);
      if (item && item.cartItemId) {
        try {
          await cartService.update(item.cartItemId, qty);
          setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)));
        } catch (err) {
          toast.error(err.message || "Failed to update quantity");
        }
      }
    } else {
      setCart((prev) => prev.map((i) => (i.id === id && i.color === color ? { ...i, qty: Math.max(1, qty) } : i)));
    }
  }, [user, cart]);

  const removeFromCart = useCallback(async (id, color) => {
    if (user?.role === "customer") {
      const item = cart.find((i) => i.id === id);
      if (item && item.cartItemId) {
        try {
          await cartService.remove(item.cartItemId);
          setCart((prev) => prev.filter((i) => i.id !== id));
          toast.success("Removed from cart");
        } catch (err) {
          toast.error(err.message || "Failed to remove from cart");
        }
      }
    } else {
      setCart((prev) => prev.filter((i) => !(i.id === id && i.color === color)));
      toast.success("Removed from cart");
    }
  }, [user, cart]);

  const clearCart = useCallback(async () => {
    if (user?.role === "customer") {
      try {
        await cartService.clear();
        setCart([]);
      } catch (err) {
        toast.error(err.message || "Failed to clear cart");
      }
    } else {
      setCart([]);
    }
  }, [user]);

  // Wishlist
  const [wishlist, setWishlist] = useState([]);

  // Load and sync wishlist on user state ready/change
  useEffect(() => {
    async function syncWishlist() {
      if (user?.role === "customer") {
        try {
          const localWishlist = wishlistService.load();
          if (localWishlist.length > 0) {
            for (const id of localWishlist) {
              await wishlistService.add(id).catch(() => {});
            }
            wishlistService.save([]); // Clear local storage after merging
          }
          const backendWishlist = await wishlistService.getWishlist();
          setWishlist(backendWishlist.map(Number));
        } catch (err) {
          console.error("Failed to sync wishlist:", err);
        }
      } else {
        setWishlist(wishlistService.load().map(Number));
      }
    }

    if (isUserLoaded) {
      syncWishlist();
    }
  }, [user, isUserLoaded]);

  // Persist guest wishlist to local storage when it changes
  useEffect(() => {
    if (isUserLoaded && (!user || user.role !== "customer")) {
      wishlistService.save(wishlist);
    }
  }, [wishlist, user, isUserLoaded]);

  const toggleWishlist = useCallback(async (id) => {
    const numId = Number(id);
    if (user?.role === "customer") {
      const isAlreadyIn = wishlist.includes(numId);
      try {
        if (isAlreadyIn) {
          await wishlistService.remove(numId);
          setWishlist((prev) => prev.filter((x) => x !== numId));
          toast.success("Removed from wishlist");
        } else {
          await wishlistService.add(numId);
          setWishlist((prev) => [...prev, numId]);
          toast.success("Added to wishlist");
        }
      } catch (err) {
        toast.error(err.message || "Failed to update wishlist");
      }
    } else {
      setWishlist((prev) => {
        const isAlreadyIn = prev.includes(numId);
        const next = isAlreadyIn ? prev.filter((x) => x !== numId) : [...prev, numId];
        if (isAlreadyIn) {
          toast.success("Removed from wishlist");
        } else {
          toast.success("Added to wishlist");
        }
        return next;
      });
    }
  }, [user, wishlist]);

  const inWishlist = useCallback((id) => wishlist.includes(Number(id)), [wishlist]);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch {}
    localStorage.removeItem("lg_token");
    localStorage.removeItem("lg_user");
    setUser(null);
    clearCart();
    setWishlist([]);
  }, [clearCart]);

  const value = useMemo(
    () => ({
      theme, setTheme, toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      user, login, register, logout, setUser, isUserLoaded,
      cart, addToCart, updateQty, removeFromCart, clearCart,
      cartCount: cart.reduce((s, i) => s + i.qty, 0),
      cartTotal: cart.reduce((s, i) => s + i.qty * i.price, 0),
      wishlist, toggleWishlist, inWishlist,
      orderService,
      notifications, unreadNotificationsCount, refreshNotifications,
      unreadChatCount, setUnreadChatCount, refreshChatBadge,
    }),
    [theme, user, login, register, logout, setUser, isUserLoaded, cart, addToCart, updateQty, removeFromCart, clearCart, wishlist, toggleWishlist, inWishlist, notifications, unreadNotificationsCount, refreshNotifications, unreadChatCount, setUnreadChatCount, refreshChatBadge]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
