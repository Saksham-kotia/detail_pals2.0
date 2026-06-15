// ─── Detail Pals V2 — Admin Email Logs ───────────────────────────────

import React, { useState } from 'react';
import { useAdminEmailLogs } from '../../hooks/useBackend';
import { clearEmailLogs } from '../../services/adminService';
import { formatDate } from '../components/adminUtils';

export default function AdminEmailLogs() {
  const { logs, loading, error, refresh } = useAdminEmailLogs();
  const [actionError, setActionError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  async function handleClear() {
    if (!confirm('Are you sure you want to clear all email logs? This cannot be undone.')) return;
    setClearing(true);
    setActionError(null);
    const { error } = await clearEmailLogs();
    if (error) {
      setActionError(error);
    } else {
      refresh();
    }
    setClearing(false);
  }

  if (loading) return <div className="p-8 text-white/30 text-sm">Loading email logs…</div>;

  return (
    <div className="p-8 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-widest uppercase">Email Logs</h1>
          <p className="text-white/30 text-sm mt-1">Status of sent transactional emails</p>
        </div>
        <div className="flex items-center gap-3">
          {logs.length > 0 && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="px-4 py-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs uppercase tracking-widest rounded-lg transition-colors disabled:opacity-40"
            >
              Clear Logs
            </button>
          )}
          <button
            onClick={refresh}
            className="text-xs text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors ml-2"
          >
            Refresh
          </button>
        </div>
      </div>

      {actionError && <p className="mb-4 text-red-400/70 text-sm">{actionError}</p>}
      {error && <p className="mb-4 text-red-400/70 text-sm">{error}</p>}

      <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/30 text-[11px] tracking-widest uppercase">
              <th className="text-left px-5 py-3">Recipient</th>
              <th className="text-left px-5 py-3">Template</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Resend ID / Error</th>
              <th className="text-left px-5 py-3">Sent At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => {
              const isFailed = l.status === 'failed';
              return (
                <tr key={l.id} className={`border-b border-white/5 hover:bg-white/3 ${i === logs.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-5 py-3.5 text-white/80 font-mono text-xs">{l.to_email}</td>
                  <td className="px-5 py-3.5 text-white/50 text-xs">
                    <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase tracking-wider text-[9px]">
                      {l.template}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] uppercase font-semibold ${
                      isFailed 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs max-w-xs truncate">
                    {isFailed ? (
                      <span className="text-red-300/80 font-light block break-words" title={l.error_msg || ''}>
                        {l.error_msg || 'Unknown error'}
                      </span>
                    ) : (
                      <span className="text-white/40 font-mono text-[10px]">
                        {l.resend_id || '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-white/40 text-xs">
                    {formatDate(l.sent_at)}
                  </td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-white/20 text-xs tracking-widest uppercase">
                  No email logs recorded
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
