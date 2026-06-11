// LDAP interface
export interface Ldap {
  name: string;
  BIND_DN: string;
  BIND_PASSWORD: string;
  CONNECTION_OPTIONS: {
    OPT_REFERRALS: number;
    OPT_NETWORK_TIMEOUT: number;
  };
  GROUP_SEARCH: string[];
  GROUP_TYPE: string;
  GROUP_TYPE_PARAMS: {
    name_attr: string;
    member_attr: string;
  };
  SERVER_URI: string[];
  START_TLS: boolean;
  USER_ATTR_MAP: {
    email: string;
    last_name: string;
    first_name: string;
  };
  USER_DN_TEMPLATE: string;
  USER_SEARCH: string[];
}
