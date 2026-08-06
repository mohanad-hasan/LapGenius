import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  MessageCircle, Send, Search, ArrowLeft, Store,
  CheckCheck, Clock, Loader2, Wifi, WifiOff, Smile,
  Users, MessageSquare
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/context/AppContext";
import { chatService } from "@/services/chatService";
import { WS_URL, makeAbsoluteUrl } from "@/lib/api";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat — LapGenius" }] }),
  component: CustomerChatPage,
});

/* ─── helpers ──────────────────────────────────────────────────────────── */
function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtDay(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}
function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(iso).toLocaleDateString();
}

function Avatar({ src, name, size = 10, online }) {
  const initials = name ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const [imgErr, setImgErr] = useState(false);
  const finalSrc = makeAbsoluteUrl(src);

  const sizes = {
    7: "w-7 h-7",
    9: "w-9 h-9",
    10: "w-10 h-10",
    12: "w-12 h-12"
  };
  const sizeClass = sizes[size] || "w-10 h-10";

  return (
    <div className="relative shrink-0">
      {finalSrc && !imgErr ? (
        <img src={finalSrc} alt={name} onError={() => setImgErr(true)}
          className={`${sizeClass} rounded-full object-cover`} />
      ) : (
        <div className={`${sizeClass} rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold text-sm select-none`}>
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-background transition-colors ${online ? "bg-green-500" : "bg-muted-foreground/30"}`} />
      )}
    </div>
  );
}

const EMOJI_LIST = ["😊", "👍", "🙏", "❤️", "😂", "🔥", "✅", "💯", "😅", "🤔", "👋", "🎉"];

/* ─── main component ───────────────────────────────────────────────────── */
function CustomerChatPage() {
  const { user, isUserLoaded, refreshChatBadge } = useApp();

  // panels
  const [panel, setPanel] = useState("inbox"); // "inbox" | "sellers" | "chat"
  const [sellers, setSellers] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const conversationRef = useRef(conversation);
  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  // ui
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const [onlineIds, setOnlineIds] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const typingTimeout = useRef(null);

  const bottomRef = useRef(null);
  const wsRef = useRef(null);
  const inputRef = useRef(null);
  const lastTypingSent = useRef(0);

  const isOnline = (id) => onlineIds.includes(String(id));

  const handleTyping = useCallback(() => {
    if (!wsConnected || !conversation || !wsRef.current) return;
    const now = Date.now();
    if (now - lastTypingSent.current > 2000) {
      lastTypingSent.current = now;
      wsRef.current.send(JSON.stringify({
        type: "typing",
        conversation_id: conversation.id,
        recipient_id: conversation.partner?.id
      }));
    }
  }, [wsConnected, conversation]);

  /* load data */
  const loadAll = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [s, c] = await Promise.all([chatService.getSellers(), chatService.getCustomerConversations()]);
      setSellers(Array.isArray(s) ? s : []);
      setInbox(Array.isArray(c) ? c : []);
    } catch { } finally { setLoading(false); }
  }, [user]);

  const openConversation = useCallback(async (sellerId) => {
    try {
      setLoading(true);
      const conv = await chatService.startConversation(sellerId);
      setConversation(conv);
      setMessages(conv.messages || []);
      setPanel("chat");
      refreshChatBadge();
    } catch (err) { toast.error(err.message || "Failed to open conversation"); }
    finally { setLoading(false); }
  }, [refreshChatBadge]);

  const openById = useCallback(async (convId) => {
    try {
      setLoading(true);
      const conv = await chatService.getCustomerConversation(convId);
      setConversation(conv);
      setMessages(conv.messages || []);
      setInbox((prev) => prev.map((c) => c.id === convId ? { ...c, unread_count: 0 } : c));
      setPanel("chat");
      refreshChatBadge();
    } catch (err) { toast.error(err.message || "Failed to open conversation"); }
    finally { setLoading(false); }
  }, [refreshChatBadge]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !conversation || sending) return;
    setSending(true);
    setInput("");
    setShowEmoji(false);
    const optimistic = { id: `tmp-${Date.now()}`, sender_id: user.id, body: text, is_read: false, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const msg = await chatService.customerSend(conversation.id, text);
      setMessages((prev) => prev.map((m) => m.id === optimistic.id ? msg : m));
      chatService.getCustomerConversations().then((c) => setInbox(Array.isArray(c) ? c : []));
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(text);
      toast.error(err.message || "Failed to send");
    } finally { setSending(false); }
  }, [input, conversation, user, sending]);

  /* websocket */
  useEffect(() => {
    if (!user) return;
    let attempts = 0;
    chatService.getOnlineUsers().then((ids) => setOnlineIds((ids || []).map(String)));

    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen = () => { setWsConnected(true); attempts = 0; ws.send(JSON.stringify({ type: "identify", user_id: user.id })); };
      ws.onclose = () => { setWsConnected(false); if (attempts < 5) { attempts++; setTimeout(connect, 4000); } };
      ws.onerror = () => ws.close();
      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data.event === "presence") { setOnlineIds((data.online_users || []).map(String)); return; }
          if (data.event === "typing") {
            setConversation((conv) => {
              if (conv && String(data.conversation_id) === String(conv.id) && String(data.sender_id) !== String(user.id)) {
                setPartnerTyping(true);
                clearTimeout(typingTimeout.current);
                typingTimeout.current = setTimeout(() => setPartnerTyping(false), 3000);
              }
              return conv;
            });
            return;
          }
          if (data.event === "messages_read") {
            if (String(data.sender_id) === String(user.id)) {
              setMessages((prev) => prev.map((m) =>
                String(m.sender_id) === String(user.id) && String(data.conversation_id) === String(conversationRef.current?.id ?? data.conversation_id)
                  ? { ...m, is_read: true } : m
              ));
            }
            return;
          }
          if (data.event !== "new_message") return;
          if (String(data.recipient_id) !== String(user.id)) return;
          setConversation((conv) => {
            if (conv && String(data.conversation_id) === String(conv.id)) {
              setMessages((prev) => {
                if (prev.some((m) => String(m.id) === String(data.message_id))) return prev;
                return [...prev, {
                  id: data.message_id,
                  sender_id: data.sender_id,
                  sender_name: data.sender_name,
                  sender_image: data.sender_image,
                  body: data.body,
                  is_read: false,
                  created_at: data.created_at
                }];
              });
              setPartnerTyping(false);
              
              // Mark read in backend immediately
              chatService.getCustomerConversation(conv.id).then(() => {
                refreshChatBadge();
              });
            }
            return conv;
          });
          setInbox((prev) => prev.map((c) => String(c.id) === String(data.conversation_id)
            ? { ...c, last_message: data.body, last_message_at: data.created_at, unread_count: (c.unread_count || 0) + 1 } : c));
        } catch { }
      };
    }
    connect();
    return () => { wsRef.current?.close(); clearTimeout(typingTimeout.current); };
  }, [user, refreshChatBadge]);


  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, partnerTyping]);
  useEffect(() => { if (panel === "chat") setTimeout(() => inputRef.current?.focus(), 200); }, [panel]);
  useEffect(() => { loadAll(); }, [loadAll]);

  if (!isUserLoaded) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== "customer") return <Navigate to="/" />;

  const filteredSellers = sellers.filter((s) => s.full_name?.toLowerCase().includes(searchQ.toLowerCase()));
  const totalUnread = inbox.reduce((t, c) => t + (c.unread_count || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl flex flex-col" style={{ height: "calc(100vh - 130px)" }}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="flex-1">
            <h1 className="text-2xl font-black flex items-center gap-2">
              <MessageCircle className="size-6 text-primary" />
              Messages
              {totalUnread > 0 && <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-bold">{totalUnread}</span>}
            </h1>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${wsConnected ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
            {wsConnected ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
            {wsConnected ? "Live" : "Reconnecting..."}
          </div>
        </div>

        {/* Main layout */}
        <div className="flex gap-4 flex-1 min-h-0">

          {/* ── LEFT SIDEBAR ── */}
          <div className={`flex flex-col w-80 shrink-0 rounded-2xl border bg-card overflow-hidden shadow-sm ${panel === "chat" ? "hidden lg:flex" : "flex w-full lg:w-80"}`}>
            {/* Tabs */}
            <div className="flex border-b shrink-0">
              <button onClick={() => setPanel("inbox")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${panel !== "sellers" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <MessageSquare className="size-4" />
                Inbox
                {totalUnread > 0 && <span className="size-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">{totalUnread}</span>}
              </button>
              <button onClick={() => setPanel("sellers")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${panel === "sellers" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <Users className="size-4" />
                Sellers
              </button>
            </div>

            {/* Search (sellers only) */}
            {panel === "sellers" && (
              <div className="p-3 border-b shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input type="text" placeholder="Search sellers..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                    className="w-full pl-9 pr-3 h-9 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading && !inbox.length ? (
                <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin text-primary" /></div>
              ) : panel === "sellers" ? (
                filteredSellers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-10 text-muted-foreground/50">
                    <Store className="size-10 mb-2" />
                    <p className="text-sm font-semibold">No sellers found</p>
                  </div>
                ) : (
                  filteredSellers.map((seller) => (
                    <button key={seller.id} onClick={() => openConversation(seller.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-muted/60 transition text-left">
                      <Avatar src={seller.image} name={seller.full_name} size={10} online={isOnline(seller.id)} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{seller.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{seller.location || "Seller"}</p>
                      </div>
                      <span className={`text-[10px] font-semibold ${isOnline(seller.id) ? "text-emerald-500" : "text-muted-foreground"}`}>
                        {isOnline(seller.id) ? "Online" : ""}
                      </span>
                    </button>
                  ))
                )
              ) : inbox.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 text-muted-foreground/50 px-4 text-center">
                  <MessageCircle className="size-10 mb-2" />
                  <p className="text-sm font-semibold">No conversations yet</p>
                  <button onClick={() => setPanel("sellers")} className="mt-3 text-xs text-primary font-bold hover:underline">Browse Sellers</button>
                </div>
              ) : (
                inbox.map((conv) => (
                  <button key={conv.id} onClick={() => openById(conv.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-muted/60 transition text-left ${conversation?.id === conv.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>
                    <Avatar src={conv.partner?.image} name={conv.partner?.full_name} size={10} online={isOnline(conv.partner?.id)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-sm truncate ${conv.unread_count > 0 ? "font-bold text-foreground" : "font-semibold text-foreground/80"}`}>{conv.partner?.full_name}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(conv.last_message_at)}</span>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${conv.unread_count > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{conv.last_message || "No messages yet"}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="shrink-0 min-w-[1.25rem] h-5 px-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">{conv.unread_count}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── RIGHT: CHAT PANEL ── */}
          <AnimatePresence mode="wait">
            {panel === "chat" && conversation ? (
              <motion.div key="chat-panel"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="flex flex-col flex-1 min-w-0 rounded-2xl border bg-card overflow-hidden shadow-md"
              >
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b bg-card/90 backdrop-blur shrink-0">
                  <button onClick={() => { setPanel("inbox"); setConversation(null); }} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition">
                    <ArrowLeft className="size-4" />
                  </button>
                  <Avatar src={conversation.partner?.image} name={conversation.partner?.full_name} size={9} online={isOnline(conversation.partner?.id)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold leading-tight truncate">{conversation.partner?.full_name}</p>
                    {isOnline(conversation.partner?.id) ? (
                      <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" /> Online
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Offline</p>
                    )}
                  </div>
                  <Store className="size-4 text-muted-foreground/40 shrink-0" />
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
                  style={{ backgroundImage: "radial-gradient(circle at 1px 1px, var(--muted) 1px, transparent 0)", backgroundSize: "24px 24px", backgroundPosition: "0 0" }}>
                  {messages.length === 0 && !partnerTyping && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 py-10">
                      <MessageCircle className="size-12 mb-2" />
                      <p className="text-sm font-semibold">Say hello! 👋</p>
                    </div>
                  )}

                  {messages.map((msg, idx) => {
                    const isMe = String(msg.sender_id) === String(user.id);
                    const prevMsg = messages[idx - 1];
                    const nextMsg = messages[idx + 1];
                    const showDate = idx === 0 || fmtDay(prevMsg?.created_at) !== fmtDay(msg.created_at);
                    const isSameAsPrev = prevMsg && String(prevMsg.sender_id) === String(msg.sender_id) && !showDate;
                    const isSameAsNext = nextMsg && String(nextMsg.sender_id) === String(msg.sender_id);

                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="text-[10px] bg-muted/80 backdrop-blur text-muted-foreground px-3 py-1 rounded-full font-semibold shadow-sm">{fmtDay(msg.created_at)}</span>
                          </div>
                        )}
                        <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} ${isSameAsPrev ? "mt-0.5" : "mt-3"}`}>
                          {/* Avatar — only show on last in a group */}
                          {!isMe && (
                            <div className={`shrink-0 ${isSameAsNext ? "opacity-0 pointer-events-none" : ""}`}>
                              <Avatar src={msg.sender_image} name={msg.sender_name} size={7} />
                            </div>
                          )}

                          <div className={`max-w-[65%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            <div className={`px-3.5 py-2 text-sm leading-relaxed shadow-sm break-words
                              ${isMe
                                ? "bg-primary text-primary-foreground"
                                : "bg-card border text-foreground"
                              }
                              ${isMe
                                ? isSameAsNext ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-br-sm"
                                : isSameAsNext ? "rounded-2xl rounded-bl-md" : "rounded-2xl rounded-bl-sm"
                              }`}>
                              {msg.body}
                            </div>

                            {/* Timestamp + read receipt — only on last in group */}
                            {!isSameAsNext && (
                              <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                                <span className="text-[10px] text-muted-foreground">{fmtTime(msg.created_at)}</span>
                                {isMe && (
                                  <CheckCheck className={`size-3.5 ${msg.is_read ? "text-blue-500" : "text-muted-foreground/40"}`} />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {partnerTyping && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-end gap-2 mt-3">
                        <Avatar src={conversation.partner?.image} name={conversation.partner?.full_name} size={7} />
                        <div className="bg-card border px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"
                              animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={bottomRef} />
                </div>

                {/* Emoji picker */}
                <AnimatePresence>
                  {showEmoji && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="flex flex-wrap gap-1 px-4 py-2 border-t bg-muted/30">
                      {EMOJI_LIST.map((e) => (
                        <button key={e} onClick={() => setInput((v) => v + e)}
                          className="text-xl hover:scale-125 transition-transform">{e}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input bar */}
                <div className="px-4 py-3 border-t bg-background/80 backdrop-blur shrink-0">
                  <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2 items-center">
                    <button type="button" onClick={() => setShowEmoji((v) => !v)}
                      className="p-2 rounded-xl hover:bg-muted transition text-muted-foreground hover:text-foreground shrink-0">
                      <Smile className="size-5" />
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Type a message..."
                      className="flex-1 h-11 px-4 rounded-2xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition text-sm"
                    />
                    <button type="submit" disabled={!input.trim() || sending}
                      className="h-11 w-11 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-40 shrink-0 shadow-sm">
                      {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="hidden lg:flex flex-1 items-center justify-center rounded-2xl border border-dashed bg-muted/20">
                <div className="text-center text-muted-foreground/40 space-y-2">
                  <MessageCircle className="size-16 mx-auto" />
                  <p className="font-bold text-lg">Select a conversation</p>
                  <p className="text-sm">Choose from your inbox or start a new chat with a seller</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
