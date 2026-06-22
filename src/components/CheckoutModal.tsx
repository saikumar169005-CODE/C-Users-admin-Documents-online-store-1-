import React, { useState } from "react";
import { CreditCard, MapPin, PackageCheck, Send, ShieldAlert, X } from "lucide-react";
import { OrderItem } from "../types.ts";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: OrderItem[];
  cartTotal: number;
  onOrderPlaced: () => void;
  userId: string;
  userEmail: string;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  cartTotal,
  onOrderPlaced,
  userId,
  userEmail,
}: CheckoutModalProps) {
  const [fullName, setFullName] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("United States");

  // Payment mock fields
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !addressLine || !city || !zipCode || !country) {
      setError("Please fill out all address details.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userEmail,
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress: {
            fullName,
            addressLine,
            city,
            zipCode,
            country,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order on server");
      }

      setSuccess(true);
      setTimeout(() => {
        onOrderPlaced(); // Clears cart and switches view
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Checkout failed. Confirm stock availability.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="checkout-modal-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        id="checkout-modal-card"
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8"
      >
        {success ? (
          <div id="checkout-success-view" className="p-10 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 animate-bounce mb-3">
              <PackageCheck size={36} />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900">Order Successfully Placed!</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Your order has been placed. You can now track its status under My Orders.
            </p>
            <div className="text-xs font-mono text-slate-400">Processing order details...</div>
          </div>
        ) : (
          <form id="checkout-form" onSubmit={handleSubmitOrder}>
            {/* Header */}
            <div className="p-6 bg-indigo-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-bold">Checkout</h2>
                <p className="text-xs text-indigo-200 mt-1">Enter your shipping address and billing details to complete your order.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-indigo-200 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content panel */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              {/* Address section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <MapPin size={16} className="text-slate-500" />
                  Shipping Address
                </h3>

                {error && (
                  <div className="bg-red-50 text-red-600 border border-red-100 rounded-lg p-3 text-xs flex items-start gap-2">
                    <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Alex"
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="100 Pine Street, Apt 3A"
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="San Francisco"
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Zip Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="94111"
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>

              {/* Purchase Details */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <CreditCard size={16} className="text-slate-500" />
                    Transaction Summary
                  </h3>

                  {/* Pricing detail list */}
                  <div className="space-y-2.5 max-h-[140px] overflow-y-auto mt-3 pr-1">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex justify-between items-center text-xs">
                        <div className="text-slate-600 flex items-center gap-1 max-w-[70%]">
                          <span className="font-mono text-slate-400 text-[10px] bg-slate-200/60 px-1 rounded">
                            x{item.quantity}
                          </span>
                          <span className="truncate">{item.productName}</span>
                        </div>
                        <span className="font-mono text-slate-700 font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-dashed border-slate-200 pt-3 mt-3 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">Order Subtotal</span>
                    <span className="text-sm font-bold font-mono text-slate-900">${cartTotal.toFixed(2)}</span>
                  </div>

                  {/* Simulated Secure Payment */}
                  <div className="mt-4 pt-4 border-t border-slate-250">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Payment Details
                    </h4>
                    <div className="bg-slate-900 rounded-lg p-3 text-white font-mono text-left relative overflow-hidden shadow-xs">
                      <div className="absolute right-3 top-3 opacity-10">
                        <CreditCard size={48} />
                      </div>
                      <div className="text-[9px] text-slate-400">Cardholder Debit</div>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="bg-transparent border-none text-white text-xs tracking-wider font-semibold focus:outline-hidden w-full mt-1.5"
                      />
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <span className="text-[8px] text-slate-500 block">EXPIRY</span>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="bg-transparent border-none text-white text-[10px] font-semibold focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 block">CVC</span>
                          <input
                            type="password"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="bg-transparent border-none text-white text-[10px] font-semibold focus:outline-hidden w-6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send size={13} />
                    {loading ? "Processing Payment..." : "Pay & Place Order"}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    All checkout transactions are fully secure and SSL-encrypted.
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
