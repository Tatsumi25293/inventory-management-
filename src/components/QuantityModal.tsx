'use client';

import { useState, useEffect, FormEvent } from 'react';
import { X, Plus, Minus, Check, RefreshCw, AlertTriangle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minThreshold: number;
}

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: string, quantityChange: number, reason: string) => void;
  product: Product | null;
}

export default function QuantityModal({ isOpen, onClose, onSave, product }: QuantityModalProps) {
  const [adjustment, setAdjustment] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [mode, setMode] = useState<'add' | 'subtract'>('add');

  useEffect(() => {
    setAdjustment(0);
    setReason('');
    setCustomReason('');
    setMode('add');
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleIncrement = () => {
    setAdjustment((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setAdjustment((prev) => {
      const target = prev - 1;
      // Prevent negative adjustments
      return target < 0 ? 0 : target;
    });
  };

  const handleInputChange = (val: string) => {
    const numVal = parseInt(val, 10);
    if (isNaN(numVal)) {
      setAdjustment(0);
    } else {
      setAdjustment(Math.max(0, numVal));
    }
  };

  const currentQuantity = product.quantity;
  const changeValue = mode === 'add' ? adjustment : -adjustment;
  const newQuantity = currentQuantity + changeValue;
  const isOutOfStockAfter = newQuantity <= 0;
  const isLowStockAfter = newQuantity <= product.minThreshold && newQuantity > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (adjustment === 0) return;

    const finalReason = reason === 'أخرى' ? customReason.trim() : reason;
    if (!finalReason) return;

    onSave(product.id, changeValue, finalReason);
    onClose();
  };

  const defaultReasons = mode === 'add' 
    ? ['توريد شحنة جديدة', 'مرتجع مبيعات', 'تسوية جرد (زيادة)', 'أخرى']
    : ['بيع منتج', 'تالف / مفقود', 'سحب للاستخدام الداخلي', 'تسوية جرد (نقص)', 'أخرى'];

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md overflow-hidden glass-panel-heavy shadow-2xl rounded-3xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">إدارة كميات المخزون</h2>
              <p className="text-xs text-gray-400">تعديل سريع لمستويات المخزون للمنتج</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Info Card */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">{product.name}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">SKU: {product.sku}</p>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-gray-400 block">الكمية الحالية</span>
              <span className={`text-lg font-bold ${product.quantity <= product.minThreshold ? 'text-red-400' : 'text-emerald-400'}`}>
                {product.quantity} وحدة
              </span>
            </div>
          </div>

          {/* Mode Switcher (Add or Subtract) */}
          <div className="flex gap-2 p-1 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setMode('add');
                setAdjustment(0);
                setReason('');
              }}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                mode === 'add' 
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              إيداع مخزون (+)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('subtract');
                setAdjustment(0);
                setReason('');
              }}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                mode === 'subtract' 
                  ? 'bg-red-500/20 border border-red-500/30 text-red-400 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              سحب مخزون (-)
            </button>
          </div>

          {/* Quantity Controls */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-medium mr-1">مقدار التعديل</label>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/10 hover:text-white text-gray-300 flex items-center justify-center font-bold text-lg active:scale-90 transition-all duration-200 cursor-pointer"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <input
                type="number"
                min="0"
                value={adjustment === 0 ? '' : adjustment}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="0"
                className="w-24 h-12 text-center text-xl font-bold bg-white/[0.02] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
              />

              <button
                type="button"
                onClick={handleIncrement}
                className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/10 hover:text-white text-gray-300 flex items-center justify-center font-bold text-lg active:scale-90 transition-all duration-200 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-medium mr-1">سبب التعديل</label>
            <select
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none appearance-none"
            >
              <option value="" disabled className="bg-[#0e0f14]">اختر سبب التعديل</option>
              {defaultReasons.map((r) => (
                <option key={r} value={r} className="bg-[#0e0f14]">{r}</option>
              ))}
            </select>

            {reason === 'أخرى' && (
              <input
                type="text"
                required
                placeholder="يرجى كتابة السبب بالتفصيل"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white mt-2 focus:outline-none"
              />
            )}
          </div>

          {/* Summary Math */}
          <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/[0.04] text-xs text-gray-300 space-y-2">
            <div className="flex justify-between">
              <span>الكمية الحالية:</span>
              <span className="font-semibold text-white">{currentQuantity} وحدة</span>
            </div>
            <div className="flex justify-between items-center">
              <span>مقدار التغيير:</span>
              <span className={`font-semibold ${mode === 'add' ? 'text-emerald-400' : 'text-red-400'}`}>
                {mode === 'add' ? `+${adjustment}` : `-${adjustment}`} وحدة
              </span>
            </div>
            <div className="border-t border-white/5 my-1" />
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-white">الكمية الناتجة:</span>
              <span className={`font-bold ${
                isOutOfStockAfter 
                  ? 'text-red-500' 
                  : isLowStockAfter 
                    ? 'text-yellow-400' 
                    : 'text-white'
              }`}>
                {newQuantity} وحدة
              </span>
            </div>

            {/* Warning Message if low stock */}
            {isOutOfStockAfter && adjustment > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-red-400 mt-2 bg-red-950/20 border border-red-500/20 rounded-lg p-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>تحذير: المخزون سينفد بالكامل لهذا المنتج بعد هذا التعديل.</span>
              </div>
            )}
            {!isOutOfStockAfter && isLowStockAfter && adjustment > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-yellow-400 mt-2 bg-yellow-950/20 border border-yellow-500/20 rounded-lg p-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>تنبيه: ستكون كمية المنتج أقل من حد المخزون المنخفض ({product.minThreshold}).</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-xs transition-all duration-200 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={adjustment === 0 || !reason || (reason === 'أخرى' && !customReason)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              تحديث المخزون
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
