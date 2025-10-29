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
  resultsheet:string;
}

export class User {
  username: string;
  name: string;
  department: string;

  constructor(username: string, name: string, department: string) {
    this.username = username;
    this.name = name;
    this.department = department;
  }
}

export type AppView = 'voting' | 'dashboard' | 'admin' | 'users';