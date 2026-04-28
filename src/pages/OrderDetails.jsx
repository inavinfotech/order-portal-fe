import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Hash,
  DollarSign,
  CreditCard,
  History,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  ArrowRight,
  Package,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import { useSettings } from "../context/SettingsContext";

const OrderDetails = () => {
  const { currencySymbol } = useSettings();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [transitions, setTransitions] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState("");

  const fetchDetails = useCallback(async () => {
    try {
      const [orderRes, transRes, statesRes] = await Promise.all([
        api.get(`/orders/${id}`),
        api.get("/workflow/transitions"),
        api.get("/workflow/states"),
      ]);

      setOrder(orderRes.data);
      setAllStates(statesRes.data);
      const valid = transRes.data.filter(
        (t) => t.from_state === orderRes.data.status,
      );
      setTransitions(valid);
    } catch (err) {
      console.error("Failed to fetch order details", err);
      setError("Could not retrieve order information");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleTerminate = async () => {
    if (
      !window.confirm(
        "Are you sure you want to terminate this sequence? This action is irreversible in the standard workflow.",
      )
    ) {
      return;
    }

    setTransitioning(true);
    try {
      await api.delete(`/orders/${id}`);
      window.location.href = "/order/orders";
    } catch (err) {
      setError(err.response?.data?.detail || "Termination failed");
      setTransitioning(false);
    }
  };

  const handleTransition = async (toStatus, force = false) => {
    if (
      force &&
      !window.confirm(
        `Warning: This is a non-standard transition. Are you sure you want to force the state change to "${toStatus}"?`,
      )
    ) {
      return;
    }

    setTransitioning(true);
    setError("");
    try {
      await api.post(`/orders/${id}/transition`, {
        to_status: toStatus,
        notes: force
          ? `Forced override via Portal UI`
          : `Transition via Portal UI`,
        force: force,
      });
      await fetchDetails();
    } catch (err) {
      setError(err.response?.data?.detail || "Transition failed");
    } finally {
      setTransitioning(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!order) return <div className="text-gray-900">Order not found</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl mx-auto print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/order/orders"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Back to Registry
          </span>
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="bg-white hover:bg-gray-50 text-gray-700 text-[10px] font-bold py-2 px-4 rounded-lg transition-all border border-gray-200 uppercase tracking-tight"
          >
            Print Records
          </button>
          <button
            onClick={handleTerminate}
            disabled={transitioning}
            className="bg-white hover:bg-red-50 text-red-600 text-[10px] font-bold py-2 px-4 rounded-lg transition-all border border-red-100 uppercase tracking-tight disabled:opacity-50"
          >
            Terminate Sequence
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                    {order.product_name}
                  </h1>
                  <div className="flex items-center gap-2 group/status">
                    <StatusBadge status={order.status} />
                    <div className="relative inline-block print:hidden">
                      <select
                        value={order.status}
                        disabled={transitioning}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          if (newStatus === order.status) return;
                          const isValid = transitions.some(
                            (t) => t.to_state === newStatus,
                          );
                          handleTransition(newStatus, !isValid);
                        }}
                        className="appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[10px] font-bold py-1 pl-2 pr-6 rounded-lg cursor-pointer focus:outline-none transition-colors uppercase tracking-tight"
                      >
                        {allStates.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ArrowRight className="w-2.5 h-2.5 text-gray-400 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 font-mono text-[10px] uppercase">
                  UUID: {order.id}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-2xl font-black text-gray-900">
                  {currencySymbol}
                  {order.total_amount.toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">
                  Grand Total ({order.currency})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-3 h-3 text-gray-300" /> Customer
                </p>
                <p className="text-xs font-bold text-gray-900">
                  {order.customer_name}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-gray-300" /> Created
                </p>
                <p className="text-xs font-bold text-gray-900">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Package className="w-3 h-3 text-gray-300" /> Units
                </p>
                <p className="text-xs font-bold text-gray-900">
                  {order.quantity} Item(s)
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CreditCard className="w-3 h-3 text-gray-300" /> Net Total
                </p>
                <p className="text-xs font-bold text-gray-900 uppercase font-mono">
                  {order.currency}
                </p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          {order.items && order.items.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-wide">
                <Package className="text-primary-600 w-4 h-4" />
                Line Items
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Product
                      </th>
                      <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Variant
                      </th>
                      <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                        Qty
                      </th>
                      <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                        Unit Price
                      </th>
                      <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {order.items.map((item, idx) => (
                      <tr
                        key={item.id || idx}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-900">
                              {item.product_name || "N/A"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              ID: {item.product_id}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-gray-600">
                          {item.variant_name ? (
                            <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight">
                              {item.variant_name}
                            </span>
                          ) : (
                            <span className="text-gray-300">Standard</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-gray-600 text-center">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-gray-600 font-mono text-right">
                          {currencySymbol}
                          {item.unit_price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-xs font-black text-gray-900 font-mono text-right">
                          {currencySymbol}
                          {(item.quantity * item.unit_price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transition Controls */}
          {transitions.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 border-l-4 border-l-primary-600 shadow-sm print:hidden">
              <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-wide">
                <ArrowRight className="text-primary-600 w-4 h-4" />
                Available State Transitions
              </h3>
              <div className="flex flex-wrap gap-3">
                {transitions.map((t) => (
                  <button
                    key={t.to_state}
                    disabled={transitioning}
                    onClick={() => handleTransition(t.to_state)}
                    className="group flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-600/50 text-white font-bold py-2.5 px-5 rounded-lg transition-all shadow-md shadow-primary-600/10 active:scale-95 text-xs uppercase tracking-tight"
                  >
                    <span className="opacity-70">Update:</span>
                    <span>{t.to_state}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
              {error && (
                <p className="text-red-600 text-[10px] font-bold mt-4 flex items-center gap-2 uppercase tracking-wide">
                  <AlertCircle className="w-3.5 h-3.5" /> {error}
                </p>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-8 flex items-center gap-2 uppercase tracking-wide">
              <History className="text-primary-600 w-4 h-4" />
              Audit Trail & History
            </h3>
            <div className="relative space-y-8 ml-2">
              <div className="absolute left-[7px] top-1.5 bottom-1.5 w-0.5 bg-gray-100"></div>

              {order.history && order.history.length > 0 ? (
                [...order.history].reverse().map((entry, idx) => (
                  <div
                    key={idx}
                    className="relative flex gap-5 pl-8 items-start group"
                  >
                    <div className="absolute left-0 top-1 w-4 h-4 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center z-10 group-hover:border-primary-600 transition-colors shadow-sm">
                      <div className="w-1.5 h-1.5 bg-primary-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="space-y-1.5 pb-6 border-b border-gray-50 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-900">
                          Transition:{" "}
                          <span className="text-gray-400 font-medium uppercase px-1">
                            {entry.from_status}
                          </span>
                          <ArrowRight className="inline w-3 h-3 text-gray-300 mx-1" />
                          <span className="text-primary-700 font-black uppercase px-1">
                            {entry.to_status}
                          </span>
                        </p>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          {new Date(entry.changed_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight italic">
                        Initiated by {entry.changed_by}
                      </p>
                      {entry.notes && (
                        <div className="mt-2 text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100 italic leading-relaxed">
                          "{entry.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest italic">
                    Initial Sequence Start
                  </p>
                </div>
              )}

              {/* Creation point */}
              <div className="relative flex gap-5 pl-8 items-start group">
                <div className="absolute left-0 top-1 w-4 h-4 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center z-10">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    ORDER CREATED
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-gray-900 text-xs font-bold mb-4 flex items-center gap-2 uppercase tracking-wide">
              <Hash className="w-4 h-4 text-gray-400" /> Data Scope
            </h3>
            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 font-mono text-[9px] text-gray-500 break-all select-all hover:bg-white transition-colors cursor-pointer leading-relaxed">
              {order.id}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-gray-900 text-xs font-bold mb-5 uppercase tracking-wide">
              System Metadata
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400 font-bold uppercase tracking-widest">
                  Application ID
                </span>
                <span className="text-gray-900 font-black uppercase">
                  {order.application_id.slice(0, 8)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400 font-bold uppercase tracking-widest">
                  User Handle
                </span>
                <span className="text-gray-900 font-black uppercase">
                  UID-{order.user_id}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400 font-bold uppercase tracking-widest">
                  Compliance
                </span>
                <span className="text-emerald-600 font-black uppercase tracking-tighter">
                  Verified
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center print:hidden">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <Package className="text-gray-400 w-5 h-5" />
            </div>
            <h4 className="text-gray-900 text-xs font-bold mb-2 uppercase tracking-tight">
              Sequence Support
            </h4>
            <p className="text-[10px] text-gray-500 leading-relaxed mb-6 font-medium">
              Encountering anomalies with this specific sequence? Open an
              enterprise support ticket.
            </p>
            <button className="w-full bg-white hover:bg-gray-50 text-gray-900 text-[10px] font-black py-2.5 rounded-lg transition-all border border-gray-200 uppercase tracking-widest">
              Open Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
