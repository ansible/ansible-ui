import { EditIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../framework';
import { RouteE } from '../../../Routes';
import { EdaJob } from '../../interfaces/EdaJob';
import { useLaunchAction } from './useLaunchAction';

export function useActivationActionActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const launchAction = useLaunchAction();

  return useMemo<IPageAction<EdaJob>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit action'),
        onClick: (job: EdaJob) => navigate(RouteE.EditEdaAction.replace(':id', job.id.toString())),
      },
      {
        type: PageActionType.single,
        label: 'Launch',
        onClick: (job: EdaJob) => launchAction(job),
      },
    ],
    [navigate, launchAction, t]
  );
}
