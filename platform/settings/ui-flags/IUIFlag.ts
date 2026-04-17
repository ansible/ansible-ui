export enum UIFlag {
  PersonaViewSwitcher = 'persona-view-switcher',
}

export interface IUIFlag {
  id: UIFlag;
  name: string;
  description: string;
  status: 'alpha' | 'beta' | 'production';
  enabled: boolean;
}
