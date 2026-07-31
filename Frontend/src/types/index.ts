export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
}

export interface AuthResponse {
  status: string;
  token?: string;
  message?: string;
  data?: {
    user?: User;
    [key: string]: any;
  };
}

export interface CategoryItem {
  id: number;
  title: string;
}