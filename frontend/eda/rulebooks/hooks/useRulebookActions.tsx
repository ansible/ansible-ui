import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../framework';
import { RouteE } from '../../../Routes';
import { EdaRulebook } from '../../interfaces/EdaRulebook';
import { useDeleteRulebooks } from './useDeleteRulebooks';

export function useRulebookActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteRulebooks = useDeleteRulebooks(() => void refresh());
  return useMemo<IPageAction<EdaRulebook>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit rulebook'),
        onClick: (rulebook: EdaRulebook) =>
          navigate(RouteE.EditEdaRulebook.replace(':id', rulebook.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete rulebook'),
        onClick: (rulebook: EdaRulebook) => deleteRulebooks([rulebook]),
      },
    ],
    [deleteRulebooks, navigate, t]
  );
}
