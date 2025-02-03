import i18next from 'i18next';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface IDomain {
  name: string;
  labels: { name: string }[];
}

export interface DomainState {
  domains: IDomain[];
  setDomains: (domains: IDomain[]) => void;
  activeDomains: IDomain[];
  setActiveDomains: (domains: IDomain[]) => void;
  addActiveDomain: (domain: IDomain) => void;
  removeActiveDomain: (domain: IDomain) => void;
  toggleActiveDomain: (domain: IDomain) => void;
  clearActiveDomains: () => void;
}

export const getTranslatedDomains = (): IDomain[] => {
  const t = i18next.t.bind(i18next);

  return [
    {
      name: t('Network'),
      labels: [{ name: 'network' }, { name: 'network.backup' }, { name: 'network.restore' }],
    },
    {
      name: t('Backup'),
      labels: [{ name: 'backup' }, { name: 'restore' }, { name: 'backup_experience' }],
    },
    {
      name: t('Security'),
      labels: [{ name: 'security' }, { name: 'security.vulnerability' }],
    },
  ];
};

export const useDomainsStore = create<DomainState>()(
  persist(
    (set) => ({
      domains: getTranslatedDomains(),

      setDomains: (domains) => set({ domains: domains }),

      activeDomains: [],

      setActiveDomains: (activeDomains) => set({ activeDomains: activeDomains }),

      addActiveDomain: (domain) =>
        set((state) => {
          if (!state.activeDomains.some((fa) => fa.name === domain.name)) {
            return { activeDomains: [...state.activeDomains, domain] };
          }
          return state; // No duplicate entries
        }),

      removeActiveDomain: (domain) =>
        set((state) => ({
          activeDomains: state.activeDomains.filter((fa) => fa.name !== domain.name),
        })),

      toggleActiveDomain: (domain) =>
        set((state) => {
          if (state.activeDomains.some((fa) => fa.name === domain.name)) {
            return {
              activeDomains: state.activeDomains.filter((fa) => fa.name !== domain.name),
            };
          }
          return { activeDomains: [...state.activeDomains, domain] };
        }),

      clearActiveDomains: () => set({ activeDomains: [] }),
    }),
    { name: 'domains' }
  )
);
