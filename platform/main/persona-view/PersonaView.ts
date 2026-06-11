export type PersonaViewType = 'administration' | 'operator';

export interface IPersonaView {
  id: PersonaViewType;
  name: string;
  description?: string;
}
