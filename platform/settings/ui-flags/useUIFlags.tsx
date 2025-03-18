import i18next from 'i18next';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUIFlag } from './IUIFlag';

export interface UIFlagsState {
  flags: IUIFlag[];
  setFlags: (flags: IUIFlag[]) => void;
}

export const getTranslatedUIFlags = (): IUIFlag[] => {
  const t = i18next.t.bind(i18next);
  return [
    {
      id: 'example-1',
      name: t('Example 1'),
      description: t('This is an example of an Alpha flag.'),
      enabled: true,
      status: 'alpha',
    },
    {
      id: 'example-2',
      name: t('Example 2'),
      description: t('This is an example of a Beta flag.'),
      enabled: false,
      status: 'beta',
    },
    {
      id: 'example-3',
      name: t('Example 3'),
      description: t('This is an example of a Production flag.'),
      enabled: true,
      status: 'production',
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
