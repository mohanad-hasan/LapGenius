// Mock product catalog. Designed to mirror future Laravel API shape.
// Images use Unsplash CDN — swap to API URLs later without code changes.
// Prices intentionally constrained to the $100 – $1000 range for the demo.

const img = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const CATEGORIES = ["Gaming", "Business", "Programming", "Design", "Lightweight", "Study", "General"];
export const CONDITIONS = ["New", "Used", "Refurbished"];
export const BRANDS = ["ASUS", "Lenovo", "HP", "Dell", "Acer", "MSI", "Apple", "Toshiba"];

export const PRODUCTS = [
  {
    id: 1, name: "ASUS ROG Strix G16", brand: "ASUS", category: "Gaming",
    description: "Beast-mode gaming laptop with RTX 4070 and 240Hz QHD display for serious gamers.",
    price: 899, aiPrice: 870, condition: "New", stock: 8,
    cpu: "Intel Core i9-13980HX", gpu: "NVIDIA RTX 4070 8GB", igpu: "Intel UHD Graphics", ram: "32GB DDR5", storage: "1TB NVMe SSD",
    seller: { id: "s1", name: "TechHub Store", rating: 4.8 },
    colors: [
      { name: "Eclipse Black", hex: "#1a1a1a", images: [img("1593642632559-0c6d3fc62b89"), img("1496181133206-80ce9b88a853"), img("1541807084-5c52b6b3adef")] },
      { name: "Volt Green", hex: "#39ff14", images: [img("1525547719571-a2d4ac8945e2"), img("1593642632559-0c6d3fc62b89")] }
    ]
  },
  {
    id: 2, name: "MacBook Pro 16\" M3 Max", brand: "Apple", category: "Design",
    description: "Pro-grade creative workstation with Liquid Retina XDR display and all-day battery.",
    price: 999, aiPrice: 980, condition: "New", stock: 5,
    cpu: "Apple M3 Max 16-core", gpu: "Apple M3 Max 40-core GPU", igpu: null, ram: "36GB Unified", storage: "1TB SSD",
    seller: { id: "s2", name: "Apple Authorized", rating: 5.0 },
    colors: [
      { name: "Space Black", hex: "#1d1d1f", images: [img("1517336714731-489689fd1ca8"), img("1611186871348-b1ce696e52c9"), img("1496181133206-80ce9b88a853")] },
      { name: "Silver", hex: "#e3e4e5", images: [img("1496181133206-80ce9b88a853"), img("1517336714731-489689fd1ca8")] }
    ]
  },
  {
    id: 3, name: "Lenovo ThinkPad X1 Carbon Gen 11", brand: "Lenovo", category: "Business",
    description: "Iconic business ultrabook with MIL-SPEC durability and legendary keyboard.",
    price: 749, aiPrice: 720, condition: "New", stock: 14,
    cpu: "Intel Core i7-1365U vPro", gpu: null, igpu: "Intel Iris Xe", ram: "16GB LPDDR5", storage: "512GB NVMe SSD",
    seller: { id: "s3", name: "Lenovo Direct", rating: 4.7 },
    colors: [{ name: "Carbon Black", hex: "#0c0c0c", images: [img("1588872657578-7efd1f1555ed"), img("1496181133206-80ce9b88a853")] }]
  },
  {
    id: 4, name: "Dell XPS 15 OLED", brand: "Dell", category: "Programming",
    description: "Stunning OLED 3.5K touch display, perfect for developers and content creators.",
    price: 949, aiPrice: 920, condition: "New", stock: 6,
    cpu: "Intel Core i7-13700H", gpu: "NVIDIA RTX 4060 8GB", igpu: "Intel Iris Xe", ram: "32GB DDR5", storage: "1TB NVMe SSD",
    seller: { id: "s4", name: "Dell Premier", rating: 4.6 },
    colors: [
      { name: "Platinum Silver", hex: "#bfc1c4", images: [img("1593642632559-0c6d3fc62b89"), img("1541807084-5c52b6b3adef")] },
      { name: "Frost", hex: "#e8e8e8", images: [img("1496181133206-80ce9b88a853")] }
    ]
  },
  {
    id: 5, name: "HP Spectre x360 14", brand: "HP", category: "Lightweight",
    description: "Convertible 2-in-1 with gem-cut design and OLED display for on-the-go work.",
    price: 699, aiPrice: 670, condition: "New", stock: 11,
    cpu: "Intel Core Ultra 7 155H", gpu: null, igpu: "Intel Arc Graphics", ram: "16GB LPDDR5", storage: "1TB NVMe SSD",
    seller: { id: "s5", name: "HP Store", rating: 4.5 },
    colors: [
      { name: "Nightfall Black", hex: "#191919", images: [img("1525547719571-a2d4ac8945e2"), img("1517336714731-489689fd1ca8")] },
      { name: "Nocturne Blue", hex: "#1c2541", images: [img("1611186871348-b1ce696e52c9")] }
    ]
  },
  {
    id: 6, name: "MSI Titan GT77 HX", brand: "MSI", category: "Gaming",
    description: "Desktop replacement with mini-LED 4K 144Hz panel and RTX 4090 power.",
    price: 999, aiPrice: 970, condition: "New", stock: 3,
    cpu: "Intel Core i9-14900HX", gpu: "NVIDIA RTX 4090 16GB", igpu: "Intel UHD Graphics", ram: "64GB DDR5", storage: "2TB NVMe SSD",
    seller: { id: "s1", name: "TechHub Store", rating: 4.8 },
    colors: [{ name: "Titan Black", hex: "#0a0a0a", images: [img("1593642632559-0c6d3fc62b89"), img("1525547719571-a2d4ac8945e2")] }]
  },
  {
    id: 7, name: "Acer Swift Go 14", brand: "Acer", category: "Study",
    description: "Affordable ultraportable with vibrant OLED for students and creators.",
    price: 449, aiPrice: 470, condition: "New", stock: 22,
    cpu: "Intel Core i5-13500H", gpu: null, igpu: "Intel Iris Xe", ram: "16GB LPDDR5", storage: "512GB NVMe SSD",
    seller: { id: "s6", name: "ValueTech", rating: 4.3 },
    colors: [
      { name: "Pure Silver", hex: "#c0c0c0", images: [img("1496181133206-80ce9b88a853")] },
      { name: "Steel Gray", hex: "#71797E", images: [img("1588872657578-7efd1f1555ed")] }
    ]
  },
  {
    id: 8, name: "ASUS ZenBook Duo OLED", brand: "ASUS", category: "Design",
    description: "Dual 14\" OLED screens reinvent multitasking for creators.",
    price: 899, aiPrice: 950, condition: "New", stock: 7,
    cpu: "Intel Core Ultra 9 185H", gpu: null, igpu: "Intel Arc Graphics", ram: "32GB LPDDR5X", storage: "1TB NVMe SSD",
    seller: { id: "s7", name: "ASUS Official", rating: 4.7 },
    colors: [{ name: "Inkwell Gray", hex: "#3b3b3b", images: [img("1611186871348-b1ce696e52c9"), img("1517336714731-489689fd1ca8")] }]
  },
  {
    id: 9, name: "Lenovo Legion Pro 7i", brand: "Lenovo", category: "Gaming",
    description: "Esports-tuned 16\" 240Hz display with bulletproof cooling.",
    price: 979, aiPrice: 990, condition: "New", stock: 9,
    cpu: "Intel Core i9-14900HX", gpu: "NVIDIA RTX 4080 12GB", igpu: "Intel UHD Graphics", ram: "32GB DDR5", storage: "1TB NVMe SSD",
    seller: { id: "s3", name: "Lenovo Direct", rating: 4.7 },
    colors: [{ name: "Eclipse Black", hex: "#181818", images: [img("1525547719571-a2d4ac8945e2"), img("1593642632559-0c6d3fc62b89")] }]
  },
  {
    id: 10, name: "HP EliteBook 840 G10", brand: "HP", category: "Business",
    description: "Enterprise-grade security with vPro and 14\" anti-glare display.",
    price: 649, aiPrice: 620, condition: "Refurbished", stock: 12,
    cpu: "Intel Core i7-1355U vPro", gpu: null, igpu: "Intel Iris Xe", ram: "16GB DDR5", storage: "512GB NVMe SSD",
    seller: { id: "s5", name: "HP Store", rating: 4.5 },
    colors: [{ name: "Silver", hex: "#bfc1c4", images: [img("1588872657578-7efd1f1555ed")] }]
  },
  {
    id: 11, name: "MacBook Air 13\" M3", brand: "Apple", category: "Lightweight",
    description: "Fanless silent design, all-day battery, and the magic of Apple silicon.",
    price: 799, aiPrice: 830, condition: "New", stock: 25,
    cpu: "Apple M3 8-core", gpu: "Apple M3 10-core GPU", igpu: null, ram: "16GB Unified", storage: "512GB SSD",
    seller: { id: "s2", name: "Apple Authorized", rating: 5.0 },
    colors: [
      { name: "Midnight", hex: "#171c2c", images: [img("1517336714731-489689fd1ca8")] },
      { name: "Starlight", hex: "#f0e8d9", images: [img("1496181133206-80ce9b88a853")] },
      { name: "Silver", hex: "#e3e4e5", images: [img("1611186871348-b1ce696e52c9")] }
    ]
  },
  {
    id: 12, name: "Dell Latitude 7450", brand: "Dell", category: "Business",
    description: "Sleek aluminum business laptop with Intel Core Ultra and Wi-Fi 7.",
    price: 829, aiPrice: 800, condition: "New", stock: 6,
    cpu: "Intel Core Ultra 7 165U", gpu: null, igpu: "Intel Graphics", ram: "16GB LPDDR5", storage: "512GB NVMe SSD",
    seller: { id: "s4", name: "Dell Premier", rating: 4.6 },
    colors: [{ name: "Aluminum", hex: "#a8a9ad", images: [img("1588872657578-7efd1f1555ed"), img("1496181133206-80ce9b88a853")] }]
  },
  {
    id: 13, name: "Acer Predator Helios 18", brand: "Acer", category: "Gaming",
    description: "18\" mini-LED 250Hz monster for desktop-class gaming on the go.",
    price: 949, aiPrice: 920, condition: "New", stock: 4,
    cpu: "Intel Core i9-14900HX", gpu: "NVIDIA RTX 4080 12GB", igpu: "Intel UHD Graphics", ram: "32GB DDR5", storage: "2TB NVMe SSD",
    seller: { id: "s6", name: "ValueTech", rating: 4.3 },
    colors: [{ name: "Abyssal Black", hex: "#080808", images: [img("1593642632559-0c6d3fc62b89")] }]
  },
  {
    id: 14, name: "ASUS VivoBook 15", brand: "ASUS", category: "Study",
    description: "Budget-friendly workhorse perfect for students and everyday computing.",
    price: 349, aiPrice: 390, condition: "New", stock: 30,
    cpu: "AMD Ryzen 5 7530U", gpu: null, igpu: "AMD Radeon Integrated", ram: "8GB DDR4", storage: "512GB SSD",
    seller: { id: "s7", name: "ASUS Official", rating: 4.7 },
    colors: [
      { name: "Quiet Blue", hex: "#3b5998", images: [img("1611186871348-b1ce696e52c9")] },
      { name: "Cool Silver", hex: "#c0c0c0", images: [img("1496181133206-80ce9b88a853")] }
    ]
  },
  {
    id: 15, name: "Lenovo Yoga 9i 14", brand: "Lenovo", category: "Design",
    description: "Convertible OLED creator laptop with rotating soundbar and stylus.",
    price: 779, aiPrice: 740, condition: "Used", stock: 5,
    cpu: "Intel Core Ultra 7 155H", gpu: null, igpu: "Intel Arc Graphics", ram: "16GB LPDDR5X", storage: "1TB NVMe SSD",
    seller: { id: "s3", name: "Lenovo Direct", rating: 4.7 },
    colors: [{ name: "Cosmic Blue", hex: "#1c2541", images: [img("1517336714731-489689fd1ca8"), img("1611186871348-b1ce696e52c9")] }]
  },
  {
    id: 16, name: "MSI Prestige 16 AI Studio", brand: "MSI", category: "Programming",
    description: "AI-accelerated creator laptop with NPU and RTX 4070 muscle.",
    price: 929, aiPrice: 900, condition: "New", stock: 8,
    cpu: "Intel Core Ultra 9 185H", gpu: "NVIDIA RTX 4070 8GB", igpu: "Intel Arc Graphics", ram: "32GB DDR5", storage: "1TB NVMe SSD",
    seller: { id: "s1", name: "TechHub Store", rating: 4.8 },
    colors: [{ name: "Stellar Gray", hex: "#52575c", images: [img("1593642632559-0c6d3fc62b89"), img("1525547719571-a2d4ac8945e2")] }]
  },
  {
    id: 17, name: "HP Pavilion Aero 13", brand: "HP", category: "Lightweight",
    description: "Featherlight 1kg magnesium chassis with vibrant 13.3\" display.",
    price: 549, aiPrice: 520, condition: "New", stock: 15,
    cpu: "AMD Ryzen 7 7735U", gpu: null, igpu: "AMD Radeon Integrated", ram: "16GB DDR5", storage: "512GB NVMe SSD",
    seller: { id: "s5", name: "HP Store", rating: 4.5 },
    colors: [
      { name: "Natural Silver", hex: "#bfc1c4", images: [img("1496181133206-80ce9b88a853")] },
      { name: "Ceramic White", hex: "#f5f5f0", images: [img("1517336714731-489689fd1ca8")] }
    ]
  },
  {
    id: 18, name: "Apple MacBook Pro 14\" M3 Pro", brand: "Apple", category: "Programming",
    description: "Pro performance in a compact 14\" frame — ideal for engineers.",
    price: 959, aiPrice: 990, condition: "New", stock: 9,
    cpu: "Apple M3 Pro 12-core", gpu: "Apple M3 Pro 18-core GPU", igpu: null, ram: "18GB Unified", storage: "1TB SSD",
    seller: { id: "s2", name: "Apple Authorized", rating: 5.0 },
    colors: [
      { name: "Space Black", hex: "#1d1d1f", images: [img("1517336714731-489689fd1ca8"), img("1611186871348-b1ce696e52c9")] },
      { name: "Silver", hex: "#e3e4e5", images: [img("1496181133206-80ce9b88a853")] }
    ]
  },
  {
    id: 19, name: "Toshiba Portege X40", brand: "Toshiba", category: "Business",
    description: "Slim business laptop with dependable portability and strong everyday performance.",
    price: 599, aiPrice: 580, condition: "Refurbished", stock: 10,
    cpu: "Intel Core i5-1240P", gpu: null, igpu: "Intel Iris Xe", ram: "16GB LPDDR5", storage: "512GB NVMe SSD",
    seller: { id: "s6", name: "ValueTech", rating: 4.3 },
    colors: [{ name: "Titan Silver", hex: "#c8c8c8", images: [img("1504386108771-2c8b7f4e6f0e")] }]
  }
];

// Augment products with extra fields used in product details / shop UI.
const OS_BY_BRAND = { Apple: "macOS" };
const TYPE_BY_CATEGORY = {
  Gaming: "Gaming Laptop", Business: "Business Ultrabook", Programming: "Developer Laptop",
  Design: "Creator Laptop", Lightweight: "Ultraportable", Study: "Student Laptop", General: "Laptop"
};
const SCREEN_BY_CATEGORY = {
  Gaming: '16" QHD 240Hz', Business: '14" FHD+ IPS', Programming: '15.6" OLED 3.5K',
  Design: '14" OLED Touch', Lightweight: '13.3" IPS', Study: '15.6" FHD', General: '15.6" FHD'
};
const BATTERY_BY_CONDITION = { New: "Excellent (>95%)", Refurbished: "Good (80-90%)", Used: "Fair (60-80%)" };

for (const p of PRODUCTS) {
  if (!p.os) p.os = OS_BY_BRAND[p.brand] || "Windows 11";
  if (!p.deviceType) p.deviceType = TYPE_BY_CATEGORY[p.category] || "Laptop";
  if (!p.screen) p.screen = SCREEN_BY_CATEGORY[p.category] || '15.6" FHD';
  if (!p.battery) p.battery = BATTERY_BY_CONDITION[p.condition] || "Good";
  if (!p.recommendedUsage) p.recommendedUsage = p.category;
  if (!("igpu" in p)) p.igpu = null;
}
