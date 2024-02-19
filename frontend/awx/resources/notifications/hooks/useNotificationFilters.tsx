import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { awxAPI } from '../../../common/api/awx-utils';

export function useNotificationFilters() {
  const { t } = useTranslation();
  const nameToolbarFilter = useNameToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/notification_templates/`);
  const notificationTypes = data?.actions?.GET?.notification_type?.choices?.map(
    ([value, label]) => {
      return {
        label: t(label),
        value,
      };
    }
  );
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      descriptionToolbarFilter,
      {
        key: 'type',
        label: t('Notification type'),
        type: ToolbarFilterType.MultiSelect,
        query: 'notification_type',

        options: notificationTypes ?? [],
        placeholder: t('Select types'),
      },
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [
      nameToolbarFilter,
      descriptionToolbarFilter,
      t,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
      notificationTypes,
    ]
  );
  return toolbarFilters;
}
