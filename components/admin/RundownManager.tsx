'use client';

import React, { useState } from 'react';
import { RundownItem } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit3, Trash2, RotateCcw, Clock, MapPin, Compass, Sparkles } from 'lucide-react';

interface RundownManagerProps {
  rundowns: RundownItem[];
  onSaveRundown: (item: RundownItem) => Promise<void>;
  onDeleteRundown: (id: string) => Promise<void>;
  onResetRundowns: () => Promise<void>;
}

export const RundownManager: React.FC<RundownManagerProps> = ({
  rundowns,
  onSaveRundown,
  onDeleteRundown,
  onResetRundowns,
}) => {
  const [selectedTour, setSelectedTour] = useState<'BALI' | 'YOGYAKARTA'>('BALI');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RundownItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<RundownItem | null>(null);

  // Form State
  const [day, setDay] = useState(1);
  const [time, setTime] = useState('08:00');
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const filteredItems = rundowns
    .filter((r) => {
      if (selectedTour === 'BALI') return r.id?.startsWith('bali') || r.location.toLowerCase().includes('bali') || r.day <= 5;
      return r.id?.startsWith('yogya') || r.location.toLowerCase().includes('yogya') || r.location.toLowerCase().includes('merapi');
    })
    .sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));

  const handleOpenAdd = () => {
    setEditingItem(null);
    setDay(1);
    setTime('08:00');
    setActivity('');
    setLocation('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: RundownItem) => {
    setEditingItem(item);
    setDay(item.day);
    setTime(item.time);
    setActivity(item.activity);
    setLocation(item.location);
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity || !location) return;

    const itemToSave: RundownItem = {
      id: editingItem?.id || `${selectedTour.toLowerCase()}_${Date.now()}`,
      day,
      time,
      activity,
      location,
      notes,
    };

    await onSaveRundown(itemToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Controller */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 mb-1">
            <Compass className="w-3.5 h-3.5" /> Management Destinasi & Jadwal Perjalanan
          </div>
          <h2 className="text-lg font-black text-slate-900">Kelola Itinerary & Objek Wisata</h2>
          <p className="text-xs text-slate-500">
            Atur urutan acara, lokasi kunjungan, dan waktu kegiatan yang tersinkronisasi otomatis ke Firebase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tour Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setSelectedTour('BALI')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTour === 'BALI' ? 'bg-emerald-600 text-white' : 'text-slate-600'
              }`}
            >
              🌴 Bali
            </button>
            <button
              onClick={() => setSelectedTour('YOGYAKARTA')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTour === 'YOGYAKARTA' ? 'bg-amber-600 text-white' : 'text-slate-600'
              }`}
            >
              🏛️ Yogyakarta
            </button>
          </div>

          <button
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin mengembalikan jadwal ke default awal?')) {
                onResetRundowns();
              }
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Jadwal/Destinasi
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
          Daftar Jadwal {selectedTour === 'BALI' ? 'Darmawisata Bali' : 'Darmawisata Yogyakarta'} ({filteredItems.length} Kegiatan)
        </h3>

        <div className="divide-y divide-slate-100">
          {filteredItems.map((item, idx) => (
            <div key={item.id || idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors">
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-900 text-white font-black text-[10px] rounded uppercase">
                    HARI KE-{item.day}
                  </span>
                  <span className="font-mono text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.time} WIB
                  </span>
                  <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">{item.activity}</h4>
                {item.notes && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>{item.notes}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Edit Jadwal"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingItem(item)}
                  className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Hapus Kegiatan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Destinasi & Jadwal' : 'Tambah Jadwal / Destinasi Baru'}
        subtitle="Sistemik sinkronisasi ke database Firestore"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hari Ke-</label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jam (WIB)</label>
              <input
                type="text"
                required
                placeholder="misal: 08:30"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Kegiatan / Destinasi Wisata *</label>
            <input
              type="text"
              required
              placeholder="misal: Kunjungan Wisata GWK Cultural Park"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Lokasi / Tempat *</label>
            <input
              type="text"
              required
              placeholder="misal: Ungasan, Badung, Bali"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
            <input
              type="text"
              placeholder="misal: Foto bersama per kelas & Makan Siang"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
            >
              Simpan Ke Firebase
            </button>
          </div>
        </form>
      </Modal>

      {/* Custom Non-blocking Delete Rundown Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-800">Hapus Kegiatan Jadwal</h3>
                <p className="text-xs text-slate-500 font-medium">Konfirmasi Hapus Rundown</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Apakah Anda yakin ingin menghapus kegiatan <strong className="text-slate-900 font-black">{deletingItem.activity}</strong> pada Hari ke-{deletingItem.day}?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deletingItem.id) {
                    onDeleteRundown(deletingItem.id);
                  }
                  setDeletingItem(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Kegiatan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
