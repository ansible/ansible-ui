import { useTranslation } from 'react-i18next';
import { IPersonaView } from './PersonaView';

export function usePersonaViews(): IPersonaView[] {
  const { t } = useTranslation();
  return [
    {
      id: 'administration',
      name: t('Administration View'),
      description: t(
        'The administration view is for users who are responsible for managing the automation platform.'
      ),
    },
    {
      id: 'developer',
      name: t('Developer View'),
      description: t(
        'The developer view is for users who are creating and maintaining automation.'
      ),
    },
    {
      id: 'operator',
      name: t('Operator View'),
      description: t(
        'The operator view is for users whose primary focus is on executing automation.'
      ),
    },
  ];
}
