import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../common/PageRoutedTabs';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaWebhook } from '../../interfaces/EdaWebhook';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteWebhooks } from '../hooks/useDeleteWebhooks';

export function WebhookPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: webhook } = useGet<EdaWebhook>(edaAPI`/webhooks/${params.id ?? ''}/`);

  const deleteWebhooks = useDeleteWebhooks((deleted) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.Webhooks);
    }
  });

  const itemActions = useMemo<IPageAction<EdaWebhook>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit webhook'),
        onClick: (webhook: EdaWebhook) =>
          pageNavigate(EdaRoute.EditWebhook, { params: { id: webhook.id } }),
      },
      {
        type: PageActionType.Seperator,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete webhook'),
        onClick: (webhook: EdaWebhook) => deleteWebhooks([webhook]),
        isDanger: true,
      },
    ],
    [deleteWebhooks, pageNavigate, t]
  );

  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={webhook?.name}
        breadcrumbs={[
          { label: t('Webhooks'), to: getPageUrl(EdaRoute.Webhooks) },
          { label: webhook?.name },
        ]}
        headerActions={
          <PageActions<EdaWebhook>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={webhook}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Webhooks'),
          page: EdaRoute.Webhooks,
          persistentFilterKey: 'webhooks',
        }}
        tabs={[{ label: t('Details'), page: EdaRoute.WebhookDetails }]}
        params={{ id: webhook?.id }}
      />
    </PageLayout>
  );
}
