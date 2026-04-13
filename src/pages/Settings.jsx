import React, { useEffect, useState } from "react";
import { 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Globe, 
  Cpu, 
  Settings as SettingsIcon, 
  Check,
  Coins
} from "lucide-react";
import api from "../services/api";
import { cn } from "../utils/cn";
import { useSettings } from "../context/SettingsContext";

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee (₹)', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar (A$)', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar (C$)', symbol: 'C$' },
];

const Settings = () => {
  const { settings, updateSetting, refreshSettings } = useSettings();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainEdits, setDomainEdits] = useState({});
  const [saveStatus, setSaveStatus] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const appsRes = await api.get('/apps');
      setApps(appsRes.data);

      const initialDomains = {};
      appsRes.data.forEach((app) => {
        initialDomains[app.id] = app.allowed_domains || "*";
      });
      setDomainEdits(initialDomains);
    } catch (error) {
      console.error("Failed to fetch settings data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalToggle = async () => {
    const newValue = settings.global_order_processing_enabled === "true" ? "false" : "true";

    const isConfirmed = window.confirm(
      newValue === "false"
        ? "⚠️ CRITICAL WARNING: Disabling global processing will immediately reject ALL order creation requests from ALL apps. Proceed?"
        : "Are you sure you want to enable global order processing?"
    );

    if (!isConfirmed) return;

    await updateSetting({ global_order_processing_enabled: newValue });
  };

  const handleCurrencyChange = async (e) => {
    const newCurrency = e.target.value;
    await updateSetting({ global_currency: newCurrency });
  };

  const handleAppStatusToggle = async (appId, currentStatus, appName) => {
    const action = currentStatus ? "BLOCK" : "ACTIVATE";
    const isConfirmed = window.confirm(`Are you sure you want to ${action} "${appName}"?`);
    if (!isConfirmed) return;

    try {
      const newStatus = !currentStatus;
      await api.put(`/apps/${appId}/status`, { is_active: newStatus });
      setApps(apps.map((app) => app.id === appId ? { ...app, is_active: newStatus } : app));
    } catch (error) {
      console.error("Failed to update app status", error);
    }
  };

  const handleAppModeToggle = async (appId, currentMode, appName) => {
    const action = currentMode ? "TEST" : "LIVE";
    const isConfirmed = window.confirm(`Switch "${appName}" to ${action} mode?`);
    if (!isConfirmed) return;

    try {
      const newMode = !currentMode;
      await api.put(`/apps/${appId}/mode`, { is_live_mode: newMode });
      setApps(apps.map((app) => app.id === appId ? { ...app, is_live_mode: newMode } : app));
    } catch (error) {
      console.error("Failed to update app mode", error);
    }
  };

  const handleDomainSave = async (appId) => {
    const domains = domainEdits[appId];
    setSaveStatus({ ...saveStatus, [appId]: "saving" });
    try {
      await api.put(`/apps/${appId}/domains`, { allowed_domains: domains });
      setApps(apps.map((app) => app.id === appId ? { ...app, allowed_domains: domains } : app));
      setSaveStatus({ ...saveStatus, [appId]: "success" });
      setTimeout(() => {
        setSaveStatus((prev) => {
          const newState = { ...prev };
          delete newState[appId];
          return newState;
        });
      }, 3000);
    } catch (error) {
      console.error("Failed to update domains", error);
      setSaveStatus({ ...saveStatus, [appId]: "error" });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">System Configuration</h2>
        <p className="text-gray-500 mt-2 font-medium">Global governance and application-specific security policies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Global Processing Switch */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Globe size={100} className="text-primary-600" />
          </div>
          <div className="flex flex-col justify-between h-full relative z-10 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                  <Shield size={18} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Processing Gateway</h3>
              </div>
              <p className="text-gray-500 leading-relaxed text-sm font-medium">
                Master switch for the fulfillment layer. Disabling this rejects all incoming order attempts globally.
              </p>
            </div>
            
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
               <div className="flex flex-col">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  settings.global_order_processing_enabled === "true" ? "text-emerald-600" : "text-rose-600"
                )}>Status</span>
                <span className="font-bold text-gray-900">
                  {settings.global_order_processing_enabled === "true" ? "OPERATIONAL" : "SUSPENDED"}
                </span>
              </div>
              <button
                onClick={handleGlobalToggle}
                className={cn(
                  "relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-300 focus:outline-none shrink-0",
                  settings.global_order_processing_enabled === "true"
                    ? "bg-emerald-500 shadow-sm"
                    : "bg-rose-500 shadow-sm"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition-transform duration-300",
                    settings.global_order_processing_enabled === "true" ? "translate-x-8" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Global Currency Selection */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Coins size={100} className="text-primary-600" />
          </div>
          <div className="flex flex-col justify-between h-full relative z-10 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Globe size={18} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Global Currency</h3>
              </div>
              <p className="text-gray-500 leading-relaxed text-sm font-medium">
                Set the default currency for all orders and visualizations across the administrative dashboard.
              </p>
            </div>

            <div className="relative">
              <select
                value={settings.global_currency || 'USD'}
                onChange={handleCurrencyChange}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all appearance-none outline-none cursor-pointer"
              >
                {CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <SettingsIcon size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                <Cpu size={20} />
             </div>
             <h3 className="text-xl font-bold text-gray-900">Application Governance</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/4">Entity Metadata</th>
                <th className="px-8 py-5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Policy</th>
                <th className="px-8 py-5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Environment</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">CORS White-list</th>
                <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Governance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 mb-0.5">{app.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{app.id.slice(0, 13)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button
                      onClick={() => handleAppStatusToggle(app.id, app.is_active, app.name)}
                      className={cn(
                        "px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                        app.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100"
                      )}
                    >
                      {app.is_active ? "Enforced" : "Restricted"}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button
                      onClick={() => handleAppModeToggle(app.id, app.is_live_mode, app.name)}
                      className={cn(
                        "px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                        app.is_live_mode
                          ? "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100"
                          : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
                      )}
                    >
                      {app.is_live_mode ? "PROD" : "SANDBOX"}
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <div className="relative group min-w-[250px]">
                      <input
                        type="text"
                        className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-xs font-semibold text-gray-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all pr-10 hover:border-gray-200"
                        placeholder="Comma separated domains (e.g. example.com)"
                        value={domainEdits[app.id] || ""}
                        onChange={(e) => setDomainEdits({ ...domainEdits, [app.id]: e.target.value })}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
                         <Globe size={14} />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => handleDomainSave(app.id)}
                      disabled={saveStatus[app.id] === "saving"}
                      className={cn(
                        "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm hover:shadow-md active:scale-95",
                        saveStatus[app.id] === "success" ? "bg-emerald-500 text-white" :
                        saveStatus[app.id] === "error" ? "bg-rose-500 text-white" :
                        "bg-primary-600 text-white hover:bg-primary-700"
                      )}
                    >
                      {saveStatus[app.id] === "saving" ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-[1.5px] border-white/30 border-t-white" />
                      ) : saveStatus[app.id] === "success" ? (
                        <Check size={14} />
                      ) : saveStatus[app.id] === "error" ? (
                        <AlertTriangle size={14} />
                      ) : (
                        <Save size={14} />
                      )}
                      {saveStatus[app.id] === "success" ? "Success" : 
                       saveStatus[app.id] === "error" ? "Retry" : 
                       saveStatus[app.id] === "saving" ? "Saving" : "Update"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Settings;
