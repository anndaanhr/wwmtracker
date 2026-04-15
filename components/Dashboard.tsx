"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Account, Character } from '@/types';
import AccountGroup from './AccountGroup';
import { Plus } from 'lucide-react';
import AddAccountModal from './AddAccountModal';

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);

  // Trigger re-render to update timers
  const [, setTick] = useState(0);

  useEffect(() => {
    fetchData();

    // Setup realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'characters' },
        (payload) => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'accounts' },
        (payload) => fetchData()
      )
      .subscribe();

    // Setup interval for local time updates (every 30s)
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (accountsError) throw accountsError;

      const { data: charsData, error: charsError } = await supabase
        .from('characters')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (charsError) throw charsError;

      setAccounts(accountsData || []);
      setCharacters(charsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            WWM Energy Tracker
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage all your alters efficiently.</p>
        </div>
        <button 
          onClick={() => setShowAddAccount(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 transition-colors rounded-lg font-medium text-sm shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          New Account
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center text-gray-400">
          <p>No accounts found.</p>
          <p className="text-xs mt-2">Click "New Account" to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {accounts.map(account => (
            <AccountGroup 
              key={account.id} 
              account={account} 
              characters={characters.filter(c => c.account_id === account.id)} 
              onDataChange={fetchData}
            />
          ))}
        </div>
      )}

      {showAddAccount && (
        <AddAccountModal 
          onClose={() => setShowAddAccount(false)} 
          onSuccess={fetchData} 
        />
      )}
    </div>
  );
}
