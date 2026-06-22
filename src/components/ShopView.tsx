import React, { useState, useMemo } from "react";
import { Search, ShoppingBag, SlidersHorizontal, Tag } from "lucide-react";
import { Product } from "../types.ts";

interface ShopViewProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  userRole?: "User" | "Admin";
}

export default function ShopView({ products, onAddToCart, userRole }: ShopViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Get active categories dynamically
  const categories = useMemo(() => {
    const list = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(list)];
  }, [products]);

  // Filters products by query and selected category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  return (
    <div id="shopview-container" className="space-y-6">
      {/* Intro hero banner */}
      <div
        id="shopview-banner"
        className="relative bg-indigo-900 text-white rounded-xl p-8 sm:p-10 shadow-sm overflow-hidden"
      >
        <div className="absolute right-0 top-0 opacity-15 pointer-events-none transform translate-x-12 -translate-y-12">
          <ShoppingBag size={280} strokeWidth={1} className="text-indigo-400" />
        </div>
        <div className="relative max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/45 border border-indigo-700/50 text-[10px] uppercase font-bold tracking-widest text-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Mid-Season Catalog Active
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight leading-none">
            Curated Gear & Accessories
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/80 font-sans leading-relaxed">
            Discover a hand-picked range of modern work, audio, and travel essential goods built to enrich your daily routines with extreme durability and focus.
          </p>
        </div>
      </div>

      {/* Filter and search controllers */}
      <div
        id="shopview-controls"
        className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        {/* Search bar */}
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input
            id="shopview-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by brand, details or tag..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Categories selector */}
        <div id="category-selector-container" className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <SlidersHorizontal size={14} className="text-slate-400 shrink-0" />
          <div className="flex gap-1.5 shrink-0">
            {categories.map((cat) => (
              <button
                id={`cat-btn-${cat}`}
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid displaying products */}
      {filteredProducts.length === 0 ? (
        <div
          id="shopview-empty"
          className="bg-white border border-dashed border-slate-200 rounded-xl p-16 text-center shadow-xs"
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
            <Search size={22} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No matching products found</h3>
          <p className="text-xs text-slate-500 mt-1">Try tweaking your search term or altering the department filter.</p>
        </div>
      ) : (
        <div id="shopview-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.stock <= 0;
            const isLowStock = p.stock > 0 && p.stock <= 3;
            return (
              <div
                id={`product-card-${p.id}`}
                key={p.id}
                className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col group hover:shadow-md transition-shadow duration-300"
              >
                {/* Image holder */}
                <div className="relative aspect-video bg-slate-50 overflow-hidden shrink-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                      <Tag size={10} className="stroke-[2.5px]" />
                      {p.category}
                    </span>
                  </div>
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-2xs flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-mono text-xs font-semibold tracking-wider uppercase shadow-xs">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Info block */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                      <h3 className="font-display font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {p.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3.5 mt-4 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm font-bold text-slate-900 block leading-none mb-1">
                        ${p.price.toFixed(2)}
                      </span>
                      <div className="text-[10px] font-semibold text-slate-400">
                        {isOutOfStock ? (
                          <span className="text-red-700 uppercase bg-red-50 px-1.5 py-0.5 rounded">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded font-medium">Low Stock ({p.stock})</span>
                        ) : (
                          <span className="text-green-700 bg-green-100 px-1.5 py-0.5 rounded font-medium">In Stock ({p.stock})</span>
                        )}
                      </div>
                    </div>

                    <button
                      id={`add-to-cart-btn-${p.id}`}
                      onClick={() => onAddToCart(p)}
                      disabled={isOutOfStock}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isOutOfStock
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-xs active:scale-98"
                      }`}
                    >
                      <ShoppingBag size={14} />
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
