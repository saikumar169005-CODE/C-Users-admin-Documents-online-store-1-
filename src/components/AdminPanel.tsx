import React, { useState } from "react";
import { CircleAlert, DatabaseZap, Edit3, HeartHandshake, Loader2, PackageOpen, Plus, RefreshCw, Save, ShieldAlert, Trash2, TrendingUp, Truck } from "lucide-react";
import { Order, OrderStatus, Product } from "../types.ts";

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onRefreshData: () => void;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export default function AdminPanel({
  products,
  orders,
  onRefreshData,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "orders">("catalog");

  // Reset database triggers
  const [resetting, setResetting] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  // Product handling forms
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<Partial<Product>>({
    name: "",
    description: "",
    category: "Electronics",
    price: 0,
    stock: 10,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
  });

  const [savingProduct, setSavingProduct] = useState(false);
  const [errorProduct, setErrorProduct] = useState("");

  const handleResetDatabase = async () => {
    if (!window.confirm("Are you sure you want to reset the store database to baseline presets? This deletes all orders and non-default items.")) return;
    try {
      setResetting(true);
      const res = await fetch("/api/admin/reset", { method: "POST" });
      if (!res.ok) throw new Error();
      setInfoMessage("Data reverted to pristine baseline presets catalog.");
      onRefreshData();
      setTimeout(() => setInfoMessage(""), 4000);
    } catch {
      alert("Failed to wipe local schema.");
    } finally {
      setResetting(false);
    }
  };

  const startEditProduct = (p: Product) => {
    setEditingId(p.id);
    setEditForm(p);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      setSavingProduct(true);
      setErrorProduct("");

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update product details");
      }

      const updated = await res.json();
      onUpdateProduct(updated);
      setEditingId(null);
    } catch (err: any) {
      setErrorProduct(err.message || "Failed to edit item.");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleAddNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.description || addForm.price === undefined || !addForm.image) {
      setErrorProduct("All fields must be formatted correctly.");
      return;
    }

    try {
      setSavingProduct(true);
      setErrorProduct("");

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to introduce new item");
      }

      const created = await res.json();
      onAddProduct(created);
      setShowAddForm(false);
      // Reset form
      setAddForm({
        name: "",
        description: "",
        category: "Electronics",
        price: 0,
        stock: 10,
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
      });
    } catch (err: any) {
      setErrorProduct(err.message || "Failed to introduce product.");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Verify: Delete this catalog listing from the server? This action is immediate.")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDeleteProduct(id);
    } catch {
      alert("Failed to remove product listing.");
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Failed to update consignment state.");
        return;
      }

      onUpdateOrderStatus(orderId, status);
    } catch {
      alert("Fulfillment state edit rejected by server connection.");
    }
  };

  return (
    <div id="adminpanel-container" className="space-y-6">
      {/* Top dashboard summary and configuration controls */}
      <div
        id="admin-dashboard-hero"
        className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
            Admin Dashboard
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold py-0.5 px-2.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
              Admin Mode Enabled
            </span>
          </h2>
          <p className="text-xs text-slate-500">Supervise product inventory levels and process customer order shipping updates.</p>
        </div>

        <div className="flex gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            id="admin-reset-db-btn"
            onClick={handleResetDatabase}
            disabled={resetting}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <DatabaseZap size={13} />
            {resetting ? "Resetting Schema..." : "Reset Store DB"}
          </button>
          
          <button
            id="admin-refresh-data-btn"
            onClick={onRefreshData}
            className="flex items-center justify-center p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {infoMessage && (
        <div id="admin-info-badge" className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl p-3 text-xs flex items-center gap-2">
          <HeartHandshake size={14} />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div id="admin-tab-bar" className="flex border-b border-slate-200">
        <button
          id="admin-tab-catalog"
          onClick={() => setActiveTab("catalog")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "catalog"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Manage Catalog ({products.length})
        </button>
        <button
          id="admin-tab-orders"
          onClick={() => setActiveTab("orders")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "orders"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Customer Orders Ledger ({orders.length})
        </button>
      </div>

      {/* ERROR HANDLERS */}
      {errorProduct && (
        <div id="admin-error" className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-3 text-xs flex items-center gap-2">
          <ShieldAlert size={14} />
          <span>{errorProduct}</span>
        </div>
      )}

      {/* VIEW: CATALOGUE */}
      {activeTab === "catalog" && (
        <div id="admin-catalog-view" className="space-y-6">
          {/* Header & Add Button */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Product Catalog</h3>
            <button
              id="admin-new-product-btn"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              {showAddForm ? "Hide Form" : "Add Product"}
            </button>
          </div>

          {/* Add form layout */}
          {showAddForm && (
            <form id="admin-add-product-form" onSubmit={handleAddNewProduct} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Product Title</label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g., Slim Leather Card Holder"
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={addForm.price}
                    onChange={(e) => setAddForm({ ...addForm, price: parseFloat(e.target.value) })}
                    placeholder="25.00"
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden bg-white hover:bg-gray-50"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Audio">Audio</option>
                    <option value="Travel">Travel</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Apparel">Apparel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Details Memo</label>
                  <input
                    type="text"
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    placeholder="Summarize built quality, warranty, materials..."
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Initial Stock (units)</label>
                  <input
                    type="number"
                    value={addForm.stock}
                    onChange={(e) => setAddForm({ ...addForm, stock: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Image URL</label>
                <input
                  type="text"
                  value={addForm.image}
                  onChange={(e) => setAddForm({ ...addForm, image: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden bg-white font-mono"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-1.5 text-xs border border-slate-200 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {savingProduct ? <Loader2 size={12} className="animate-spin" /> : "Add Product"}
                </button>
              </div>
            </form>
          )}

          {/* Catalog interactive grid */}
          <div id="admin-catalog-grid" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium uppercase tracking-wider">
                    <th className="p-3">Product Info</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock Level</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => {
                    const isEditing = editingId === p.id;
                    return (
                      <tr id={`admin-tr-${p.id}`} key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3 max-w-[280px]">
                          {isEditing ? (
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                value={editForm.name || ""}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-200 rounded-md bg-white font-semibold"
                              />
                              <input
                                type="text"
                                value={editForm.description || ""}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-200 rounded-md bg-white text-gray-500 text-[11px]"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-lg object-cover shrink-0 bg-gray-100"
                              />
                              <div>
                                <p className="font-semibold text-slate-900">{p.name}</p>
                                <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{p.description}</p>
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          {isEditing ? (
                            <select
                              value={editForm.category || "Electronics"}
                              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                              className="px-1.5 py-1 border border-gray-200 rounded-md bg-white"
                            >
                              <option value="Electronics">Electronics</option>
                              <option value="Audio">Audio</option>
                              <option value="Travel">Travel</option>
                              <option value="Fitness">Fitness</option>
                              <option value="Apparel">Apparel</option>
                            </select>
                          ) : (
                            <span className="bg-gray-100 px-2 py-0.5 text-[10px] rounded-full text-gray-600 font-medium">
                              {p.category}
                            </span>
                          )}
                        </td>

                        <td className="p-3 font-mono font-semibold">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.price || 0}
                              onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                              className="w-16 px-1.5 py-1 border border-gray-200 rounded-md bg-white"
                            />
                          ) : (
                            <span>${p.price.toFixed(2)}</span>
                          )}
                        </td>

                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editForm.stock || 0}
                              onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value, 10) })}
                              className="w-14 px-1.5 py-1 border border-gray-200 rounded-md bg-white"
                            />
                          ) : (
                            <span
                              className={`font-mono font-semibold ${
                                p.stock < 5 ? "text-amber-500 font-bold" : "text-gray-700"
                              }`}
                            >
                              {p.stock} units
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex gap-1.5 justify-end">
                            {isEditing ? (
                              <>
                                <button
                                  id={`save-edit-btn-${p.id}`}
                                  onClick={() => handleSaveEdit(p.id)}
                                  disabled={savingProduct}
                                  className="p-1 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Save size={12} />
                                  Save
                                </button>
                                <button
                                  id={`cancel-edit-btn-${p.id}`}
                                  onClick={() => setEditingId(null)}
                                  className="p-1 px-2 bg-gray-200 hover:bg-gray-300 text-slate-700 rounded-md cursor-pointer"
                                >
                                  Esc
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  id={`edit-product-btn-${p.id}`}
                                  onClick={() => startEditProduct(p)}
                                  className="p-1.5 bg-gray-50 hover:bg-gray-100 text-slate-700 border border-gray-200 rounded-md cursor-pointer transition-colors"
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button
                                  id={`delete-product-btn-${p.id}`}
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-md cursor-pointer transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: CUSTOMER ORDERS */}
      {activeTab === "orders" && (
        <div id="admin-orders-view" className="space-y-4">
          <h3 className="text-base font-semibold text-slate-800">Customer Orders Log</h3>

          {orders.length === 0 ? (
            <div id="admin-orders-empty" className="bg-white border border-dashed border-slate-200 rounded-xl p-16 text-center shadow-xs">
              <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-3">
                <PackageOpen size={22} className="text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No customer orders recorded</h3>
              <p className="text-xs text-slate-500 mt-1">When customers place orders, they will appear in this list.</p>
            </div>
          ) : (
            <div id="admin-orders-table-wrapper" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium uppercase tracking-wider">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((o) => {
                      const orderDate = new Date(o.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <tr id={`admin-order-tr-${o.id}`} key={o.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-900">
                            <div>{o.id}</div>
                            <div className="text-[9px] text-slate-400 font-normal mt-0.5">{orderDate}</div>
                          </td>

                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{o.shippingAddress.fullName}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{o.userEmail}</div>
                          </td>

                          <td className="p-3 font-semibold font-mono">
                            <div>${o.total.toFixed(2)}</div>
                            <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                              {o.items.length} {o.items.length === 1 ? "item" : "items"}
                            </div>
                          </td>

                          <td className="p-3">
                            <span
                              className={`text-[9px] font-mono font-medium tracking-wide border px-2 py-0.5 rounded-full ${
                                o.status === "Cancelled"
                                  ? "bg-red-50 text-red-600 border-red-100"
                                  : o.status === "Delivered"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : "bg-blue-50 text-blue-600 border-blue-100"
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex gap-2 justify-end items-center">
                              <span className="text-[10px] font-medium text-slate-400 hidden lg:inline">Update Status:</span>
                              <select
                                id={`status-select-${o.id}`}
                                value={o.status}
                                onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                                className="px-2 py-1 text-xs border border-slate-200 rounded-md bg-white hover:bg-slate-50 focus:outline-hidden cursor-pointer"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
