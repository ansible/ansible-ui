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
  login_redirect_override: string;
  custom_login_info: string;
  custom_logo: string;
  managed_cloud_install: boolean;
}
