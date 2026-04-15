"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X } from 'lucide-react';

export default function AddCharacterModal({ accountId, onClose, onSuccess }: { accountId: string, onClose: () => void, onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState(1);
  const [energy, setEnergy] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    setLoading(true);
    await supabase.from('characters').insert([{ 
      account_id: accountId,
      name,
      level,
      energy,
      last_energy_update: new Date().toISOString()
    }]);
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
      <div className="glass-panel w-full max-w-sm rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-[rgba(255,255,255,0.05)]">
          <h3 className="font-semibold text-lg">Add New Character</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Character Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. Healer Alt"
              autoFocus
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Level</label>
              <input 
                type="number" 
                min="1" max="100"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Current Energy</label>
              <input 
                type="number" 
                min="0" max="500"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Character'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
