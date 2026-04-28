import React, { useState, useEffect } from "react";
import {
  GitMerge,
  Circle,
  ArrowRight,
  Info,
  Terminal,
  Database,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import api from "../services/api";

const Workflow = () => {
  const [states, setStates] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);

  // Form states
  const [newState, setNewState] = useState({ name: "", description: "" });
  const [newTransition, setNewTransition] = useState({
    name: "",
    from_state_id: "",
    to_state_id: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchWorkflow = async () => {
    try {
      const [statesRes, transRes] = await Promise.all([
        api.get("/workflow/states"),
        api.get("/workflow/transitions"),
      ]);
      setStates(statesRes.data);
      setTransitions(transRes.data);
    } catch (err) {
      console.error("Failed to fetch workflow", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflow();
  }, []);

  const handleAddState = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage(null);
    try {
      await api.post("/workflow/states", newState);
      setMessage({ type: "success", text: "State created successfully" });
      setNewState({ name: "", description: "" });
      fetchWorkflow();
      setTimeout(() => setIsStateModalOpen(false), 1500);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to create state",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteState = async (id) => {
    if (
      !window.confirm("Are you sure? Deleting a state may break transitions.")
    )
      return;
    try {
      await api.delete(`/workflow/states/${id}`);
      fetchWorkflow();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete state");
    }
  };

  const handleAddTransition = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage(null);
    try {
      await api.post("/workflow/transitions", newTransition);
      setMessage({ type: "success", text: "Transition created successfully" });
      setNewTransition({ name: "", from_state_id: "", to_state_id: "" });
      fetchWorkflow();
      setTimeout(() => setIsTransitionModalOpen(false), 1500);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to create transition",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTransition = async (id) => {
    if (!window.confirm("Delete this transition?")) return;
    try {
      await api.delete(`/workflow/transitions/${id}`);
      fetchWorkflow();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete transition");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Workflow Intel
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Schema of authorized state transitions and order lifecycle logic
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsStateModalOpen(true)}
            className="bg-white border border-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 text-xs shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add State
          </button>
          <button
            onClick={() => setIsTransitionModalOpen(true)}
            className="bg-primary-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-primary-700 transition-all flex items-center gap-2 text-xs shadow-md shadow-primary-600/20"
          >
            <GitMerge className="w-3.5 h-3.5" />
            New Transition
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* States List */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest">
              <Circle className="text-primary-600 w-3.5 h-3.5" />
              Defined Lifecycle States
            </h3>
            <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded-full">
              {states.length} Active
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto max-h-[500px]">
            {states.map((state) => (
              <div
                key={state.id}
                className="bg-white border border-gray-100 p-4 rounded-2xl group hover:border-primary-500/50 hover:shadow-md hover:shadow-primary-500/5 transition-all relative"
              >
                <button
                  onClick={() => handleDeleteState(state.id)}
                  className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-mono">
                  ID: {state.id.slice(0, 8)}
                </p>
                <p className="text-sm font-black text-gray-900 uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                  {state.name}
                </p>
                {state.description && (
                  <p className="text-[10px] text-gray-500 mt-2 leading-relaxed font-medium line-clamp-2">
                    {state.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Transitions Grid */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest">
              <GitMerge className="text-primary-600 w-3.5 h-3.5" />
              Transition Registry
            </h3>
            <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded-full">
              {transitions.length} Rules
            </span>
          </div>
          <div className="p-6 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {transitions.map((t) => {
              const fromState =
                states.find((s) => s.id === t.from_state_id)?.name || "Unknown";
              const toState =
                states.find((s) => s.id === t.to_state_id)?.name || "Unknown";
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-2 bg-gray-50 border border-gray-100 p-3 rounded-2xl group hover:border-emerald-500/30 transition-all relative"
                >
                  <div className="flex-1 text-center py-1">
                    <span className="text-[8px] font-bold text-gray-400 uppercase block mb-0.5 tracking-widest">
                      From
                    </span>
                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest truncate block px-2">
                      {fromState}
                    </span>
                  </div>
                  <div className="flex flex-col items-center px-2">
                    <div className="p-1.5 bg-white rounded-full border border-gray-200 shadow-sm group-hover:border-emerald-500/50 transition-all">
                      <ArrowRight className="text-primary-600 w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    {t.name && t.name !== "Unnamed Transition" && (
                      <span className="text-[8px] font-bold text-primary-500 uppercase mt-1 tracking-tighter">
                        {t.name}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-center py-1">
                    <span className="text-[8px] font-bold text-gray-400 uppercase block mb-0.5 tracking-widest">
                      To
                    </span>
                    <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest truncate block px-2">
                      {toState}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteTransition(t.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Engine Details */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <Terminal className="text-primary-600 w-4 h-4" />
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
            System Architecture
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4 md:border-r md:border-gray-100 md:pr-10">
            <div className="flex items-center gap-2 text-primary-600">
              <Database className="w-3.5 h-3.5" />
              <h4 className="font-black text-[10px] uppercase tracking-widest">
                Relational Core
              </h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              States and transitions are stored in normalized tables with strict
              foreign key constraints to ensure referential integrity.
            </p>
          </div>
          <div className="space-y-4 md:border-r md:border-gray-100 md:pr-10">
            <div className="flex items-center gap-2 text-primary-600">
              <Info className="w-3.5 h-3.5" />
              <h4 className="font-black text-[10px] uppercase tracking-widest">
                Rule Execution
              </h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              The workflow engine intercepts every order mutation,
              cross-referencing this registry before permitting state changes.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <h4 className="font-black text-[10px] uppercase tracking-widest">
                Audit Transparency
              </h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Every transition is logged with high-resolution timestamps and
              actor metadata for complete operational visibility.
            </p>
          </div>
        </div>
      </div>

      {/* Add State Modal */}
      {isStateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                Create New State
              </h3>
              <button
                onClick={() => setIsStateModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddState} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  State Name
                </label>
                <input
                  required
                  type="text"
                  value={newState.name}
                  onChange={(e) =>
                    setNewState({
                      ...newState,
                      name: e.target.value.toLowerCase().replace(/ /g, "_"),
                    })
                  }
                  placeholder="e.g. pending_review"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all uppercase placeholder:normal-case"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Description
                </label>
                <textarea
                  value={newState.description}
                  onChange={(e) =>
                    setNewState({ ...newState, description: e.target.value })
                  }
                  placeholder="What does this state represent?"
                  rows="3"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none"
                />
              </div>

              {message && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold ${message.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                {formLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Register State"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Transition Modal */}
      {isTransitionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                New Workflow Transition
              </h3>
              <button
                onClick={() => setIsTransitionModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTransition} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Transition Name (Optional)
                </label>
                <input
                  type="text"
                  value={newTransition.name}
                  onChange={(e) =>
                    setNewTransition({ ...newTransition, name: e.target.value })
                  }
                  placeholder="e.g. Approve Order"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all placeholder:font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    From State
                  </label>
                  <select
                    required
                    value={newTransition.from_state_id}
                    onChange={(e) =>
                      setNewTransition({
                        ...newTransition,
                        from_state_id: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary-500 transition-all uppercase appearance-none"
                  >
                    <option value="" disabled className="normal-case">
                      Select State
                    </option>
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    To State
                  </label>
                  <select
                    required
                    value={newTransition.to_state_id}
                    onChange={(e) =>
                      setNewTransition({
                        ...newTransition,
                        to_state_id: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary-500 transition-all uppercase appearance-none"
                  >
                    <option value="" disabled className="normal-case">
                      Select State
                    </option>
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {message && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold ${message.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                {formLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Commit Transition"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workflow;
