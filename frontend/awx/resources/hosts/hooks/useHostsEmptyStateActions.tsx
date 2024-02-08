import { useTranslation } from 'react-i18next';
import { AwxHost } from '../../../interfaces/AwxHost';
import { useMemo } from 'react';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { ButtonVariant } from '@patternfly/react-core';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { useParams } from 'react-router-dom';

export function useHostsEmptyStateActions() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();

  const hostOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventories/${params.id ?? ''}/hosts/`
  ).data;
  const canCreateHost = Boolean(hostOptions && hostOptions.actions && hostOptions.actions['POST']);

  return useMemo<IPageAction<AwxHost>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        label: t('Existing host'),
        isPinned: true,
        onClick: () => {},
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        label: t('New host'),
        isPinned: true,
        onClick: () => {},
        isDisabled: () =>
          canCreateHost
            ? undefined
            : t(
                'You do not have permission to create a group. Please contact your organization administrator if there is an issue with your access.'
              ),
      },
    ],
    [canCreateHost, t]
  );
}
