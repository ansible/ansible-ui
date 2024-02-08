import React from 'react';
import { TextCell, useGetPageUrl } from '../../../../../framework';
import { ActivityStream } from '../../../interfaces/ActivityStream';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useTranslation } from 'react-i18next';

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

  const pageUrl = getPageUrl(AwxRoute.UserDetails, { params: { id: actorId } });

  if (actorId) {
    return (
      <TextCell
        text={actorUsername ?? ''}
        to={pageUrl}
        disableLinks={options?.disableLinks}
        data-cy="initiated-by"
      />
    );
  } else if (item.summary_fields?.actor) {
    return <span>{t(`${actorUsername} (deleted)`)}</span>;
  } else {
    return <span>{t('system')}</span>;
  }
};
