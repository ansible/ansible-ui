/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button } from '@patternfly/react-core';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ICatalogBreadcrumb,
  LoadingPage,
  PageFormDataEditor,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { AwxPageForm } from '../../common/AwxPageForm';
import { NotificationTemplate } from '../../interfaces/NotificationTemplate';
import { AwxRoute } from '../../main/AwxRoutes';

import { awxAPI } from '../../common/api/awx-utils';
import { useGet } from '../../../common/crud/useGet';
import { AwxError } from '../../common/AwxError';
import { PageFormSelectOrganization } from '../../access/organizations/components/PageFormOrganizationSelect';

export function EditNotifier() {
  return <NotifierForm mode={'edit'} />;
}

export function AddNotifier() {
  return <NotifierForm mode={'add'} />;
}

function NotifierForm(props: { mode: 'add' | 'edit' }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { mode } = props;
  const params = useParams<{ id: string }>();
  let getUrl = mode === 'add' ? '' : awxAPI`/notification_templates/${params.id || ''}/`;
  const notifierRequest = useGet<NotificationTemplate>(getUrl);
  const navigate = useNavigate();

  const breadcrumbs: ICatalogBreadcrumb[] = [
    { label: t('Notifications'), to: getPageUrl(AwxRoute.NotificationTemplates) },
    { label: mode === 'add' ? t('Add') : t('Edit') },
  ];

  if (notifierRequest.error) {
    return <AwxError error={notifierRequest.error} />;
  }

  if (!notifierRequest.data && mode === 'edit') {
    return <LoadingPage />;
  }

  const defaultValue = mode === 'add' ? {} : notifierRequest.data;

  return (
    <PageLayout>
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={mode === 'edit' ? t('Edit notifier') : t('Add notifier')}
      />
      <AwxPageForm<NotificationTemplate>
        submitText={t('Save host')}
        onSubmit={() => {}}
        cancelText={t('Cancel')}
        onCancel={ () => navigate(-1)}
        defaultValue={defaultValue}
      >
          <PageFormTextInput<NotificationTemplate>
            name="name"
            label={t('Name')}
            placeholder={t('Enter a name')}
            isRequired
            maxLength={150}
          />
          <PageFormTextInput<NotificationTemplate>
            name="description"
            label={t('Description')}
            placeholder={t('Enter a description')}
          />
          <PageFormSelectOrganization<NotificationTemplate> name="organization" isRequired />
      </AwxPageForm>
    </PageLayout>
  );
}
