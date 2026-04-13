import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  DollarSign,
  ArrowUpRight,
  Package,
  ArrowRight,
  Plus
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import OrderModal from '../components/OrderModal';
import { useSettings } from '../context/SettingsContext';

const Dashboard = () => {
  const { currencySymbol } = useSettings();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    amount: 0,
    growth: '0%',
    recent: []
  });
  const [health, setHealth] = useState({ api: '...', database: '...', relay: '...' });
  const [loading, setLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, healthRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/health')
      ]);
      setStats(statsRes.data);
      setHealth(healthRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    init();
  }, []);

  const statCards = [
    { name: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Pending Orders', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Total Revenue', value: `${currencySymbol}${stats.amount.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Growth Rate', value: stats.growth, icon: TrendingUp, color: stats.growth.startsWith('+') ? 'text-emerald-600' : 'text-primary-600', bg: stats.growth.startsWith('+') ? 'bg-emerald-50' : 'bg-primary-50' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Overview</h1>
        <p className="text-gray-500 text-sm font-medium mt-1">Real-time fulfillment metrics and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white border border-gray-200 p-6 rounded-xl group hover:border-primary-500/50 transition-all duration-300 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${card.bg} ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{card.name}</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Package className="text-primary-600 w-5 h-5" />
              Recent Orders
            </h3>
            <Link to="/orders" className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1 group">
              View All
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recent.map((order) => (
                  <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-mono text-gray-500">#{order.id.slice(0, 8)}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-900">{order.customer_name}</td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">{currencySymbol}{order.total_amount.toFixed(2)}</td>
                    <td className="py-4 px-6 text-right">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Status */}
        <div className="space-y-6">
          <div className="bg-primary-600 rounded-xl p-6 text-white shadow-lg shadow-primary-600/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <ShoppingBag className="w-20 h-20" />
            </div>
            <h3 className="text-lg font-bold mb-1">New Sequence</h3>
            <p className="text-primary-100 text-xs mb-6 opacity-90">
              Initialize a manual order entry into the fulfillment engine.
            </p>
            <button 
              onClick={() => setIsOrderModalOpen(true)}
              className="bg-white text-primary-600 text-xs font-bold py-2.5 px-5 rounded-lg transition-all active:scale-[0.98] shadow-md"
            >
              Initiate Order
            </button>
          </div>

          <div className="bg-emerald-600 rounded-xl p-6 text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <Plus className="w-20 h-20" />
            </div>
            <h3 className="text-lg font-bold mb-1">New Application</h3>
            <p className="text-emerald-100 text-xs mb-6 opacity-90">
              Register a new client gateway and generate secure API keys.
            </p>
            <Link to="/apps">
              <button className="bg-white text-emerald-600 text-xs font-bold py-2.5 px-5 rounded-lg transition-all active:scale-[0.98] shadow-md">
                Create App
              </button>
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wide">Infrastructure</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">API Gateway</span>
                <span className={`text-[10px] font-bold ${health.api === 'online' ? 'text-emerald-600' : 'text-rose-600'} flex items-center gap-1.5 uppercase transition-all`}>
                  <span className={`w-1.5 h-1.5 ${health.api === 'online' ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full ${health.api === 'online' ? 'animate-pulse' : ''}`}></span>
                  {health.api}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Database</span>
                <span className={`text-[10px] font-bold ${health.database === 'online' ? 'text-emerald-600' : 'text-rose-600'} flex items-center gap-1.5 uppercase`}>
                  <span className={`w-1.5 h-1.5 ${health.database === 'online' ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full ${health.database === 'online' ? 'animate-pulse' : ''}`}></span>
                  {health.database}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Relay Nodes</span>
                <span className={`text-[10px] font-bold ${health.relay === 'online' ? 'text-emerald-600' : 'text-rose-600'} flex items-center gap-1.5 uppercase`}>
                  <span className={`w-1.5 h-1.5 ${health.relay === 'online' ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full ${health.relay === 'online' ? 'animate-pulse' : ''}`}></span>
                  {health.relay}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OrderModal 
        isOpen={isOrderModalOpen} 
        onClose={() => setIsOrderModalOpen(false)} 
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};

export default Dashboard;
