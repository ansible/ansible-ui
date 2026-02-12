import i18next from 'i18next';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUIFlag, UIFlag } from './IUIFlag';

export interface UIFlagsState {
  flags: IUIFlag[];
  setFlags: (flags: IUIFlag[]) => void;
}

export const getTranslatedUIFlags = (): IUIFlag[] => {
  const t = i18next.t.bind(i18next);
  return [
    {
      id: UIFlag.PersonaViewSwitcher,
      name: t('View Switcher'),
      description: t(
        'Navigation view switcher that enabled the left hand navigation to have an "administration" view and an "operator" view.'
      ),
      enabled: false,
      status: 'beta',
    },
    {
      id: UIFlag.AutomationDashboard,
      name: t('Automation Dashboard'),
      description: t(
        'Discover the significant cost and time savings achieved by automating Ansible jobs with the Ansible Automation Platform. Explore how automation reduces manual effort, enhances efficiency, and optimizes IT operations across your organization.'
      ),
      enabled: false,
      status: 'alpha',
    },
  ];
};

export const useUIFlags = create<UIFlagsState>()(
  persist(
    (set) => ({
      flags: getTranslatedUIFlags(),
      setFlags: (flags) => set({ flags: flags }),
    }),
    {
      name: 'ui-flags',
      merge: (persistedState: unknown, currentState) => {
        // this merge function ensures that the persisted state is only used for flags that are still in the app
        const flagsMap = new Map<string, IUIFlag>();
        for (const flag of getTranslatedUIFlags()) {
          flagsMap.set(flag.id, flag);
        }
        for (const flag of currentState.flags) {
          if (flagsMap.has(flag.id)) {
            flagsMap.set(flag.id, flag);
          }
        }
        if (persistedState) {
          for (const flag of (persistedState as UIFlagsState).flags) {
            if (flagsMap.has(flag.id)) {
              flagsMap.set(flag.id, flag);
            }
          }
        }
        return { flags: Array.from(flagsMap.values()), setFlags: currentState.setFlags };
      },
    }
  )
);
