import React from "react";
import { LogOut, MonitorCheck, ShoppingCart, ShieldAlert, UserCheck } from "lucide-react";
import { User, OrderItem } from "../types.ts";

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onOpenLogin: () => void;
  cartItems: OrderItem[];
  onOpenCart: () => void;
  currentView: "shop" | "orders" | "admin";
  onSetView: (v: "shop" | "orders" | "admin") => void;
}

export default function Navbar({
  user,
  onLogout,
  onOpenLogin,
  cartItems,
  onOpenCart,
  currentView,
  onSetView,
}: NavbarProps) {
  // Count total quantity in cart
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header id="store-navbar" className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Branding */}
        <div id="navbar-brand" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-xs">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-display font-bold text-slate-900 tracking-tight leading-none uppercase">
              ModernShop
            </h1>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Premium Curated Gear</span>
          </div>
        </div>

        {/* Center: Routes (Storefront & Tracking / Admin) */}
        <nav id="navbar-nav-tabs" className="hidden sm:flex items-center h-16 space-x-6 text-sm font-medium">
          <button
            id="nav-btn-shop"
            onClick={() => onSetView("shop")}
            className={`h-16 flex items-center border-b-2 transition-all cursor-pointer px-1 text-sm ${
              currentView === "shop"
                ? "text-indigo-600 border-indigo-600 font-semibold"
                : "text-slate-500 hover:text-slate-900 border-transparent hover:border-slate-200"
            }`}
          >
            Storefront
          </button>
          
          <button
            id="nav-btn-orders"
            onClick={() => onSetView("orders")}
            className={`h-16 flex items-center border-b-2 transition-all cursor-pointer px-1 text-sm ${
              currentView === "orders"
                ? "text-indigo-600 border-indigo-600 font-semibold"
                : "text-slate-500 hover:text-slate-900 border-transparent hover:border-slate-200"
            }`}
          >
            My Orders
          </button>

          {user?.role === "Admin" && (
            <button
              id="nav-btn-admin"
              onClick={() => onSetView("admin")}
              className={`h-16 flex items-center border-b-2 transition-all cursor-pointer px-1 text-sm gap-1 ${
                currentView === "admin"
                  ? "text-indigo-600 border-indigo-600 font-semibold"
                  : "text-slate-500 hover:text-slate-900 border-transparent hover:border-slate-200"
              }`}
            >
              <MonitorCheck size={14} />
              Admin Desk
            </button>
          )}
        </nav>

        {/* Right: Cart, Authenticated accounts, Logout */}
        <div id="navbar-right-elements" className="flex items-center gap-3">
          {/* Mobile view router indicators */}
          <div id="mobile-route-indicators" className="flex sm:hidden items-center gap-1 mr-1">
            <button
              onClick={() => onSetView("shop")}
              className={`p-1.5 rounded-lg text-xs font-semibold ${currentView === "shop" ? "bg-indigo-50 text-indigo-700" : "text-slate-500"}`}
            >
              Shop
            </button>
            <button
              onClick={() => onSetView("orders")}
              className={`p-1.5 rounded-lg text-xs font-semibold ${currentView === "orders" ? "bg-indigo-50 text-indigo-700" : "text-slate-500"}`}
            >
              Track
            </button>
            {user?.role === "Admin" && (
              <button
                onClick={() => onSetView("admin")}
                className={`p-1.5 rounded-lg text-xs font-semibold ${currentView === "admin" ? "bg-indigo-50 text-indigo-700" : "text-slate-500"}`}
              >
                Admin
              </button>
            )}
          </div>

          {/* Cart Icon trigger */}
          <button
            id="navbar-cart-trigger"
            onClick={onOpenCart}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-all cursor-pointer"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {/* User badge */}
          {user ? (
            <div id="navbar-user-profile" className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-950 leading-none">{user.name}</p>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5 block">Role: {user.role === "Admin" ? "Superuser" : "Customer"}</span>
              </div>

              {user.role === "Admin" ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold py-0.5 px-2 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                  <ShieldAlert size={10} />
                  Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold py-0.5 px-2 bg-slate-50 text-slate-600 rounded-full border border-slate-200">
                  <UserCheck size={10} />
                  Buyer
                </span>
              )}

              <button
                id="navbar-logout-btn"
                onClick={onLogout}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                title="Sign out of current account"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              id="navbar-login-btn"
              onClick={onOpenLogin}
              className="text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-3.5 rounded-lg transition-all cursor-pointer shadow-xs"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
