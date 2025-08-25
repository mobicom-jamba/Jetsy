export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  MetaAccounts?: MetaAccount[];
  createdAt: string;
  updatedAt: string;
}

export interface MetaAccount {
  id: string;
  accountId: string;
  accountName: string;
  currency: string;
  accountStatus: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}
