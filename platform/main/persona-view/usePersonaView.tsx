import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PersonaViewType } from './PersonaView';

interface PersonaViewState {
  activePersonaViewId: PersonaViewType;
  setActivePersonaView: (personaViewId: PersonaViewType) => void;
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
