"use client";

import { useState } from 'react';
import { Character } from '@/types';
import { getCurrentEnergy, getMaxEnergy, getTimeUntilFull, formatTimeRemaining } from '@/lib/energy';
import { Edit2, Sparkles, Trash2, Shield } from 'lucide-react';
import EditEnergyModal from './EditEnergyModal';
import { supabase } from '@/lib/supabase';

interface CharacterCardProps {
  character: Character;
  onDataChange: () => void;
}

export default function CharacterCard({ character, onDataChange }: CharacterCardProps) {
  const [showEdit, setShowEdit] = useState(false);

  const maxEnergy = getMaxEnergy(character.level);
  const currentEnergy = getCurrentEnergy(character.energy, character.last_energy_update, character.level);
  const timeUntilFull = getTimeUntilFull(character.energy, character.last_energy_update, character.level);
  
  const percent = Math.min((currentEnergy / maxEnergy) * 100, 100);
  const isReady = currentEnergy >= 60; // 60 is the cost for one farming run
  const isFull = currentEnergy >= maxEnergy;

  // Generate markers every 60 points
  const markers = [];
  for(let i = 60; i < maxEnergy; i += 60) {
    markers.push((i / maxEnergy) * 100);
  }

  const handleDelete = async () => {
    if (confirm(`Delete character ${character.name}?`)) {
      await supabase.from('characters').delete().eq('id', character.id);
      onDataChange();
    }
  };

  const handleSpend = async () => {
    if (currentEnergy >= 60) {
      if (confirm(`Spend 60 energy for farming on ${character.name}?`)) {
        await supabase.from('characters').update({
          energy: currentEnergy - 60,
          last_energy_update: new Date().toISOString(),
          notified_full: false
        }).eq('id', character.id);
        onDataChange();
      }
    }
  };

  return (
    <div className={`relative bg-[rgba(15,17,21,0.6)] backdrop-blur-md rounded-lg p-5 border transition-all duration-300 ${isFull ? 'border-blue-500/50 energy-glow' : isReady ? 'border-emerald-500/30' : 'border-[rgba(255,255,255,0.05)]'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-lg flex items-center gap-2">
            {character.name}
            {isFull && <Sparkles size={14} className="text-blue-400" />}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
            <Shield size={12} />
            <span>Lv. {character.level} (Max {maxEnergy})</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowEdit(true)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1.5 font-medium">
          <span className={isFull ? 'text-blue-400' : isReady ? 'text-emerald-400' : 'text-gray-300'}>
            {currentEnergy} / {maxEnergy}
          </span>
          <span className="text-gray-400 text-xs flex items-center">
            {isFull ? 'Max Reached' : `Full in ${formatTimeRemaining(timeUntilFull)}`}
          </span>
        </div>
        
        <div className="relative h-3 w-full bg-[rgba(0,0,0,0.5)] rounded-full overflow-hidden border border-[rgba(255,255,255,0.05)] shadow-inner flex">
          {/* Progress Bar */}
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${
              isFull ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 
              isReady ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 
              'bg-gradient-to-r from-amber-600 to-amber-500'
            }`}
            style={{ width: `${percent}%` }}
          />

          {/* Markers per 60 energy */}
          {markers.map((marker, index) => (
             <div 
              key={index} 
              className="absolute top-0 bottom-0 w-[1px] bg-[rgba(255,255,255,0.2)] z-10"
              style={{ left: `${marker}%` }}
             />
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button 
          onClick={handleSpend}
          disabled={!isReady}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
            isReady 
              ? 'bg-[rgba(16,185,129,0.1)] text-emerald-400 hover:bg-[rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.2)]' 
              : 'bg-[rgba(255,255,255,0.02)] text-gray-500 cursor-not-allowed border border-transparent'
          }`}
        >
          {isReady ? 'Spend 60 Energy' : 'Not enough energy'}
        </button>
      </div>

      {showEdit && (
        <EditEnergyModal 
          character={character} 
          currentCalculation={currentEnergy}
          onClose={() => setShowEdit(false)} 
          onSuccess={onDataChange} 
        />
      )}
    </div>
  );
}
