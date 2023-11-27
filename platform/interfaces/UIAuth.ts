export interface AuthOption {
  name?: string;
  login_url: string;
  type: string;
}

export interface UIAuth {
  show_login_form: boolean;
  passwords: {
    name: string;
    type: string;
  }[];
  ssos: AuthOption[];
}
