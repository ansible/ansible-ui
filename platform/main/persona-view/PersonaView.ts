export type PersonalViewType = 'administration' | 'developer' | 'operator';

export interface IPersonaView {
  id: PersonalViewType;
  name: string;
  description?: string;
}
