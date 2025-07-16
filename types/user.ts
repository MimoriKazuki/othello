export interface User {
  nickname: string;
  email: string;
  age: number;
  registeredAt: string;
}

export interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  successfulDoubts: number;
}

export interface UserWithStats extends User {
  stats: UserStats;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
}