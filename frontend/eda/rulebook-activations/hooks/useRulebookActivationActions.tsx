import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../framework';
import { RouteE } from '../../../Routes';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { useDeleteRulebookActivations } from './useDeleteRulebookActivations';

export function useRulebookActivationActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteRulebookActivations = useDeleteRulebookActivations(() => void refresh());
  return useMemo<IPageAction<EdaRulebookActivation>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit rulebookActivation'),
        onClick: (rulebookActivation: EdaRulebookActivation) =>
          navigate(
            RouteE.EditEdaRulebookActivation.replace(':id', rulebookActivation.id.toString())
          ),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete rulebookActivation'),
        onClick: (rulebookActivation: EdaRulebookActivation) =>
          deleteRulebookActivations([rulebookActivation]),
        isDanger: true,
      },
    ],
    [deleteRulebookActivations, navigate, t]
  );
}
