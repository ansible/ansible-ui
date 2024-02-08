import { useTranslation } from 'react-i18next';
import { DateTimeCell, PageDetail, PageDetails, usePageNavigate } from '../../../../framework';
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../main/AwxRoutes';
import { LastModifiedPageDetail } from '../../../common/LastModifiedPageDetail';
import { PageDetailCodeEditor } from '../../../../framework/PageDetails/PageDetailCodeEditor';
import { useGetItem } from '../../../common/crud/useGet';
import { InventoryGroup } from '../../interfaces/InventoryGroup';
import { awxAPI } from '../../common/api/awx-utils';

export function GroupDetails() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ group_id: string }>();
  const { data: group } = useGetItem<InventoryGroup>(awxAPI`/groups/`, params.group_id);

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{group?.name}</PageDetail>
      <PageDetail label={t('Description')}>{group?.description}</PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell
          format="date-time"
          value={group?.created}
          author={group?.summary_fields?.created_by?.username}
          onClick={() =>
            pageNavigate(AwxRoute.UserDetails, {
              params: { id: group?.summary_fields?.created_by?.id },
            })
          }
        />
      </PageDetail>
      <LastModifiedPageDetail
        format="date-time"
        value={group?.created}
        author={group?.summary_fields?.created_by?.username}
        onClick={() =>
          pageNavigate(AwxRoute.UserDetails, {
            params: { id: group?.summary_fields?.created_by?.id },
          })
        }
      />
      <PageDetailCodeEditor
        label={t('Variables')}
        showCopyToClipboard
        toggleLanguage
        value={group?.variables || '---'}
      />
    </PageDetails>
  );
}
