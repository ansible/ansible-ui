/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, PageTab, PageTabs } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { RouteObj } from '../../../../Routes';
import { PageNotImplemented } from '../../../../common/PageNotImplemented';
import { useGetItem } from '../../../../common/crud/useGetItem';
import { AwxError } from '../../../common/AwxError';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { useTemplateActions } from '../hooks/useTemplateActions';
import { TemplateDetails } from './TemplateDetails';

export function TemplatePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: template,
    refresh,
  } = useGetItem<JobTemplate>('/api/v2/job_templates', params.id);
  const navigate = useNavigate();
  const itemActions = useTemplateActions({
    onTemplatesDeleted: () => navigate(RouteObj.Templates),
  });

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!template) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={template?.name}
        breadcrumbs={[{ label: t('Templates'), to: RouteObj.Templates }, { label: template?.name }]}
        headerActions={
          <PageActions<JobTemplate>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={template}
          />
        }
      />
      <PageTabs loading={!template}>
        <PageTab label={t('Details')}>
          <TemplateDetails template={template} />
        </PageTab>
        <PageTab label={t('Access')}>
          <PageNotImplemented />
        </PageTab>
        <PageTab label={t('Job templates')}>
          <PageNotImplemented />
        </PageTab>
        <PageTab label={t('Notifications')}>
          <PageNotImplemented />
        </PageTab>
        <PageTab label={t('Schedules')}>
          <PageNotImplemented />
        </PageTab>
      </PageTabs>
    </PageLayout>
  );
}
