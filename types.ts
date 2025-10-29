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
  poll1:string;
  poll2:string;
  constructor(username: string, name: string, department: string,poll1:string,poll2:string) {
    this.username = username;
    this.name = name;
    this.department = department;
    this.poll1 = poll1;
    this.poll2 = poll2;
  }
}

export type AppView = 'voting' | 'dashboard' | 'admin' | 'users' | 'debug';