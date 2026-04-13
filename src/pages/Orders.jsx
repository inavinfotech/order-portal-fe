import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  ArrowUpDown,
  FileText,
  Download,
  Plus,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import OrderModal from '../components/OrderModal';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const ORDERS_PER_PAGE = 15;

const Orders = () => {
  const { currencySymbol } = useSettings();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / ORDERS_PER_PAGE));

  const fetchOrders = async (page = 1) => {
    try {
      const skip = (page - 1) * ORDERS_PER_PAGE;
      const [ordersRes, countRes] = await Promise.all([
        api.get(`/orders/?skip=${skip}&limit=${ORDERS_PER_PAGE}`),
        api.get('/orders/count')
      ]);
      setOrders(ordersRes.data);
      setTotalCount(countRes.data.count);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const filteredOrders = orders.filter(order => 
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Order Lifecycle</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Registry of all historical and active sequences</p>
        </div>
        <button 
          onClick={() => setIsOrderModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          New Order
        </button>
      </div>

      <OrderModal 
        isOpen={isOrderModalOpen} 
        onClose={() => setIsOrderModalOpen(false)} 
        onSuccess={() => fetchOrders(currentPage)}
      />

      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-500 transition-all text-xs font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
          <button className="flex items-center justify-center p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Details</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="text-xs font-bold text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{order.product_name}</p>
                    <p className="text-[10px] font-mono text-gray-400 mt-0.5 whitespace-nowrap">ID: {order.id.slice(0, 12)}...</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-xs font-bold text-gray-700">{order.customer_name}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-xs text-gray-500 font-medium">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-xs font-black text-gray-900">{currencySymbol}{order.total_amount.toFixed(2)}</p>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/orders/${order.id}`} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-400">
                      <Package className="w-12 h-12 text-gray-200" />
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">No Records Found</h3>
                        <p className="text-xs text-gray-400 font-medium mt-1">No orders match the current search criteria.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Page {currentPage} of {totalPages} • {totalCount} total records
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-gray-200"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-gray-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-gray-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-gray-200"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
