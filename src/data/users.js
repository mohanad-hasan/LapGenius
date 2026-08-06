export const MOCK_USERS = [
  { id: "u1", name: "Mohanad Hasan", email: "customer@lapgenius.com", phone: "0999111222", password: "demo123", role: "customer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mohanad", joined: "2024-08-12" },
  { id: "s1", name: "TechHub Store", email: "seller@lapgenius.com", phone: "0999222333", password: "demo123", role: "seller", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=seller", joined: "2024-02-04" },
  { id: "u3", name: "Sarah Johnson", email: "sarah@example.com", phone: "0999333444", password: "demo123", role: "customer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah", joined: "2025-01-20" },
  { id: "u4", name: "Ali Mansour", email: "ali@example.com", phone: "0999444555", password: "demo123", role: "customer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ali", joined: "2025-03-09" },
  { id: "s2", name: "Apple Authorized", email: "apple-seller@lapgenius.com", phone: "0999555666", password: "demo123", role: "seller", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=apple", joined: "2023-11-15" },
  { id: "u6", name: "Admin Master", email: "admin@lapgenius.com", phone: "0999666777", password: "demo123", role: "admin", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin", joined: "2023-01-01" },
  { id: "s3", name: "Lenovo Direct", email: "lenovo-direct@lapgenius.com", phone: "0999777888", password: "demo123", role: "seller", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lenovo", joined: "2023-07-10" },
  { id: "s4", name: "Dell Premier", email: "dell-premier@lapgenius.com", phone: "0999888999", password: "demo123", role: "seller", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dell", joined: "2024-04-05" },
  { id: "s5", name: "HP Store", email: "hp-store@lapgenius.com", phone: "0999555222", password: "demo123", role: "seller", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hp", joined: "2024-09-14" },
  { id: "s6", name: "ValueTech", email: "valuetech@lapgenius.com", phone: "0999666111", password: "demo123", role: "seller", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=valuetech", joined: "2024-11-21" },
  { id: "s7", name: "ASUS Official", email: "asus-official@lapgenius.com", phone: "0999777999", password: "demo123", role: "seller", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=asus", joined: "2023-12-12" }
];

// Order statuses: "pending" | "accepted" | "rejected"
export const MOCK_ORDERS = [
  {
    id: "ORD-1001",
    userId: "u1",
    date: "2025-11-20",
    total: 899,
    status: "accepted",
    items: 1,
    customer: { id: "u1", name: "Mohanad Hasan", email: "customer@lapgenius.com", phone: "0999111222", address: "", city: "", paymentMethod: "cash_on_delivery" },
    paymentMethod: "cash_on_delivery",
    product: { id: 1, name: "ASUS ROG Strix G16", price: 899, qty: 1, sellerId: "s1", sellerName: "TechHub Store" },
    orderItems: [{ productId: 1, name: "ASUS ROG Strix G16", price: 899, qty: 1, sellerId: "s1", sellerName: "TechHub Store" }],
    paymentProof: null,
    note: null
  },
  {
    id: "ORD-1002",
    userId: "u1",
    date: "2025-12-02",
    total: 799,
    status: "pending",
    items: 1,
    customer: { id: "u1", name: "Mohanad Hasan", email: "customer@lapgenius.com", phone: "0999111222", address: "123 Main St", city: "Damascus", paymentMethod: "cash_on_delivery" },
    paymentMethod: "cash_on_delivery",
    product: { id: 7, name: "Acer Swift Go 14", price: 449, qty: 1, sellerId: "s6", sellerName: "ValueTech" },
    orderItems: [{ productId: 7, name: "Acer Swift Go 14", price: 449, qty: 1, sellerId: "s6", sellerName: "ValueTech" }],
    paymentProof: null,
    note: null
  },
  {
    id: "ORD-1003",
    userId: "u3",
    date: "2026-01-15",
    total: 949,
    status: "pending",
    items: 1,
    customer: { id: "u3", name: "Sarah Johnson", email: "sarah@example.com", phone: "0999333444", address: "", city: "", paymentMethod: "sham_cash" },
    paymentMethod: "sham_cash",
    product: { id: 4, name: "Dell XPS 15 OLED", price: 949, qty: 1, sellerId: "s4", sellerName: "Dell Premier" },
    orderItems: [{ productId: 4, name: "Dell XPS 15 OLED", price: 949, qty: 1, sellerId: "s4", sellerName: "Dell Premier" }],
    paymentProof: { name: "receipt-1003.jpg", type: "image/jpeg", url: "https://via.placeholder.com/480x320?text=Receipt+1003" },
    note: null
  },
  {
    id: "ORD-1004",
    userId: "u4",
    date: "2026-02-22",
    total: 449,
    status: "accepted",
    items: 1,
    customer: { id: "u4", name: "Ali Mansour", email: "ali@example.com", phone: "0999444555", address: "", city: "", paymentMethod: "cash_on_delivery" },
    paymentMethod: "cash_on_delivery",
    product: { id: 7, name: "Acer Swift Go 14", price: 449, qty: 1, sellerId: "s6", sellerName: "ValueTech" },
    orderItems: [{ productId: 7, name: "Acer Swift Go 14", price: 449, qty: 1, sellerId: "s6", sellerName: "ValueTech" }],
    paymentProof: null,
    note: null
  },
  {
    id: "ORD-1005",
    userId: "u3",
    date: "2026-04-03",
    total: 699,
    status: "rejected",
    items: 1,
    customer: { id: "u3", name: "Sarah Johnson", email: "sarah@example.com", phone: "0999333444", address: "", city: "", paymentMethod: "sham_cash" },
    paymentMethod: "sham_cash",
    product: { id: 5, name: "HP Spectre x360 14", price: 699, qty: 1, sellerId: "s5", sellerName: "HP Store" },
    orderItems: [{ productId: 5, name: "HP Spectre x360 14", price: 699, qty: 1, sellerId: "s5", sellerName: "HP Store" }],
    paymentProof: { name: "receipt-1005.png", type: "image/png", url: "https://via.placeholder.com/480x320?text=Receipt+1005" },
    note: "تم رفض الطلب - يحتاج إلى مراجعة العربون يدوياً"
  },
  {
    id: "ORD-1006",
    userId: "u1",
    date: "2026-05-18",
    total: 349,
    status: "accepted",
    items: 1,
    customer: { id: "u1", name: "Mohanad Hasan", email: "customer@lapgenius.com", phone: "0999111222", address: "", city: "", paymentMethod: "cash_on_delivery" },
    paymentMethod: "cash_on_delivery",
    product: { id: 3, name: "Lenovo ThinkPad X1 Carbon Gen 11", price: 749, qty: 1, sellerId: "s3", sellerName: "Lenovo Direct" },
    orderItems: [{ productId: 3, name: "Lenovo ThinkPad X1 Carbon Gen 11", price: 749, qty: 1, sellerId: "s3", sellerName: "Lenovo Direct" }],
    paymentProof: null,
    note: null
  }
];

export function findUserById(id) {
  return MOCK_USERS.find((u) => u.id === id) || null;
}
