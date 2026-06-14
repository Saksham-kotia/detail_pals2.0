// ─── Detail Pals V2 — Admin Customers ───────────────────────────────

import React from 'react';
import { useAdminCustomers } from '../../hooks/useBackend';
import { formatCurrency, formatDate } from '../components/adminUtils';

export function AdminCustomers() {
  const { customers, loading } = useAdminCustomers();

  if (loading) return <div className="p-8 text-white/30 text-sm">Loading…</div>;

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-light tracking-widest uppercase mb-8">
        Customers <span className="text-white/30 text-lg font-thin ml-3">{customers.length}</span>
      </h1>

      <div className="border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/30 text-[11px] tracking-widest uppercase">
              <th className="text-left px-5 py-3">Name</th>
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-left px-5 py-3">Phone</th>
              <th className="text-left px-5 py-3">Bookings</th>
              <th className="text-left px-5 py-3">Spend</th>
              <th className="text-left px-5 py-3">Last Booking</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={c.id} className={`border-b border-white/5 hover:bg-white/3 ${i === customers.length - 1 ? 'border-b-0' : ''}`}>
                <td className="px-5 py-3 text-white/80">{c.name}</td>
                <td className="px-5 py-3 text-white/50">{c.email}</td>
                <td className="px-5 py-3 text-white/50">{c.phone}</td>
                <td className="px-5 py-3 text-white/70">{c.total_bookings}</td>
                <td className="px-5 py-3 text-white/70">{formatCurrency(c.total_spend)}</td>
                <td className="px-5 py-3 text-white/40">{c.last_booking ? formatDate(c.last_booking) : '—'}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-white/20 text-xs tracking-widest uppercase">
                  No customers yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Detail Pals V2 — Admin Gallery ─────────────────────────────────

import { useAdminGallery } from '../../hooks/useBackend';
import { uploadGalleryImage, deleteGalleryImage, pairGalleryImages } from '../../services/galleryService';
import type { GalleryImage } from '../../lib/types';

export function AdminGallery() {
  const { images, loading, refresh } = useAdminGallery();
  const [uploading, setUploading]    = React.useState(false);
  const [error,     setError]        = React.useState<string | null>(null);
  const [pairMode,  setPairMode]     = React.useState<string | null>(null); // first selected id
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [tag, setTag]                = React.useState<'before' | 'after'>('after');
  const [vehicle, setVehicle]        = React.useState('');
  const [serviceType, setServiceType] = React.useState('');

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const captionText = vehicle ? `${vehicle} — finished with ${serviceType || 'Premium Detail'}` : '';
    const { error } = await uploadGalleryImage(file, tag, serviceType, captionText);
    if (error) setError(error);
    else refresh();
    setUploading(false);
    e.target.value = '';
  }

  async function handleDelete(img: GalleryImage) {
    if (!confirm(`Delete this ${img.tag} image?`)) return;
    const { error } = await deleteGalleryImage(img.id, img.storage_path);
    if (error) setError(error);
    else refresh();
  }

  async function handlePairClick(id: string) {
    if (!pairMode) {
      setPairMode(id);
      return;
    }
    if (pairMode === id) { setPairMode(null); return; }
    const { error } = await pairGalleryImages(pairMode, id);
    if (error) setError(error);
    else { refresh(); }
    setPairMode(null);
  }

  if (loading) return <div className="p-8 text-white/30 text-sm">Loading…</div>;

  return (
    <div className="p-8 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-light tracking-widest uppercase">Gallery</h1>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Vehicle (e.g. BMW M3)"
            value={vehicle}
            onChange={e => setVehicle(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
          />
          <input
            type="text"
            placeholder="Detail Type (e.g. Ceramic)"
            value={serviceType}
            onChange={e => setServiceType(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
          />
          <select
            value={tag}
            onChange={e => setTag(e.target.value as 'before' | 'after')}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="after"  className="bg-[#111]">After</option>
            <option value="before" className="bg-[#111]">Before</option>
          </select>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-5 py-2 bg-white text-black text-xs uppercase tracking-widest rounded-lg hover:bg-white/90 disabled:opacity-40"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>
      </div>

      {pairMode && (
        <div className="mb-4 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60">
          Click a second image to pair it with the selected one. Click the same image to deselect.
        </div>
      )}

      {error && <p className="mb-4 text-red-400/70 text-sm">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {images.map(img => (
          <div
            key={img.id}
            className={`relative group rounded-xl overflow-hidden border cursor-pointer transition-all ${
              pairMode === img.id
                ? 'border-white/50 ring-2 ring-white/30'
                : 'border-white/10 hover:border-white/20'
            }`}
            onClick={() => handlePairClick(img.id)}
          >
            <img src={img.url} alt={img.caption || img.tag} className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${
                img.tag === 'before' ? 'bg-orange-500/30 text-orange-300' : 'bg-green-500/30 text-green-300'
              }`}>{img.tag}</span>
              {img.pair_id && (
                <span className="text-[10px] text-white/40">Paired</span>
              )}
              <button
                onClick={e => { e.stopPropagation(); handleDelete(img); }}
                className="text-[11px] text-red-400/80 hover:text-red-300 uppercase tracking-wider mt-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {images.length === 0 && (
          <div className="col-span-full py-16 text-center text-white/20 text-xs tracking-widest uppercase">
            No images uploaded yet
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Detail Pals V2 — Admin Testimonials ────────────────────────────

import { useAdminTestimonials } from '../../hooks/useBackend';
import { upsertTestimonial, deleteTestimonial, toggleTestimonialVisibility } from '../../services/adminService';
import type { Testimonial } from '../../lib/types';

export function AdminTestimonials() {
  const { testimonials, loading, refresh } = useAdminTestimonials();
  const [editing, setEditing] = React.useState<Partial<Testimonial> | null>(null);
  const [error,   setError]   = React.useState<string | null>(null);

  if (loading) return <div className="p-8 text-white/30 text-sm">Loading…</div>;

  async function handleSave(t: Partial<Testimonial>) {
    const { error } = await upsertTestimonial(t as Omit<Testimonial, 'created_at'> & { id?: string });
    if (error) setError(error);
    else { refresh(); setEditing(null); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    const { error } = await deleteTestimonial(id);
    if (error) setError(error);
    else refresh();
  }

  async function handleToggle(id: string, visible: boolean) {
    await toggleTestimonialVisibility(id, visible);
    refresh();
  }

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light tracking-widest uppercase">Testimonials</h1>
        <button
          onClick={() => setEditing({ author: '', rating: 5, text: '', vehicle: '', visible: true })}
          className="px-5 py-2 bg-white text-black text-xs uppercase tracking-widest rounded-lg hover:bg-white/90"
        >
          Add New
        </button>
      </div>

      {error && <p className="mb-4 text-red-400/70 text-sm">{error}</p>}

      <div className="space-y-3">
        {testimonials.map(t => (
          <div key={t.id} className="border border-white/10 rounded-xl px-5 py-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-white/80 font-medium text-sm">{t.author}</span>
                <span className="text-yellow-400/70 text-xs">{'★'.repeat(t.rating)}</span>
                {t.vehicle && <span className="text-white/30 text-xs">{t.vehicle}</span>}
                {!t.visible && <span className="text-white/20 text-xs uppercase tracking-wider">[hidden]</span>}
              </div>
              <p className="text-white/50 text-sm leading-relaxed">{t.text}</p>
            </div>
            <div className="flex items-center gap-3 ml-4 shrink-0">
              <button onClick={() => handleToggle(t.id, !t.visible)} className="text-xs text-white/30 hover:text-white/60 uppercase tracking-wider">
                {t.visible ? 'Hide' : 'Show'}
              </button>
              <button onClick={() => setEditing(t)} className="text-xs text-white/30 hover:text-white/60 uppercase tracking-wider">
                Edit
              </button>
              <button onClick={() => handleDelete(t.id)} className="text-xs text-red-400/40 hover:text-red-400/70 uppercase tracking-wider">
                Delete
              </button>
            </div>
          </div>
        ))}
        {testimonials.length === 0 && (
          <p className="text-white/20 text-xs tracking-widest uppercase text-center py-16">No testimonials yet</p>
        )}
      </div>

      {/* Edit modal */}
      {editing !== null && (
        <TestimonialModal
          data={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function TestimonialModal({
  data,
  onSave,
  onClose,
}: {
  data:    Partial<Testimonial>;
  onSave:  (t: Partial<Testimonial>) => Promise<void>;
  onClose: () => void;
}) {
  const [author,  setAuthor]  = React.useState(data.author  ?? '');
  const [rating,  setRating]  = React.useState(data.rating  ?? 5);
  const [text,    setText]    = React.useState(data.text    ?? '');
  const [vehicle, setVehicle] = React.useState(data.vehicle ?? '');
  const [saving,  setSaving]  = React.useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({ ...data, author, rating, text, vehicle });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-md p-6">
        <h3 className="text-sm tracking-widest uppercase mb-6">
          {data.id ? 'Edit' : 'Add'} Testimonial
        </h3>
        <div className="space-y-4">
          <LabeledInput label="Author"  value={author}  onChange={setAuthor}  />
          <LabeledInput label="Vehicle" value={vehicle} onChange={setVehicle} />
          <div>
            <label className="block text-[10px] tracking-[2px] text-white/30 uppercase mb-2">Rating</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`text-xl transition-opacity ${n <= rating ? 'text-yellow-400' : 'text-white/10'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] tracking-[2px] text-white/30 uppercase mb-2">Review</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-xs text-white/40 uppercase tracking-widest">Cancel</button>
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

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[2px] text-white/30 uppercase mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/20"
      />
    </div>
  );
}
