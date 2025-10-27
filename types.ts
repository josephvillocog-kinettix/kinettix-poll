export interface Candidate {
  id: string;
  name: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  candidates: Candidate[];
  status: 'open' | 'closed';
}

export type AppView = 'voting' | 'dashboard' | 'admin' | 'user-management';