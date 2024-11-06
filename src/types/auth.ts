export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  username?: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    username: string;
  };
  token: string;
}