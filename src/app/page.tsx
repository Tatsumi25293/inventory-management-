'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, Search, Plus, Trash2, Edit2, ChevronDown, 
  TrendingUp, AlertTriangle, Layers, DollarSign, LogOut, 
  History, CornerDownLeft, ShieldAlert, ArrowUpDown, RefreshCcw
} from 'lucide-react';
import ProductModal from '@/components/ProductModal';
import QuantityModal from '@/components/QuantityModal';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minThreshold: number;
  costPrice: number;
  sellingPrice: number;
  supplierName: string;
}

interface LogEntry {
  id: string;
  productName: string;
  sku: string;
  change: number;
  reason: string;
  timestamp: string;
}

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'iPhone 15 Pro Max',
    sku: 'APL-IP15PM-256',
    category: 'هواتف ذكية',
    quantity: 15,
    minThreshold: 5,
    costPrice: 920,
    sellingPrice: 1199,
    supplierName: 'شركة آبل للتوزيع المحدودة',
  },
  {
    id: 'prod-2',
    name: 'Samsung Galaxy S24 Ultra',
    sku: 'SAM-S24U-512',
    category: 'هواتف ذكية',
    quantity: 3, // Low stock since threshold is 5
    minThreshold: 5,
    costPrice: 950,
    sellingPrice: 1299,
    supplierName: 'وكالة سامسونج الشرق الأوسط',
  },
  {
    id: 'prod-3',
    name: 'MacBook Pro M3 Max 16"',
    sku: 'APL-MBP3M-1TB',
    category: 'إلكترونيات',
    quantity: 8,
    minThreshold: 2,
    costPrice: 2800,
    sellingPrice: 3499,
    supplierName: 'شركة آبل للتوزيع المحدودة',
  },
  {
    id: 'prod-4',
    name: 'iPad Pro 11-inch M4',
    sku: 'APL-IPP4-256',
    category: 'أجهزة لوحية',
    quantity: 0, // Out of stock
    minThreshold: 4,
    costPrice: 750,
    sellingPrice: 999,
    supplierName: 'موزعي آبل المعتمدين',
  },
  {
    id: 'prod-5',
    name: 'Sony WH-1000XM5',
    sku: 'SNY-XM5-WHT',
    category: 'إكسسوارات',
    quantity: 22,
    minThreshold: 8,
    costPrice: 240,
    sellingPrice: 349,
    supplierName: 'سوني للإلكترونيات مصر',
  }
];

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedStatus, setSelectedStatus] = useState('الكل');
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      productName: 'iPhone 15 Pro Max',
      sku: 'APL-IP15PM-256',
      change: 5,
      reason: 'توريد شحنة جديدة',
      timestamp: '2026-06-14 10:15'
    },
    {
      id: 'log-2',
      productName: 'Samsung Galaxy S24 Ultra',
      sku: 'SAM-S24U-512',
      change: -2,
      reason: 'بيع منتج',
      timestamp: '2026-06-14 11:42'
    }
  ]);

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [selectedQtyProduct, setSelectedQtyProduct] = useState<Product | null>(null);
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  // Statistics calculation
  const totalProducts = products.length;
  
  const totalStockValue = products.reduce(
    (sum, p) => sum + p.quantity * p.sellingPrice, 0
  );
  
  const totalCostValue = products.reduce(
    (sum, p) => sum + p.quantity * p.costPrice, 0
  );

  const profitMargin = totalStockValue > 0 
    ? ((totalStockValue - totalCostValue) / totalStockValue) * 100 
    : 0;

  const lowStockCount = products.filter(
    (p) => p.quantity <= p.minThreshold && p.quantity > 0
  ).length;

  const outOfStockCount = products.filter(
    (p) => p.quantity === 0
  ).length;

  // Filter logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory;

    let matchesStatus = true;
    if (selectedStatus === 'متوفر') {
      matchesStatus = p.quantity > p.minThreshold;
    } else if (selectedStatus === 'منخفض المخزون') {
      matchesStatus = p.quantity <= p.minThreshold && p.quantity > 0;
    } else if (selectedStatus === 'غير متوفر') {
      matchesStatus = p.quantity === 0;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Extract unique categories for filter dropdown
  const categories = ['الكل', ...Array.from(new Set(products.map((p) => p.category)))];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Add / Edit Product Save
  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      // Edit mode
      setProducts((prev) => 
        prev.map((p) => (p.id === product.id ? product : p))
      );
      
      // Add log
      const newLog: LogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        productName: product.name,
        sku: product.sku,
        change: 0,
        reason: 'تعديل تفاصيل المنتج والأسعار',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setLogs((prev) => [newLog, ...prev]);
    } else {
      // Add mode
      setProducts((prev) => [...prev, product]);
      
      // Add log
      const newLog: LogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        productName: product.name,
        sku: product.sku,
        change: product.quantity,
        reason: 'إضافة منتج جديد للمخازن',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  // Adjust Product Quantity
  const handleSaveQuantity = (productId: string, quantityChange: number, reason: string) => {
    let affectedProduct: Product | undefined;
    
    setProducts((prev) => 
      prev.map((p) => {
        if (p.id === productId) {
          const updatedQty = Math.max(0, p.quantity + quantityChange);
          affectedProduct = { ...p, quantity: updatedQty };
          return affectedProduct;
        }
        return p;
      })
    );

    if (affectedProduct) {
      const newLog: LogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        productName: affectedProduct.name,
        sku: affectedProduct.sku,
        change: quantityChange,
        reason,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  // Delete Product
  const handleDeleteProduct = (productId: string) => {
    const productToDelete = products.find((p) => p.id === productId);
    if (!productToDelete) return;

    if (confirm(`هل أنت متأكد من حذف المنتج "${productToDelete.name}" نهائياً من النظام؟`)) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      
      // Add log
      const newLog: LogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        productName: productToDelete.name,
        sku: productToDelete.sku,
        change: -productToDelete.quantity,
        reason: 'شطب وحذف المنتج من المخازن',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#08090d] text-white flex flex-col font-sans pb-12 relative overflow-x-hidden">
      
      {/* Background Neon Blobs - Apple Style */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[130px] animate-pulse pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-[450px] h-[450px] rounded-full bg-cyan-600/10 blur-[140px] pointer-events-none" />

      {/* Grid texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293706_1px,transparent_1px),linear-gradient(to_bottom,#1f293706_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-20" />

      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#08090d]/65 border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border border-white/10 shadow-lg shadow-blue-500/10">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-white/95">لوحة تحكم المخزون</h1>
            <p className="text-[10px] text-gray-400">إصدار التعديل المحلي - آمن بالكامل</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-gray-400 select-none">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>المستخدم: المسؤول</span>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isLoggingOut ? 'جاري الخروج...' : 'تسجيل الخروج'}</span>
          </button>
        </div>
      </nav>

      {/* Dashboard Content Container */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-6 md:px-12 mt-8 flex-1 space-y-8">
        
        {/* STATS PANELS CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Total Products */}
          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <span className="text-xs text-gray-400 block font-medium">إجمالي المنتجات</span>
              <span className="text-3xl font-extrabold text-white block">{totalProducts}</span>
              <span className="text-[10px] text-gray-500 block">من أصناف مختلفة</span>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Total Stock Value */}
          <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <span className="text-xs text-gray-400 block font-medium">قيمة مخزون البيع</span>
              <span className="text-3xl font-extrabold text-emerald-400 block">
                ${totalStockValue.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-500 block">
                قيمة التكلفة: ${totalCostValue.toLocaleString()} ({profitMargin.toFixed(0)}% ربح)
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Low Stock Alerts */}
          <div className={`glass-panel p-6 rounded-2xl flex items-center justify-between shadow-lg transition-all duration-300 ${
            lowStockCount > 0 ? 'border-amber-500/20 bg-amber-500/[0.02] glow-amber' : ''
          }`}>
            <div className="space-y-1">
              <span className="text-xs text-gray-400 block font-medium">منتجات منخفضة المخزون</span>
              <span className={`text-3xl font-extrabold block ${lowStockCount > 0 ? 'text-amber-400' : 'text-white'}`}>
                {lowStockCount}
              </span>
              <span className="text-[10px] text-gray-500 block">تحت حد التنبيه الآمن</span>
            </div>
            <div className={`p-3.5 rounded-xl ${
              lowStockCount > 0 
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' 
                : 'bg-white/5 border border-white/10 text-gray-400'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Out Of Stock */}
          <div className={`glass-panel p-6 rounded-2xl flex items-center justify-between shadow-lg transition-all duration-300 ${
            outOfStockCount > 0 ? 'border-red-500/20 bg-red-500/[0.02] glow-red animate-pulse' : ''
          }`}>
            <div className="space-y-1">
              <span className="text-xs text-gray-400 block font-medium">المنتجات النفذة</span>
              <span className={`text-3xl font-extrabold block ${outOfStockCount > 0 ? 'text-red-400 font-black' : 'text-white'}`}>
                {outOfStockCount}
              </span>
              <span className="text-[10px] text-gray-500 block">بحاجة لإعادة شراء فورية</span>
            </div>
            <div className={`p-3.5 rounded-xl ${
              outOfStockCount > 0 
                ? 'bg-red-500/20 border border-red-500/30 text-red-400' 
                : 'bg-white/5 border border-white/10 text-gray-400'
            }`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>

        </section>

        {/* CONTROLS BAR (SEARCH / FILTER / ADD) */}
        <section className="glass-panel p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center justify-between shadow-md">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-[320px]">
            <input
              type="text"
              placeholder="ابحث بالاسم، رمز SKU، أو المورد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input rounded-xl pr-10 pl-4 py-2 text-xs text-white focus:outline-none"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-1.5">
              <span className="text-[10px] text-gray-500">الفئة:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none border-none cursor-pointer pr-1"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#0e0f14]">{c}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-1.5">
              <span className="text-[10px] text-gray-500">الحالة:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none border-none cursor-pointer pr-1"
              >
                <option value="الكل" className="bg-[#0e0f14]">الكل</option>
                <option value="متوفر" className="bg-[#0e0f14]">متوفر</option>
                <option value="منخفض المخزون" className="bg-[#0e0f14]">منخفض المخزون</option>
                <option value="غير متوفر" className="bg-[#0e0f14]">غير متوفر</option>
              </select>
            </div>

            {/* Add Product Button */}
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:scale-[1.02] active:scale-95 shadow-md shadow-blue-500/10 transition-all duration-200 cursor-pointer lg:mr-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج</span>
            </button>
          </div>

        </section>

        {/* PRODUCTS TABLE */}
        <section className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-white/[0.06]">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.06] text-xs text-gray-400 select-none">
                  <th className="px-5 py-4 font-semibold text-center w-36">رمز SKU</th>
                  <th className="px-5 py-4 font-semibold text-right">اسم المنتج</th>
                  <th className="px-5 py-4 font-semibold text-right w-32">الفئة</th>
                  <th className="px-5 py-4 font-semibold text-center w-28">الكمية</th>
                  <th className="px-5 py-4 font-semibold text-center w-28">الحد المنخفض</th>
                  <th className="px-5 py-4 font-semibold text-center w-28">التكلفة</th>
                  <th className="px-5 py-4 font-semibold text-center w-28">سعر البيع</th>
                  <th className="px-5 py-4 font-semibold text-right w-44">المورد</th>
                  <th className="px-5 py-4 font-semibold text-center w-32">الحالة</th>
                  <th className="px-5 py-4 font-semibold text-center w-28">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => {
                    const isOutOfStock = p.quantity === 0;
                    const isLowStock = p.quantity <= p.minThreshold && p.quantity > 0;
                    
                    return (
                      <tr 
                        key={p.id} 
                        className={`text-xs text-gray-300 hover:bg-white/[0.02] transition-colors duration-150 ${
                          isOutOfStock ? 'bg-red-500/[0.01]' : isLowStock ? 'bg-amber-500/[0.01]' : ''
                        }`}
                      >
                        {/* SKU */}
                        <td className="px-5 py-4 text-center font-mono text-gray-400 select-all">
                          {p.sku}
                        </td>
                        
                        {/* Name */}
                        <td className="px-5 py-4 font-bold text-white max-w-xs truncate">
                          {p.name}
                        </td>
                        
                        {/* Category */}
                        <td className="px-5 py-4 text-gray-400">
                          {p.category}
                        </td>
                        
                        {/* Quantity */}
                        <td className="px-5 py-4 text-center">
                          <span className={`font-bold px-2 py-0.5 rounded-md ${
                            isOutOfStock 
                              ? 'text-red-400 bg-red-500/10' 
                              : isLowStock 
                                ? 'text-amber-400 bg-amber-500/10' 
                                : 'text-emerald-400 bg-emerald-500/10'
                          }`}>
                            {p.quantity}
                          </span>
                        </td>
                        
                        {/* Min Threshold */}
                        <td className="px-5 py-4 text-center text-gray-400">
                          {p.minThreshold}
                        </td>
                        
                        {/* Cost Price */}
                        <td className="px-5 py-4 text-center text-gray-400">
                          ${p.costPrice.toFixed(2)}
                        </td>
                        
                        {/* Selling Price */}
                        <td className="px-5 py-4 text-center font-semibold text-white">
                          ${p.sellingPrice.toFixed(2)}
                        </td>
                        
                        {/* Supplier */}
                        <td className="px-5 py-4 text-gray-400 truncate max-w-[176px]" title={p.supplierName}>
                          {p.supplierName}
                        </td>
                        
                        {/* Status badge */}
                        <td className="px-5 py-4 text-center select-none">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${
                            isOutOfStock 
                              ? 'text-red-400 bg-red-500/10 border border-red-500/20' 
                              : isLowStock 
                                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' 
                                : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isOutOfStock 
                                ? 'bg-red-500' 
                                : isLowStock 
                                  ? 'bg-amber-500' 
                                  : 'bg-emerald-500'
                            }`} />
                            {isOutOfStock ? 'نفذ المخزون' : isLowStock ? 'مخزون منخفض' : 'متوفر'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Adjust Qty */}
                            <button
                              onClick={() => {
                                setSelectedQtyProduct(p);
                                setIsQuantityModalOpen(true);
                              }}
                              title="تحديث الكمية"
                              className="p-1.5 rounded-lg border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition-all duration-200 cursor-pointer"
                            >
                              <ArrowUpDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit details */}
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              title="تعديل التفاصيل"
                              className="p-1.5 rounded-lg border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/10 text-gray-400 hover:text-indigo-400 transition-all duration-200 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              title="حذف المنتج"
                              className="p-1.5 rounded-lg border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all duration-200 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center text-gray-500">
                      لا توجد منتجات مطابقة لمعايير البحث الحالية.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* TRANSACTION HISTORY LOGS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl col-span-1 lg:col-span-3">
            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">سجل حركات تعديل المخزون</h3>
              </div>
              <span className="text-[10px] text-gray-500 bg-white/[0.02] border border-white/[0.05] rounded-full px-3 py-1">
                تحديث تلقائي (الجلسة الحالية)
              </span>
            </div>
            
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const isPositive = log.change > 0;
                  const isChangeZero = log.change === 0;

                  return (
                    <div 
                      key={log.id} 
                      className="p-3 rounded-2xl bg-white/[0.01] border border-white/[0.04] flex items-center justify-between hover:bg-white/[0.02] transition-all duration-200"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-1 text-gray-500">
                          <CornerDownLeft className="w-3 h-3 text-gray-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{log.productName}</span>
                            <span className="text-[9px] font-mono text-gray-500">({log.sku})</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">السبب: {log.reason}</p>
                        </div>
                      </div>

                      <div className="text-left flex flex-col items-end gap-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          isChangeZero 
                            ? 'text-gray-400 bg-gray-500/10' 
                            : isPositive 
                              ? 'text-emerald-400 bg-emerald-500/10' 
                              : 'text-red-400 bg-red-500/10'
                        }`}>
                          {isChangeZero ? 'تعديل بيانات' : isPositive ? `+${log.change} وحدة` : `${log.change} وحدة`}
                        </span>
                        <span className="text-[9px] text-gray-500 font-mono">{log.timestamp}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-gray-500">
                  لا توجد حركات مخزنية مسجلة حالياً.
                </div>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* Product Add/Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
      />

      {/* Quantity Adjust Modal */}
      <QuantityModal
        isOpen={isQuantityModalOpen}
        onClose={() => {
          setIsQuantityModalOpen(false);
          setSelectedQtyProduct(null);
        }}
        onSave={handleSaveQuantity}
        product={selectedQtyProduct}
      />

    </div>
  );
}
