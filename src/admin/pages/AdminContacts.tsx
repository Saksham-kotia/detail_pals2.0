// ─── Detail Pals V2 — Admin Contacts / Messages ────────────────────────

import React, { useState } from 'react';
import { useAdminContacts } from '../../hooks/useBackend';
import { deleteContact } from '../../services/adminService';
import { formatDate } from '../components/adminUtils';

export default function AdminContacts() {
  const { contacts, loading, error, refresh } = useAdminContacts();
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this contact submission?')) return;
    setActionError(null);
    const { error } = await deleteContact(id);
    if (error) {
      setActionError(error);
    } else {
      refresh();
    }
  }

  if (loading) return <div className="p-8 text-white/30 text-sm">Loading messages…</div>;

  return (
    <div className="p-8 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-widest uppercase">Messages</h1>
          <p className="text-white/30 text-sm mt-1">Contact Form Submissions</p>
        </div>
        <button
          onClick={refresh}
          className="text-xs text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors"
        >
          Refresh
        </button>
      </div>

      {actionError && <p className="mb-4 text-red-400/70 text-sm">{actionError}</p>}
      {error && <p className="mb-4 text-red-400/70 text-sm">{error}</p>}

      <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/30 text-[11px] tracking-widest uppercase">
              <th className="text-left px-5 py-3">Sender</th>
              <th className="text-left px-5 py-3">Contact Info</th>
              <th className="text-left px-5 py-3">Message</th>
              <th className="text-left px-5 py-3">Date</th>
              <th className="text-right px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c, i) => (
              <tr key={c.id} className={`border-b border-white/5 hover:bg-white/3 ${i === contacts.length - 1 ? 'border-b-0' : ''}`}>
                <td className="px-5 py-4 font-normal vertical-align-top">
                  <span className="text-white/80 block font-medium">{c.name}</span>
                  {c.vehicle && <span className="text-[10px] text-dp-gold block mt-0.5">{c.vehicle}</span>}
                </td>
                <td className="px-5 py-4 text-white/50 text-xs vertical-align-top">
                  <span className="block">{c.email}</span>
                  <span className="block mt-0.5">{c.phone}</span>
                </td>
                <td className="px-5 py-4 text-white/70 text-xs max-w-md break-words vertical-align-top whitespace-pre-wrap">
                  {c.message}
                </td>
                <td className="px-5 py-4 text-white/40 text-xs vertical-align-top">
                  {formatDate(c.created_at)}
                </td>
                <td className="px-5 py-4 text-right vertical-align-top">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-xs text-red-400/40 hover:text-red-400/75 transition-colors uppercase tracking-wider"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-white/20 text-xs tracking-widest uppercase">
                  No messages received yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
