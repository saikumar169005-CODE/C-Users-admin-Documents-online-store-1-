import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar.tsx";
import ShopView from "./components/ShopView.tsx";
import CartDrawer from "./components/CartDrawer.tsx";
import CheckoutModal from "./components/CheckoutModal.tsx";
import OrdersView from "./components/OrdersView.tsx";
import AdminPanel from "./components/AdminPanel.tsx";
import AuthModal from "./components/AuthModal.tsx";
import { Product, Order, User, OrderItem, OrderStatus } from "./types.ts";
import { LogIn, ShieldAlert } from "lucide-react";

export default function App() {
  // Session and user state - Default to the preset buyer for direct app accessibility
  const [user, setUser] = useState<User | null>({
    id: "user-buyer",
    email: "buyer@store.com",
    name: "Default Customer",
    role: "User",
  });

  // Core shop data vectors
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);

  // View state managers
  const [currentView, setCurrentView] = useState<"shop" | "orders" | "admin">("shop");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Loading indicator states
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch orders when user profile or role state transitions
  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products from Express database.", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setLoadingOrders(true);
      const res = await fetch(`/api/orders?userId=${user.id}&role=${user.role}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load matching orders database lists.", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      triggerFeedback(`Sorry, standard stock allotments for ${product.name} are currently depleted.`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productId === product.id);

      if (existing) {
        if (existing.quantity >= product.stock) {
          triggerFeedback(`Stock allocation limit reached. Only ${product.stock} units are currently siphoned on server.`);
          return prevCart;
        }
        triggerFeedback(`Incremented quantity for ${product.name} inside basket.`);
        return prevCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      triggerFeedback(`Added ${product.name} to your basket listing.`);
      return [
        ...prevCart,
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
        },
      ];
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart((prevCart) => {
      const item = prevCart.find((i) => i.productId === productId);
      if (!item) return prevCart;

      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prevCart.filter((i) => i.productId !== productId);
      }

      if (newQty > product.stock) {
        triggerFeedback(`Cap reached: Only ${product.stock} units of ${product.name} remain in immediate warehouse reserve.`);
        return prevCart;
      }

      return prevCart.map((i) =>
        i.productId === productId ? { ...i, quantity: newQty } : i
      );
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
    triggerFeedback("Removed selected article from shopping basket.");
  };

  const handleOrderPlaced = () => {
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    fetchProducts(); // Refresh products stock lists
    fetchOrders(); // Refresh orders ledger lists
    setCurrentView("orders"); // Switch view immediately for live buyer verification
    triggerFeedback("Parcel checked out successfully! Dispatch coordinates loaded.");
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    setCurrentView("shop");
    setIsAuthOpen(true); // Guide user directly to re-auth
  };

  const hangleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setIsAuthOpen(false);
    // Automatically swap view if user was on Admin view but the new user is not an Admin
    if (authenticatedUser.role !== "Admin" && currentView === "admin") {
      setCurrentView("shop");
    }
  };

  const triggerFeedback = (message: string) => {
    setFeedbackMsg(message);
    setTimeout(() => {
      setFeedbackMsg((prev) => (prev === message ? "" : prev));
    }, 4500);
  };

  const cartTotal = cart.reduce((add, item) => add + item.price * item.quantity, 0);

  // Admin updating product triggers
  const handleAdminUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    triggerFeedback(`Updated catalog details for ${updated.name}.`);
  };

  const handleAdminAddProduct = (created: Product) => {
    setProducts((prev) => [...prev, created]);
    triggerFeedback(`Successfully registered ${created.name} into store ledger.`);
  };

  const handleAdminDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    triggerFeedback("Terminated product listing on store database.");
  };

  const handleAdminUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    triggerFeedback(`Transitioned order ${orderId} phase status to ${status}.`);
  };

  return (
    <div id="full-app-root" className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Dynamic Feedback Banner */}
      {feedbackMsg && (
        <div id="app-toast-alert" className="fixed bottom-5 right-5 z-50 bg-indigo-950 text-white text-xs py-3 px-4.5 rounded-lg shadow-2xl border border-indigo-800 flex items-center gap-2 max-w-sm animate-fade-in animate-duration-150">
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0"></div>
          <span className="font-medium">{feedbackMsg}</span>
        </div>
      )}

      {/* Primary header navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setIsAuthOpen(true)}
        cartItems={cart}
        onOpenCart={() => setIsCartOpen(true)}
        currentView={currentView}
        onSetView={setCurrentView}
      />

      {/* Main viewport frame */}
      <main id="app-main-viewport" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user && (
          <div id="app-unauthorized" className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6 text-indigo-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-indigo-600 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-sm">Guest Session</h4>
                <p className="text-xs text-indigo-900/80 mt-0.5">Please sign in to place orders, track history, and access admin dashboard tools.</p>
              </div>
            </div>
            <button
              id="app-unauthorized-auth-btn"
              onClick={() => setIsAuthOpen(true)}
              className="py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-xs"
            >
              <LogIn size={13} />
              Sign In
            </button>
          </div>
        )}

        {/* View switching logic */}
        {currentView === "shop" && (
          <>
            {loadingProducts ? (
              <div id="shop-loader" className="flex flex-col items-center justify-center py-20 space-y-2">
                <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 font-mono font-medium">Loading catalog items...</p>
              </div>
            ) : (
              <ShopView
                products={products}
                onAddToCart={handleAddToCart}
                userRole={user?.role}
              />
            )}
          </>
        )}

        {currentView === "orders" && (
          <OrdersView
            orders={orders}
            onGoToShop={() => setCurrentView("shop")}
            loading={loadingOrders}
          />
        )}

        {currentView === "admin" && user?.role === "Admin" && (
          <AdminPanel
            products={products}
            orders={orders}
            onRefreshData={() => {
              fetchProducts();
              fetchOrders();
            }}
            onUpdateProduct={handleAdminUpdateProduct}
            onAddProduct={handleAdminAddProduct}
            onDeleteProduct={handleAdminDeleteProduct}
            onUpdateOrderStatus={handleAdminUpdateOrderStatus}
          />
        )}
      </main>

      {/* Modal Dialogs / Sliding Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={hangleLoginSuccess}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          if (!user) {
            setIsAuthOpen(true);
            triggerFeedback("Authentication is required to clear catalog parcels.");
            return;
          }
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        cartTotal={cartTotal}
        onOrderPlaced={handleOrderPlaced}
        userId={user?.id || ""}
        userEmail={user?.email || ""}
      />

      {/* Humanized elegant footer */}
      <footer id="app-footing" className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div>&copy; {new Date().getFullYear()} ModernShop. All rights reserved. Premium curated workspace goods.</div>
      </footer>
    </div>
  );
}
