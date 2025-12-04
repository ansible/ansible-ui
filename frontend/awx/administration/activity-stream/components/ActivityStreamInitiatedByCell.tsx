import { TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityStream } from '../../../interfaces/ActivityStream';
import { AwxRoute } from '../../../main/AwxRoutes';

interface ActivityStreamInitiatedByCellProps {
  item: ActivityStream;
  options?: { disableLinks?: boolean };
}

export const ActivityStreamInitiatedByCell: React.FC<ActivityStreamInitiatedByCellProps> = ({
  item,
  options,
}) => {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const actorId = item.summary_fields?.actor?.id;
  const actorUsername = item.summary_fields?.actor?.username;

  const pageUrl = getPageUrl(AwxRoute.UserDetails, { params: { id: actorId?.toString() } });

  if (actorId) {
    return (
      <TextCell
        text={actorUsername ?? ''}
        to={pageUrl}
        disableLinks={options?.disableLinks}
        data-cy="initiated-by"
        data-testid="initiated-by"
      />
    );
  } else if (item.summary_fields?.actor) {
    return <span>{t(`${actorUsername} (deleted)`)}</span>;
  } else {
    return <span>{t('system')}</span>;
  }
};
