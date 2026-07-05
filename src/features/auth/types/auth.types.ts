export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginDTO {
  email: string;
  passwordHash: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  passwordHash: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
