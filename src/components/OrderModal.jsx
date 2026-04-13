import React, { useState, useEffect, useMemo } from 'react';
import { 
  X,
  Zap,
  Box,
  User,
  Tag,
  CreditCard,
  CheckCircle2,
  Plus,
  Trash2,
  Package,
  Hash
} from 'lucide-react';
import api from '../services/api';
import { useSettings } from '../context/SettingsContext';

const OrderModal = ({ isOpen, onClose, onSuccess }) => {
  const { settings, currencySymbol } = useSettings();
  const [apps, setApps] = useState([]);
  const [orderForm, setOrderForm] = useState({
    application_id: '',
    customer_name: '',
    user_id: `user_${Math.floor(Math.random() * 1000)}`,
    items: [
      { id: Date.now(), product_id: '', product_name: '', quantity: 1, unit_price: '' }
    ]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculate totals
  const totals = useMemo(() => {
    return orderForm.items.reduce((acc, item) => {
      const qty = parseInt(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return {
        amount: acc.amount + (qty * price),
        quantity: acc.quantity + qty
      };
    }, { amount: 0, quantity: 0 });
  }, [orderForm.items]);

  const fetchApps = async () => {
    try {
      const res = await api.get('/apps');
      if (res.data.length > 0) {
        setApps(res.data);
        setOrderForm(prev => {
          if (!prev.application_id || !res.data.find(a => a.id === prev.application_id)) {
            return { ...prev, application_id: res.data[0].id };
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Failed to fetch apps', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchApps();
    }
  }, [isOpen]);

  const addItem = () => {
    setOrderForm(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), product_id: '', product_name: '', quantity: 1, unit_price: '' }]
    }));
  };

  const removeItem = (id) => {
    if (orderForm.items.length === 1) return;
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id, field, value) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const newItem = { ...item, [field]: value };
          // Auto-generate product_id if name is updated and ID is empty
          if (field === 'product_name' && !item.product_id) {
            newItem.product_id = value.toLowerCase().trim().replace(/\s+/g, '_');
          }
          return newItem;
        }
        return item;
      })
    }));
  };

  const handleInitiateOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!orderForm.application_id) {
        throw new Error('Please select a target application first');
      }
      
      if (orderForm.items.some(item => !item.product_id || !item.product_name || !item.quantity || !item.unit_price)) {
        throw new Error('Please fill in all item details (including IDs)');
      }

      const summaryProductName = orderForm.items.map(i => i.product_name).join(', ');
      const truncatedName = summaryProductName.length > 100 ? summaryProductName.substring(0, 97) + '...' : summaryProductName;

      const payload = {
        application_id: orderForm.application_id,
        customer_name: orderForm.customer_name,
        user_id: orderForm.user_id,
        product_name: truncatedName,
        total_amount: totals.amount,
        quantity: totals.quantity,
        currency: settings.global_currency || 'USD',
        items: orderForm.items.map(item => ({
          product_id: item.product_id.trim(),
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.unit_price)
        }))
      };
      
      await api.post('/orders/admin', payload);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Order initiation failed', err);
      const msg = err.response?.data?.detail || err.message || 'Failed to initiate order';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isSubmitting && onClose()}></div>
      <div className="bg-white rounded-3xl w-full max-w-2xl relative overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]">
        {showSuccess ? (
          <div className="p-12 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Initiated!</h3>
            <p className="text-gray-500 font-medium">The fulfillment sequence has been triggered for {orderForm.customer_name}.</p>
          </div>
        ) : (
          <>
            <div className="bg-primary-600 p-6 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-primary-200" />
                <h3 className="text-xl font-bold">Initiate New Sequence</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateOrder} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              {/* Customer Info Section */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Target Application</label>
                  <div className="relative">
                    <Box className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select 
                      required
                      value={orderForm.application_id}
                      onChange={(e) => setOrderForm({...orderForm, application_id: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all appearance-none"
                    >
                      {apps.map(app => (
                        <option key={app.id} value={app.id}>{app.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Customer Identifier</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      required
                      placeholder="e.g. user_123"
                      value={orderForm.user_id}
                      onChange={(e) => setOrderForm({...orderForm, user_id: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Customer Name</label>
                <input 
                  type="text"
                  required
                  placeholder="John Doe"
                  value={orderForm.customer_name}
                  onChange={(e) => setOrderForm({...orderForm, customer_name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all"
                />
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary-600" />
                    Order Items
                  </h4>
                  <button 
                    type="button"
                    onClick={addItem}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {orderForm.items.map((item, index) => (
                    <div key={item.id} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-4 animate-in slide-in-from-left-2 duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item #{index + 1}</span>
                        <button 
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={orderForm.items.length === 1}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 disabled:hidden rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Product ID</label>
                          <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              type="text"
                              required
                              placeholder="sku_123"
                              value={item.product_id}
                              onChange={(e) => updateItem(item.id, 'product_id', e.target.value)}
                              className="w-full bg-white border border-gray-100 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all font-mono"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                          <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              type="text"
                              required
                              placeholder="Product Name"
                              value={item.product_name}
                              onChange={(e) => updateItem(item.id, 'product_name', e.target.value)}
                              className="w-full bg-white border border-gray-100 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
                          <input 
                            type="number"
                            required
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Unit Price ({currencySymbol})</label>
                          <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              type="number"
                              step="0.01"
                              required
                              placeholder="0.00"
                              value={item.unit_price}
                              onChange={(e) => updateItem(item.id, 'unit_price', e.target.value)}
                              className="w-full bg-white border border-gray-100 rounded-xl pl-11 pr-4 py-2.5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Section */}
              <div className="bg-gray-50 rounded-2xl p-6 space-y-3 shrink-0">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Total Quantity</span>
                  <span className="text-gray-900 font-bold">{totals.quantity}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-base font-bold text-gray-900">Total Order Amount</span>
                  <span className="text-2xl font-black text-primary-600 font-mono">{currencySymbol}{totals.amount.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98] text-sm uppercase tracking-widest flex items-center justify-center gap-2 shrink-0"
              >
                {isSubmitting ? 'Processing...' : 'Initiate Secure Order'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
