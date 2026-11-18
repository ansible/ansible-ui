import { useEffect } from 'react';
import i18next from 'i18next';
import { create } from 'zustand';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { usePutRequest } from '@ansible/common-ui/crud/usePutRequest';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';

export interface IDomain {
  name: string;
  labels: { name: string }[];
}

export interface DomainState {
  domains: IDomain[];
  userDomains: IDomain[];
  setDomains: (domains: IDomain[]) => void;
  setUserDomains: (domains: IDomain[]) => void;
  activeDomains: IDomain[];
  setActiveDomains: (domains: IDomain[]) => void;
  addActiveDomain: (domain: IDomain) => void;
  removeActiveDomain: (domain: IDomain) => void;
  toggleActiveDomain: (domain: IDomain) => void;
  clearActiveDomains: () => void;
}

interface UserDomainPreference {
  domains: IDomain[];
  userDomains: IDomain[];
  activeDomains: IDomain[];
}

interface UserDomainPreferenceRequest {
  domains: IDomain[];
  activeDomains: IDomain[];
}

interface UserPreferenceResponse {
  name: string;
  value: UserDomainPreference | null;
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

export const useDomainsStore = create<DomainState>()((set) => ({
  domains: getTranslatedDomains(),
  userDomains: [],

  setDomains: (domains) => set({ domains }),
  setUserDomains: (userDomains) => set({ userDomains }),

  activeDomains: [],

  setActiveDomains: (activeDomains) => set({ activeDomains }),

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
}));

export function useDomainsPersistence() {
  const { data } = useGet<UserPreferenceResponse>(gatewayAPI`/me/preferences/domains/`);
  const putRequest = usePutRequest<
    { value: UserDomainPreferenceRequest },
    UserPreferenceResponse
  >();
  const setDomains = useDomainsStore((state) => state.setDomains);
  const setUserDomains = useDomainsStore((state) => state.setUserDomains);
  const setActiveDomains = useDomainsStore((state) => state.setActiveDomains);

  useEffect(() => {
    if (data?.value) {
      setDomains(data.value.domains);
      setUserDomains(data.value.userDomains ?? []);
      setActiveDomains(data.value.activeDomains);
    } else if (data && data.value === null) {
      setDomains(getTranslatedDomains());
      setUserDomains([]);
      setActiveDomains([]);
    }
  }, [data, setActiveDomains, setDomains, setUserDomains]);

  const saveDomains = async (domains: IDomain[], activeDomains: IDomain[]) => {
    const response = await putRequest(gatewayAPI`/me/preferences/domains/`, {
      value: { domains, activeDomains },
    });
    if (response.value) {
      setDomains(response.value.domains);
      setUserDomains(response.value.userDomains ?? domains);
      setActiveDomains(response.value.activeDomains);
    }
    return response;
  };

  return { saveDomains };
}
