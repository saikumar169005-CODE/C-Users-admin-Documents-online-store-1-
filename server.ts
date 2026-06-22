import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Product, Order, User, OrderStatus } from "./src/types.ts";

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to our JSON database
const DB_FILE = path.join(process.cwd(), "src", "store_db.json");

// Intended initial baseline product list (beautiful curated images from Unsplash)
const BASELINE_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Keychron K2 Mechanical Keyboard",
    description: "Compact 84-key wireless mechanical keyboard with tactile brown switches, Gateron hot-swappable frame, and striking RGB backlighting.",
    price: 99.99,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600",
    category: "Electronics",
    stock: 12
  },
  {
    id: "prod-2",
    name: "AeroStream Over-Ear Headphones",
    description: "Active noise-canceling high-resolution wireless headphones with 40-hour battery life and memory foam cups for maximum comfort.",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    category: "Audio",
    stock: 8
  },
  {
    id: "prod-3",
    name: "Apex 24L Minimalist Backpack",
    description: "Weatherproof urban commute pack featuring a dedicated 16-inch laptop pocket, hidden passport section, and premium magnetic buckles.",
    price: 129.50,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600",
    category: "Travel",
    stock: 15
  },
  {
    id: "prod-4",
    name: "HydroForge Smart Flask 24oz",
    description: "Vacuum-insulated double-wall stainless steel bottle with an integrated OLED temperature display and hydration reminder tech.",
    price: 45.00,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600",
    category: "Fitness",
    stock: 35
  },
  {
    id: "prod-5",
    name: "Boreal Wool Merino Beanie",
    description: "Superfine 100% merino wool knit beanie engineered for premium thermal regulation, moisture wicking, and soft itch-free wearing.",
    price: 32.00,
    image: "https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?auto=format&fit=crop&q=80&w=600",
    category: "Apparel",
    stock: 20
  },
  {
    id: "prod-6",
    name: "Nova Lux Orbit Desk Mat",
    description: "Spacious premium felt desk pad with non-slip natural rubber backing, protecting your workspace while providing buttery mouse tracking.",
    price: 38.00,
    image: "https://images.unsplash.com/photo-1616440347437-b1ef734df493?auto=format&fit=crop&q=80&w=600",
    category: "Electronics",
    stock: 18
  }
];

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  users: User[];
}

// Ensure database file exists and load it
const initDB = (): DatabaseSchema => {
  try {
    const parentDir = path.dirname(DB_FILE);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialSchema: DatabaseSchema = {
        products: BASELINE_PRODUCTS,
        orders: [],
        users: [
          {
            id: "user-admin",
            email: "admin@store.com",
            name: "Default Admin",
            role: "Admin"
          },
          {
            id: "user-buyer",
            email: "buyer@store.com",
            name: "Default Customer",
            role: "User"
          }
        ]
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSchema, null, 2), "utf-8");
      return initialSchema;
    }

    const data = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(data);
    // Ensure all crucial keys exist
    if (!parsed.products) parsed.products = BASELINE_PRODUCTS;
    if (!parsed.orders) parsed.orders = [];
    if (!parsed.users) parsed.users = [];
    return parsed;
  } catch (err) {
    console.error("Failed to initialize JSON database file, returning default schema", err);
    return {
      products: BASELINE_PRODUCTS,
      orders: [],
      users: []
    };
  }
};

const saveDB = (db: DatabaseSchema) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save JSON database", err);
  }
};

// Database state
const db = initDB();

// --- Authentication APIs ---

app.post("/api/auth/login", (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  
  // Find or create user
  let user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    user = {
      id: "u-" + Math.random().toString(36).substring(2, 9),
      email: normalizedEmail,
      name: email.split("@")[0] || "User",
      role: role === "Admin" ? "Admin" : "User"
    };
    db.users.push(user);
    saveDB(db);
  } else if (role && user.role !== role) {
    // Optionally updates role for testing convenience
    user.role = role;
    saveDB(db);
  }

  res.json({ user });
});

// --- Product APIs ---

// Get all products
app.get("/api/products", (req, res) => {
  res.json(db.products);
});

// Create a product (Admin)
app.post("/api/products", (req, res) => {
  const { name, description, price, image, category, stock } = req.body;
  
  if (!name || !description || price === undefined || !image || !category || stock === undefined) {
    return res.status(400).json({ error: "Missing required product fields" });
  }

  const newProduct: Product = {
    id: "prod-" + Math.random().toString(36).substring(2, 9),
    name: String(name),
    description: String(description),
    price: Number(price),
    image: String(image),
    category: String(category),
    stock: Math.max(0, parseInt(String(stock), 10))
  };

  db.products.push(newProduct);
  saveDB(db);
  res.status(201).json(newProduct);
});

// Update a product (Admin)
app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, category, stock } = req.body;

  const productIndex = db.products.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  db.products[productIndex] = {
    ...db.products[productIndex],
    ...(name !== undefined && { name: String(name) }),
    ...(description !== undefined && { description: String(description) }),
    ...(price !== undefined && { price: Number(price) }),
    ...(image !== undefined && { image: String(image) }),
    ...(category !== undefined && { category: String(category) }),
    ...(stock !== undefined && { stock: Math.max(0, parseInt(String(stock), 10)) })
  };

  saveDB(db);
  res.json(db.products[productIndex]);
});

// Delete a product (Admin)
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const productIndex = db.products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const deleted = db.products.splice(productIndex, 1);
  saveDB(db);
  res.json({ success: true, deleted: deleted[0] });
});

// --- Order APIs ---

// Get orders (All if Admin, user-scoped if normal User)
app.get("/api/orders", (req, res) => {
  const userId = req.query.userId as string;
  const role = req.query.role as string;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId query param" });
  }

  if (role === "Admin") {
    // Admins see all orders
    res.json(db.orders);
  } else {
    // Users see their own orders
    const userOrders = db.orders.filter(o => o.userId === userId);
    res.json(userOrders);
  }
});

// Create an order
app.post("/api/orders", (req, res) => {
  const { userId, userEmail, items, shippingAddress } = req.body;

  if (!userId || !userEmail || !items || !Array.isArray(items) || items.length === 0 || !shippingAddress) {
    return res.status(400).json({ error: "Invalid order details" });
  }

  // Validate stock and verify integrity of prices
  const orderItems = [];
  let calculatedTotal = 0;

  for (const item of items) {
    const product = db.products.find(p => p.id === item.productId);
    if (!product) {
      return res.status(404).json({ error: `Product ${item.productId} not found` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for product ${product.name}. Dynamic stock remaining: ${product.stock}` });
    }

    const itemPrice = product.price;
    calculatedTotal += itemPrice * item.quantity;

    orderItems.push({
      productId: product.id,
      productName: product.name,
      price: itemPrice,
      quantity: item.quantity,
      image: product.image
    });
  }

  // Decrement stock
  for (const item of items) {
    const product = db.products.find(p => p.id === item.productId)!;
    product.stock -= item.quantity;
  }

  const newOrder: Order = {
    id: "ord-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
    userId,
    userEmail,
    items: orderItems,
    total: Math.round(calculatedTotal * 100) / 100,
    status: "Pending",
    shippingAddress,
    createdAt: new Date().toISOString()
  };

  db.orders.unshift(newOrder); // Add to the beginning of the list
  saveDB(db);
  res.status(201).json(newOrder);
});

// Update order status (Admin)
app.put("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid order status provided" });
  }

  const order = db.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  // If order is transitioned to Cancelled, we should restore product stock!
  if (status === "Cancelled" && order.status !== "Cancelled") {
    for (const item of order.items) {
      const product = db.products.find(p => p.id === item.productId);
      if (product) {
        product.stock += item.quantity;
      }
    }
  } else if (order.status === "Cancelled" && status !== "Cancelled") {
    // If transitioning back from Cancelled, re-decrement stock if sufficient, else fail
    for (const item of order.items) {
      const product = db.products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ error: `Cannot restore order: insufficient stock for ${product ? product.name : "unknown product"}` });
      }
    }
    for (const item of order.items) {
      const product = db.products.find(p => p.id === item.productId)!;
      product.stock -= item.quantity;
    }
  }

  order.status = status as OrderStatus;
  saveDB(db);
  res.json(order);
});

// Clean slate command to reset database to initial state
app.post("/api/admin/reset", (req, res) => {
  db.products = [...BASELINE_PRODUCTS];
  db.orders = [];
  // Keep regular accounts for convenience
  db.users = [
    {
      id: "user-admin",
      email: "admin@store.com",
      name: "Default Admin",
      role: "Admin"
    },
    {
      id: "user-buyer",
      email: "buyer@store.com",
      name: "Default Customer",
      role: "User"
    }
  ];
  saveDB(db);
  res.json({ success: true, message: "Database successfully reset to pristine states" });
});

// --- Server & Production Configuration ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is booted at http://localhost:${PORT}`);
  });
}

startServer();
