// ─── Detail Pals V2 — Admin Services Page ───────────────────────────

import React, { useState } from 'react';
import { useAdminServices } from '../../hooks/useBackend';
import type { Service } from '../../lib/types';
import { formatCurrency } from '../components/adminUtils';
import { addService, deleteService } from '../../services/servicesService';

export default function AdminServices() {
  const { services, loading, update, toggleActive, refresh } = useAdminServices();
  const [editing, setEditing] = useState<Service | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [crudError, setCrudError] = useState<string | null>(null);

  if (loading) return <div className="p-8 text-white/30 text-sm">Loading…</div>;

  const main  = services.filter(s => s.category === 'main');
  const addon = services.filter(s => s.category === 'addon');

  async function handleAddSave(newService: {
    name: string;
    description: string;
    base_price: number;
    category: 'main' | 'addon';
  }) {
    const { error } = await addService(newService);
    if (error) {
      alert(error);
    } else {
      setShowAddModal(false);
      refresh();
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this service/add-on?')) {
      const { error } = await deleteService(id);
      if (error) {
        alert(error);
      } else {
        refresh();
      }
    }
  }

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light tracking-widest uppercase">Services & Pricing</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-white text-black text-xs uppercase tracking-widest rounded-lg hover:bg-white/90 font-medium transition-colors"
        >
          Add Service / Add-on
        </button>
      </div>

      {[{ label: 'Main Services', items: main }, { label: 'Add-Ons', items: addon }].map(group => (
        <div key={group.label} className="mb-8">
          <h2 className="text-xs tracking-[3px] text-white/30 uppercase mb-4">{group.label}</h2>
          <div className="border border-white/10 rounded-xl overflow-hidden bg-dp-surface/20">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/30 text-[11px] tracking-widest uppercase">
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Base Price</th>
                  <th className="text-left px-5 py-3">Duration</th>
                  <th className="text-left px-5 py-3">Popular</th>
                  <th className="text-left px-5 py-3">Active</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((s, i) => (
                  <tr key={s.id} className={`border-b border-white/5 ${i === group.items.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-5 py-3 text-white/80">{s.name}</td>
                    <td className="px-5 py-3 text-white/70">{formatCurrency(s.base_price)}</td>
                    <td className="px-5 py-3 text-white/40">{s.duration || '—'}</td>
                    <td className="px-5 py-3">
                      <Toggle checked={s.popular} onChange={async (v) => {
                        const res = await update(s.id, { popular: v });
                        if (res?.error) alert(res.error);
                      }} />
                    </td>
                    <td className="px-5 py-3">
                      <Toggle checked={s.active} onChange={async (v) => {
                        const res = await toggleActive(s.id, v);
                        if (res?.error) alert(res.error);
                      }} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-4 items-center">
                        <button
                          onClick={() => setEditing(s)}
                          className="text-xs text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-xs text-red-500/50 hover:text-red-400 uppercase tracking-widest transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {group.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-white/20 text-xs uppercase tracking-widest">
                      No services found in this category
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Edit modal */}
      {editing && (
        <ServiceEditModal
          service={editing}
          onSave={async (updates) => {
            await update(editing.id, updates);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Add modal */}
      {showAddModal && (
        <ServiceAddModal
          onSave={handleAddSave}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full transition-colors ${checked ? 'bg-white/30' : 'bg-white/10'}`}
    >
      <span className={`block w-4 h-4 rounded-full bg-white transition-transform mx-0.5 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function ServiceEditModal({
  service,
  onSave,
  onClose,
}: {
  service: Service;
  onSave:  (updates: Partial<Service>) => Promise<void>;
  onClose: () => void;
}) {
  const [name,       setName]       = useState(service.name);
  const [desc,       setDesc]       = useState(service.description);
  const [price,      setPrice]      = useState(String(service.base_price));
  const [duration,   setDuration]   = useState(service.duration);
  const [saving,     setSaving]     = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({
      name,
      description: desc,
      base_price:  parseFloat(price),
      duration,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-md p-6">
        <h3 className="text-sm tracking-widest uppercase mb-6">Edit Service</h3>

        <div className="space-y-4">
          <Field label="Name"       value={name}     onChange={setName}     />
          <Field label="Base Price" value={price}    onChange={setPrice}    type="number" />
          <Field label="Duration"   value={duration} onChange={setDuration} />
          <div>
            <label className="block text-[10px] tracking-[2px] text-white/30 uppercase mb-2">Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 resize-none font-sans"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-xs text-white/40 hover:text-white/60 uppercase tracking-widest">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-white text-black text-xs uppercase tracking-widest rounded-lg hover:bg-white/90 disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceAddModal({
  onSave,
  onClose,
}: {
  onSave:  (service: { name: string; description: string; base_price: number; category: 'main' | 'addon' }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'main' | 'addon'>('main');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name || !price) {
      setError('Name and price are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name,
        description: desc,
        base_price: parseFloat(price),
        category,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-md p-6">
        <h3 className="text-sm tracking-widest uppercase mb-6">Add New Service / Add-on</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-[2px] text-white/30 uppercase mb-2">Category</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer font-sans">
                <input
                  type="radio"
                  checked={category === 'main'}
                  onChange={() => setCategory('main')}
                  className="accent-white"
                />
                Main Service
              </label>
              <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer font-sans">
                <input
                  type="radio"
                  checked={category === 'addon'}
                  onChange={() => setCategory('addon')}
                  className="accent-white"
                />
                Add-on
              </label>
            </div>
          </div>
          <Field label="Name" value={name} onChange={setName} />
          <Field label="Base Price" value={price} onChange={setPrice} type="number" />
          <div>
            <label className="block text-[10px] tracking-[2px] text-white/30 uppercase mb-2">Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 resize-none font-sans"
            />
          </div>
          {error && <p className="text-red-400 text-xs font-sans">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-xs text-white/40 hover:text-white/60 uppercase tracking-widest">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-white text-black text-xs uppercase tracking-widest rounded-lg hover:bg-white/90 disabled:opacity-40"
          >
            {saving ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text'
}: {
  label:    string;
  value:    string;
  onChange: (v: string) => void;
  type?:    string;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-[2px] text-white/30 uppercase mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 font-sans"
      />
    </div>
  );
}
