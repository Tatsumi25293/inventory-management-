'use client';

import { useState, useEffect, FormEvent } from 'react';
import { X, Save, Plus, HelpCircle, Package, DollarSign, Tag, Truck } from 'lucide-react';

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
  status?: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product: Product | null;
}

export default function ProductModal({ isOpen, onClose, onSave, product }: ProductModalProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [minThreshold, setMinThreshold] = useState(10);
  const [costPrice, setCostPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [supplierName, setSupplierName] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku);
      setCategory(product.category);
      setQuantity(product.quantity);
      setMinThreshold(product.minThreshold);
      setCostPrice(product.costPrice);
      setSellingPrice(product.sellingPrice);
      setSupplierName(product.supplierName);
    } else {
      setName('');
      setSku('');
      setCategory('');
      setQuantity(0);
      setMinThreshold(10);
      setCostPrice(0);
      setSellingPrice(0);
      setSupplierName('');
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const submittedProduct: Product = {
      id: product?.id || Math.random().toString(36).substring(2, 9),
      name,
      sku: sku.trim().toUpperCase(),
      category: category.trim(),
      quantity: product ? product.quantity : Number(quantity),
      minThreshold: Number(minThreshold),
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      supplierName: supplierName.trim(),
    };

    onSave(submittedProduct);
    onClose();
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden glass-panel-heavy shadow-2xl rounded-3xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {product ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
              </h2>
              <p className="text-xs text-gray-400">
                {product ? `تحديث معلومات SKU: ${product.sku}` : 'أدخل تفاصيل ومواصفات المنتج الجديد'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium">اسم المنتج</label>
              <input
                type="text"
                required
                placeholder="مثال: Samsung Galaxy S24"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium">رمز الـ SKU</label>
              <input
                type="text"
                required
                placeholder="مثال: SAM-S24-256G"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium">الفئة</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none appearance-none"
              >
                <option value="" disabled className="bg-[#0e0f14]">اختر الفئة</option>
                <option value="هواتف ذكية" className="bg-[#0e0f14]">هواتف ذكية</option>
                <option value="إلكترونيات" className="bg-[#0e0f14]">إلكترونيات</option>
                <option value="إكسسوارات" className="bg-[#0e0f14]">إكسسوارات</option>
                <option value="أجهزة لوحية" className="bg-[#0e0f14]">أجهزة لوحية</option>
                <option value="ساعات ذكية" className="bg-[#0e0f14]">ساعات ذكية</option>
                <option value="أخرى" className="bg-[#0e0f14]">أخرى</option>
              </select>
            </div>

            {/* Supplier Name */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium">اسم المورد</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة آبل العالمية"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full glass-input rounded-xl pr-4 pl-9 py-2.5 text-sm text-white focus:outline-none"
                />
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            {/* Cost Price */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium">سعر التكلفة (USD)</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={costPrice || ''}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="w-full glass-input rounded-xl pr-4 pl-9 py-2.5 text-sm text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            {/* Selling Price */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium">سعر البيع (USD)</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={sellingPrice || ''}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full glass-input rounded-xl pr-4 pl-9 py-2.5 text-sm text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            {/* Initial Quantity (Only in Add Mode) */}
            {!product && (
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">الكمية الابتدائية</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="0"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>
            )}

            {/* Low Stock Threshold */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                حد المخزون المنخفض
                <span className="group relative cursor-pointer text-gray-500 hover:text-gray-300">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="absolute bottom-full right-1/2 translate-x-1/2 mb-1.5 hidden group-hover:block w-48 p-2 text-[10px] text-gray-300 bg-black/90 border border-white/10 rounded-lg shadow-xl text-center z-50">
                    سيظهر تنبيه باللون الأحمر إذا قلّ المخزون عن هذا الحد.
                  </span>
                </span>
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="10"
                value={minThreshold || ''}
                onChange={(e) => setMinThreshold(Number(e.target.value))}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-all duration-200 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:scale-[1.02] active:scale-95 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {product ? 'حفظ التغييرات' : 'إضافة المنتج'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
