/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button } from '@patternfly/react-core';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ICatalogBreadcrumb,
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

export function EditNotifier()
{
  return <NotifierForm mode={'edit'} />;
}

export function AddNotifier()
{
  return <NotifierForm mode={'add'} />;
}

function NotifierForm(props : {mode : 'add' | 'edit'})
{
  const {t} = useTranslation();
  const getPageUrl = useGetPageUrl();
  const {mode } = props;

  const breadcrumbs : ICatalogBreadcrumb[] = [
    { label: t('Notifications'), to: getPageUrl(AwxRoute.NotificationTemplates) },
    { label: mode === 'add' ? t('Add') : t('Edit') }
  ]
 
  return (
  <PageLayout>
      <PageHeader breadcrumbs={breadcrumbs} title={ mode === 'edit' ? t('Edit notifier') : t('Add notifier')} />
      <AwxPageForm<NotificationTemplate>
        submitText={t('Save host')}
        onSubmit={ () => {}}
        cancelText={t('Cancel')}
        onCancel={ () => {}}
        defaultValue={ {} }
      >
      </AwxPageForm>
    </PageLayout>);
}