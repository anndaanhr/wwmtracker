export type Account = {
  id: string;
  name: string;
  created_at: string;
};

export type Character = {
  id: string;
  account_id: string;
  name: string;
  level: number;
  energy: number;
  last_energy_update: string;
  created_at: string;
  notified_full: boolean;
};
