import React from "react";
import { Calendar, CircleAlert, Clock, Compass, Package, Receipt, Truck } from "lucide-react";
import { Order, OrderStatus } from "../types.ts";

interface OrdersViewProps {
  orders: Order[];
  onGoToShop: () => void;
  loading?: boolean;
}

const STATUS_STAGES: { status: OrderStatus; label: string; description: string }[] = [
  { status: "Pending", label: "Awaiting Confirmation", description: "Payment verified and order queued." },
  { status: "Processing", label: "Fulfillment", description: "Product sourced and securely prepared." },
  { status: "Shipped", label: "In Transit", description: "Dispatched with ultra-fast trackable courier." },
  { status: "Delivered", label: "Delivered", description: "Sealed cargo arrived at destination address." }
];

export default function OrdersView({ orders, onGoToShop, loading }: OrdersViewProps) {
  if (loading) {
    return (
      <div id="orders-loading" className="flex flex-col items-center justify-center p-16 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xs text-slate-500 font-medium">Fetching secure tracking logs...</div>
      </div>
    );
  }

  // Helper to determine status step color index
  const getStatusIndex = (status: OrderStatus): number => {
    if (status === "Cancelled") return -1;
    const stages: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered"];
    return stages.indexOf(status);
  };

  return (
    <div id="orders-view-container" className="space-y-6">
      <div id="orders-header" className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900">Order History</h2>
          <p className="text-xs text-slate-500">Track and view all your current and previous orders.</p>
        </div>
        <span className="text-xs font-bold bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 border border-indigo-100">
          Total orders: {orders.length}
        </span>
      </div>

      {orders.length === 0 ? (
        <div
          id="orders-empty"
          className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-xs flex flex-col items-center justify-center"
        >
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
            <Compass size={22} className="animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Orders Placed</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mb-4">
            You haven't checked out any items in your session yet. Head over to our catalog to select your favorite products.
          </p>
          <button
            id="orders-shop-cta"
            onClick={onGoToShop}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div id="orders-list" className="space-y-6">
          {orders.map((order) => {
            const currentStepIdx = getStatusIndex(order.status);
            const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

            return (
              <div
                id={`order-tracking-card-${order.id}`}
                key={order.id}
                className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200"
              >
                {/* Left pane: meta metrics */}
                <div className="p-5 md:w-80 shrink-0 space-y-4 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-400">{order.id}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        order.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Shipped"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Receipt size={13} className="text-slate-400" />
                      <span className="font-bold text-slate-900">Total: ${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 text-xs">
                    <div className="font-bold text-slate-900 flex items-center gap-1 mb-1">
                      <Truck size={13} className="text-slate-400" />
                      Shipping Details
                    </div>
                    <div className="text-slate-500 space-y-0.5">
                      <p className="font-bold text-slate-850">{order.shippingAddress.fullName}</p>
                      <p className="truncate">{order.shippingAddress.addressLine}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                        {order.shippingAddress.country}
                      </p>
                    </div>
                  </div>

                  {/* Purchased items listed */}
                  <div className="border-t border-slate-200 pt-3">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                      <Package size={11} />
                      Items in Order ({order.items.length})
                    </div>
                    <div className="space-y-1.5">
                      {order.items.map((item) => (
                        <div key={item.productId} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 truncate max-w-[70%]">
                            {item.productName} <span className="text-slate-400 font-mono text-[10px]">x{item.quantity}</span>
                          </span>
                          <span className="font-mono text-slate-600 font-bold">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: progress timeline */}
                <div className="p-6 flex-1 flex flex-col justify-center">
                  {order.status === "Cancelled" ? (
                    <div className="text-center p-6 bg-red-50/55 rounded-xl border border-red-100 text-red-700 space-y-1">
                      <CircleAlert className="mx-auto text-red-500" size={24} />
                      <h4 className="text-sm font-bold">Order Cancelled</h4>
                      <p className="text-xs text-red-550">
                        This order has been cancelled and any reserved stock has been returned to our inventory availability.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <Clock size={14} className="text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Delivery Progress
                        </h4>
                      </div>

                      {/* Visual tracker line */}
                      <div className="grid grid-cols-4 gap-2 relative">
                        {STATUS_STAGES.map((stage, idx) => {
                          const isCompleted = idx <= currentStepIdx;
                          const isActive = idx === currentStepIdx;

                          return (
                            <div key={stage.status} className="flex flex-col items-center text-center relative z-10">
                              {/* Step node */}
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                                  isActive
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                    : isCompleted
                                    ? "bg-green-600 border-green-600 text-white"
                                    : "bg-slate-100 border-slate-200 text-slate-400"
                                }`}
                              >
                                {idx + 1}
                              </div>

                              {/* Stage labels */}
                              <span
                                className={`text-[11px] font-bold mt-2 ${
                                  isActive ? "text-indigo-600" : isCompleted ? "text-green-700" : "text-slate-400"
                                }`}
                              >
                                {stage.label}
                              </span>

                              <p className="text-[10px] text-slate-400 line-clamp-2 md:block hidden leading-snug mt-0.5 max-w-[120px]">
                                {stage.description}
                              </p>
                            </div>
                          );
                        })}

                        {/* Connection line helper overlay */}
                        <div className="absolute top-4 left-[12%] right-[12%] h-[2px] bg-slate-100 -z-0">
                          {currentStepIdx >= 0 && (
                            <div
                              className="h-full bg-green-600 transition-all duration-500"
                              style={{ width: `${(currentStepIdx / 3) * 100}%` }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
