"use client";

import { useState } from 'react';
import { Account, Character } from '@/types';
import CharacterCard from './CharacterCard';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import AddCharacterModal from './AddCharacterModal';
import { supabase } from '@/lib/supabase';

interface AccountGroupProps {
  account: Account;
  characters: Character[];
  onDataChange: () => void;
}

export default function AccountGroup({ account, characters, onDataChange }: AccountGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddChar, setShowAddChar] = useState(false);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this account?')) {
      await supabase.from('accounts').delete().eq('id', account.id);
      onDataChange();
    }
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden border border-[rgba(255,255,255,0.05)]">
      <div 
        className="px-6 py-4 flex items-center justify-between bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] cursor-pointer transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          <h2 className="text-xl font-semibold tracking-wide">{account.name}</h2>
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">{characters.length}/6</span>
        </div>
        
        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
          {characters.length < 6 && (
            <button 
              onClick={() => setShowAddChar(true)}
              className="p-2 bg-[rgba(59,130,246,0.1)] text-blue-400 rounded-lg hover:bg-[rgba(59,130,246,0.2)] transition-colors"
              title="Add Character"
            >
              <Plus size={16} />
            </button>
          )}
          <button 
            onClick={handleDelete}
            className="p-2 bg-[rgba(239,68,68,0.1)] text-red-400 rounded-lg hover:bg-[rgba(239,68,68,0.2)] transition-colors"
            title="Delete Account"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 pt-2">
          {characters.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              No characters yet. Add one to start tracking.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {characters.map(char => (
                <CharacterCard key={char.id} character={char} onDataChange={onDataChange} />
              ))}
            </div>
          )}
        </div>
      )}

      {showAddChar && (
        <AddCharacterModal 
          accountId={account.id} 
          onClose={() => setShowAddChar(false)} 
          onSuccess={onDataChange} 
        />
      )}
    </div>
  );
}
