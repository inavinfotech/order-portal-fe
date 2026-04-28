import React, { useState, useEffect } from "react";
import {
  Box,
  Plus,
  Search,
  MoreVertical,
  Key,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Shield,
  Loader2,
  X,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import api from "../services/api";
import { cn } from "../utils/cn";

const Applications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);
  const [revealModal, setRevealModal] = useState(null);

  const fetchApps = async () => {
    try {
      const response = await api.get("/apps");
      setApps(response.data);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleCreateApp = async (e) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    setCreating(true);
    try {
      const response = await api.post("/apps", { name: newAppName });
      setNewAppName("");
      setRevealModal(response.data); // Store the response with the plain secret
      fetchApps();
    } catch (err) {
      console.error("Failed to create application", err);
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeApp = async (appId) => {
    if (
      !window.confirm(
        "Are you sure you want to revoke this application? All associated API access will be immediately terminated.",
      )
    ) {
      return;
    }

    try {
      await api.delete(`/apps/${appId}`);
      setApps((prev) => prev.filter((app) => app.id !== appId));
    } catch (err) {
      console.error("Failed to revoke application", err);
      alert("Failed to revoke application. Please try again.");
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Connected Applications
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Manage API integrations and secure access keys
          </p>
        </div>
        <form onSubmit={handleCreateApp} className="flex gap-2">
          <input
            type="text"
            placeholder="New App Name..."
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-primary-500 w-48 sm:w-64"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all active:scale-[0.98] flex items-center gap-2 shadow-sm text-sm disabled:bg-primary-600/50"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Create App
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.length > 0 ? (
          apps.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group border-b-4 border-b-transparent hover:border-b-primary-600"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-primary-50 transition-colors">
                    <Box className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {app.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 uppercase font-black mt-0.5 tracking-widest">
                      Active Application
                    </p>
                  </div>
                </div>
                <button className="p-1.5 text-gray-300 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative group/key">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                    API Identity Key
                  </span>
                  <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 flex items-center justify-between gap-3 group-hover/key:bg-white transition-colors">
                    <code className="text-[10px] font-mono text-primary-600 font-bold truncate">
                      {app.api_key}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(app.api_key, `${app.id}-key`)
                      }
                      className="shrink-0 p-1 hover:bg-gray-100 rounded transition-colors text-gray-400"
                    >
                      {copiedKey === `${app.id}-key` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-gray-50">
                  <button
                    onClick={() => handleRevokeApp(app.id)}
                    className="text-[10px] font-bold text-gray-400 hover:text-red-500 flex items-center gap-1.5 transition-colors uppercase tracking-widest"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-50/50 border border-dashed border-gray-200 rounded-3xl">
            <div className="flex flex-col items-center gap-4">
              <Box className="w-12 h-12 text-gray-200" />
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Infrastructure Empty
                </h3>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  Create your first application lifecycle monitoring endpoint.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Secret Reveal Modal */}
      {revealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setRevealModal(null)}
          ></div>
          <div className="bg-white rounded-3xl w-full max-w-xl relative overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="bg-emerald-600 p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-8 h-8" />
                  <h3 className="text-xl font-bold">Secret Key Generated</h3>
                </div>
                <button
                  onClick={() => setRevealModal(null)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-emerald-50 text-sm font-medium leading-relaxed opacity-90">
                This secret will only be shown{" "}
                <span className="underline decoration-2 underline-offset-4">
                  ONCE
                </span>
                . Please store it immediately in a secure vault. You will not be
                able to retrieve it again.
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Application Name
                </label>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900">
                  {revealModal.name}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 text-emerald-600">
                  Secure API Secret
                </label>
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex-1 font-mono text-sm text-emerald-700 font-bold break-all">
                    {revealModal.api_secret}
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(revealModal.api_secret, "reveal-secret")
                    }
                    className="shrink-0 p-3 bg-white border border-emerald-100 rounded-xl hover:bg-emerald-50 transition-all text-emerald-600"
                  >
                    {copiedKey === "reveal-secret" ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setRevealModal(null)}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] text-sm uppercase tracking-tight mt-4"
              >
                I have securely stored the secret
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-emerald-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-600/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-xl font-bold mb-2">
              Enterprise Security Notice
            </h3>
            <p className="text-emerald-50 text-sm opacity-90 leading-relaxed font-medium">
              API secrets are one-time visible entities. Once an application is
              established, you must store your secret in a hardware vault or
              secure environment configuration.
            </p>
          </div>
          <button className="shrink-0 bg-white text-emerald-700 font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-emerald-50 transition-colors flex items-center gap-2 text-sm uppercase tracking-tight">
            Security Docs
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
        <Shield className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 rotate-12" />
      </div>
    </div>
  );
};

export default Applications;
