export interface IUIFlag {
  id: string;
  name: string;
  description: string;
  status: 'alpha' | 'beta' | 'production';
  enabled: boolean;
}
