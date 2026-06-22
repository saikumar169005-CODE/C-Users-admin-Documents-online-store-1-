import React from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { OrderItem } from "../types.ts";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: OrderItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 overflow-hidden">
      {/* Black backdrop click handler */}
      <div
        id="cart-overlay-back"
        className="absolute inset-0 bg-black/60 backdrop-blur-3xs transition-opacity"
        onClick={onClose}
      />

      <div id="cart-drawer-body" className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 bg-indigo-900 text-white flex items-center justify-between border-b border-indigo-950">
            <h2 className="text-lg font-display font-medium flex items-center gap-2">
              <ShoppingBag size={18} />
              Shopping Basket
              <span className="text-[10px] bg-indigo-950/45 text-indigo-200 font-bold px-2.5 py-0.5 rounded-full border border-indigo-700/50">
                {cartItems.length} items
              </span>
            </h2>
            <button
              onClick={onClose}
              className="text-indigo-200 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart item list scroll view */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div id="cart-drawer-empty" className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <ShoppingBag size={22} />
                </div>
                <h3 className="text-sm font-bold text-slate-700">Your basket is empty</h3>
                <p className="text-xs text-slate-400 max-w-[200px]">Head over to the catalog to choose premium equipment.</p>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {cartItems.map((item, idx) => (
                  <div id={`cart-row-${item.productId}`} key={item.productId} className={`pt-4 ${idx === 0 ? "pt-0" : ""} flex gap-4 items-start`}>
                    <img
                      src={item.image}
                      alt={item.productName}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover rounded-lg bg-slate-50 shrink-0 border border-slate-200"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{item.productName}</h4>
                      <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">${item.price.toFixed(2)}</p>

                      <div className="flex items-center justify-between mt-2.5">
                        {/* Quantity management */}
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <button
                            id={`qty-minus-${item.productId}`}
                            onClick={() => onUpdateQuantity(item.productId, -1)}
                            className="p-1 px-2.5 hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer text-xs"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="font-mono text-xs font-bold px-1.5 text-slate-800">{item.quantity}</span>
                          <button
                            id={`qty-plus-${item.productId}`}
                            onClick={() => onUpdateQuantity(item.productId, 1)}
                            className="p-1 px-2.5 hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer text-xs"
                          >
                            <Plus size={10} />
                          </button>
                        </div>

                        {/* Remove item */}
                        <button
                          id={`remove-cart-item-${item.productId}`}
                          onClick={() => onRemoveItem(item.productId)}
                          className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout billing footbar */}
          {cartItems.length > 0 && (
            <div id="cart-drawer-foot" className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">Order Subtotal</span>
                <span className="text-lg font-bold font-mono text-slate-900">${total.toFixed(2)}</span>
              </div>

              <button
                id="cart-drawer-checkout-btn"
                onClick={onCheckout}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-99"
              >
                Assemble Delivery Address
                <ArrowRight size={13} />
              </button>
              <p className="text-[10px] text-center text-slate-400">Shipping rates calculated dynamically upon checkout.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
