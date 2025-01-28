import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PersonalViewType } from './PersonaView';

interface PersonaViewState {
  activePersonaViewId: PersonalViewType;
  setActivePersonaView: (personaViewId: PersonalViewType) => void;
}

export const usePersonaView = create<PersonaViewState>()(
  persist(
    (set) => ({
      activePersonaViewId: 'administration',
      setActivePersonaView: (activePersonaViewId) => set({ activePersonaViewId }),
    }),
    { name: 'persona-view' }
  )
);
